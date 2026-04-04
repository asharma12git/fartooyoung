# 🚀 **AWS DEPLOYMENT ARCHITECTURE GUIDE**
*Complete Frontend + Backend + Database + CI/CD Documentation*

---

## 🏗️ **FILE CREATION ORDER (Fresh Start)**

### **Phase 1: Core Application** 
1. **React App** - `src/` components *(always needed)*
2. **Lambda Functions** - `backend/lambda/` *(backend only - skip for static sites)*

### **Phase 2: Infrastructure Definition**
3. **`template.yaml`** - Define what AWS resources you need *(backend only)*
4. **`samconfig.toml`** - Define where to deploy those resources *(backend only)*

### **Phase 3: Environment Configuration**
5. **`.env.local`** - Local development API URLs *(frontend connecting to backend)*
6. **`.env.staging`** - Staging environment API URLs *(frontend connecting to backend)*
7. **`.env.production`** - Production environment API URLs *(frontend connecting to backend)*

**Note:** These files tell your React app where to find the backend API - whether it's running locally (Docker/SAM local) or deployed to AWS. Skip this phase only if you have a pure static site with no backend.

### **Phase 4: Version Control & Manual Deployment**
8. **Set up Git repository** *(always needed)*
   ```bash
   git init                          # Initialize local Git repository
   git add .                         # Stage all files
   git commit -m "Initial commit"    # Create first commit
   git branch -M main                # Rename default branch to main
   git remote add origin https://github.com/username/repo.git  # Connect to GitHub
   git push -u origin main           # Push code to GitHub
   ```
9. **Deploy backend manually** *(backend only)*
   ```bash
   cd backend                        # Navigate to project's backend directory
   sam build                         # Package Lambda functions (creates .aws-sam/build/ locally)
   sam deploy --config-env production # Deploy all AWS resources to production
   ```
10. **Deploy frontend manually** *(always needed)*
   ```bash
   npm run build -- --mode production                              # Build React app (creates dist/ locally)
   aws s3 sync dist/ s3://your-bucket-name --delete               # Upload files to S3 bucket
   aws cloudfront create-invalidation --distribution-id YOUR-ID --paths "/*" # Clear CDN cache
   ```

### **Phase 5: Automation (Optional)**
10. **`buildspec-frontend.yml`** - Automate frontend deployments *(CI/CD for frontend)*
11. **`buildspec-backend.yml`** - Automate backend deployments *(CI/CD for backend)*
12. **`pipeline.yml`** - Create the CI/CD infrastructure *(CI/CD automation)*

### **🎯 Why This Order?**
- **Start local, deploy later** - Initially, all infrastructure runs locally (React dev server, local DynamoDB via Docker) for development and testing
- **Code first, infrastructure second** - Write your app logic before defining AWS resources
- **Backend infrastructure creates API URLs** - `template.yaml` deploys Lambda functions → generates API Gateway URL → `.env.production` uses that URL to connect frontend to backend
- **Version control before deployment** - Commit your code to Git/GitHub before deploying to AWS - this creates a source of truth and enables CI/CD later
- **Manual deployment before automation** - Test that everything works first, then automate it
- **Static sites skip backend steps** - If you only have a React app (no databases/APIs), skip all *(backend only)* files and go straight to frontend deployment
- **Phase 4 = Production ready** - After version control and manual deployment, your app is live and functional
- **Phase 5 = Convenience** - CI/CD just automates what you've already proven works by pulling from your GitHub repo

---

## 📁 **PROJECT STRUCTURE & FILE PURPOSE**

```
fartooyoung/
├── 🎨 FRONTEND FILES
│   ├── src/                     # React components
│   ├── .env.production         # 🔧 Production API URLs
│   ├── .env.staging            # 🔧 Staging API URLs  
│   └── .env.local              # 🔧 Local development URLs
│
├── ⚡ BACKEND FILES
│   ├── backend/template.yaml    # 🏗️ ALL AWS Infrastructure (Lambda+DB+API)
│   ├── backend/samconfig.toml   # 🎯 Deployment targets (staging/production)
│   └── backend/lambda/          # 💻 Function code (17 functions)
│
└── 🔄 CI/CD FILES
    ├── buildspec-frontend.yml   # 🚀 Auto-deploy React app
    ├── buildspec-backend.yml    # 🚀 Auto-deploy Lambda functions
    └── deployment/production/
        └── pipeline.yml         # 🏗️ Creates CI/CD infrastructure
```

