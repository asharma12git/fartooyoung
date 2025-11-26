# AWS API Testing Commands - Far Too Young Project

## Current AWS Resources Overview - 2025-11-26

### **Production Stack: fartooyoung-staging**
- **API Gateway**: https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/
- **14 Lambda Functions**: All auth, donation, and Stripe endpoints
- **2 DynamoDB Tables**: Users and donations
- **AWS Secrets Manager**: Centralized secret storage
- **IAM Roles**: Function-specific roles with Secrets Manager permissions
- **S3 Bucket**: SAM deployment artifacts (fartooyoung-backend-staging)

---

## AWS Resource Viewing Commands

### View All Stack Resources
```bash
# List all CloudFormation stacks
aws cloudformation list-stacks --region us-east-1

# Describe your specific stack
aws cloudformation describe-stacks --stack-name fartooyoung-staging --region us-east-1

# List all resources in your stack
aws cloudformation list-stack-resources --stack-name fartooyoung-staging --region us-east-1
```

### View API Gateway Resources
```bash
# List all API Gateway APIs
aws apigateway get-rest-apis --region us-east-1

# Get specific API details (current staging API)
aws apigateway get-rest-api --rest-api-id 71z0wz0dg9 --region us-east-1

# List all resources/endpoints in your API
aws apigateway get-resources --rest-api-id 71z0wz0dg9 --region us-east-1

# List API stages
aws apigateway get-stages --rest-api-id 71z0wz0dg9 --region us-east-1
```

### View Lambda Functions
```bash
# List all Lambda functions
aws lambda list-functions --region us-east-1

# List functions with staging prefix
aws lambda list-functions --region us-east-1 --query 'Functions[?starts_with(FunctionName, `fartooyoung-staging`)]'

# Get specific function details (example - replace with actual function name)
aws lambda get-function --function-name fartooyoung-staging-LoginFunction-XXXXX --region us-east-1

# Get function configuration (shows environment variables)
aws lambda get-function-configuration --function-name fartooyoung-staging-LoginFunction-XXXXX --region us-east-1
```

### View DynamoDB Tables
```bash
# List all DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Describe specific tables
aws dynamodb describe-table --table-name fartooyoung-staging-users-table --region us-east-1
aws dynamodb describe-table --table-name fartooyoung-staging-donations-table --region us-east-1

# Scan table contents (be careful with large tables)
aws dynamodb scan --table-name fartooyoung-staging-users-table --region us-east-1 --max-items 5
aws dynamodb scan --table-name fartooyoung-staging-donations-table --region us-east-1 --max-items 10
```

### View AWS Secrets Manager
```bash
# List all secrets
aws secretsmanager list-secrets --region us-east-1

# Get secret details (metadata only, not values)
aws secretsmanager describe-secret --secret-id fartooyoung-staging-secrets --region us-east-1

# Get secret value (SENSITIVE - contains actual secrets)
aws secretsmanager get-secret-value --secret-id arn:aws:secretsmanager:us-east-1:538781441544:secret:fartooyoung-staging-secrets-BjIpQD --region us-east-1

# List secrets with staging prefix
aws secretsmanager list-secrets --region us-east-1 --query 'SecretList[?starts_with(Name, `fartooyoung-staging`)]'
```

### View IAM Roles
```bash
# List IAM roles created by your stack
aws iam list-roles --query 'Roles[?starts_with(RoleName, `fartooyoung-staging`)]' --region us-east-1

# Get specific role details
aws iam get-role --role-name fartooyoung-staging-RegisterFunctionRole-2nx4WmoMK3pG --region us-east-1
```

### View CloudWatch Logs
```bash
# List log groups for your Lambda functions
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/fartooyoung-staging" --region us-east-1

# Get recent logs for a specific function
aws logs describe-log-streams --log-group-name "/aws/lambda/fartooyoung-staging-RegisterFunction-GaGzUZqdnRAm" --order-by LastEventTime --descending --region us-east-1

# Get actual log events (replace log-stream-name with actual stream)
aws logs get-log-events --log-group-name "/aws/lambda/fartooyoung-staging-RegisterFunction-GaGzUZqdnRAm" --log-stream-name "STREAM_NAME_HERE" --region us-east-1
```

### View S3 Buckets (SAM Deployment)
```bash
# List S3 buckets
aws s3 ls

# List contents of your SAM deployment bucket
aws s3 ls s3://fartooyoung-backend-staging/
```

