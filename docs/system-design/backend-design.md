# Far Too Young - Backend Design

## Overview
Complete backend architecture for Far Too Young platform using AWS Lambda functions, designed to work with the database schema defined in `database-design.md`.

---

## Backend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React App)                               │
│                                Port 5173                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP Requests
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (SAM Local)                               │
│                                Port 3001                                        │
│─────────────────────────────────────────────────────────────────────────────────│
│  POST /auth/login          │  POST /auth/register     │  POST /auth/logout      │
│  POST /auth/forgot-password│  POST /auth/reset-password                         │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Route to Lambda Functions
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              LAMBDA FUNCTIONS                                   │
│                            (Business Logic Layer)                              │
│─────────────────────────────────────────────────────────────────────────────────│
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   login.js      │  │  register.js    │  │   logout.js     │                │
│  │─────────────────│  │─────────────────│  │─────────────────│                │
│  │• Query by email │  │• Check existence│  │• Validate JWT   │                │
│  │• Verify password│  │• Hash password  │  │• Return success │                │
│  │• Create JWT     │  │• Create full    │  │                 │                │
│  │• Return user    │  │  user object    │  │                 │                │
│  └─────────────────┘  │• Save to DB     │  └─────────────────┘                │
│                       └─────────────────┘                                      │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                                     │
│  │forgot-password.js│  │reset-password.js│                                     │
│  │─────────────────│  │─────────────────│                                     │
│  │• Find by email  │  │• Scan by token  │                                     │
│  │• Update with    │  │• Check expiry   │                                     │
│  │  resetToken     │  │• Update password│                                     │
│  │• Generate email │  │• Remove tokens  │                                     │
│  └─────────────────┘  └─────────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Database Operations
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DYNAMODB LOCAL                                     │
│                                Port 8000                                        │
│─────────────────────────────────────────────────────────────────────────────────│
│                          fartooyoung-users table                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ email (PK) │ name │ hashedPassword │ userId │ shippingAddress │ ... │     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Database-Backend Mapping

### Lambda Functions → Database Tables

| Lambda Function | Database Table | Operations | Fields Used |
|----------------|----------------|------------|-------------|
| `login.js` | `fartooyoung-users` | GET by email | email, hashedPassword, name |
| `register.js` | `fartooyoung-users` | GET (check), PUT (create) | All user fields |
| `logout.js` | None | JWT validation only | N/A |
| `forgot-password.js` | `fartooyoung-users` | GET by email, UPDATE | email, resetToken, resetExpires |
| `reset-password.js` | `fartooyoung-users` | SCAN by token, UPDATE | resetToken, resetExpires, hashedPassword |

---

## Current Lambda Functions (Phase 1 - Authentication)

### `login.js`
**Purpose**: User authentication and JWT token generation  
**Database**: `fartooyoung-users` table

| Function | Database Operation | Fields Accessed |
|----------|-------------------|-----------------|
| **Validate User** | `dynamodb.get()` by email | `email` (PK), `hashedPassword`, `name` |

**Database Query:**
```javascript
const result = await dynamodb.get({
  TableName: 'fartooyoung-users',
  Key: { email }  // Primary key lookup
}).promise();

// Uses: result.Item.hashedPassword, result.Item.name
```

**Code Flow:**
```javascript
1. Parse email/password from request body
2. Query fartooyoung-users table: GET by email (PK)
3. Check if user exists (result.Item)
4. Compare password with hashedPassword using bcrypt
5. Create JWT token with email + name
6. Return success response with user + token
```

### `register.js`
**Purpose**: New user account creation  
**Database**: `fartooyoung-users` table

| Function | Database Operation | Fields Created |
|----------|-------------------|----------------|
| **Check Existence** | `dynamodb.get()` by email | `email` (PK) |
| **Create User** | `dynamodb.put()` full object | All fields from database-design.md |

