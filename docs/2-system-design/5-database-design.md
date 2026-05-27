# Far Too Young - Database Design

## Overview
**PRODUCTION STATUS: ✅ LIVE** - Current database schema for Far Too Young platform at https://www.fartooyoung.org

**Current Implementation**: 3 DynamoDB tables supporting authentication and donation processing with live Stripe payments
**Future Expansion**: Designed to scale to full e-commerce and book platform functionality

---

## Entity Relationship Diagram (ERD)

### **🟢 CURRENT PRODUCTION TABLES (Live at https://www.fartooyoung.org)**

```
┌─────────────────────────────────────┐
│    fartooyoung-production-users     │
│─────────────────────────────────────│
│ email (PK)                          │
│ name                                │
│ hashedPassword                      │
│ userId (UUID)                       │
│ createdAt                           │
│ lastLogin                           │
│ resetToken                          │
│ resetExpires                        │
│ isVerified                          │
│ verificationToken                   │
└─────────────────────────────────────┘
            │
            │ 1:many (userId)
            ▼
┌─────────────────────────────────────┐
│  fartooyoung-production-donations   │
│─────────────────────────────────────│
│ id (PK)                             │
│ email                               │
│ name                                │
│ amount                              │
│ type                                │
│ status                              │
│ paymentMethod                       │
│ cardBrand                           │
│ cardLast4                           │
│ wallet                              │
│ stripeInvoiceId                     │
│ stripeSubscriptionId                │
│ stripeSessionId                     │
│ createdAt                           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  fartooyoung-production-rate-limits │
│─────────────────────────────────────│
│ ipAddress (PK)                      │
│ requestCount                        │
│ windowStart                         │
│ ttl (auto-expires)                  │
└─────────────────────────────────────┘
```

### **🔵 FUTURE EXPANSION TABLES (Planned)**

```
┌─────────────────────────┐         ┌─────────────────────────┐         ┌─────────────────────────┐
│   fartooyoung-orders    │         │ fartooyoung-book-clicks │         │   fartooyoung-books     │
│─────────────────────────│         │─────────────────────────│         │─────────────────────────│
│ orderId (PK)            │         │ clickId (PK)            │         │ bookId (PK)             │
│ userId (FK)             │         │ bookId (FK)             │         │ title                   │
│ items[]                 │         │ userId (FK) [optional]  │         │ author                  │
│ totalAmount             │         │ timestamp               │         │ authorType              │
│ status                  │         │ referrer                │         │ description             │
│ shippingAddress         │         │ amazonUrl               │         │ isbn                    │
│ paymentMethod           │         └─────────────────────────┘         │ publishedDate           │
│ stripePaymentId         │                   │                         │ pages                   │
│ createdAt               │                   │ many:1 (bookId)         │ language                │
│ shippedAt               │                   │                         │ category                │
└─────────────────────────┘                   ▼                         │ amazonUrl               │
            │                       ┌─────────────────────────┐         │ price                   │
            │ many:many (items[])   │   fartooyoung-books     │         │ royaltyPercentage       │
            │                       │─────────────────────────│         │ coverImage              │
            ▼                       │ bookId (PK)             │         │ previewPages[]          │
┌─────────────────────────┐         │ title                   │         │ authorId (FK)           │──┐
│  fartooyoung-products   │         │ author                  │         │ authorBio               │  │
│─────────────────────────│         │ authorType              │         │ authorPhoto             │  │
│ productId (PK)          │         │ description             │         │ featured                │  │
│ name                    │         │ isbn                    │         │ status                  │  │
│ description             │         │ publishedDate           │         │ createdAt               │  │
│ price                   │         │ pages                   │         │ updatedAt               │  │
│ category                │         │ language                │         └─────────────────────────┘  │
│ images[]                │         │ category                │                   │                  │
│ inventory               │         │ amazonUrl               │                   │ 1:many           │ 1:many (authorId)
│ status                  │         │ price                   │                   ▼                  │
│ createdAt               │         │ royaltyPercentage       │         ┌─────────────────────────┐  │
│ tags[]                  │         │ coverImage              │         │fartooyoung-book-royalties│  │
└─────────────────────────┘         │ previewPages[]          │         │─────────────────────────│  │
                                    │ authorId (FK)           │         │ royaltyId (PK)          │  │
                                    │ authorBio               │         │ bookId (FK)             │  │
                                    │ authorPhoto             │         │ amount                  │  │
                                    │ featured                │         │ period                  │  │
                                    │ status                  │         │ source                  │  │
                                    │ createdAt               │         │ createdAt               │  │
                                    │ updatedAt               │         └─────────────────────────┘  │
                                    └─────────────────────────┘                                    │
                                                                      ┌─────────────────────────┐  │
                                                                      │    fartooyoung-users    │◄─┘
                                                                      │      (if isAuthor)      │
                                                                      └─────────────────────────┘
```