---

## 🏗️ **STEP-BY-STEP DEPLOYMENT PROCESS**

### **STEP 1: Backend Infrastructure Deployment**
```bash
cd backend                           # Navigate to project's backend directory
sam build                           # Package Lambda functions (creates .aws-sam/build/ locally)
sam deploy --config-env production  # Deploy all AWS resources to production
```

**What `template.yaml` Creates:**

**🗄️ Database Tables (DynamoDB):**
- `fartooyoung-production-users-table` - User accounts & authentication
- `fartooyoung-production-donations-table` - Donation records & history
- `fartooyoung-production-rate-limits` - Anti-spam protection (auto-expires)

**⚡ Backend Functions (Lambda):**
- 17 Lambda functions (LoginFunction, RegisterFunction, CreateCheckoutSessionFunction, etc.)
- Complete authentication system (login, register, password reset)
- Donation processing with Stripe integration
- Email verification system

**🌐 API & Security (API Gateway + IAM):**
- API Gateway (ID: `0o7onj0dr7`) - REST endpoints for all functions
- IAM Roles - Proper security permissions for each function
- Secrets Manager integration - Secure storage for API keys

**Result:** Backend API live at `https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com`

---

### **STEP 2: Frontend Infrastructure Setup**
*Note: CloudFront and S3 bucket must be created manually via AWS Console first*

**Manual Setup Required:**
- **S3 Bucket:** `fartooyoung-frontend-production` (static website hosting)
- **CloudFront Distribution:** `E2PHSH4ED2AIN5` (global CDN with HTTPS)
- **Route 53:** DNS records pointing to CloudFront
- **SSL Certificate:** Via AWS Certificate Manager for HTTPS

### **STEP 3: Frontend Deployment**
```bash
npm run build -- --mode production  # Build React app (creates dist/ locally)
aws s3 sync dist/ s3://fartooyoung-frontend-production --delete  # Upload files to S3 bucket
aws cloudfront create-invalidation --distribution-id E2PHSH4ED2AIN5 --paths "/*"  # Clear CDN cache
```

**What Happens:**

**📦 Build Process:**
- React app reads `.env.production` for API URLs
- Vite builds optimized static files (HTML, CSS, JS)
- Production bundle created in `dist/` folder

**🪣 S3 Upload:**
- Static files uploaded to `fartooyoung-frontend-production` bucket
- `--delete` flag removes old files for clean deployment
- Files organized for web serving

**🚀 CloudFront Distribution:**
- Cache invalidation clears old cached files globally
- New files distributed to edge locations worldwide
- HTTPS certificate ensures secure connections

**🌐 Route 53 (DNS):**
- Domain `www.fartooyoung.org` points to CloudFront distribution
- DNS routing directs users to the correct CloudFront edge location
- Handles both www and root domain redirects

**Result:** Website live at `https://www.fartooyoung.org`

---

### **STEP 4: CI/CD Automation Setup**
**Trigger:** Push code to GitHub `main` branch

**Pipeline Execution:**
```
GitHub Push → CodePipeline → 2 Parallel Builds:

┌─ Frontend Build (buildspec-frontend.yml)
│  ├── npm install
│  ├── npm run build --mode production
│  ├── aws s3 sync → S3 bucket
│  └── aws cloudfront invalidate
│
└─ Backend Build (buildspec-backend.yml)  
   ├── pip install aws-sam-cli
   ├── sam build
   └── sam deploy --config-env production
```

---

## 🔗 **COMPLETE AWS SERVICES MAPPING**

### **🗄️ DATABASE LAYER**
```yaml
# Defined in: backend/template.yaml
UsersTable:          # Email, password, verification status
DonationsTable:      # Amount, date, Stripe payment ID  
RateLimitsTable:     # IP tracking, auto-expires via TTL
```

### **⚡ API LAYER** 
```yaml
# 17 Lambda Functions in template.yaml:
Auth Functions:      LoginFunction, RegisterFunction, LogoutFunction
Donation Functions:  CreateDonationFunction, GetDonationsFunction  
Stripe Functions:    CreateCheckoutSessionFunction, StripeWebhookFunction
```

### **🌐 FRONTEND LAYER**
```
CloudFront (E2PHSH4ED2AIN5) → S3 (fartooyoung-frontend-production)
Domain: www.fartooyoung.org → Serves React app globally
```

