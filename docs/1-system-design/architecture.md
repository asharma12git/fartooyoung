# Far Too Young - System Design Overview

## Complete System Architecture
High-level visual representation of the entire Far Too Young platform showing frontend, backend, and database integration.

---

## Full System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 USER LAYER                                      │
│                              (Web Browsers)                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS Requests
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                     │
│                            React App (Port 5173)                               │
│─────────────────────────────────────────────────────────────────────────────────│
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Pages Layer   │  │ Components Layer│  │  State Layer    │                │
│  │  (Production)   │  │  (Production)   │  │  (Production)   │                │
│  │─────────────────│  │─────────────────│  │─────────────────│                │
│  │• Home           │  │• Navbar         │  │• User Context   │                │
│  │• ChildMarriage  │  │• Footer         │  │• Auth State     │                │
│  │• FounderTeam    │  │• AuthModal      │  │• API Calls      │                │
│  │• Partners       │  │• DonationModal  │  │• Local Storage  │                │
│  │• WhatWeDo       │  │• Subscription   │  │• Error Handling │                │
│  │• Dashboard      │  │  Manager        │  │• Rate Limiting  │                │
│  │• VerifyEmail    │  │• Dashboard Tabs │  │                 │                │
│  │• PaymentSuccess │  │                 │  │                 │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐              │
│  │              Future Pages (Planned)                         │              │
│  │─────────────────────────────────────────────────────────────│              │
│  │• Books (showcase with external links)                       │              │
│  │• Shop (product catalog, cart, checkout, orders)             │              │
│  │• Blog (public blog posts, categories)                       │              │
│  │• Admin Dashboard (blog management, content control)         │              │
│  └─────────────────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ API Calls (JSON)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND LAYER                                     │
│                          Lambda Functions (Port 3001)                          │
│─────────────────────────────────────────────────────────────────────────────────│
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ Authentication  │  │  Donations &    │  │  Integrations   │                │
│  │  (Production)   │  │  Payments       │  │  (Production)   │                │
│  │─────────────────│  │  (Production)   │  │─────────────────│                │
│  │• login.js       │  │─────────────────│  │• Stripe API     │                │
│  │• register.js    │  │• create-        │  │• AWS SES        │                │
│  │• logout.js      │  │  donation.js    │  │• AWS Secrets    │                │
│  │• verify-email   │  │• get-donations  │  │  Manager        │                │
│  │• forgot-pwd.js  │  │• create-        │  │                 │                │
│  │• reset-pwd.js   │  │  checkout.js    │  │                 │                │
│  │• update-        │  │• create-portal  │  │                 │                │
│  │  profile.js     │  │• list-          │  │                 │                │
│  │• change-pwd.js  │  │  subscriptions  │  │                 │                │
│  │                 │  │• stripe-webhook │  │                 │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐              │
│  │              Future APIs (Planned)                          │              │
│  │─────────────────────────────────────────────────────────────│              │
│  │• Shop: products.js, orders.js, cart.js, wishlist.js        │              │
│  │• Books: books.js (external links management)                │              │
│  │• Blog: blog-posts.js, categories.js (admin management)      │              │
│  └─────────────────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Database Queries
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE LAYER                                     │
│                           DynamoDB (Port 8000)                                 │
│─────────────────────────────────────────────────────────────────────────────────│
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │  Core Tables    │  │ Business Tables │  │ Future Tables   │                │
│  │  (Production)   │  │  (Production)   │  │   (Planned)     │                │
│  │─────────────────│  │─────────────────│  │─────────────────│                │
│  │• users          │  │• donations      │  │• products       │                │
│  │• rate-limits    │  │                 │  │• orders         │                │
│  │  (with TTL)     │  │                 │  │• wishlist       │                │
│  │                 │  │                 │  │• books          │                │
│  │                 │  │                 │  │• blog-posts     │                │
│  │                 │  │                 │  │• categories     │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    USER     │───▶│  FRONTEND   │───▶│   BACKEND   │───▶│  DATABASE   │
│             │    │             │    │             │    │             │
│ • Clicks    │    │ • React     │    │ • Lambda    │    │ • DynamoDB  │
│ • Types     │    │ • Forms     │    │ • Business  │    │ • Tables    │
│ • Submits   │    │ • Buttons   │    │   Logic     │    │ • Records   │
│             │    │ • State     │    │ • API       │    │ • Queries   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ▲                   ▲                   ▲                   │
       │                   │                   │                   │
       │    ┌─────────────┐│    ┌─────────────┐│    ┌─────────────┐│
       └────│  RESPONSE   │◀────│  JSON API   │◀────│   RESULT    │◀┘
            │             │     │             │     │             │
            │ • UI Update │     │ • Success   │     │ • Data      │
            │ • Messages  │     │ • Error     │     │ • Status    │
            │ • Redirect  │     │ • Data      │     │ • Changes   │
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
- **AWS Lambda** - Serverless compute functions
- **Node.js** - JavaScript runtime
- **SAM CLI** - Local development and deployment
- **API Gateway** - HTTP API management