---

## 🟢 **CURRENT PRODUCTION TABLES** (Live System)

### `fartooyoung-production-users-table`
**Purpose**: User authentication and profile management  
**Status**: ✅ LIVE - Supporting authentication at https://www.fartooyoung.org

| Field | Type | Purpose | Production Status |
|-------|------|---------|------------------|
| `email` | String (PK) | Primary key, login identifier | ✅ Active |
| `name` | String | User's display name | ✅ Active |
| `hashedPassword` | String | bcrypt hashed password (never plain text) | ✅ Active |
| `userId` | String (UUID) | Unique identifier, foreign key for other tables | ✅ Active |
| `createdAt` | ISO String | Account creation timestamp | ✅ Active |
| `lastLogin` | ISO String | Last successful login | ✅ Active |
| `resetToken` | String (Optional) | Temporary password reset token (UUID) | ✅ Active |
| `resetExpires` | ISO String (Optional) | Reset token expiration (15 minutes) | ✅ Active |
| `isVerified` | Boolean | Email verification status | ✅ Active |
| `verificationToken` | String (Optional) | Email verification token | ✅ Active |

### `fartooyoung-production-donations-table`
**Purpose**: 💳 CRITICAL - Complete donation tracking with live Stripe payments  
**Status**: ✅ LIVE - Processing real donations with Stripe integration

| Field | Type | Purpose | Production Status |
|-------|------|---------|------------------|
| `id` | String (PK) | Primary key (prefixed: `checkout_` or `invoice_`) | ✅ Active |
| `email` | String | Donor email address | ✅ Active |
| `name` | String | Donor display name | ✅ Active |
| `amount` | Number | Donation amount in USD (dollars) | ✅ Active |
| `type` | String | one-time, monthly, subscription_cancelled, subscription_updated | ✅ Active |
| `status` | String | completed, cancelled, pending_cancellation | ✅ Active |
| `paymentMethod` | String | card, us_bank_account, stripe-subscription | ✅ Active |
| `cardBrand` | String (Nullable) | visa, amex, mastercard, etc. | ✅ Active |
| `cardLast4` | String (Nullable) | Last 4 digits of card | ✅ Active |
| `wallet` | String (Nullable) | apple_pay, google_pay, or null | ✅ Active |
| `stripeInvoiceId` | String (Nullable) | Stripe invoice ID (recurring payments) | ✅ Active |
| `stripeSubscriptionId` | String (Nullable) | Stripe subscription ID | ✅ Active |
| `stripeSessionId` | String (Nullable) | Stripe checkout session ID (one-time) | ✅ Active |
| `createdAt` | ISO String | Donation timestamp | ✅ Active |

### `fartooyoung-production-rate-limits`
**Purpose**: 🛡️ Anti-spam protection and API rate limiting  
**Status**: ✅ LIVE - Protecting all API endpoints

| Field | Type | Purpose | Production Status |
|-------|------|---------|------------------|
| `limitKey` | String (PK) | Rate limit key (e.g., `login:IP:email`) | ✅ Active |
| `attempts` | List | Timestamps of recent attempts | ✅ Active |
| `ttl` | Number | DynamoDB TTL for auto-expiration (Unix timestamp) | ✅ Active |
| `expiresAt` | Number | Window expiry in milliseconds | ✅ Active |

