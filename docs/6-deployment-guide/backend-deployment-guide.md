# Backend Deployment Guide - AWS SAM

This guide documents the step-by-step process to deploy the Far Too Young backend to AWS using AWS SAM (Serverless Application Model).

> **Note:** This guide uses **staging environment** values as examples. For production deployment, follow the same steps but use `--config-env production` and update production-specific values in `samconfig.toml`.

## AWS Services Used

- **Lambda**: Serverless compute for 18 API functions
- **API Gateway**: REST API with CORS configuration
- **DynamoDB**: NoSQL database for users, donations, and rate limits
- **Secrets Manager**: Secure storage for JWT secrets and Stripe API keys
- **SES (Simple Email Service)**: Email sending for verification and password reset
- **CloudFormation**: Infrastructure as code (used by SAM under the hood)
- **S3**: Storage for Lambda deployment packages
- **CloudWatch Logs**: Lambda function logging and monitoring
- **IAM (Identity and Access Management)**: Roles and policies for Lambda functions

## Prerequisites

- AWS CLI installed and configured
- AWS SAM CLI installed (`brew install aws-sam-cli` on macOS)
- Node.js 18.x installed
- Domain configured in Route 53 (for SES email sending)

## Environment-Specific Values

This guide uses staging values. Replace with production values as needed:

| Resource        | Staging                              | Production                                |
|-----------------|--------------------------------------|-------------------------------------------|
| Stack Name      | `fartooyoung-staging`                | `fartooyoung-production`                  |
| S3 Bucket       | `fartooyoung-backend-staging`        | `fartooyoung-backend-production`          |
| Secrets Name    | `fartooyoung-staging-secrets`        | `fartooyoung-production-secrets`          |
| Deploy Command  | `sam deploy --config-env staging`    | `sam deploy --config-env production`      |
| API Domain      | `staging-api.fartooyoung.org` (opt)  | `api.fartooyoung.org` (optional)          |

**Note:** Production configuration already exists in `samconfig.toml` - just update the Secrets Manager ARN.

## Deployment Steps Overview

1. **Create Secrets Manager Secret** - Store JWT secret and Stripe API keys
2. **Create S3 Bucket for SAM Artifacts** - Storage for Lambda deployment packages
3. **Verify SES Email Identity** - Enable email sending for verification and password reset
4. **Build the SAM Application** - Install dependencies and package Lambda functions
5. **Deploy to Staging** - Create CloudFormation stack with all resources
6. **Verify Deployment** - Check stack status and test API endpoints
7. **View Logs** - Monitor Lambda function execution in CloudWatch

---

## Configuration Files

### 1. samconfig.toml

Defines deployment configurations for each environment:

```toml
[default]
[default.deploy.parameters]
stack_name = "fartooyoung-local"
s3_bucket = "fartooyoung-backend-local"
region = "us-east-1"
capabilities = "CAPABILITY_IAM"
parameter_overrides = [
    "Environment=local",
    "SecretsManagerArn="
]

[staging]
[staging.deploy.parameters]
stack_name = "fartooyoung-staging"
s3_bucket = "fartooyoung-backend-staging"
region = "us-east-1"
capabilities = "CAPABILITY_IAM"
parameter_overrides = [
    "Environment=staging",
    "DynamoDBEndpoint=\"\"",
    "SecretsManagerArn=arn:aws:secretsmanager:us-east-1:538781441544:secret:fartooyoung-staging-secrets-BjIpQD"
]

[production]
[production.deploy.parameters]
stack_name = "fartooyoung-production"
s3_bucket = "fartooyoung-backend-production"
region = "us-east-1"
capabilities = "CAPABILITY_IAM"
parameter_overrides = [
    "Environment=production",
    "DynamoDBEndpoint=\"\"",
    "SecretsManagerArn=YOUR_PRODUCTION_SECRETS_MANAGER_ARN"
]
```

### 2. template.yaml

Defines all AWS resources using CloudFormation syntax:
- 18 Lambda functions
- API Gateway with CORS
- 3 DynamoDB tables
- IAM policies for each function

---

## Step 1: Create Secrets Manager Secret

