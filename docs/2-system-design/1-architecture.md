# Far Too Young - System Architecture Overview

## Production System Architecture
High-level visual representation of the LIVE Far Too Young platform at https://www.fartooyoung.org

**Status:** ✅ Production LIVE | ✅ Real Payments Active | ✅ CI/CD Automated

---

## Production System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 USERS                                           │
│                    https://www.fartooyoung.org                                  │
│                    https://fartooyoung.org                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS (SSL)
                                        ▼
╔═════════════════════════════════════════════════════════════════════════════════╗
║                        🎨 FRONTEND LAYER                                       ║
║          Serves the React app to users (no logic, just static files)          ║
║═════════════════════════════════════════════════════════════════════════════════║
║                                                                                ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │                          CLOUDFRONT CDN                                │   ║
║  │                     Global Edge Locations                              │   ║
║  │                    Distribution: E2PHSH4ED2AIN5                        │   ║
║  │              (Caches and delivers React app worldwide)                 │   ║
║  └─────────────────────────────────┬───────────────────────────────────────┘   ║
║                                    │ Cache Miss                                ║
║                                    ▼                                           ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │                          S3 BUCKET                                     │   ║
║  │                 fartooyoung-frontend-production                        │   ║
║  │              (Stores built React files: HTML, CSS, JS)                 │   ║
║  │─────────────────────────────────────────────────────────────────────────│   ║
║  │                                                                         │   ║
║  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   ║
║  │  │     Pages       │  │   Components    │  │   Features      │        │   ║
║  │  │─────────────────│  │─────────────────│  │─────────────────│        │   ║
║  │  │• Home           │  │• Navigation     │  │• Authentication │        │   ║
║  │  │• Child Marriage │  │• Auth Modal     │  │• Donations      │        │   ║
║  │  │• Founder & Team │  │• Donation Modal │  │• Subscriptions  │        │   ║
║  │  │• Partners       │  │• Dashboard      │  │• User Profile   │        │   ║
║  │  │• What We Do     │  │• Payment Forms  │  │• Email Verify   │        │   ║
║  │  │• User Dashboard │  │• Success Pages  │  │• Rate Limiting  │        │   ║
║  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   ║
║  └─────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                ║
║  Also includes: Route 53 (DNS) + ACM (SSL Certificate)                        ║
╚════════════════════════════════════════════════════════════════════════════════╝
                                        │
                                        │ API Calls (fetch requests from browser)
                                        ▼
╔═════════════════════════════════════════════════════════════════════════════════╗
║                        ⚡ BACKEND LAYER                                       ║
║       Processes all logic: auth, payments, emails, security                   ║
║═════════════════════════════════════════════════════════════════════════════════║
║                                                                                ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │                          API GATEWAY                                   │   ║
║  │                 0o7onj0dr7.execute-api.us-east-1                       │   ║
║  │           (Receives API calls, routes to correct Lambda)               │   ║
║  │              17 Endpoints (14 POST, 3 GET)                             │   ║
║  │        See 4-backend-design.md for full endpoint details                │   ║
║  └─────────────────────────────────┬───────────────────────────────────────┘   ║
║                                    │ Route to Functions                         ║
║                                    ▼                                           ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │                       LAMBDA FUNCTIONS                                 │   ║
║  │                (Runs business logic, talks to database)                │   ║
║  │─────────────────────────────────────────────────────────────────────────│   ║
║  │                                                                         │   ║
║  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   ║
║  │  │ Authentication  │  │ Donations &     │  │ Integrations    │        │   ║
║  │  │─────────────────│  │ Payments        │  │─────────────────│        │   ║
║  │  │• Login          │  │─────────────────│  │• Stripe API     │        │   ║
║  │  │• Register       │  │• Create Donation│  │• AWS SES        │        │   ║
║  │  │• Logout         │  │• Get Donations  │  │• Secrets Mgr    │        │   ║
║  │  │• Email Verify   │  │• Checkout       │  │• Rate Limiting  │        │   ║
║  │  │• Password Reset │  │• Portal Session │  │                 │        │   ║
║  │  │• Update Profile │  │• Subscriptions  │  │                 │        │   ║
║  │  │• Change Password│  │• Webhook        │  │                 │        │   ║
║  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   ║
║  └─────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                ║
║  Also includes: Secrets Manager (API keys) + SES (emails)                     ║
╚════════════════════════════════════════════════════════════════════════════════╝
                                        │
                                        │ Database Queries (read/write data)
                                        ▼
