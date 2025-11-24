# Environment Switching & AWS Deployment Guide

## Overview
This guide covers AWS staging deployment and production deployment for the Far Too Young platform using SAM (Serverless Application Model).

> **Note:** For local development setup and current project status, see [Development Progress Guide](../4-planning/development-progress.md)

---

## Understanding SAM Deployment

### What SAM Does Automatically
✅ **Creates CloudFormation Stack** - Groups all resources under one name
✅ **9 Lambda Functions** - All authentication and donation endpoints
✅ **2 DynamoDB Tables** - Users and donations tables with proper schemas
✅ **API Gateway** - REST API with CORS configuration
✅ **IAM Roles** - Execution permissions for each Lambda function
✅ **CloudWatch Logs** - Automatic logging for all functions

### What You Create Manually
❌ **S3 Bucket** - For React frontend hosting
❌ **CloudFront Distribution** - For global CDN
❌ **Route53 Records** - For custom domain (staging.fartooyoung.org)

### Key Concepts
- **Stack Name**: Project name that groups all AWS resources (e.g., `fartooyoung-staging`)
- **No VPC Needed**: Lambda functions run in AWS-managed infrastructure
- **Uses Your AWS CLI**: Reads from `~/.aws/credentials` for account/region info

---

## AWS Staging Deployment Guide

### Phase 1: Prepare Repository (5 minutes)

#### Step 1: Update SAM Template
Your `backend/template.yaml` already has staging support. Verify these parameters exist:
```yaml
Parameters:
  Environment:
    Type: String
    Default: development
    AllowedValues: [development, staging, production]
  
  JWTSecret:
    Type: String
    Default: "dev-secret-key"
    NoEcho: true
```

#### Step 2: Create Production Environment File
Create `.env.production`:
```bash
VITE_API_BASE_URL=https://api-staging.fartooyoung.org
VITE_ENVIRONMENT=staging
```

### Phase 2: Deploy Backend with SAM (10 minutes)

#### Step 3: Deploy SAM Stack
```bash
cd backend
sam build
sam deploy --guided
```

**SAM will ask you:**
- **Stack name**: `fartooyoung-staging`
- **AWS Region**: `us-east-1` (or your preferred region)
- **Parameter Environment**: `staging`
- **Parameter JWTSecret**: `your-production-jwt-secret-here`
- **Confirm changes before deploy**: `Y`
- **Allow SAM to create IAM roles**: `Y`
- **Save parameters to samconfig.toml**: `Y`

#### Step 4: Note Your API Gateway URL
After deployment, SAM will output:
```
Outputs:
ApiGatewayApi = https://abc123def.execute-api.us-east-1.amazonaws.com/Prod/
```
**Save this URL** - you'll need it for frontend configuration.

### Phase 3: Deploy Frontend (15 minutes)

#### Step 5: Create S3 Bucket
```bash
aws s3 mb s3://staging-fartooyoung-frontend --region us-east-1
aws s3 website s3://staging-fartooyoung-frontend --index-document index.html --error-document index.html
```

#### Step 6: Update Frontend Environment
Update `.env.production` with your actual API Gateway URL:
```bash
VITE_API_BASE_URL=https://abc123def.execute-api.us-east-1.amazonaws.com/Prod
VITE_ENVIRONMENT=staging
```

#### Step 7: Build and Deploy Frontend
```bash
npm run build
aws s3 sync dist/ s3://staging-fartooyoung-frontend --delete
```

#### Step 8: Create CloudFront Distribution
1. Go to AWS CloudFront Console
2. Create Distribution:
   - **Origin Domain**: `staging-fartooyoung-frontend.s3.us-east-1.amazonaws.com`
   - **Origin Path**: (leave empty)
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Alternate Domain Names**: `staging.fartooyoung.org`
   - **SSL Certificate**: Request via AWS Certificate Manager
   - **Default Root Object**: `index.html`
   - **Error Pages**: Add custom error response
     - HTTP Error Code: `404`
     - Response Page Path: `/index.html`
     - HTTP Response Code: `200`

#### Step 9: Create Route53 Record
1. Go to Route53 Console
2. Select `fartooyoung.org` hosted zone
3. Create Record:
   - **Name**: `staging`
   - **Type**: `A`
   - **Alias**: Yes
   - **Route traffic to**: CloudFront distribution
   - **Select your distribution**

### Phase 4: Test Deployment (5 minutes)

#### Step 10: Verify Everything Works
1. Visit `https://staging.fartooyoung.org`
2. Test user registration and login
3. Test donation flow
4. Check settings page functionality
5. Verify all API endpoints work

