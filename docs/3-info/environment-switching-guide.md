# Environment Switching & AWS Deployment Guide

## Overview
This guide covers AWS staging deployment and production deployment for the Far Too Young platform.

> **Note:** For local development setup and current project status, see [Development Progress Guide](../4-planning/development-progress.md)

---

## AWS Staging Deployment Guide

### Phase 1: Prepare Repository (10 minutes)

#### Step 1: Update SAM Template
Add staging environment to `backend/template.yaml`:
```yaml
Parameters:
  Environment:
    Type: String
    Default: development
    AllowedValues: [development, staging, production]  # Add staging
    Description: Deployment environment
  
  JWTSecret:
    Type: String
    Default: "dev-secret-key"
    NoEcho: true  # Add this line for security
```

#### Step 2: Create Backend BuildSpec
Create `buildspec-backend.yml` in root directory:
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

#### Step 3: Create Frontend BuildSpec
Create `buildspec-frontend.yml` in root directory:
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

#### Step 4: Create Production Environment File
Create `.env.production`:
```bash
VITE_API_BASE_URL=https://api-staging.fartooyoung.org
VITE_ENVIRONMENT=staging
```

### Phase 2: Create AWS Infrastructure (20 minutes)

#### Step 5: Create S3 Bucket for Frontend
```bash
aws s3 mb s3://staging-fartooyoung-frontend --region us-east-1
aws s3 website s3://staging-fartooyoung-frontend --index-document index.html --error-document index.html
```

#### Step 6: Create CloudFront Distribution
1. Go to AWS CloudFront Console
2. Create Distribution
3. Origin Domain: staging-fartooyoung-frontend.s3.us-east-1.amazonaws.com
4. Origin Path: (leave empty)
5. Viewer Protocol Policy: Redirect HTTP to HTTPS
6. Alternate Domain Names: staging.fartooyoung.org
7. SSL Certificate: Request certificate via ACM
8. Default Root Object: index.html
9. Error Pages: 404 → /index.html (for React routing)

#### Step 7: Create Route53 Record
1. Go to Route53 Console
2. Select fartooyoung.org hosted zone
3. Create Record:
   - Name: staging
   - Type: A
   - Alias: Yes
   - Route traffic to: CloudFront distribution
   - Select your distribution

### Phase 3: Set up CodePipeline (25 minutes)

#### Step 8: Create IAM Roles

**CodePipeline Service Role:**
```bash
aws iam create-role --role-name CodePipelineServiceRole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"Service": "codepipeline.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }
  ]
}'

aws iam attach-role-policy --role-name CodePipelineServiceRole --policy-arn arn:aws:iam::aws:policy/AWSCodePipelineFullAccess
```

**CodeBuild Service Role:**
```bash
aws iam create-role --role-name CodeBuildServiceRole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"Service": "codebuild.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }
  ]
}'

aws iam attach-role-policy --role-name CodeBuildServiceRole --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
```

#### Step 9: Create CodeBuild Projects

**Backend Build Project:**
1. Go to CodeBuild Console
2. Create Project:
   - Name: fartooyoung-backend-build
   - Source: GitHub (connect to your repo)
   - Environment: Amazon Linux 2, Standard runtime
   - Buildspec: buildspec-backend.yml
   - Service Role: CodeBuildServiceRole

**Frontend Build Project:**
1. Create Project:
   - Name: fartooyoung-frontend-build
   - Source: GitHub (connect to your repo)
   - Environment: Amazon Linux 2, Standard runtime
   - Buildspec: buildspec-frontend.yml
   - Environment Variables:
     - CLOUDFRONT_ID: (your distribution ID)
   - Service Role: CodeBuildServiceRole

#### Step 10: Create CodePipeline
1. Go to CodePipeline Console
2. Create Pipeline:
   - Name: fartooyoung-staging-pipeline
   - Service Role: CodePipelineServiceRole
   - Source Stage:
     - Provider: GitHub
     - Repository: asharma12git/fartooyoung
     - Branch: main
   - Build Stage:
     - Add Action: Backend Build (CodeBuild project)
     - Add Action: Frontend Build (CodeBuild project)
   - Deploy Stage: Skip (handled by CodeBuild)

### Phase 4: Deploy & Test (10 minutes)

#### Step 11: Push to GitHub
```bash
git add .
git commit -m "Add AWS CodePipeline deployment configuration

✅ Added staging environment support
✅ Created buildspec files for CodeBuild
✅ Added production environment configuration
✅ Ready for automated deployment to staging.fartooyoung.org"

git push origin main
```