╔═════════════════════════════════════════════════════════════════════════════════╗
║                        🗄️ DATABASE LAYER                                      ║
║            Stores and retrieves data (no logic, just storage)                 ║
║═════════════════════════════════════════════════════════════════════════════════║
║                                                                                ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │                          DYNAMODB                                      │   ║
║  │                       NoSQL Database                                   │   ║
║  │─────────────────────────────────────────────────────────────────────────│   ║
║  │                                                                         │   ║
║  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   ║
║  │  │ Users Table     │  │ Donations Table │  │ Rate Limits     │        │   ║
║  │  │─────────────────│  │─────────────────│  │─────────────────│        │   ║
║  │  │• Email (PK)     │  │• ID (PK)        │  │• Key (PK)       │        │   ║
║  │  │• Password Hash  │  │• User Email     │  │• Attempts       │        │   ║
║  │  │• Name           │  │• Amount         │  │• TTL (Auto-Del) │        │   ║
║  │  │• Verified       │  │• Stripe ID      │  │                 │        │   ║
║  │  │• Created Date   │  │• Type           │  │                 │        │   ║
║  │  │                 │  │• Status         │  │                 │        │   ║
║  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   ║
║  └─────────────────────────────────────────────────────────────────────────┘   ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

## CI/CD Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DEVELOPER                                          │
│                         Local Development                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ git push origin main
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              GITHUB                                             │
│                      Source Code Repository                                    │
│                    asharma12git/fartooyoung                                    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Webhook Trigger
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AWS CODEPIPELINE                                      │
│                    fartooyoung-production-pipeline                             │
│─────────────────────────────────────────────────────────────────────────────────│
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │  Source Stage   │  │ Frontend Build  │  │ Backend Build   │                │
│  │─────────────────│  │─────────────────│  │─────────────────│                │
│  │• GitHub Pull    │  │• npm build      │  │• sam build      │                │
│  │• Code Download  │  │• S3 Upload      │  │• sam deploy     │                │
│  │                 │  │• CloudFront     │  │• Lambda Update  │                │
│  │                 │  │  Invalidation   │  │                 │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Parallel Deployment
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTION AWS                                        │
│                        Live System Updated                                     │
│                     https://www.fartooyoung.org                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    USER     │───▶│ CLOUDFRONT  │───▶│ API GATEWAY │───▶│  DYNAMODB   │
│             │    │             │    │             │    │             │
│ • Clicks    │    │ • React App │    │ • Lambda    │    │ • Users     │
│ • Donates   │    │ • Global    │    │ • Business  │    │ • Donations │
│ • Registers │    │   CDN       │    │   Logic     │    │ • Rate      │
│             │    │ • SSL       │    │ • Stripe    │    │   Limits    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ▲                   ▲                   ▲                   │
       │                   │                   │                   │
       │    ┌─────────────┐│    ┌─────────────┐│    ┌─────────────┐│
       └────│   RESPONSE  │◀────│  JSON API   │◀────│   RESULT    │◀┘
            │             │     │             │     │             │
            │ • UI Update │     │ • Success   │     │ • Data      │
            │ • Redirect  │     │ • Error     │     │ • Status    │
            │ • Messages  │     │ • Payments  │     │ • Changes   │
            └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Authentication Flow Example

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │         │    React    │         │   Lambda    │         │  DynamoDB   │
│             │         │   App.jsx   │         │  login.js   │         │    Users    │
└─────────────┘         └─────────────┘         └─────────────┘         └─────────────┘
       │                        │                        │                        │
       │ 1. User clicks Login   │                        │                        │
       │───────────────────────▶│                        │                        │
       │                        │ 2. POST /auth/login    │                        │
       │                        │───────────────────────▶│                        │
       │                        │                        │ 3. Query user by email │
       │                        │                        │───────────────────────▶│
       │                        │                        │ 4. Return user data    │
       │                        │                        │◀───────────────────────│
       │                        │ 5. JWT token + user    │                        │
       │                        │◀───────────────────────│                        │
       │ 6. Update UI, redirect │                        │                        │
       │◀───────────────────────│                        │                        │