**Database Operations:**
```javascript
// Check if user exists
const existingUser = await dynamodb.get({
  TableName: 'fartooyoung-users',
  Key: { email }
}).promise();

// Create complete user object (matches database-design.md)
const newUser = {
  email,                    // Primary key
  name,
  hashedPassword,           // bcrypt hash
  userId: uuidv4(),         // UUID
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  
  // Future-ready fields (start as defaults)
  shippingAddress: null,
  billingAddress: null,
  preferences: {},
  loyaltyPoints: 0,
  isAuthor: false,
  authorProfile: null,
  publishedBooks: []
};

// Save to database
await dynamodb.put({
  TableName: 'fartooyoung-users',
  Item: newUser
}).promise();
```

### `logout.js`
**Purpose**: User session termination  
**Database**: None (JWT is stateless)

| Function | Database Operation | Fields Accessed |
|----------|-------------------|-----------------|
| **End Session** | None | N/A |

**Code Flow:**
```javascript
1. Extract JWT token from Authorization header
2. Validate token signature (no database query needed)
3. Return success (frontend removes token from localStorage)
```

### `forgot-password.js`
**Purpose**: Password reset initiation  
**Database**: `fartooyoung-users` table

| Function | Database Operation | Fields Updated |
|----------|-------------------|----------------|
| **Find User** | `dynamodb.get()` by email | `email` (PK) |
| **Save Reset Token** | `dynamodb.update()` | `resetToken`, `resetExpires` |

**Database Operations:**
```javascript
// Find user
const result = await dynamodb.get({
  TableName: 'fartooyoung-users',
  Key: { email }
}).promise();

// Update with reset token
await dynamodb.update({
  TableName: 'fartooyoung-users',
  Key: { email },
  UpdateExpression: 'SET resetToken = :token, resetExpires = :expires',
  ExpressionAttributeValues: {
    ':token': resetToken,      // UUID
    ':expires': resetExpires   // 15 minutes from now
  }
}).promise();
```

### `reset-password.js`
**Purpose**: Password reset completion  
**Database**: `fartooyoung-users` table

| Function | Database Operation | Fields Used |
|----------|-------------------|-------------|
| **Find by Token** | `dynamodb.scan()` with filter | `resetToken`, `resetExpires` |
| **Update Password** | `dynamodb.update()` | `hashedPassword`, remove `resetToken`/`resetExpires` |

**Database Operations:**
```javascript
// Find user by reset token (scan required since token is not PK)
const result = await dynamodb.scan({
  TableName: 'fartooyoung-users',
  FilterExpression: 'resetToken = :token',
  ExpressionAttributeValues: {
    ':token': token
  }
}).promise();

// Update password and remove reset fields
await dynamodb.update({
  TableName: 'fartooyoung-users',
  Key: { email: user.email },  // Use email PK for update
  UpdateExpression: 'SET hashedPassword = :password REMOVE resetToken, resetExpires',
  ExpressionAttributeValues: {
    ':password': hashedPassword  // New bcrypt hash
  }
}).promise();
```

---

## Future Lambda Functions (Phase 2 - Database Integration)

### Donation Functions → `fartooyoung-donations` table
- `create-donation.js` - PUT new donation record
- `get-donation-history.js` - QUERY by userId
- `process-recurring-donation.js` - PUT recurring donations

### E-commerce Functions → `fartooyoung-products` + `fartooyoung-orders` tables
- `create-product.js` - PUT to products table
- `get-products.js` - SCAN products table
- `create-order.js` - PUT to orders table, UPDATE product inventory
- `get-order-history.js` - QUERY orders by userId

### Book Management Functions → `fartooyoung-books` + related tables
- `create-book.js` - PUT to books table
- `get-books.js` - SCAN books table with filters
- `track-book-click.js` - PUT to book-clicks table
- `process-book-royalty.js` - PUT to book-royalties table

---

## Database Schema Compliance