### **🔐 SECURITY LAYER**
```
Secrets Manager: fartooyoung-production-secrets
├── JWT_SECRET (user authentication)
├── STRIPE_SECRET_KEY (payment processing)  
└── STRIPE_WEBHOOK_SECRET (payment verification)
```

---

## 🔄 **COMPLETE DATA FLOW**

```
1. 👤 User visits https://www.fartooyoung.org
   ↓
2. 🚀 CloudFront serves React app from S3
   ↓  
3. 💻 React app makes API calls to:
   https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/auth/login
   ↓
4. 🌐 API Gateway routes to LoginFunction (Lambda)
   ↓
5. ⚡ Lambda function:
   - Gets JWT_SECRET from Secrets Manager
   - Queries fartooyoung-production-users-table (DynamoDB)
   - Returns authentication token
   ↓
6. 💳 For donations: Stripe integration processes payments
   - Webhook updates fartooyoung-production-donations-table
   - SES sends confirmation emails
```

---

## 🎯 **KEY CONFIGURATION FILES**

| File | Controls | Purpose | Example |
|------|----------|---------|---------|
| **`.env.production`** | React app backend connection | Tells React app which API endpoints to use | `VITE_API_URL=https://0o7onj0dr7...` |
| **`samconfig.toml`** | Backend deployment targets | Tells SAM where to deploy (staging vs production) | `stack_name = "fartooyoung-production"` |
| **`template.yaml`** | ALL AWS infrastructure | Blueprint that creates Lambda functions + databases | Creates 17 functions + 3 tables |
| **`buildspec-frontend.yml`** | Frontend deployment steps | Instructions for CodeBuild: how to deploy React app | React build → S3 → CloudFront |
| **`buildspec-backend.yml`** | Backend deployment steps | Instructions for CodeBuild: how to deploy Lambda functions | SAM build → Lambda deployment |
| **`pipeline.yml`** | CI/CD infrastructure | Creates the factory (CodePipeline) that runs buildspecs | Creates CodePipeline + CodeBuild projects |
| **`.secrets`** | GitHub integration | Stores GitHub token for CI/CD pipeline authentication | `GITHUB_TOKEN=github_pat_...` |

---

## 🌐 **PRODUCTION ENVIRONMENT DETAILS**

### **Live URLs**
- **Website:** https://www.fartooyoung.org
- **API Endpoint:** https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com
- **Staging:** https://staging.fartooyoung.org

### **AWS Resource IDs**
- **CloudFront Distribution:** E2PHSH4ED2AIN5
- **S3 Bucket:** fartooyoung-frontend-production
- **API Gateway:** 0o7onj0dr7
- **Secrets Manager:** fartooyoung-production-secrets-tEmB4i

### **Database Tables**
- **Users:** fartooyoung-production-users-table
- **Donations:** fartooyoung-production-donations-table
- **Rate Limits:** fartooyoung-production-rate-limits

---

## 🔧 **DEPLOYMENT COMMANDS**

### **Manual Deployment**
```bash
# Backend
cd backend
sam build
sam deploy --config-env production

# Frontend  
npm run build -- --mode production
aws s3 sync dist/ s3://fartooyoung-frontend-production --delete
aws cloudfront create-invalidation --distribution-id E2PHSH4ED2AIN5 --paths "/*"
```

### **Automated Deployment**
```bash
# Simply push to main branch
git push origin main
# CI/CD pipeline automatically deploys both frontend and backend
```

---

## ✅ **FINAL PRODUCTION RESULT**

**Live System:**
- **🌐 Website:** https://www.fartooyoung.org (Global CDN)
- **⚡ API:** Serverless backend with 17 Lambda functions
- **🗄️ Database:** 3 DynamoDB tables with auto-scaling
- **💳 Payments:** Live Stripe processing operational
- **📧 Emails:** SES verification and notification system
- **🔐 Security:** Multi-layer protection with rate limiting

**Automation Features:**
- Zero downtime deployments
- Automatic cache invalidation
- Environment-specific configurations
- Rollback capabilities
- Real-time monitoring

**Cost Efficiency:**
- Pay-per-use serverless architecture
- Current cost: ~$1.80/month for staging + production
- Auto-scaling based on demand

---

**The Magic:** One `template.yaml` file creates your entire backend infrastructure (database + API + functions), while the buildspec files automate everything with a simple git push!

---

*Last Updated: December 11, 2025*  
*Production Status: ✅ LIVE and accepting real donations*
