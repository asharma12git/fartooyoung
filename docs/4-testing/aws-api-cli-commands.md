# AWS API Testing Commands - Far Too Young Project

## Current AWS Resources Overview - December 11, 2025

### **🟢 PRODUCTION STACK: fartooyoung-production** ✅ LIVE
- **Website**: https://www.fartooyoung.org
- **API Gateway**: https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com
- **17 Lambda Functions**: Complete auth, donation, and Stripe system
- **3 DynamoDB Tables**: Users, donations, and rate-limits
- **CloudFront CDN**: E2PHSH4ED2AIN5 (global distribution)
- **S3 Frontend**: fartooyoung-frontend-production
- **AWS Secrets Manager**: fartooyoung-production-secrets-tEmB4i
- **Live Payments**: Real Stripe integration processing donations

### **🔵 STAGING STACK: fartooyoung-staging** (Development)
- **API Gateway**: https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com
- **Testing Environment**: Safe for development and testing

---

## AWS Resource Viewing Commands

### View All Stack Resources
```bash
# List all CloudFormation stacks
aws cloudformation list-stacks --region us-east-1

# Describe PRODUCTION stack
aws cloudformation describe-stacks --stack-name fartooyoung-production --region us-east-1

# Describe STAGING stack
aws cloudformation describe-stacks --stack-name fartooyoung-staging --region us-east-1

# List all resources in PRODUCTION stack
aws cloudformation list-stack-resources --stack-name fartooyoung-production --region us-east-1

# List all resources in STAGING stack
aws cloudformation list-stack-resources --stack-name fartooyoung-staging --region us-east-1
```

### View API Gateway Resources
```bash
# List all API Gateway APIs
aws apigateway get-rest-apis --region us-east-1

# Get PRODUCTION API details (0o7onj0dr7)
aws apigateway get-rest-api --rest-api-id 0o7onj0dr7 --region us-east-1

# Get STAGING API details (71z0wz0dg9)
aws apigateway get-rest-api --rest-api-id 71z0wz0dg9 --region us-east-1

# List all resources/endpoints in PRODUCTION API
aws apigateway get-resources --rest-api-id 0o7onj0dr7 --region us-east-1

# List all resources/endpoints in STAGING API
aws apigateway get-resources --rest-api-id 71z0wz0dg9 --region us-east-1
```

### View Lambda Functions
```bash
# List all Lambda functions
aws lambda list-functions --region us-east-1

# List PRODUCTION functions
aws lambda list-functions --region us-east-1 --query 'Functions[?starts_with(FunctionName, `fartooyoung-production`)]'

# List STAGING functions
aws lambda list-functions --region us-east-1 --query 'Functions[?starts_with(FunctionName, `fartooyoung-staging`)]'

# Get specific PRODUCTION function details
aws lambda get-function --function-name fartooyoung-production-LoginFunction-XXXXX --region us-east-1

# Get function configuration (shows environment variables)
aws lambda get-function-configuration --function-name fartooyoung-production-LoginFunction-XXXXX --region us-east-1
```

### View DynamoDB Tables
```bash
# List all DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Describe PRODUCTION tables
aws dynamodb describe-table --table-name fartooyoung-production-users-table --region us-east-1
aws dynamodb describe-table --table-name fartooyoung-production-donations-table --region us-east-1
aws dynamodb describe-table --table-name fartooyoung-production-rate-limits --region us-east-1

# Describe STAGING tables
aws dynamodb describe-table --table-name fartooyoung-staging-users-table --region us-east-1
aws dynamodb describe-table --table-name fartooyoung-staging-donations-table --region us-east-1

# Scan PRODUCTION table contents (be careful with large tables)
aws dynamodb scan --table-name fartooyoung-production-users-table --region us-east-1 --max-items 5
aws dynamodb scan --table-name fartooyoung-production-donations-table --region us-east-1 --max-items 10
```

### View AWS Secrets Manager
```bash
# List all secrets
aws secretsmanager list-secrets --region us-east-1

# Get PRODUCTION secret details (metadata only)
aws secretsmanager describe-secret --secret-id fartooyoung-production-secrets-tEmB4i --region us-east-1

# Get STAGING secret details
aws secretsmanager describe-secret --secret-id fartooyoung-staging-secrets --region us-east-1

# Get PRODUCTION secret value (SENSITIVE - contains actual secrets)
aws secretsmanager get-secret-value --secret-id fartooyoung-production-secrets-tEmB4i --region us-east-1

# List secrets by environment
aws secretsmanager list-secrets --region us-east-1 --query 'SecretList[?starts_with(Name, `fartooyoung-production`)]'
aws secretsmanager list-secrets --region us-east-1 --query 'SecretList[?starts_with(Name, `fartooyoung-staging`)]'
```

