# Environment Switching Guide - Local Development vs AWS Production

**Date**: November 20, 2025  
**Purpose**: Complete guide for switching between local development and AWS production environments using AWS CodePipeline CI/CD

---

## Overview

The Far Too Young platform uses environment-based configuration to seamlessly switch between local development and AWS production without changing code. Production deployments are automated through AWS CodePipeline.

---

## Environment Files Structure

### **Local Development Files**
```
.env.local                    # Local development settings (NOT in git)
├── NODE_ENV=development
├── API_BASE_URL=http://localhost:3001
├── REACT_APP_API_BASE_URL=http://localhost:3001
├── DYNAMODB_ENDPOINT=http://localhost:8000
├── JWT_SECRET=dev-secret-key
└── AWS credentials for local DynamoDB
```

### **Production Reference File**
```
.env.production              # Template/reference only (in git)
├── NODE_ENV=production
├── API_BASE_URL=https://api.fartooyoung.org
├── REACT_APP_API_BASE_URL=https://api.fartooyoung.org
├── DYNAMODB_ENDPOINT=undefined (uses AWS DynamoDB)
└── JWT_SECRET=prod-secret-from-aws-secrets
```

---

## CI/CD Architecture - AWS CodePipeline

### **Complete AWS CI/CD Stack**
```
GitHub Repository → AWS CodePipeline → AWS CodeBuild → AWS Lambda/S3 Deployment
```

**AWS Services Used:**
- **AWS CodeCommit** or **GitHub Integration** - Source code repository
- **AWS CodePipeline** - Orchestrates the entire CI/CD workflow
- **AWS CodeBuild** - Builds and tests the application
- **AWS CodeDeploy** - Deploys to Lambda functions and S3
- **AWS CloudFormation/SAM** - Infrastructure as Code deployment

### **Pipeline Stages**
1. **Source Stage** - Triggered by git push to main branch
2. **Build Stage** - CodeBuild compiles and tests code
3. **Deploy Stage** - CodeDeploy updates Lambda functions and frontend

---

## How Environment Switching Works

### **Local Development (Automatic)**

**Commands:**
```bash
# Terminal 1: DynamoDB Local
docker run -p 8000:8000 amazon/dynamodb-local

# Terminal 2: Backend API
cd backend && sam local start-api --port 3001

# Terminal 3: Frontend
npm run dev
```

**What Happens:**
- **React** automatically reads `.env.local`
- **SAM CLI** uses template.yaml local parameters
- **Code uses**: localhost endpoints, local DynamoDB
- **No manual configuration needed**

### **AWS Production (Automated via CodePipeline)**

**Trigger:**
```bash
# Push to main branch triggers automatic deployment
git add .
git commit -m "New feature"
git push origin main  # ← This triggers AWS CodePipeline
```

**What Happens Automatically:**
1. **CodePipeline detects** git push to main branch
2. **CodeBuild runs** build and test scripts
3. **SAM deploys** with production environment variables
4. **Lambda functions updated** with new code
5. **S3/CloudFront updated** with new frontend build

---

## Environment Switching Scenarios

### **Scenario 1: Daily Development → Automatic Production Deploy**
```bash
# 1. Develop locally (automatic)
npm run dev                    # Uses .env.local automatically

# 2. Test features locally
# ... make changes, test with local backend ...

# 3. Deploy to production (automatic)
git add . && git commit -m "New feature"
git push origin main           # ← Triggers AWS CodePipeline automatically
# No manual deployment needed!
```

### **Scenario 2: Production Issue → Local Debug → Auto-Fix**
```bash
# 1. Pull latest code
git pull

# 2. Debug locally (automatic switch to local env)
npm run dev                    # Automatically uses local settings

# 3. Fix issue and test locally
# ... fix code, test with local backend ...

# 4. Deploy fix to production (automatic)
git add . && git commit -m "Fix production issue"
git push origin main           # ← Auto-deploys via CodePipeline
```

### **Scenario 3: Multiple Environment Pipeline**
```bash
# Development branch → Staging environment
git push origin develop        # Triggers staging pipeline

# Main branch → Production environment  
git push origin main           # Triggers production pipeline
```

---

## AWS CodePipeline Configuration

### **buildspec.yml for CodeBuild**
```yaml
# buildspec.yml (in project root)
version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
  pre_build:
    commands:
      - echo Installing dependencies...
      - npm install
      - cd backend && npm install
  build:
    commands:
      - echo Building application...
      - npm run build
      - cd backend && sam build
  post_build:
    commands:
      - echo Deploying to AWS...
      - cd backend && sam deploy --no-confirm-changeset --parameter-overrides Environment=production
artifacts:
  files:
    - '**/*'
```

### **SAM Template Environment Configuration**
```yaml
# backend/template.yaml
Parameters:
  Environment:
    Type: String
    Default: production
    Description: Deployment environment
  
  DynamoDBEndpoint:
    Type: String
    Default: ""  # Empty for production (uses AWS DynamoDB)
    Description: DynamoDB endpoint
  
  JWTSecret:
    Type: String
    Default: "{{resolve:secretsmanager:fartooyoung-jwt-secret}}"
    Description: JWT signing secret from AWS Secrets Manager
    NoEcho: true

Conditions:
  IsProduction: !Equals [!Ref Environment, "production"]

Globals:
  Function:
    Environment:
      Variables:
        DYNAMODB_ENDPOINT: !Ref DynamoDBEndpoint
        JWT_SECRET: !Ref JWTSecret
        NODE_ENV: !Ref Environment
```