---

## AWS CodePipeline CI/CD Setup (Optional)

### Automated Deployment Pipeline

#### Backend BuildSpec
Create `buildspec-backend.yml`:
```yaml
version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
  pre_build:
    commands:
      - cd backend
  build:
    commands:
      - sam build
      - sam deploy --no-confirm-changeset --stack-name fartooyoung-staging --region us-east-1 --capabilities CAPABILITY_IAM --parameter-overrides Environment=staging JWTSecret=$JWT_SECRET
```

#### Frontend BuildSpec
Create `buildspec-frontend.yml`:
```yaml
version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
  build:
    commands:
      - npm install
      - npm run build
      - aws s3 sync dist/ s3://staging-fartooyoung-frontend --delete
      - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
```

#### CodePipeline Setup
1. **Create CodeBuild Projects** for backend and frontend
2. **Create CodePipeline** with GitHub source
3. **Set Environment Variables** in CodeBuild:
   - `JWT_SECRET`: Your production JWT secret
   - `CLOUDFRONT_ID`: Your CloudFront distribution ID

---

## Production Deployment (Future)

### When Ready for Production
1. Create `production` branch from `main`
2. Update stack name to `fartooyoung-production`
3. Create separate S3 bucket: `fartooyoung-frontend`
4. Point CloudFront to main domain: `fartooyoung.org`
5. Update Route53 A record for root domain

### Production Checklist
- [ ] SSL certificate for `fartooyoung.org`
- [ ] Production JWT secret in AWS Secrets Manager
- [ ] AWS SES for email notifications
- [ ] CloudWatch monitoring and alerts
- [ ] DynamoDB backup strategy
- [ ] Cost monitoring and budgets
- [ ] WAF for security protection

---

## Environment Variables Reference

### Local Development
```bash
VITE_API_BASE_URL=http://localhost:3001
VITE_ENVIRONMENT=development
```

### Staging
```bash
VITE_API_BASE_URL=https://abc123def.execute-api.us-east-1.amazonaws.com/Prod
VITE_ENVIRONMENT=staging
```

### Production (Future)
```bash
VITE_API_BASE_URL=https://api.fartooyoung.org
VITE_ENVIRONMENT=production
```

---

## Troubleshooting

### Common SAM Deployment Issues
1. **Permission Errors**: Ensure AWS CLI has proper IAM permissions
2. **Stack Already Exists**: Use `sam deploy` (without --guided) for updates
3. **Parameter Validation**: Check template.yaml parameter constraints
4. **Build Failures**: Run `sam validate` to check template syntax

### Common Frontend Issues
1. **CORS Errors**: Verify API Gateway CORS configuration in template.yaml
2. **404 Errors**: Ensure CloudFront error pages redirect to index.html
3. **Environment Variables**: Check .env.production has correct API URL
4. **Cache Issues**: Invalidate CloudFront cache after deployments

### Useful Commands
```bash
# Validate SAM template
sam validate

# Check stack status
aws cloudformation describe-stacks --stack-name fartooyoung-staging

# View stack resources
aws cloudformation list-stack-resources --stack-name fartooyoung-staging

# Delete stack (if needed)
sam delete --stack-name fartooyoung-staging

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## Cost Estimation

### Monthly Costs (Staging)
- **Lambda (9 functions)**: $0-8 (pay per request)
- **DynamoDB (2 tables)**: $0-10 (on-demand pricing)
- **API Gateway**: $0-5 (pay per API call)
- **S3**: $1-3 (frontend storage + requests)
- **CloudFront**: $0-5 (free tier covers most usage)
- **Route53**: $0.50 (hosted zone)
- **Total: $5-30/month** for staging with light usage

### Scaling to Production
- Add CloudWatch monitoring: +$5-10/month
- AWS SES for emails: +$1-5/month
- Increased traffic costs: Variable
- **Production estimate: $15-60/month** depending on usage

---

## Security Best Practices

### Implemented in SAM Template
✅ **JWT token authentication** with configurable secrets
✅ **IAM least privilege** - Each Lambda gets minimal permissions
✅ **HTTPS enforcement** via CloudFront
✅ **Parameter encryption** with NoEcho for secrets
✅ **CORS configuration** for secure API access

### Additional Security (Production)
- AWS WAF for DDoS protection
- AWS Secrets Manager for JWT rotation
- CloudTrail for audit logging
- VPC endpoints (if needed for compliance)
- Multi-factor authentication

---

*Last Updated: November 23, 2025*
*SAM Version: Latest*
*Ready for staging deployment with single command: `sam deploy --guided`*