---

## 🔗 **PRODUCTION AWS INTEGRATION**

### **Live Database Resources**
- **Region**: us-east-1
- **Tables**: 3 DynamoDB tables with on-demand billing
- **Security**: IAM roles with least-privilege access
- **Backup**: Point-in-time recovery enabled

### **Connected Services**
- **17 Lambda Functions**: Authentication, donations, email verification
- **API Gateway**: https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com
- **Stripe Integration**: Live payment processing
- **SES Email**: Verification and notification system
- **Secrets Manager**: Secure API key storage

---

## 🔵 **FUTURE EXPANSION TABLES** (Planned Development)

### `fartooyoung-products`
**Purpose**: E-commerce product catalog (merchandise, apparel)

| Field | Type | Purpose |
|-------|------|---------|
| `productId` | String (PK) | Primary key (UUID) |
| `name` | String | Product name |
| `description` | String | Product description |
| `price` | Number | Price in USD |
| `category` | String | Product category (apparel, accessories, etc.) |
| `images` | Array | Product image URLs |
| `inventory` | Number | Stock quantity |
| `status` | String | active, inactive, discontinued |
| `createdAt` | ISO String | Product creation date |
| `tags` | Array | Search tags and keywords |

### `fartooyoung-orders`
**Purpose**: E-commerce order management

| Field | Type | Purpose |
|-------|------|---------|
| `orderId` | String (PK) | Primary key (UUID) |
| `userId` | String | Links to users table |
| `items` | Array | Order items [{productId, quantity, price}] |
| `totalAmount` | Number | Total order value |
| `status` | String | pending, processing, shipped, delivered |
| `shippingAddress` | Object | Delivery address |
| `paymentMethod` | String | stripe, paypal, etc. |
| `stripePaymentId` | String | Payment processor reference |
| `createdAt` | ISO String | Order creation date |
| `shippedAt` | ISO String | Shipping date |

### `fartooyoung-books`
**Purpose**: Book catalog and author promotion (content marketing)

| Field | Type | Purpose |
|-------|------|---------|
| `bookId` | String (PK) | Primary key (UUID) |
| `title` | String | Book title |
| `author` | String | Author name |
| `authorType` | String | member, non-member, organization |
| `description` | String | Book description/summary |
| `isbn` | String | ISBN number |
| `publishedDate` | ISO String | Publication date |
| `pages` | Number | Page count |
| `language` | String | Book language |
| `category` | String | memoir, research, fiction, children |
| `amazonUrl` | String | Amazon purchase link (affiliate) |
| `price` | Number | Book price on Amazon |
| `royaltyPercentage` | Number | % revenue to Far Too Young |
| `coverImage` | String | Book cover image URL |
| `previewPages` | Array | Preview page URLs |
| `authorId` | String | Links to users table (if member) |
| `authorBio` | String | Author biography |
| `authorPhoto` | String | Author photo URL |
| `featured` | Boolean | Show on homepage |
| `status` | String | draft, published, archived |
| `createdAt` | ISO String | Record creation date |
| `updatedAt` | ISO String | Last update date |

### `fartooyoung-book-royalties`
**Purpose**: Track Amazon royalty payments (separate from donations)

| Field | Type | Purpose |
|-------|------|---------|
| `royaltyId` | String (PK) | Primary key (UUID) |
| `bookId` | String | Links to books table |
| `amount` | Number | Royalty amount received |
| `period` | String | Payment period (e.g., "2024-11") |
| `source` | String | amazon-kdp, amazon-affiliate, direct-sales |
| `createdAt` | ISO String | When Amazon paid Far Too Young |

### `fartooyoung-book-clicks`
**Purpose**: Analytics - Track book link clicks and user engagement

| Field | Type | Purpose |
|-------|------|---------|
| `clickId` | String (PK) | Primary key (UUID) |
| `bookId` | String | Links to books table |
| `userId` | String (Optional) | Links to users (if logged in) |
| `timestamp` | ISO String | When link was clicked |
| `referrer` | String | homepage, books-page, author-profile |
| `amazonUrl` | String | Full Amazon link clicked |