### Database Technologies
- **DynamoDB** - NoSQL database
- **DynamoDB Local** - Local development database
- **AWS SDK** - Database client library

### Security & Authentication
- **JWT Tokens** - Stateless authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **HTTPS** - Encrypted communication

---

## Deployment Architecture

### Local Development Environment
```
┌─────────────────────────────────────────────────────────────────┐
│                    Developer Machine                            │
│─────────────────────────────────────────────────────────────────│
│                                                                 │
│  React Dev Server     SAM CLI Local      DynamoDB Local        │
│  (Port 5173)         (Port 3001)        (Port 8000)           │
│       │                   │                   │                │
│       └───────────────────┼───────────────────┘                │
│                           │                                    │
│                      Docker Engine                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### AWS Production Environment
```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Cloud                               │
│─────────────────────────────────────────────────────────────────│
│                                                                 │
│  CloudFront + S3      API Gateway        DynamoDB              │
│  (Static Hosting)     (Lambda Proxy)     (Managed Database)    │
│       │                   │                   │                │
│       └───────────────────┼───────────────────┘                │
│                           │                                    │
│                    Lambda Functions                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key System Features

### ✅ Current Capabilities (Production Ready)
- **User Authentication** - Login, register, logout, password reset, email verification
- **Donation System** - Stripe integration for one-time and recurring donations
- **Subscription Management** - Monthly subscriptions with customer portal
- **User Dashboard** - Donation history, subscription management, profile settings
- **Security** - Backend rate limiting, email verification, input validation, honeypot detection
- **Responsive Design** - Mobile-first UI with professional branding
- **Email System** - AWS SES integration for transactional emails

### 🔮 Future Capabilities (Planned)

#### **Books Page** (Simple - Showcase)
- Display book covers and descriptions
- External links to Amazon/retailers
- Promotional page for donor-supported books
- No checkout on site (external links only)

#### **E-Commerce Shop** (Complex - Full Integration)
- Product catalog and detail pages
- Shopping cart functionality
- Checkout integration with Stripe
- Order management system
- Wishlist feature for users
- Inventory tracking

#### **Blog System** (Medium Complexity)
- Public blog page for articles
- Admin dashboard for blog management
- Create/edit/delete blog posts
- Rich text editor
- Categories and tags
- SEO optimization

#### **Enhanced Features**
- Analytics dashboard for donations and engagement
- Admin panel for content management
- Advanced reporting and insights
- Email marketing integration

### Scalability Features
- **Serverless Architecture** - Auto-scaling Lambda functions
- **NoSQL Database** - Flexible schema for future growth
- **CDN Distribution** - Global content delivery
- **Microservices Design** - Independent component deployment

---

## 💰 Serverless Architecture Cost Breakdown

### **Current Monthly Costs (Staging + Production)**

**Note:** Running two separate stacks (staging for testing, production for live users)

**AWS Services Used:**

