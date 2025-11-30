# Deployment Environments Guide
**Last Updated:** November 29, 2025

---

## 🎯 Git Branch Strategy

```
main (production - auto-deploy via CI/CD)
  ↑
staging (development + testing)
```

**Branch purposes:**
- `staging` → All development work, local testing with staging AWS APIs
- `main` → Production-ready code only, triggers automatic CI/CD deployment

--------------------------------------------------------------------------------------------------------

## 🌍 COMPLETE ENVIRONMENT OVERVIEW

### **Environment 1: Fully Local (Docker)**
- **Branch:** staging
- **Frontend:** localhost:5173
- **Backend API:** localhost:3000 (SAM local)
- **Database:** Local DynamoDB (Docker on port 8000)
- **Database Admin UI:** localhost:8001 (DynamoDB Admin)
- **Deployment:** Manual (docker-compose + sam local)
- **URL:** localhost:5173 → localhost:3000
- **Use case:** Offline development, testing Lambda changes
- **Config file:** `.env.local`

**How to run:**
```bash
# Start local DynamoDB + Admin UI
docker-compose up -d

# Access DynamoDB Admin UI
open http://localhost:8001

# Start local Lambda APIs
cd backend
sam local start-api --env-vars env.json

# Start frontend (pointing to local API)
npm run dev  # Uses .env.local with localhost:3000
```

**Ports:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- DynamoDB: http://localhost:8000
- DynamoDB Admin UI: http://localhost:8001

**Pros:**
- ✅ Works offline
- ✅ No AWS costs
- ✅ Fast iteration on backend
- ✅ Full control

**Cons:**
- ❌ Need Docker running
- ❌ Stripe webhooks won't work (need ngrok)
- ❌ No real Secrets Manager

--------------------------------------------------------------------------------------------------------

### **Environment 2: Local Frontend + Staging AWS** ⭐ CURRENT SETUP
- **Branch:** staging
- **Frontend:** localhost:5173
- **Backend API:** https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/
- **Database:** Staging DynamoDB (AWS)
- **Deployment:** Manual (npm run dev -- --mode staging)
- **URL:** localhost:5173 → AWS Staging API
- **Use case:** Frontend development with real AWS services
- **Config file:** `.env.staging`

**How to run:**
```bash
npm run dev -- --mode staging
```

**Pros:**
- ✅ Real AWS services
- ✅ Real Stripe integration
- ✅ Real data
- ✅ Simple setup

**Cons:**
- ❌ Need internet
- ❌ Uses AWS resources

---

### **Environment 3: Staging Live on AWS**
- **Branch:** staging
- **Frontend:** S3 + CloudFront
- **Backend API:** https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/
- **Database:** Staging DynamoDB (AWS)
- **Deployment:** Manual script (./deploy-staging.sh)
- **URL:** staging.fartooyoung.org (when configured)
- **Use case:** Testing full deployment before production
- **Config file:** `.env.staging`

**How to deploy:**
```bash
./deploy-staging.sh
```

**What it does:**
1. Builds React app with staging config
2. Uploads to S3 bucket (fartooyoung-staging-frontend)
3. Invalidates CloudFront cache
4. Live on staging.fartooyoung.org

---

### **Environment 4: Production**
- **Branch:** main
- **Frontend:** S3 + CloudFront
- **Backend API:** https://PROD-API-URL.execute-api.us-east-1.amazonaws.com/Prod/ (not deployed yet)
- **Database:** Production DynamoDB (AWS)
- **Deployment:** Automatic CI/CD (triggered by push to main)
- **URL:** fartooyoung.org
- **Use case:** Live production site for real users
- **Config file:** `.env.production`

**How to deploy:**
```bash
git checkout main
git merge staging
git push origin main
# CI/CD automatically deploys
```

**What happens automatically:**
1. GitHub webhook triggers AWS CodePipeline
2. CodeBuild builds React app with production config
3. Deploys to S3 bucket (fartooyoung-production-frontend)
4. Invalidates CloudFront cache
5. Live on fartooyoung.org

---

## 🔄 TYPICAL DEVELOPMENT WORKFLOW

### **Daily Development:**
```bash
# 1. Make sure you're on staging branch
git checkout staging

# 2. Start local development server
npm run dev -- --mode staging

# 3. Make changes, test locally
# Frontend runs on localhost:5173
# Connects to staging AWS API

# 4. Commit and push changes
git add .
git commit -m "Feature: Description"
git push origin staging
```

---

### **Testing on Staging AWS (Optional):**
```bash
# Deploy frontend to staging.fartooyoung.org
./deploy-staging.sh

# Test the full deployment
# Visit staging.fartooyoung.org
```

---