### User Object Structure (Matches database-design.md)
```javascript
// Complete user object created by register.js
{
  // Core authentication fields
  email: "gary@test.com",           // Primary key
  name: "Gary Smith",
  hashedPassword: "$2a$10$...",     // bcrypt hash
  userId: "uuid-string",
  createdAt: "2024-11-20T...",
  lastLogin: "2024-11-20T...",
  
  // Password reset fields (optional)
  resetToken: "uuid-string",        // Only during reset process
  resetExpires: "2024-11-20T...",   // 15-minute expiration
  
  // Future e-commerce fields (defaults)
  shippingAddress: null,
  billingAddress: null,
  preferences: {},
  loyaltyPoints: 0,
  isAuthor: false,
  authorProfile: null,
  publishedBooks: []
}
```

### Primary Key Usage
- **All queries by email**: Uses `fartooyoung-users` primary key for efficient lookups
- **Token scanning**: Only `reset-password.js` requires scan operation (resetToken is not indexed)
- **Future optimization**: Consider GSI (Global Secondary Index) on userId for cross-table queries

---

## Technical Specifications

### Authentication & Security
- **Password Hashing**: bcrypt with 10 salt rounds (matches database security requirements)
- **JWT Tokens**: 24-hour expiration, contains email + name (matches user fields)
- **Reset Tokens**: UUID with 15-minute expiration (matches database design)
- **CORS**: Enabled for frontend integration

### Database Integration
- **AWS SDK**: DynamoDB DocumentClient for all database operations
- **Table Names**: Exact match with database-design.md (`fartooyoung-users`)
- **Field Names**: Consistent with database schema (camelCase)
- **Environment Variables**: 
  - `DYNAMODB_ENDPOINT` - Switches between local (localhost:8000) and AWS
  - `JWT_SECRET` - Token signing key
  - `NODE_ENV` - Environment detection

### Error Handling & Responses
- **Consistent Format**: All functions return standardized JSON responses
- **HTTP Status Codes**: 200 (success), 400 (client error), 401 (unauthorized), 500 (server error)
- **CORS Headers**: Included in all responses for frontend compatibility
- **Database Errors**: Proper error handling for DynamoDB exceptions

---

## API Endpoints

### Authentication Endpoints
| Method | Endpoint | Function | Database Table | Operation |
|--------|----------|----------|----------------|-----------|
| POST | `/auth/login` | login.js | fartooyoung-users | GET by email |
| POST | `/auth/register` | register.js | fartooyoung-users | GET (check) + PUT (create) |
| POST | `/auth/logout` | logout.js | None | JWT validation only |
| POST | `/auth/forgot-password` | forgot-password.js | fartooyoung-users | GET + UPDATE |
| POST | `/auth/reset-password` | reset-password.js | fartooyoung-users | SCAN + UPDATE |

### Request/Response Examples

**Register Request (Creates Full User Object):**
```json
POST /auth/register
{
  "email": "gary@test.com",
  "password": "password123",
  "name": "Gary Smith"
}
```

**Register Response:**
```json
{
  "success": true,
  "user": {
    "email": "gary@test.com",
    "name": "Gary Smith"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Deployment Architecture

### Local Development
- **SAM CLI**: Manages local Lambda execution with DynamoDB Local
- **Docker**: Containerizes Lambda runtime environment
- **Environment**: `DYNAMODB_ENDPOINT=http://localhost:8000`

### AWS Production  
- **API Gateway**: HTTP routing with CORS
- **Lambda Functions**: Serverless compute
- **DynamoDB**: Managed database with `fartooyoung-users` table
- **Environment**: `DYNAMODB_ENDPOINT=undefined` (uses AWS DynamoDB)

### Seamless Transition
- **Same Code**: Lambda functions work identically in local and AWS environments
- **Environment Detection**: Automatic endpoint switching based on environment variables
- **Database Schema**: Identical table structure in local and production