---

## Code Examples - No Changes Needed

### **Frontend Code (Same Everywhere)**
```javascript
// AuthModal.jsx - This code never changes
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'

const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### **Backend Code (Same Everywhere)**
```javascript
// login.js - This code never changes
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,  // Local or AWS
  region: 'us-east-1'
});
```

---

## AWS CodePipeline Setup Steps

### **1. Create CodePipeline**
```bash
# AWS CLI command to create pipeline
aws codepipeline create-pipeline --cli-input-json file://pipeline-config.json
```

### **2. Configure Source Stage**
- **Source Provider**: GitHub or AWS CodeCommit
- **Repository**: fartooyoung
- **Branch**: main
- **Trigger**: Webhook on push

### **3. Configure Build Stage**
- **Build Provider**: AWS CodeBuild
- **Build Project**: fartooyoung-build
- **Buildspec**: buildspec.yml in repository root

### **4. Configure Deploy Stage**
- **Deploy Provider**: AWS CloudFormation (SAM)
- **Template**: backend/template.yaml
- **Parameters**: Production environment variables

---

## Important: How .env Files Work with CodePipeline

### **❌ Common Misconception**
> "CodePipeline automatically reads .env.production when deploying"

### **✅ Reality**
- **Local**: React/Node automatically read `.env.local`
- **CodeBuild**: Uses buildspec.yml and SAM template parameters
- **Production**: Environment variables set via SAM template and AWS Secrets Manager
- **`.env.production`**: Reference template only, not used by CodePipeline

### **Environment Variables Set Via:**
```yaml
# SAM template with Secrets Manager integration
Parameters:
  JWTSecret:
    Type: String
    Default: "{{resolve:secretsmanager:fartooyoung-jwt-secret}}"
    NoEcho: true
```

---

## Security Best Practices with CodePipeline

### **Local Development**
- ✅ `.env.local` in `.gitignore` (contains dummy secrets)
- ✅ Use dummy AWS credentials for local DynamoDB
- ✅ Use simple JWT secret for local testing

### **Production with CodePipeline**
- ✅ Real secrets stored in **AWS Secrets Manager**
- ✅ CodeBuild uses **IAM roles** for AWS access
- ✅ Environment variables injected via **SAM template**
- ✅ **No secrets in git repository** ever
- ✅ **No secrets in buildspec.yml** - use Secrets Manager references

---

## CodePipeline Deployment Flow

### **Automatic Deployment Process**
```
1. Developer: git push origin main
2. CodePipeline: Detects change via webhook
3. CodeBuild: Runs buildspec.yml
   - npm install (frontend dependencies)
   - npm run build (React production build)
   - sam build (Lambda function packaging)
   - sam deploy (CloudFormation deployment)
4. CloudFormation: Updates AWS resources
   - Lambda functions with new code
   - S3 bucket with new frontend build
   - DynamoDB tables (if schema changes)
   - API Gateway endpoints
5. CloudFront: Cache invalidation for new frontend
6. Result: Live website updated automatically
```

---

## Monitoring and Troubleshooting

### **CodePipeline Console**
- **Pipeline Status**: View current deployment status
- **Build Logs**: Debug build failures in CodeBuild
- **Deployment History**: Track all deployments

### **Common Issues**
- **Build Failures**: Check CodeBuild logs for npm/sam errors
- **Deployment Failures**: Check CloudFormation events
- **Permission Issues**: Verify CodeBuild IAM role permissions

---

## Troubleshooting Environment Issues

### **Problem: Local app calling production API**
**Solution**: Check `.env.local` has correct `REACT_APP_API_BASE_URL=http://localhost:3001`

### **Problem: Lambda can't connect to local DynamoDB**
**Solution**: Check SAM template has correct `DynamoDBEndpoint` parameter

### **Problem: CodePipeline deployment failing**
**Solution**: Check buildspec.yml syntax and CodeBuild logs

### **Problem: Secrets not available in production**
**Solution**: Verify AWS Secrets Manager integration in SAM template

---

## Key Takeaways

1. **Same codebase** works in all environments
2. **Environment variables** control the differences
3. **Local development** is automatic (reads `.env.local`)
4. **Production deployment** is automatic via **AWS CodePipeline**
5. **Never commit secrets** to git - use **AWS Secrets Manager**
6. **CodePipeline handles** all production deployments
7. **Push to main branch** = automatic production deployment

---

## Next Steps

1. **Test local environment switching** - verify `.env.local` works
2. **Set up AWS CodePipeline** with GitHub integration
3. **Configure AWS Secrets Manager** for production secrets
4. **Create buildspec.yml** for CodeBuild configuration
5. **Add staging environment** pipeline for testing before production
6. **Set up monitoring** with CloudWatch for pipeline health
