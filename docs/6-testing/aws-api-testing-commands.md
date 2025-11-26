# AWS API Testing Commands

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

# Get specific API details
aws apigateway get-rest-api --rest-api-id f20mzr7xcg --region us-east-1

# List all resources/endpoints in your API
aws apigateway get-resources --rest-api-id f20mzr7xcg --region us-east-1

# List API stages
aws apigateway get-stages --rest-api-id f20mzr7xcg --region us-east-1
```

### View Lambda Functions
```bash
# List all Lambda functions
aws lambda list-functions --region us-east-1

# Get specific function details
aws lambda get-function --function-name fartooyoung-staging-RegisterFunction-GaGzUZqdnRAm --region us-east-1

# List functions with staging prefix
aws lambda list-functions --region us-east-1 --query 'Functions[?starts_with(FunctionName, `fartooyoung-staging`)]'
```

### View DynamoDB Tables
```bash
# List all DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Describe specific table
aws dynamodb describe-table --table-name fartooyoung-staging-users-table --region us-east-1
aws dynamodb describe-table --table-name fartooyoung-staging-donations-table --region us-east-1

# Scan table contents (be careful with large tables)
aws dynamodb scan --table-name fartooyoung-staging-users-table --region us-east-1 --max-items 10
aws dynamodb scan --table-name fartooyoung-staging-donations-table --region us-east-1 --max-items 10
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