### View CloudFront Distribution (Production Only)
```bash
# List all CloudFront distributions
aws cloudfront list-distributions --query 'DistributionList.Items[?Comment==`fartooyoung-production`]'

# Get specific distribution details (E2PHSH4ED2AIN5)
aws cloudfront get-distribution --id E2PHSH4ED2AIN5

# Get distribution configuration
aws cloudfront get-distribution-config --id E2PHSH4ED2AIN5
```

### View S3 Buckets
```bash
# List S3 buckets
aws s3 ls

# List contents of PRODUCTION frontend bucket
aws s3 ls s3://fartooyoung-frontend-production/

# List contents of STAGING SAM deployment bucket
aws s3 ls s3://fartooyoung-backend-staging/
```

### Quick Resource Summary
```bash
# Production resources summary
echo "=== PRODUCTION STACK ===" && \
aws cloudformation describe-stacks --stack-name fartooyoung-production --region us-east-1 --query 'Stacks[0].{StackName:StackName,Status:StackStatus,Created:CreationTime}' && \
echo -e "\n=== PRODUCTION API GATEWAY ===" && \
aws apigateway get-rest-api --rest-api-id 0o7onj0dr7 --region us-east-1 --query '{Name:name,ID:id,Created:createdDate}' && \
echo -e "\n=== PRODUCTION LAMBDA FUNCTIONS ===" && \
aws lambda list-functions --region us-east-1 --query 'Functions[?starts_with(FunctionName, `fartooyoung-production`)].{Name:FunctionName,Runtime:Runtime}' && \
echo -e "\n=== PRODUCTION DYNAMODB TABLES ===" && \
aws dynamodb list-tables --region us-east-1 --query 'TableNames[?starts_with(@, `fartooyoung-production`)]'
```

---

## API Endpoints

### **🟢 PRODUCTION API** (Live System)
```
Base URL: https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com
Status: ✅ LIVE - Processing real donations and user accounts
```

### **🔵 STAGING API** (Development/Testing)
```
Base URL: https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com
Status: 🧪 TESTING - Safe for development and testing
```

## All Available Endpoints (Both Environments)

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login  
- `POST /auth/logout` - User logout (requires auth)
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/verify-email` - Verify email address ✅ PRODUCTION
- `POST /auth/resend-verification` - Resend verification email ✅ PRODUCTION
- `POST /auth/update-profile` - Update user profile (requires auth)
- `POST /auth/change-password` - Change user password (requires auth)

### Donation Endpoints  
- `POST /donations/create` - Create donation (no auth required) ✅ PRODUCTION
- `GET /donations/history` - Get user donations (requires auth) ✅ PRODUCTION

### Stripe Payment Endpoints ✅ PRODUCTION LIVE
- `POST /stripe/create-checkout-session` - Create Stripe checkout session
- `POST /stripe/create-payment-intent` - Create payment intent for embedded checkout
- `POST /stripe/create-portal-session` - Create customer portal session (requires auth)
- `GET /stripe/list-subscriptions` - List user subscriptions (requires auth)
- `POST /stripe/webhook` - Stripe webhook handler (Stripe calls this)

### User Management Endpoints ✅ PRODUCTION
- `GET /user/profile` - Get user profile (requires auth)
- `PUT /user/profile` - Update user profile (requires auth)
- `DELETE /user/account` - Delete user account (requires auth)

---

## Authentication Endpoints

### 1. Register User

**🟢 PRODUCTION (Live System):**
```bash
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

**🔵 STAGING (Testing):**
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "email": "test@example.com",
    "name": "Test User",
    "isVerified": false
  }
}
```

### 2. Login User

**🟢 PRODUCTION:**
```bash
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**🔵 STAGING:**
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "email": "test@example.com",
    "name": "Test User",
    "isVerified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Verify Email (Production Only)

**🟢 PRODUCTION:**
```bash
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"verification-token-from-email"}'
```

