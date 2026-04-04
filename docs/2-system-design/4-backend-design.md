# Far Too Young - Backend Design

## Overview
Complete production backend architecture for Far Too Young platform using 17 AWS Lambda functions, integrated with Stripe payments, email verification, and donation management.

**Status:** ✅ Production LIVE | ✅ 17 Functions Deployed | ✅ Real Payments Active

---

## Production Backend Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React App)                               │
│                        https://www.fartooyoung.org                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS API Calls
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                        │
│                 0o7onj0dr7.execute-api.us-east-1.amazonaws.com                 │
│                              17 Endpoints                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Route to Lambda Functions
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              LAMBDA FUNCTIONS                                   │
│                            (Serverless Backend)                                │
│─────────────────────────────────────────────────────────────────────────────────│
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ Authentication  │  │ Donations &     │  │ Stripe Payment  │                │
│  │   (9 Functions) │  │ Management      │  │  (5 Functions)  │                │
│  │─────────────────│  │  (2 Functions)  │  │─────────────────│                │
│  │• Login          │  │─────────────────│  │• Checkout       │                │
│  │• Register       │  │• Create         │  │• Payment Intent │                │
│  │• Logout         │  │• Get History    │  │• Portal Session │                │
│  │• Email Verify   │  │                 │  │• Subscriptions  │                │
│  │• Resend Verify  │  │                 │  │• Webhook        │                │
│  │• Forgot Password│  │                 │  │                 │                │
│  │• Reset Password │  │                 │  │                 │                │
│  │• Update Profile │  │                 │  │                 │                │
│  │• Change Password│  │                 │  │                 │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐              │
│  │                    External Integrations                    │              │
│  │─────────────────────────────────────────────────────────────│              │
│  │• AWS SES (Email Service)                                    │              │
│  │• AWS Secrets Manager (API Keys)                             │              │
│  │• Stripe API (Payment Processing)                            │              │
│  │• Rate Limiting (Anti-Bot Protection)                        │              │
│  └─────────────────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Database Operations
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DYNAMODB TABLES                                   │
│─────────────────────────────────────────────────────────────────────────────────│
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ Users Table     │  │ Donations Table │  │ Rate Limits     │                │
│  │─────────────────│  │─────────────────│  │─────────────────│                │
│  │• Email (PK)     │  │• ID (PK)        │  │• Key (PK)       │                │
│  │• Password Hash  │  │• User Email     │  │• Attempts Count │                │
│  │• Name           │  │• Amount         │  │• TTL (Auto-Del) │                │
│  │• Email Verified │  │• Stripe ID      │  │• IP Tracking    │                │
│  │• Verify Token   │  │• Type           │  │                 │                │
│  │• Created Date   │  │• Status         │  │                 │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Lambda Functions Overview

### Authentication Functions (9 Functions)

| Function | Endpoint | Database Tables | Purpose |
|----------|----------|-----------------|---------|
| `login.js` | POST /auth/login | users, rate-limits | User authentication with rate limiting |
| `register.js` | POST /auth/register | users, rate-limits | Account creation with email verification |
| `logout.js` | POST /auth/logout | None | JWT token invalidation |
| `verify-email.js` | GET /auth/verify-email | users | Email address verification |
| `resend-verification.js` | POST /auth/resend-verification | users | Resend verification email |
| `forgot-password.js` | POST /auth/forgot-password | users | Password reset initiation |
| `reset-password.js` | POST /auth/reset-password | users | Password reset completion |
| `update-profile.js` | POST /auth/update-profile | users | User profile updates |
| `change-password.js` | POST /auth/change-password | users | Password change |

### Donation Functions (2 Functions)

| Function | Endpoint | Database Tables | Purpose |
|----------|----------|-----------------|---------|
| `create-donation.js` | POST /donations | donations | Record donation transactions |
| `get-donations.js` | GET /donations | donations | Retrieve user donation history |

### Stripe Payment Functions (5 Functions)

| Function | Endpoint | Database Tables | Purpose |
|----------|----------|-----------------|---------|
| `create-checkout-session.js` | POST /stripe/create-checkout-session | donations | Stripe Checkout integration |
| `create-payment-intent.js` | POST /stripe/create-payment-intent | None | Direct payment processing |
| `create-portal-session.js` | POST /stripe/create-portal-session | None | Customer subscription portal |
| `list-subscriptions.js` | GET /stripe/list-subscriptions | None | User subscription management |
| `webhook.js` | POST /stripe/webhook | donations | Payment event processing |

### External Integrations

| Service | Purpose | Used By |
|---------|---------|---------|
| **AWS SES** | Email delivery | register, verify-email, resend-verification, forgot-password |
| **Stripe API** | Payment processing | All stripe functions |
| **Secrets Manager** | API key storage | All functions requiring secrets |
| **Rate Limiting** | Bot protection | login, register |

---

## Core Authentication Functions

### `login.js` - User Authentication
**Database**: `users` + `rate-limits` tables  
**Security**: Rate limited (5 attempts per 15 minutes)

```javascript
// Database Operations
1. Check rate limits by IP + email
2. Query users table by email (PK)
3. Verify password with bcrypt
4. Update rate limit counter
5. Generate JWT token
6. Return user data + token
```

### `register.js` - Account Creation  
**Database**: `users` + `rate-limits` tables  
**Email**: SES verification email sent