#### Step 12: Monitor & Test
1. Watch CodePipeline execution in AWS Console
2. Check CloudWatch logs for any errors
3. Test staging.fartooyoung.org:
   - Registration/Login
   - Donation flow
   - Settings page
   - Password change

---

## Production Deployment (Future)

### When Ready for Production
1. Create `production` branch from `main`
2. Update environment variables for production
3. Create separate CodePipeline for production branch
4. Deploy to fartooyoung.org (main domain)

### Production Checklist
- [ ] SSL certificate for fartooyoung.org
- [ ] Production JWT secret in AWS Secrets Manager
- [ ] AWS SES for email notifications
- [ ] CloudWatch monitoring and alerts
- [ ] Backup strategy for DynamoDB
- [ ] Cost monitoring and budgets

---

## Environment Variables Reference

### Local Development
```bash
VITE_API_BASE_URL=http://localhost:3001
VITE_ENVIRONMENT=development
```

### Staging
```bash
VITE_API_BASE_URL=https://api-staging.fartooyoung.org
VITE_ENVIRONMENT=staging
```

### Production (Future)
```bash
VITE_API_BASE_URL=https://api.fartooyoung.org
VITE_ENVIRONMENT=production
```

---

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check API Gateway CORS configuration
2. **Build Failures**: Check CodeBuild logs in CloudWatch
3. **Domain Issues**: Verify Route53 and CloudFront configuration
4. **Permission Errors**: Check IAM roles and policies

### Useful Commands
```bash
# Check SAM template syntax
sam validate

# Deploy manually (if pipeline fails)
cd backend
sam build
sam deploy --guided

# Check CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"

# Check S3 bucket contents
aws s3 ls s3://staging-fartooyoung-frontend --recursive
```

---

## Cost Estimation

### Monthly Costs (Staging)
- **Lambda (9 functions)**: $0-8 (pay per request, very low for testing)
- **DynamoDB (2 tables)**: $0-10 (on-demand pricing for users + donations)
- **S3**: $1-3 (frontend storage + requests)
- **CloudFront**: $0-5 (free tier covers most usage)
- **API Gateway**: $0-5 (pay per API call)
- **Route53**: $0.50 (hosted zone for staging subdomain)
- **Total: $5-30/month** for staging environment with light usage

### Scaling to Production
- Add CloudWatch monitoring: +$5-10/month
- AWS SES for automated emails: +$1-5/month
- Increased traffic costs: Variable based on usage
- SSL certificates: Free with AWS Certificate Manager
- **Production estimate: $15-60/month** depending on user volume

---

## Security Considerations

### Implemented ✅
✅ **JWT token authentication** with 24-hour expiration
✅ **Password hashing with bcrypt** (salt rounds: 10 production, 4 local)
✅ **Rate limiting** on login attempts (3 attempts = 15-minute lockout)
✅ **Input validation and sanitization** for all user inputs
✅ **HTTPS enforcement** via CloudFront
✅ **Secrets management** with NoEcho parameters
✅ **Case-insensitive email** authentication (industry standard)
✅ **Current password verification** for password changes
✅ **Email enumeration prevention** in authentication flows
✅ **JWT-protected API endpoints** for sensitive operations
✅ **User data isolation** (users can only access their own data)

### Future Enhancements 🔄
- [ ] AWS WAF for DDoS protection
- [ ] AWS Secrets Manager for JWT secrets rotation
- [ ] CloudTrail for comprehensive audit logging
- [ ] VPC endpoints for enhanced network security
- [ ] Multi-factor authentication (2FA)
- [ ] Session management and concurrent login limits
- [ ] Advanced rate limiting with AWS API Gateway throttling

---

## Monitoring & Maintenance

### CloudWatch Metrics to Monitor
- Lambda function errors and duration
- DynamoDB read/write capacity
- API Gateway 4xx/5xx errors
- CloudFront cache hit ratio

### Regular Maintenance
- Review CloudWatch logs weekly
- Update dependencies monthly
- Security patches as needed
- Cost optimization quarterly

---

*Last Updated: November 23, 2025*
*Current Status: Production-Ready Features Complete*
*Environment: Local Development Optimized + AWS Staging Deployment Ready*
*Features: 9 Lambda Functions, 2 DynamoDB Tables, Complete Authentication & Donation System*