### **Deploying to Production:**
```bash
# 1. Ensure staging is fully tested
# 2. Merge staging to main
git checkout main
git merge staging

# 3. Push to main (triggers automatic deployment)
git push origin main

# 4. CI/CD pipeline automatically:
#    - Builds production app
#    - Deploys to S3
#    - Invalidates CloudFront
#    - Live on fartooyoung.org

# 5. Verify production deployment
# Visit fartooyoung.org
```

---

## 📁 Configuration Files

### **.env.local** (Fully Local)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51OAyuDKzUGswJ6LaCEwV2nS8MXdBvGAPsfFGZTqtqbHESScdGHyi7Sl93INNowI2A3AfnEmPjOisqo6jCa7KWvK400mMNpSqB6
```

### **.env.staging** (Staging AWS)
```env
VITE_API_BASE_URL=https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51OAyuDKzUGswJ6LaCEwV2nS8MXdBvGAPsfFGZTqtqbHESScdGHyi7Sl93INNowI2A3AfnEmPjOisqo6jCa7KWvK400mMNpSqB6
```

### **.env.production** (Production)
```env
VITE_API_BASE_URL=https://PROD-API-URL.execute-api.us-east-1.amazonaws.com/Prod
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXX
```


## 🚀 Deployment Scripts

### **deploy-staging.sh** (Manual Staging Deployment)
```bash
#!/bin/bash

echo "Building staging frontend..."
npm run build -- --mode staging

echo "Uploading to S3..."
aws s3 sync dist/ s3://fartooyoung-staging-frontend --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"

echo "Staging deployment complete!"
echo "Visit: https://staging.fartooyoung.org"
```

---

## 📊 Environment Comparison

| Feature | Local (Docker) | Local + Staging AWS | Staging Live | Production |
|---------|---------------|---------------------|--------------|------------|
| **Internet Required** | No | Yes | Yes | Yes |
| **AWS Costs** | None | Minimal | Minimal | Standard |
| **Real Stripe** | No | Yes | Yes | Yes |
| **Real Data** | No | Yes | Yes | Yes |
| **Deployment Speed** | Instant | Instant | 2-3 min | 5-10 min |
| **Use Case** | Backend dev | Frontend dev | Pre-prod testing | Live users |

---

## 🔐 AWS Resources by Environment

### **Staging:**
- API Gateway: https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/
- DynamoDB Tables:
  - fartooyoung-staging-users-table
  - fartooyoung-staging-donations-table
- Secrets Manager: fartooyoung-staging-secrets
- S3 Bucket: fartooyoung-staging-frontend (when created)
- CloudFront: staging.fartooyoung.org (when created)
- Stripe Webhook: Far Too Young - Staging

### **Production (Not Yet Deployed):**
- API Gateway: TBD
- DynamoDB Tables: TBD
- Secrets Manager: fartooyoung-production-secrets
- S3 Bucket: fartooyoung-production-frontend
- CloudFront: fartooyoung.org
- Stripe Webhook: Far Too Young - Production (placeholder created)

---

## 🎯 Quick Reference Commands

```bash
# Local development (staging AWS)
npm run dev -- --mode staging

# Build for staging
npm run build -- --mode staging

# Build for production
npm run build -- --mode production

# Deploy backend to staging
cd backend && sam deploy --config-env staging

# Deploy backend to production
cd backend && sam deploy --config-env production

# Deploy frontend to staging (manual)
./deploy-staging.sh

# Deploy frontend to production (automatic)
git push origin main

# Start local Docker services
docker-compose up -d

# Stop local Docker services
docker-compose down
```

---

## 🔌 Localhost Ports Reference

When running fully local development:

| Port | Service | Purpose | URL |
|------|---------|---------|-----|
| **5173** | Vite Dev Server | React frontend | http://localhost:5173 |
| **3000** | SAM Local API | Lambda functions | http://localhost:3000 |
| **8000** | DynamoDB Local | Local database | http://localhost:8000 |
| **8001** | DynamoDB Admin | Database UI | http://localhost:8001 |

---

## 📝 Notes

- **Current Status:** Using Environment 2 (Local Frontend + Staging AWS)
- **Staging Frontend:** Not yet deployed to S3/CloudFront
- **Production:** Not yet deployed
- **CI/CD Pipeline:** Not yet configured
- **Branch Protection:** Not yet enabled on main branch

---

## 🚦 Next Steps

1. ✅ Create staging branch
2. ⏳ Deploy staging frontend to S3 + CloudFront
3. ⏳ Set up production AWS infrastructure
4. ⏳ Configure CI/CD pipeline (CodePipeline + CodeBuild)
5. ⏳ Enable branch protection on main
6. ⏳ Configure custom domains (staging.fartooyoung.org, fartooyoung.org)
7. ⏳ Set up SSL certificates (AWS Certificate Manager)

---

**Last Updated:** November 29, 2025  
**Current Environment:** Local Frontend + Staging AWS  
**Status:** Development Phase
