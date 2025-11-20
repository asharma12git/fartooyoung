# Debug Session 1: Local Lambda + DynamoDB Setup Issues

**Date**: November 20, 2025  
**Context**: Setting up local testing environment with SAM CLI and DynamoDB Local  
**Outcome**: ✅ Successfully resolved - Authentication system working locally

---

## Issues Encountered & Solutions

### 1. Missing Lambda Dependencies
**Error**: `Cannot find module 'aws-sdk'`
```
Runtime.ImportModuleError: Error: Cannot find module 'aws-sdk'
Require stack:
- /var/task/logout.js
```

**Root Cause**: Dependencies installed in `/backend/` but Lambda functions in `/backend/lambda/auth/`

**Solution**:
```bash
cd /backend/lambda/auth
npm init -y
npm install aws-sdk bcryptjs jsonwebtoken uuid
```

**Lesson**: Each Lambda function directory needs its own `package.json` and `node_modules`

---

### 2. UUID ES Module Import Error
**Error**: `require() of ES Module not supported`
```
Error [ERR_REQUIRE_ESM]: require() of ES Module /var/task/node_modules/uuid/dist-node/index.js 
from /var/task/register.js not supported.
```

**Root Cause**: `uuid` package is ES Module, incompatible with CommonJS `require()`

**Solution**:
```javascript
// Before (broken)
const { v4: uuidv4 } = require('uuid');
userId: uuidv4()

// After (working)
const { randomUUID } = require('crypto');
userId: randomUUID()
```

**Lesson**: Use Node.js built-in modules when possible to avoid compatibility issues

---

### 3. DynamoDB Connection Timeout
**Error**: `Function timed out after 3 seconds`
```
Function 'RegisterFunction' timed out after 3 seconds
No response from invoke container for RegisterFunction
```

**Root Cause**: Lambda containers couldn't reach DynamoDB Local on `localhost:8000`

**Solution Attempts**:
1. ❌ `http://localhost:8000` - Docker can't reach host localhost
2. ❌ `http://host.docker.internal:8000` - Works from container but not from host
3. ❌ `http://dynamodb-local:8000` - Container name resolution failed
4. ✅ `http://192.168.1.199:8000` - Host machine IP address

**Final Configuration**:
```yaml
# template.yaml
Environment:
  Variables:
    DYNAMODB_ENDPOINT: http://192.168.1.199:8000
```

**Lesson**: Docker containers need host machine IP to reach services on host

---

### 4. DynamoDB Table Not Found
**Error**: `ResourceNotFoundException: Cannot do operations on a non-existent table`
```
ResourceNotFoundException: Cannot do operations on a non-existent table
```

**Root Cause**: Table created at different endpoint than Lambda was using

**Solution**:
```bash
# Delete and recreate table at correct endpoint
aws dynamodb delete-table --table-name fartooyoung-users \
  --endpoint-url http://192.168.1.199:8000 --region us-east-1

aws dynamodb create-table --table-name fartooyoung-users \
  --attribute-definitions AttributeName=email,AttributeType=S \
  --key-schema AttributeName=email,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://192.168.1.199:8000 --region us-east-1
```

**Lesson**: Ensure table creation uses same endpoint as Lambda functions

---

### 5. Missing AWS Credentials
**Error**: DynamoDB operations failing despite correct endpoint

**Root Cause**: DynamoDB Local expects AWS credentials even for local testing

**Solution**:
```yaml
# template.yaml
Environment:
  Variables:
    DYNAMODB_ENDPOINT: http://192.168.1.199:8000
    AWS_ACCESS_KEY_ID: dummy
    AWS_SECRET_ACCESS_KEY: dummy
```

**Lesson**: Local AWS services still require credential configuration

---

### 6. bcrypt Performance Timeout
**Error**: Function timeout during password hashing
```
INFO: Hashing password...
Function 'RegisterFunction' timed out after 3 seconds
```

**Root Cause**: bcrypt with 10 salt rounds too slow for 3-second Lambda timeout in local environment

**Solution**:
```javascript
// Local testing (faster)
const hashedPassword = await bcrypt.hash(password, 4);

// Production (secure)
const hashedPassword = await bcrypt.hash(password, 10);
```

**Lesson**: Local testing may need performance adjustments

---

## Final Working Configuration

### SAM Template (`template.yaml`)
```yaml
Globals:
  Function:
    Environment:
      Variables:
        DYNAMODB_ENDPOINT: http://192.168.1.199:8000
        JWT_SECRET: dev-secret-key
        AWS_ACCESS_KEY_ID: dummy
        AWS_SECRET_ACCESS_KEY: dummy
```

### Lambda Function Configuration
```javascript
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: 'us-east-1'
});
```

### Commands Used
```bash
# Start DynamoDB Local
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local

# Start SAM CLI
sam local start-api --port 3001

# Test endpoint
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "gary@test.com", "password": "test123", "name": "Gary Smith"}'
```

---

## Success Result
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

## Production Impact

### ✅ No Changes Needed
- Dependencies structure works identically in AWS
- Business logic remains the same
- Database schema and queries unchanged

### 🔄 Automatic Improvements in Production
- Real AWS DynamoDB (faster, more reliable)
- No Docker networking issues
- Better Lambda performance
- Proper IAM roles instead of dummy credentials

### ⚙️ Production Optimizations Required
- Restore bcrypt salt rounds to 10
- Remove local environment variables
- Use AWS Secrets Manager for JWT_SECRET
- Remove DYNAMODB_ENDPOINT (use default AWS)

---

## Time Investment
- **Total Debug Time**: ~45 minutes
- **Root Cause**: Local development environment complexity
- **Value**: Robust local testing setup for future development

## Key Takeaway
This debugging session was entirely about local development setup. The core authentication system is production-ready. AWS deployment will be simpler and more reliable than local testing.