| Service              | Staging Cost | Production Cost | Total Cost | Free Tier                          | Notes                        |
|---------------------|--------------|-----------------|------------|-------------------------------------|------------------------------|
| **Lambda**          | $0           | $0              | $0         | 1M requests/month per account       | Shared free tier             |
| **API Gateway**     | $0           | $0              | $0         | 1M calls/month (12 months)          | Shared free tier             |
| **DynamoDB**        | $0           | $0              | $0         | 25GB storage, 25 RCU/WCU            | 3 staging + 3 production tables |
| **S3**              | $0           | $0              | $0         | 5GB storage, 20K GET requests       | Staging not deployed yet     |
| **CloudFront**      | $0           | $0              | $0         | 1TB transfer, 10M requests          | Staging not deployed yet     |
| **Route 53**        | $0.50        | $0.50           | $1.00      | $0.50 per hosted zone               | 2 hosted zones (staging + prod) |
| **SES**             | $0           | $0              | $0         | 62,000 emails/month per account     | Shared free tier             |
| **Secrets Manager** | $0.40        | $0.40           | $0.80      | None                                | 1 secret per stack           |
| **CloudFormation**  | $0           | $0              | $0         | Free (SAM templates)                | 2 stacks                     |
| **IAM**             | $0           | $0              | $0         | Always free                         | Shared across stacks         |

**Total Current Cost: $1.80/month** (both environments)

**Breakdown:**
- Staging environment: $0.90/month (testing only, minimal usage)
- Production environment: $0.90/month (not deployed yet)

---

### **Projected Costs at Scale**

**At 10,000 users/month (Production only, Staging minimal):**

| Service              | Staging Cost | Production Cost | Total Cost | Notes                                    |
|---------------------|--------------|-----------------|------------|------------------------------------------|
| **Lambda**          | $0           | $0              | $0         | Still within free tier                   |
| **API Gateway**     | $0           | $3.50           | $3.50      | Production traffic only                  |
| **DynamoDB**        | $0           | $2-5            | $2-5       | Production data volume                   |
| **S3**              | $0           | $0.50           | $0.50      | Static hosting                           |
| **CloudFront**      | $0           | $5-10           | $5-10      | Production CDN traffic                   |
| **Route 53**        | $0.50        | $0.50           | $1.00      | 2 hosted zones                           |
| **SES**             | $0           | $0              | $0         | Within free tier                         |
| **Secrets Manager** | $0.40        | $0.40           | $0.80      | 2 secrets                                |
| **CloudFormation**  | $0           | $0              | $0         | Free                                     |
| **IAM**             | $0           | $0              | $0         | Free                                     |

**Estimated Total: $13-21/month** (both environments)

---

**At 100,000 users/month (Production only, Staging minimal):**

| Service              | Staging Cost | Production Cost | Total Cost | Notes                                    |
|---------------------|--------------|-----------------|------------|------------------------------------------|
| **Lambda**          | $0           | $20-40          | $20-40     | Production traffic                       |
| **API Gateway**     | $0           | $35             | $35        | Production requests                      |
| **DynamoDB**        | $1           | $50-100         | $51-101    | Staging minimal, production high         |
| **S3**              | $0           | $2              | $2         | Production storage                       |
| **CloudFront**      | $0           | $50-80          | $50-80     | Production CDN                           |
| **Route 53**        | $0.50        | $1              | $1.50      | 2 hosted zones                           |
| **SES**             | $0           | $10             | $10        | Production emails                        |
| **Secrets Manager** | $0.40        | $0.40           | $0.80      | 2 secrets                                |
| **CloudFormation**  | $0           | $0              | $0         | Free                                     |
| **IAM**             | $0           | $0              | $0         | Free                                     |

**Estimated Total: $170-270/month** (both environments)

---

### **Cost Optimization Features**

✅ **Pay-per-use pricing** - Only pay for actual usage  
✅ **Auto-scaling** - No over-provisioning  
✅ **Free tier benefits** - 12 months free for most services  
✅ **No idle costs** - Lambda only charges during execution  
✅ **Efficient caching** - CloudFront reduces origin requests  
✅ **DynamoDB on-demand** - No capacity planning  
✅ **IAM & CloudFormation** - Always free  

---

### **Key Cost Drivers**

1. **Lambda invocations** - Scales with user activity
2. **DynamoDB reads/writes** - Depends on data access patterns
3. **CloudFront data transfer** - Grows with traffic
4. **API Gateway requests** - Tied to Lambda invocations

**Cost Control Strategies:**
- Use CloudFront caching to reduce API calls
- Optimize DynamoDB queries (use indexes)
- Implement client-side caching
- Monitor with CloudWatch (free)

---

**Last Updated:** November 30, 2025