Store sensitive credentials in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name fartooyoung-staging-secrets \
  --description "Secrets for Far Too Young staging environment" \
  --secret-string '{
    "JWT_SECRET": "your-random-jwt-secret-here",
    "STRIPE_SECRET_KEY": "sk_test_...",
    "STRIPE_WEBHOOK_SECRET": "whsec_..."
  }' \
  --region us-east-1
```

**Output:** Secret ARN
```
arn:aws:secretsmanager:us-east-1:538781441544:secret:fartooyoung-staging-secrets-BjIpQD
```

Update `samconfig.toml` with this ARN.

---

## Step 2: Create S3 Bucket for SAM Artifacts

SAM needs an S3 bucket to upload Lambda code packages:

```bash
aws s3api create-bucket \
  --bucket fartooyoung-backend-staging \
  --region us-east-1
```

---

## Step 3: Verify SES Email Identity

Lambda functions send emails via SES. Verify your domain:

```bash
aws ses verify-domain-identity \
  --domain fartooyoung.org \
  --region us-east-1
```

Add the verification TXT record to Route 53:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z10244882P83IUVL8IHLM \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "_amazonses.fartooyoung.org",
        "Type": "TXT",
        "TTL": 300,
        "ResourceRecords": [{"Value": "\"verification-token-from-ses\""}]
      }
    }]
  }'
```

Verify the email address for sending:

```bash
aws ses verify-email-identity \
  --email-address admin@fartooyoung.org \
  --region us-east-1
```

---

## Step 4: Build the SAM Application

Navigate to backend directory and build:

```bash
cd /Users/avinashsharma/WebstormProjects/fartooyoung/backend
sam build
```

This:
- Installs Node.js dependencies
- Packages Lambda functions
- Prepares CloudFormation template

---

## Step 5: Deploy to Staging

Deploy using the staging configuration:

```bash
sam deploy --config-env staging
```

SAM will:
1. Upload Lambda code to S3
2. Create CloudFormation stack
3. Deploy all resources (Lambda, API Gateway, DynamoDB)
4. Output the API Gateway URL

**Output:**
```
Stack fartooyoung-staging
  Status: CREATE_COMPLETE
  Outputs:
    ApiGatewayApi: https://abc123xyz.execute-api.us-east-1.amazonaws.com/Prod/
```

---

## Step 6: Verify Deployment

Check stack status:

```bash
aws cloudformation describe-stacks \
  --stack-name fartooyoung-staging \
  --region us-east-1 \
  --query 'Stacks[0].StackStatus'
```

List all resources created:

```bash
aws cloudformation list-stack-resources \
  --stack-name fartooyoung-staging \
  --region us-east-1
```

Test the API:

```bash
curl https://abc123xyz.execute-api.us-east-1.amazonaws.com/Prod/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## Step 7: View Logs

Check Lambda function logs in CloudWatch:

```bash
sam logs --stack-name fartooyoung-staging --name LoginFunction --tail
```

Or use AWS CLI:

```bash
aws logs tail /aws/lambda/fartooyoung-staging-LoginFunction \
  --follow \
  --region us-east-1