### 4. Logout User

**🟢 PRODUCTION:**
```bash
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**🔵 STAGING:**
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 5. Forgot Password

**🟢 PRODUCTION:**
```bash
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**🔵 STAGING:**
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Donation Endpoints

### 6. Create Donation (No Auth Required)

**🟢 PRODUCTION (Live Payments):**
```bash
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/donations/create \
  -H "Content-Type: application/json" \
  -d '{"amount":25.00,"type":"one-time","donorInfo":{"email":"test@example.com","name":"John Doe"}}'
```

**🔵 STAGING (Test Payments):**
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/donations/create \
  -H "Content-Type: application/json" \
  -d '{"amount":25.00,"type":"one-time","donorInfo":{"email":"test@example.com","name":"John Doe"}}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Donation recorded successfully",
  "donation": {
    "donationId": "3e37e94f-7a29-4e65-8a75-6158b0be7496",
    "amount": 2500,
    "type": "one-time",
    "status": "completed",
    "createdAt": "2025-12-11T20:29:21.148Z",
    "processedAt": "2025-12-11T20:29:21.148Z"
  }
}
```

### 7. Get Donation History (Auth Required)

**🟢 PRODUCTION:**
```bash
curl -X GET https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/donations/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**🔵 STAGING:**
```bash
curl -X GET https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/donations/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "donations": [
    {
      "donationId": "3e37e94f-7a29-4e65-8a75-6158b0be7496",
      "amount": 2500,
      "type": "one-time",
      "status": "completed",
      "createdAt": "2025-12-11T20:29:21.148Z",
      "processedAt": "2025-12-11T20:29:21.148Z",
      "stripePaymentId": "pi_1234567890"
    }
  ]
}
```

## Stripe Payment Endpoints ✅ LIVE PAYMENTS

### 8. Create Checkout Session (Live Stripe Integration)

**🟢 PRODUCTION (Real Payments):**
```bash
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "donorInfo": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "type": "one-time"
  }'
```

**🔵 STAGING (Test Payments):**
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "donorInfo": {
      "name": "John Doe", 
      "email": "john@example.com"
    },
    "type": "one-time"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "sessionUrl": "https://checkout.stripe.com/pay/cs_live_...",
  "sessionId": "cs_live_..."
}
```

### 9. Create Payment Intent (For Embedded Checkout)

**🟢 PRODUCTION:**
```bash
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.00,
    "donorInfo": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "type": "one-time"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "clientSecret": "pi_live_..._secret_...",
  "paymentIntentId": "pi_live_..."
}
```

### 10. Create Customer Portal Session (Auth Required)

**🟢 PRODUCTION:**
```bash
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/stripe/create-portal-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "returnUrl": "https://www.fartooyoung.org/dashboard"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "portalUrl": "https://billing.stripe.com/session/..."
}
```

### 11. List User Subscriptions (Auth Required)

**🟢 PRODUCTION:**
```bash
curl -X GET https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/stripe/list-subscriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": "sub_live_...",
      "status": "active",
      "amount": 2500,
      "currency": "usd",
      "interval": "month",
      "created": 1733961600,
      "currentPeriodEnd": 1736640000,
      "cancelAtPeriodEnd": false
    }
  ]
}
```

## Complete Testing Workflow

### 🟢 **PRODUCTION TESTING** (Live System)

**⚠️ WARNING: Production testing creates real user accounts and processes real payments**

### Step 1: Register a New User (Production)
```bash
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"prodtest@example.com","password":"securepass123","name":"Production Test User"}'
```

### Step 2: Verify Email (Check your email for verification link)
```bash
# Use verification token from email
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"VERIFICATION_TOKEN_FROM_EMAIL"}'
```

### Step 3: Login and Get JWT Token (Production)
```bash
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"prodtest@example.com","password":"securepass123"}'
```

### Step 4: Create Live Stripe Checkout Session
```bash
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.00,
    "donorInfo": {
      "name": "Production Test User",
      "email": "prodtest@example.com"
    },
    "type": "one-time"
  }'
```

### 🔵 **STAGING TESTING** (Safe Development)

### Step 1: Register a New User (Staging)
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"stagingtest@example.com","password":"securepass123","name":"Staging Test User"}'
```

