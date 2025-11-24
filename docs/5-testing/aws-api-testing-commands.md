# AWS API Testing Commands

## API Endpoint
```
Base URL: https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod
```

## Authentication Endpoints

### 1. Register User
```bash
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "email": "test@example.com",
    "name": "Test User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login User
```bash
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "email": "test@example.com",
    "name": "Test User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Logout User
```bash
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 4. Forgot Password
```bash
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Reset email sent if account exists"
}
```

## Donation Endpoints

### 5. Create Donation (No Auth Required)
```bash
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/donations \
  -H "Content-Type: application/json" \
  -d '{"amount":25.00,"paymentMethod":"credit_card","type":"one-time","email":"test@example.com","name":"John Doe"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Donation recorded successfully",
  "donation": {
    "id": "3e37e94f-7a29-4e65-8a75-6158b0be7496",
    "donationId": "3e37e94f-7a29-4e65-8a75-6158b0be7496",
    "amount": 25,
    "type": "one-time",
    "paymentMethod": "credit_card",
    "email": "test@example.com",
    "name": "John Doe",
    "status": "completed",
    "createdAt": "2025-11-24T05:29:21.148Z",
    "processedAt": "2025-11-24T05:29:21.148Z"
  }
}
```

### 6. Get Donations (Auth Required)
```bash
curl -X GET https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/donations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "donations": [
    {
      "donationId": "3e37e94f-7a29-4e65-8a75-6158b0be7496",
      "status": "completed",
      "createdAt": "2025-11-24T05:29:21.148Z",
      "amount": 25,
      "paymentMethod": "credit_card",
      "processedAt": "2025-11-24T05:29:21.148Z",
      "id": "3e37e94f-7a29-4e65-8a75-6158b0be7496",
      "email": "test@example.com",
      "name": "John Doe",
      "type": "one-time"
    }
  ]
}
```

### 7. Get Donations Without Auth (Should Fail)
```bash
curl -X GET https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/donations
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

## Complete Testing Workflow

### Step 1: Register a New User
```bash
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"securepass123","name":"New User"}'
```

### Step 2: Login and Get JWT Token
```bash
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"securepass123"}'
```

### Step 3: Create a Donation
```bash
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/donations \
  -H "Content-Type: application/json" \
  -d '{"amount":50.00,"paymentMethod":"paypal","type":"monthly","email":"newuser@example.com","name":"New User"}'
```

### Step 4: Get User's Donations (Use JWT from Step 2)
```bash
curl -X GET https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/donations \
  -H "Authorization: Bearer JWT_TOKEN_FROM_STEP_2"
```

### Step 5: Test Forgot Password
```bash
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com"}'
```

### Step 6: Logout
```bash
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKEN_FROM_STEP_2"
```

## Error Testing

### Test Invalid Login
```bash
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}'
```

### Test Missing Required Fields in Donation
```bash
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/donations \
  -H "Content-Type: application/json" \
  -d '{"amount":25.00}'
```

### Test Duplicate Registration
```bash
# First registration
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"duplicate@example.com","password":"testpass123","name":"Test User"}'

# Second registration (should fail)
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"duplicate@example.com","password":"testpass123","name":"Test User"}'
```

## Required Fields Reference

### Registration
- `email` (string, required)
- `password` (string, required)
- `name` (string, required)

### Login
- `email` (string, required)
- `password` (string, required)

### Create Donation
- `amount` (number, required)
- `paymentMethod` (string, required)
- `type` (string, optional, defaults to "one-time")
- `email` (string, optional)
- `name` (string, optional)

### Forgot Password
- `email` (string, required)

## Authentication Notes

- JWT tokens are returned from login and registration endpoints
- JWT tokens should be included in the `Authorization` header as `Bearer TOKEN`
- Tokens expire after 24 hours (86400 seconds)
- The `/donations` GET endpoint requires authentication
- The `/donations` POST endpoint does not require authentication
- All `/auth/*` endpoints except login and register require authentication

## Testing Tips

1. **Save JWT Tokens**: After login/register, save the JWT token for authenticated requests
2. **Test Error Cases**: Try invalid inputs to ensure proper error handling
3. **Check Response Status**: Look for `"success": true/false` in responses
4. **Verify Data Persistence**: Create donations and verify they appear in GET requests
5. **Test Authentication**: Try accessing protected endpoints without tokens