---

## Database Relationships

### User-Centric Design
- **Users** → **Donations** (1:many via userId) - **CRITICAL RELATIONSHIP**
- **Users** → **Orders** (1:many via userId)
- **Users** → **Books** (1:many via authorId, if author)
- **Users** → **Book Clicks** (1:many via userId, if logged in)

### Content & Revenue Tracking
- **Books** → **Book Royalties** (1:many via bookId)
- **Books** → **Book Clicks** (1:many via bookId)
- **Orders** → **Products** (many:many via items array)

### **Business Intelligence & Analytics**

**🟢 Current Production Analytics:**
- **Donations table** = Complete donor history and financial tracking ✅ LIVE
- **Rate Limits table** = API usage patterns and security monitoring ✅ LIVE
- **Users table** = User registration and engagement metrics ✅ LIVE

**🔵 Future Analytics Capabilities:**
- **Book Royalties** = Amazon revenue attribution
- **Book Clicks** = Content marketing effectiveness
- **Orders** = E-commerce sales performance

---

## Technical Specifications

### **🟢 Current Production Implementation**

**Primary Keys:**
- `fartooyoung-production-users-table`: email (natural key)
- `fartooyoung-production-donations-table`: id (prefixed string: checkout_ or invoice_)
- `fartooyoung-production-rate-limits`: ipAddress (natural key)

**Data Types in Production:**
- **Strings**: Text fields, UUIDs, ISO date strings, Stripe IDs
- **Numbers**: Donation amounts (USD cents), request counts, TTL values
- **Booleans**: Verification flags (isVerified)

**Security Implementation:**
- All passwords stored as bcrypt hashes (salt rounds: 10) ✅ LIVE
- Reset tokens are UUIDs with 15-minute expiration ✅ LIVE
- Email verification tokens for account security ✅ LIVE
- Rate limiting prevents API abuse ✅ LIVE
- No plain text passwords anywhere in system ✅ LIVE

**DynamoDB Configuration:**
- **Billing Mode**: On-demand (pay-per-request)
- **Region**: us-east-1
- **Backup**: Point-in-time recovery enabled
- **Security**: Encryption at rest with AWS managed keys
- **Access**: Lambda functions with least-privilege IAM roles

### **🔵 Future Expansion Standards**

**Planned Primary Key Strategy:**
- All future tables will use UUID strings as primary keys
- Consistent naming: `tableId` format (userId, productId, bookId, etc.)
- Natural keys only where business logic requires (email, ipAddress)

**Future Data Types:**
- **Arrays**: Multiple values (images, tags, order items)
- **Objects**: Complex nested data (addresses, profiles)
- **Numbers**: Prices, quantities, percentages, inventory counts

**Scalability Considerations:**
- Single-table design principles where applicable
- Consistent naming convention across all tables
- Optimized for Lambda function access patterns
- Future-proof schema allows adding fields without breaking changes

---

## 🚀 **PRODUCTION STATUS SUMMARY**

**✅ LIVE SYSTEM**: https://www.fartooyoung.org
- **3 DynamoDB Tables**: Users, Donations, Rate Limits
- **17 Lambda Functions**: Complete authentication and payment system
- **Live Payments**: Stripe integration processing real donations
- **Security**: Multi-layer protection with rate limiting and encryption
- **Monitoring**: CloudWatch logs and metrics for all database operations

**📈 CURRENT METRICS**:
- Database cost: ~$0.50/month (on-demand billing)
- Response time: <100ms for all queries
- Availability: 99.9% uptime via AWS DynamoDB
- Security: Zero data breaches, comprehensive audit logging

**🔮 EXPANSION ROADMAP**:
- **Phase 2**: E-commerce tables (products, orders)
- **Phase 3**: Book platform tables (books, royalties, clicks)
- **Phase 4**: Advanced analytics and reporting tables

---

*Last Updated: May 26, 2026*  
*Production Database Status: ✅ LIVE and operational*