### Quick Resource Summary
```bash
# One-liner to see all your resources
echo "=== CLOUDFORMATION STACK ===" && \
aws cloudformation describe-stacks --stack-name fartooyoung-staging --region us-east-1 --query 'Stacks[0].{StackName:StackName,Status:StackStatus,Created:CreationTime}' && \
echo -e "\n=== API GATEWAY ===" && \
aws apigateway get-rest-apis --region us-east-1 --query 'items[?name==`fartooyoung-staging`].{Name:name,ID:id,Created:createdDate}' && \
echo -e "\n=== LAMBDA FUNCTIONS ===" && \
aws lambda list-functions --region us-east-1 --query 'Functions[?starts_with(FunctionName, `fartooyoung-staging`)].{Name:FunctionName,Runtime:Runtime,Modified:LastModified}' && \
echo -e "\n=== DYNAMODB TABLES ===" && \
aws dynamodb list-tables --region us-east-1 --query 'TableNames[?starts_with(@, `fartooyoung-staging`)]'
```

---

## API Endpoint
```
Base URL: https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod
```

## All Available Endpoints

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout (requires auth)
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/update-profile` - Update user profile (requires auth)
- `POST /auth/change-password` - Change user password (requires auth)

### Donation Endpoints
- `POST /donations` - Create donation (no auth required)
- `GET /donations` - Get user donations (requires auth)

### Stripe Payment Endpoints
- `POST /stripe/create-checkout-session` - Create Stripe checkout session
- `POST /stripe/create-payment-intent` - Create payment intent for embedded checkout
- `POST /stripe/create-portal-session` - Create customer portal session (requires auth)
- `GET /stripe/list-subscriptions` - List user subscriptions (requires auth)
- `POST /stripe/webhook` - Stripe webhook handler (Stripe calls this)

---

## Authentication Endpoints

### 1. Register User
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/auth/register \
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
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/auth/login \
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
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/auth/logout \
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
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/auth/forgot-password \
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

### 5. Update Profile (Auth Required)
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/auth/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"firstName":"John","lastName":"Doe","phone":"(555) 123-4567"}'
```

### 6. Change Password (Auth Required)
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"currentPassword":"oldpass123","newPassword":"newpass123","confirmPassword":"newpass123"}'
```

## Donation Endpoints

### 7. Create Donation (No Auth Required)
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/donations \
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
    "createdAt": "2025-11-26T19:29:21.148Z",
    "processedAt": "2025-11-26T19:29:21.148Z"
  }
}
```

### 8. Get Donations (Auth Required)
```bash
curl -X GET https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/donations \
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
      "createdAt": "2025-11-26T19:29:21.148Z",
      "amount": 25,
      "paymentMethod": "credit_card",
      "processedAt": "2025-11-26T19:29:21.148Z",
      "id": "3e37e94f-7a29-4e65-8a75-6158b0be7496",
      "email": "test@example.com",
      "name": "John Doe",
      "type": "one-time"
    }
  ]
}
```

## Stripe Payment Endpoints

### 9. Create Checkout Session
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "donor_info": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "donation_type": "one-time"
  }'
```

**Expected Response:**
```json
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
  "session_id": "cs_test_..."
}
```

### 10. Create Payment Intent (For Embedded Checkout)
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.00,
    "donor_info": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    },
    "donation_type": "one-time"
  }'
```

**Expected Response:**
```json
{
  "client_secret": "pi_test_..._secret_..."
}
```

### 11. Create Portal Session (Auth Required)
```bash
curl -X POST https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/stripe/create-portal-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "customer_email": "test@example.com",
    "return_url": "https://yoursite.com/dashboard"
  }'
```

**Expected Response:**
```json
{
  "portal_url": "https://billing.stripe.com/session/..."
}
```

### 12. List Subscriptions (Auth Required)
```bash
curl -X GET "https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/stripe/list-subscriptions?customer_email=test@example.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "active_subscriptions": [
    {
      "id": "sub_...",
      "status": "active",
      "amount": 25.00,
      "currency": "usd",
      "interval": "month",
      "created": 1732648800,
      "current_period_end": 1735327200,
      "cancel_at_period_end": false,
      "canceled_at": null
    }
  ],
  "inactive_subscriptions": []
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