```

---

## Updating the Backend

After making code changes:

```bash
# Build and deploy in one command
sam build && sam deploy --config-env staging
```

Or use the shorthand:

```bash
sam sync --stack-name fartooyoung-staging --watch
```

This watches for file changes and auto-deploys (useful for development).

---

## Deploying to Production

Update `samconfig.toml` with production Secrets Manager ARN, then:

```bash
sam build && sam deploy --config-env production
```

---

## Resources Created

### Lambda Functions (18 total)
- **Auth**: Login, Register, Logout, ForgotPassword, ResetPassword, UpdateProfile, ChangePassword, VerifyEmail, ResendVerification
- **Donations**: CreateDonation, GetDonations
- **Stripe**: CreateCheckoutSession, CreatePaymentIntent, CreatePortalSession, ListSubscriptions, StripeWebhook

### DynamoDB Tables
- **UsersTable**: Stores user accounts (email as primary key)
- **DonationsTable**: Stores donation records (id as primary key)
- **RateLimitsTable**: Tracks rate limiting (limitKey as primary key, TTL enabled)

### API Gateway
- REST API with `/Prod/` stage
- CORS enabled for all origins
- 18 endpoints mapped to Lambda functions

### IAM Roles
- Each Lambda function has its own execution role
- Policies grant access to DynamoDB, Secrets Manager, and SES

---

## Environment Variables

Set automatically by SAM for all Lambda functions:

```yaml
DYNAMODB_ENDPOINT: "" (empty for AWS, set for local DynamoDB)
SECRETS_MANAGER_ARN: arn:aws:secretsmanager:...
USERS_TABLE: fartooyoung-staging-users-table
DONATIONS_TABLE: fartooyoung-staging-donations-table
RATE_LIMIT_TABLE: fartooyoung-staging-rate-limits
SES_FROM_EMAIL: admin@fartooyoung.org
SES_REGION: us-east-1
```

---

## Cost Breakdown (Staging)

- **Lambda**: Free tier covers 1M requests/month
- **API Gateway**: Free tier covers 1M requests/month
- **DynamoDB**: Free tier covers 25 GB storage + 25 RCU/WCU
- **Secrets Manager**: $0.40/month per secret
- **SES**: $0.10 per 1,000 emails (after free tier)
- **CloudWatch Logs**: Minimal cost for log storage

**Total Monthly Cost:** ~$0.40-$1.00/month (mostly Secrets Manager)

---

## Troubleshooting

### Deployment fails with "S3 bucket does not exist"
Create the bucket specified in `samconfig.toml`:
```bash
aws s3api create-bucket --bucket fartooyoung-backend-staging --region us-east-1
```

### Lambda function returns 500 error
Check CloudWatch logs:
```bash
sam logs --stack-name fartooyoung-staging --name FunctionName --tail
```

### DynamoDB access denied
Verify the Lambda function has `DynamoDBCrudPolicy` in `template.yaml`

### Secrets Manager access denied
Verify `SecretsManagerArn` is correct in `samconfig.toml` and Lambda has permission

### SES email not sending
- Verify domain and email identity in SES
- Check if SES is in sandbox mode (requires recipient verification)
- Request production access: https://console.aws.amazon.com/ses/

### Rate limiting not working
Verify `RateLimitsTable` has TTL enabled:
```bash
aws dynamodb describe-table \
  --table-name fartooyoung-staging-rate-limits \
  --query 'Table.TimeToLiveDescription'
```

---

## Deleting the Stack

To remove all resources:

```bash
aws cloudformation delete-stack \
  --stack-name fartooyoung-staging \
  --region us-east-1
```

**Warning:** This deletes all DynamoDB tables and data. Backup first if needed.

---

## Key Commands Reference

```bash
# Build
sam build

# Deploy to staging
sam deploy --config-env staging

# Deploy to production
sam deploy --config-env production

# View logs
sam logs --stack-name fartooyoung-staging --name LoginFunction --tail

# Auto-deploy on file changes
sam sync --stack-name fartooyoung-staging --watch

# Validate template
sam validate

# List stack resources
aws cloudformation list-stack-resources --stack-name fartooyoung-staging

# Delete stack
aws cloudformation delete-stack --stack-name fartooyoung-staging
```

---

## Key Resources

- **Stack Name:** fartooyoung-staging
- **S3 Bucket:** fartooyoung-backend-staging
- **Secrets Manager ARN:** arn:aws:secretsmanager:us-east-1:538781441544:secret:fartooyoung-staging-secrets-BjIpQD
- **API Gateway URL:** https://abc123xyz.execute-api.us-east-1.amazonaws.com/Prod/
- **Region:** us-east-1

---

## Additional Notes

- SAM uses CloudFormation under the hood - you can view the stack in CloudFormation console
- `template.yaml` uses SAM-specific transforms (AWS::Serverless::Function) that get converted to standard CloudFormation
- The `samconfig.toml` file stores deployment parameters so you don't need to pass them via CLI flags
- Rate limiting implementation prevents bot attacks (5 attempts/hour for registration, 5 attempts/15min for login)
- All Lambda functions use Node.js 18.x runtime