```javascript
// Database Operations
1. Check rate limits (5 attempts per hour)
2. Check if user exists by email
3. Hash password with bcrypt
4. Generate verification token
5. Create user record with verified=false
6. Send verification email via SES
7. Update rate limit counter
```

### `verify-email.js` - Email Verification
**Database**: `users` table

```javascript
// Database Operations
1. Find user by verification token
2. Check token expiry (1 hour)
3. Update user: verified=true
4. Remove verification token
5. Return success response
```

## Payment Processing Functions

### `create-checkout-session.js` - Stripe Checkout
**Integrations**: Stripe API + `donations` table

```javascript
// Process Flow
1. Get Stripe secret from Secrets Manager
2. Create Stripe checkout session
3. Record pending donation in database
4. Return checkout URL to frontend
```

### `webhook.js` - Payment Events
**Database**: `donations` table  
**Security**: Stripe signature verification

```javascript
// Webhook Processing
1. Verify Stripe webhook signature
2. Process payment events (success/failure)
3. Update donation status in database
4. Handle subscription events
5. Send confirmation emails via SES
```

## User Management Functions

### `update-profile.js` - Profile Updates
**Database**: `users` table  
**Security**: JWT authentication required

```javascript
// Update Operations
1. Validate JWT token
2. Update user name/email in database
3. Handle email change verification
4. Return updated user data
```

### `change-password.js` - Password Change
**Database**: `users` table  
**Security**: Current password verification

```javascript
// Security Flow
1. Validate JWT token
2. Verify current password
3. Hash new password with bcrypt
4. Update password in database
5. Return success confirmation
```

---

## Production API Endpoints

### Authentication Endpoints
| Method | Endpoint | Function | Purpose |
|--------|----------|----------|---------|
| POST | `/auth/login` | login.js | User authentication |
| POST | `/auth/register` | register.js | Account creation |
| POST | `/auth/logout` | logout.js | Session termination |
| GET | `/auth/verify-email` | verify-email.js | Email verification |
| POST | `/auth/resend-verification` | resend-verification.js | Resend verification |
| POST | `/auth/forgot-password` | forgot-password.js | Password reset start |
| POST | `/auth/reset-password` | reset-password.js | Password reset complete |
| POST | `/auth/update-profile` | update-profile.js | Profile updates |
| POST | `/auth/change-password` | change-password.js | Password change |

### Donation Endpoints
| Method | Endpoint | Function | Purpose |
|--------|----------|----------|---------|
| POST | `/donations` | create-donation.js | Record donations |
| GET | `/donations` | get-donations.js | Donation history |

### Stripe Payment Endpoints
| Method | Endpoint | Function | Purpose |
|--------|----------|----------|---------|
| POST | `/stripe/create-checkout-session` | create-checkout-session.js | Stripe Checkout |
| POST | `/stripe/create-payment-intent` | create-payment-intent.js | Direct payments |
| POST | `/stripe/create-portal-session` | create-portal-session.js | Customer portal |
| GET | `/stripe/list-subscriptions` | list-subscriptions.js | Subscription list |
| POST | `/stripe/webhook` | webhook.js | Payment events |

### Production Base URL
**API Gateway**: `https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/Prod`

### Example API Calls

**User Registration:**
```bash
POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/Prod/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Create Donation:**
```bash
POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/Prod/stripe/create-checkout-session
{
  "amount": 2500,
  "type": "one-time",
  "email": "user@example.com"
}
```

## Security & Technical Specifications

### Multi-Layer Security
- **Rate Limiting**: IP + email tracking with TTL auto-expiry
- **Password Security**: bcrypt with 10 salt rounds
- **JWT Tokens**: 24-hour expiration with secure signing
- **Email Verification**: Required for account activation
- **Stripe Security**: Webhook signature verification
- **Secrets Management**: AWS Secrets Manager for API keys

### Database Architecture
- **3 DynamoDB Tables**: users, donations, rate-limits
- **Primary Keys**: Optimized for query patterns
- **TTL**: Auto-expiring rate limit records
- **Indexes**: Efficient data access patterns

### External Integrations
- **Stripe API**: Live payment processing
- **AWS SES**: Transactional email delivery
- **Secrets Manager**: Secure credential storage
- **CloudWatch**: Logging and monitoring

---

## Deployment Architecture

### Local Development
```
React (localhost:5173) → SAM Local (localhost:3001) → DynamoDB Local (Docker:8000)
```

### Production Environment (LIVE)
```
React (CloudFront) → API Gateway → Lambda Functions → DynamoDB
                                      ↓
                              External Services:
                              • Stripe API
                              • AWS SES
                              • Secrets Manager
```

### Environment Configuration
- **Local**: Uses Docker for DynamoDB, mock Stripe keys
- **Staging**: AWS services with test Stripe keys
- **Production**: Full AWS stack with live Stripe processing

---

## Future Enhancements

### Planned Features
- **Books Management**: Author profile and book showcase
- **E-commerce Shop**: Product catalog and order processing
- **Blog System**: Content management and publishing
- **Analytics**: Donation tracking and user insights

### Scalability Considerations
- **Auto-scaling**: Lambda functions scale automatically
- **Database**: DynamoDB on-demand scaling
- **Caching**: CloudFront for API response caching
- **Monitoring**: CloudWatch alerts and dashboards

---

**Last Updated:** December 11, 2025  
**Production Status:** ✅ 17 Functions LIVE  
**Payment Status:** ✅ Real Stripe Processing Active
