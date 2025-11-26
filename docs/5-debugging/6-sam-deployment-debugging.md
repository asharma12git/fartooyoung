# SAM Deployment Debugging Summary

## Issues Encountered and Solutions

### 1. CORS Configuration Syntax Errors
**Problem**: Initial SAM template had incorrect CORS configuration syntax causing validation failures.

**Error**: 
```
Template format error: Every Cors property must have at least one of the following properties defined: [AllowCredentials, AllowHeaders, AllowMethods, AllowOrigin, ExposeHeaders, MaxAge]
```

**Solution**: Created minimal template without CORS configuration to isolate the issue.
- Created `template-minimal.yaml` with basic Lambda and DynamoDB resources
- Successfully validated and deployed minimal version first

### 2. DynamoDB Billing Mode Configuration
**Problem**: Template used incorrect billing mode value `ON_DEMAND` instead of `PAY_PER_REQUEST`.

**Error**:
```
Value provided to parameter 'BillingMode' is invalid. Valid values: PROVISIONED | PAY_PER_REQUEST
```

**Solution**: Updated DynamoDB table configuration:
```yaml
# Before (incorrect)
BillingMode: ON_DEMAND

# After (correct)
BillingMode: PAY_PER_REQUEST
```

### 3. Environment Parameter Validation
**Problem**: Template didn't include "staging" in AllowedValues for Environment parameter.

**Solution**: Updated template.yaml parameters:
```yaml
Parameters:
  Environment:
    Type: String
    Default: staging
    AllowedValues:
      - staging
      - production
```

### 4. Stack Rollback Handling
**Problem**: Failed deployments left stack in ROLLBACK_COMPLETE state, preventing redeployment.

**Solution**: Used SAM delete command to clean up failed stacks:
```bash
sam delete --stack-name fartooyoung-staging
```

## Key Commands Used

### Validation and Build
```bash
sam validate -t template.yaml
sam build -t template-minimal.yaml
```

### Deployment
```bash
sam deploy --guided
sam deploy --stack-name fartooyoung-staging --s3-bucket fartooyoung-backend-staging --capabilities CAPABILITY_IAM --region us-east-1 --parameter-overrides Environment=staging JWTSecret=FTY-Staging-JWT-Secure-Key
```

### Cleanup
```bash
sam delete --stack-name fartooyoung-staging
```

### Resource Verification
```bash
aws cloudformation describe-stacks --stack-name fartooyoung-staging --region us-east-1
aws lambda list-functions --region us-east-1
aws dynamodb list-tables --region us-east-1
```

## Final Working Configuration

### Stack Details
- **Stack Name**: fartooyoung-staging
- **Region**: us-east-1
- **S3 Bucket**: fartooyoung-backend-staging
- **Environment**: staging
- **JWT Secret**: FTY-Staging-JWT-Secure-Key

### Resources Created
- 9 Lambda Functions (auth + donations)
- 2 DynamoDB Tables (users, donations)
- API Gateway with proper permissions
- IAM roles for each Lambda function

### API Endpoint
```
https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/
```

## Lessons Learned

1. **Template Validation**: Always validate templates before deployment to catch syntax errors early
2. **Incremental Deployment**: Use minimal templates to isolate configuration issues
3. **Parameter Validation**: Ensure all parameter values match allowed values in template
4. **Stack Cleanup**: Failed stacks must be deleted before redeployment
5. **Resource Naming**: CloudFormation adds random suffixes to resource names for uniqueness
6. **Environment Variables**: Lambda functions properly inherit environment-specific configurations

## Best Practices Applied

- Environment separation (staging vs production)
- Secure JWT secret management
- Proper IAM role configuration
- Stack-based resource management
- Automated rollback on failures