### Step 2: Login and Get JWT Token (Staging)
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"stagingtest@example.com","password":"securepass123"}'
```

### Step 3: Create a Test Donation (Staging)
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/donations/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "type": "monthly",
    "donorInfo": {
      "email": "stagingtest@example.com",
      "name": "Staging Test User"
    }
  }'
```

### Step 4: Get User's Donations (Use JWT from Step 2)
```bash
curl -X GET https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/donations/history \
  -H "Authorization: Bearer JWT_TOKEN_FROM_STEP_2"
```

### Step 5: Test Forgot Password (Staging)
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"stagingtest@example.com"}'
```

### Step 6: Logout (Staging)
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKEN_FROM_STEP_2"
```

## Error Testing

### Test Invalid Login (Both Environments)
```bash
# Production
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}'

# Staging  
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}'
```

### Test Missing Required Fields in Donation
```bash
# Production
curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/donations/create \
  -H "Content-Type: application/json" \
  -d '{"amount":25.00}'

# Staging
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/donations/create \
  -H "Content-Type: application/json" \
  -d '{"amount":25.00}'
```

### Test Duplicate Registration
```bash
# First registration (Staging)
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"duplicate@example.com","password":"testpass123","name":"Test User"}'

# Second registration (should fail)
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"duplicate@example.com","password":"testpass123","name":"Test User"}'
```

### Test Rate Limiting (Production has rate limits)
```bash
# Make multiple rapid requests to trigger rate limiting
for i in {1..10}; do
  curl -X POST https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
done
```

## Required Fields Reference

### Registration
- `email` (string, required) - Valid email format
- `password` (string, required) - Minimum 8 characters
- `name` (string, required) - User's display name

### Login
- `email` (string, required) - Registered email address
- `password` (string, required) - User's password

### Create Donation
- `amount` (number, required) - Donation amount in USD
- `type` (string, optional) - "one-time" or "recurring" (defaults to "one-time")
- `donorInfo` (object, optional) - Donor information
  - `email` (string, optional) - Donor email
  - `name` (string, optional) - Donor name

### Stripe Checkout Session
- `amount` (number, required) - Payment amount in USD
- `type` (string, required) - "one-time" or "recurring"
- `donorInfo` (object, required) - Donor information
  - `name` (string, required) - Donor name
  - `email` (string, required) - Donor email

### Forgot Password
- `email` (string, required) - Registered email address

### Email Verification
- `token` (string, required) - Verification token from email

## Authentication Notes

- **JWT Tokens**: Returned from login and registration endpoints
- **Authorization Header**: Include as `Bearer TOKEN` for protected endpoints
- **Token Expiration**: 24 hours (86400 seconds)
- **Protected Endpoints**: `/donations/history`, `/stripe/create-portal-session`, `/stripe/list-subscriptions`
- **Public Endpoints**: `/auth/register`, `/auth/login`, `/donations/create`, `/stripe/create-checkout-session`
- **Rate Limiting**: Production has IP-based rate limiting (10 requests per minute)
- **Email Verification**: Required in production, optional in staging

## Testing Tips

1. **Environment Separation**: Use staging for development, production only for final testing
2. **Save JWT Tokens**: Store tokens from login/register for authenticated requests  
3. **Test Error Cases**: Verify proper error handling with invalid inputs
4. **Check Response Status**: Look for `"success": true/false` in all responses
5. **Verify Data Persistence**: Create donations and verify they appear in history
6. **Test Authentication Flow**: Register → Verify Email → Login → Access Protected Endpoints
7. **Monitor Rate Limits**: Production has stricter limits than staging
8. **Real Payment Testing**: Use Stripe test cards in staging, real cards in production

---

## 🚀 **PRODUCTION STATUS SUMMARY**

**✅ LIVE API**: https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com
- **17 Lambda Functions**: All endpoints operational
- **3 DynamoDB Tables**: Users, donations, rate-limits
- **Live Stripe Integration**: Processing real payments
- **Email Verification**: SES integration active
- **Rate Limiting**: DynamoDB-based protection
- **Security**: JWT authentication, HTTPS enforcement

**🧪 STAGING API**: https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com  
- **Safe Testing Environment**: No real payments or emails
- **Full Feature Parity**: Same endpoints as production
- **Development Ready**: Perfect for integration testing

---

*Last Updated: December 11, 2025*  
*Production API Status: ✅ LIVE and processing real transactions*
