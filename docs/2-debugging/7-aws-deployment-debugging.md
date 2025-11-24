# AWS Deployment Debugging Summary

## Issues Encountered and Solutions

### 1. Lambda Function Timeout - Local DynamoDB Connection
**Problem**: Lambda functions deployed to AWS were trying to connect to local DynamoDB endpoint.

**Error**: 
```
Duration: 3000.00 ms	Status: timeout
DYNAMODB_ENDPOINT: 'http://host.docker.internal:8000'
```

**Root Cause**: Environment variable `DYNAMODB_ENDPOINT` was set to local Docker endpoint instead of empty for AWS deployment.

**Solution**: Redeployed with empty DynamoDB endpoint parameter:
```bash
sam deploy --parameter-overrides "Environment=staging JWTSecret=FTY-Staging-JWT-Secure-Key DynamoDBEndpoint=''"
```

### 2. DynamoDB Access Denied - Missing IAM Permissions
**Problem**: Lambda functions lacked permissions to access DynamoDB tables.

**Error**:
```
AccessDeniedException: User: arn:aws:sts::538781441544:assumed-role/fartooyoung-staging-RegisterFunctionRole-2nx4WmoMK3pG/fartooyoung-staging-RegisterFunction-GaGzUZqdnRAm is not authorized to perform: dynamodb:GetItem
```

**Root Cause**: SAM template missing DynamoDB permissions for Lambda functions.

**Solution**: Added DynamoDB policies to each Lambda function:
```yaml
Policies:
  - DynamoDBCrudPolicy:
      TableName: !Sub "${AWS::StackName}-users-table"
```

### 3. Table Name Mismatch - Hardcoded vs Dynamic Names
**Problem**: Lambda code used hardcoded table names that didn't match actual AWS table names.

**Error**:
```
not authorized to perform: dynamodb:GetItem on resource: arn:aws:dynamodb:us-east-1:538781441544:table/fartooyoung-users
```

**Root Cause**: 
- Lambda code: `TableName: 'fartooyoung-users'`
- Actual table: `fartooyoung-staging-users-table`

**Solution**: 
1. Added environment variables to SAM template:
```yaml
Environment:
  Variables:
    USERS_TABLE: !Sub "${AWS::StackName}-users-table"
    DONATIONS_TABLE: !Sub "${AWS::StackName}-donations-table"
```

2. Updated Lambda code to use environment variables:
```javascript
const USERS_TABLE = process.env.USERS_TABLE || 'fartooyoung-users';
// Then use: TableName: USERS_TABLE
```

## Debugging Commands Used

### CloudWatch Logs Investigation
```bash
# Find log groups
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/fartooyoung-staging-RegisterFunction" --region us-east-1

# Get log streams
aws logs describe-log-streams --log-group-name "/aws/lambda/fartooyoung-staging-RegisterFunction-GaGzUZqdnRAm" --descending --order-by "LastEventTime" --region us-east-1

# Get error logs
aws logs get-log-events --log-group-name "/aws/lambda/fartooyoung-staging-RegisterFunction-GaGzUZqdnRAm" --log-stream-name "2025/11/24/[\$LATEST]b538895992ec4f739d32018846fbe143" --region us-east-1
```

### Deployment Commands
```bash
# Build and deploy with corrected parameters
sam build
sam deploy --stack-name fartooyoung-staging --s3-bucket fartooyoung-backend-staging --capabilities CAPABILITY_IAM --region us-east-1 --parameter-overrides "Environment=staging JWTSecret=FTY-Staging-JWT-Secure-Key DynamoDBEndpoint=''"
```

### Testing Commands
```bash
# Test registration endpoint
curl -X POST https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

## Final Working Configuration

### Environment Variables (AWS Deployment)
```
DYNAMODB_ENDPOINT: '' (empty for AWS DynamoDB)
JWT_SECRET: 'FTY-Staging-JWT-Secure-Key'
USERS_TABLE: 'fartooyoung-staging-users-table'
DONATIONS_TABLE: 'fartooyoung-staging-donations-table'
```

### SAM Template Key Sections
```yaml
Globals:
  Function:
    Environment:
      Variables:
        DYNAMODB_ENDPOINT: !Ref DynamoDBEndpoint
        JWT_SECRET: !Ref JWTSecret
        USERS_TABLE: !Sub "${AWS::StackName}-users-table"
        DONATIONS_TABLE: !Sub "${AWS::StackName}-donations-table"

RegisterFunction:
  Type: AWS::Serverless::Function
  Properties:
    Policies:
      - DynamoDBCrudPolicy:
          TableName: !Sub "${AWS::StackName}-users-table"
```

### Lambda Code Pattern
```javascript
const USERS_TABLE = process.env.USERS_TABLE || 'fartooyoung-users';

// Use in DynamoDB operations
await dynamodb.get({
  TableName: USERS_TABLE,
  Key: { email }
}).promise();
```

## Success Result

**Final Test Response**:
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

## Key Lessons Learned

1. **Environment-Specific Configuration**: AWS deployment requires different environment variables than local development
2. **IAM Permissions**: Lambda functions need explicit DynamoDB permissions via SAM policies
3. **Dynamic Resource Naming**: Use CloudFormation references instead of hardcoded names
4. **CloudWatch Debugging**: Essential for diagnosing Lambda function errors in AWS
5. **Parameter Validation**: Ensure deployment parameters match expected values
6. **Code vs Infrastructure**: Both Lambda code and SAM template must be aligned for table names

## Deployment Sequence

1. **Local Development**: Works with local DynamoDB and hardcoded table names
2. **AWS Deployment**: Requires empty DynamoDB endpoint, IAM permissions, and dynamic table names
3. **Testing**: Use CloudWatch logs to debug, then test endpoints with curl
4. **Success**: API returns proper responses with JWT tokens

This debugging process took the deployment from timeout errors to fully functional AWS API endpoints.