```

---

## Technology Stack Overview

### Frontend Technologies
- **React 18** - Component-based UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend Technologies
- **AWS Lambda** - Serverless compute (17 functions)
- **API Gateway** - HTTP API management
- **Node.js 18** - JavaScript runtime
- **SAM CLI** - Infrastructure as code

### Database & Storage
- **DynamoDB** - NoSQL database (3 tables)
- **S3** - Static website hosting
- **CloudFront** - Global CDN distribution

### Security & Authentication
- **JWT Tokens** - Stateless authentication
- **bcrypt** - Password hashing
- **AWS Secrets Manager** - API key storage
- **Rate Limiting** - Anti-bot protection
- **HTTPS/SSL** - Encrypted communication

### Payment Processing
- **Stripe** - Payment gateway integration
- **Webhooks** - Real-time payment events
- **Subscriptions** - Recurring donations

### DevOps & Deployment
- **GitHub** - Source code repository
- **CodePipeline** - CI/CD automation
- **CodeBuild** - Build and deployment
- **CloudFormation** - Infrastructure management

---

## Deployment Architecture

*For environment-specific details (local, staging, production), see `2-environments.md`.*

---

## Key System Features

### ✅ Production Capabilities (LIVE)
- **User Authentication** - Complete login/register system with email verification
- **Payment Processing** - Live Stripe integration for donations and subscriptions
- **User Dashboard** - Donation history, subscription management, profile settings
- **Security** - Multi-layer protection with rate limiting and bot detection
- **Global Distribution** - CloudFront CDN for worldwide performance
- **Automated Deployment** - CI/CD pipeline for zero-downtime updates
- **Email System** - AWS SES for transactional emails and notifications
- **Mobile Responsive** - Optimized for all device sizes
- **SSL Security** - HTTPS encryption across all endpoints

### 🔮 Future Enhancements (Planned)

#### **Books Showcase** (Simple)
- Display published books with covers
- External purchase links to retailers
- Author information and reviews

#### **E-Commerce Shop** (Complex)
- Product catalog with shopping cart
- Inventory management system
- Order processing and fulfillment
- Customer wishlist functionality

#### **Blog Platform** (Medium)
- Content management system
- Public blog with categories
- Admin dashboard for publishing
- SEO optimization features

### 📊 System Metrics
- **Uptime**: 99.9% availability
- **Performance**: Global CDN distribution
- **Security**: Multi-layer protection active
- **Scalability**: Auto-scaling serverless architecture
- **Cost**: ~$1.80/month current operational cost

---

## 💰 Production Cost Breakdown

### **Current Monthly Costs (Staging + Production)**

| Service              | Staging Cost | Production Cost | Total Cost | Notes                                    |
|---------------------|--------------|-----------------|------------|------------------------------------------|
| **Lambda**          | $0           | $0              | $0         | Within free tier (1M requests/month)    |
| **API Gateway**     | $0           | $0              | $0         | Within free tier (1M calls/month)       |
| **DynamoDB**        | $0           | $0              | $0         | Within free tier (25GB + 25 RCU/WCU)    |
| **S3**              | $0           | $0              | $0         | Within free tier (5GB storage)          |
| **CloudFront**      | $0           | $0              | $0         | Within free tier (1TB transfer)         |
| **Route 53**        | $0.50        | $0.50           | $1.00      | $0.50 per hosted zone                    |
| **SES**             | $0           | $0              | $0         | Within free tier (62K emails/month)     |
| **Secrets Manager** | $0.40        | $0.40           | $0.80      | $0.40 per secret per month               |
| **ACM (SSL)**       | $0           | $0              | $0         | Free when used with CloudFront           |
| **CodePipeline**    | $0           | $1.00           | $1.00      | $1 per active pipeline per month         |

**Total Current Cost: $2.80/month** (both environments)

### **Projected Costs at Scale**

**At 10,000 users/month:**
- **Total Estimated Cost**: $15-25/month
- **Primary drivers**: API Gateway requests, CloudFront data transfer

**At 100,000 users/month:**
- **Total Estimated Cost**: $200-300/month  
- **Primary drivers**: Lambda invocations, DynamoDB throughput, CloudFront

### **Cost Optimization Features**
✅ **Serverless pay-per-use** - No idle server costs  
✅ **Auto-scaling** - Resources scale with demand  
✅ **Free tier benefits** - Significant cost savings  
✅ **CloudFront caching** - Reduces backend requests  
✅ **Efficient architecture** - Minimal resource waste

---

**Last Updated:** December 11, 2025  
**Production Status:** ✅ LIVE at https://www.fartooyoung.org  
**System Status:** Fully operational with automated CI/CD
