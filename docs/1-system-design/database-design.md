# Far Too Young - Database Design

## Overview
Complete database schema for Far Too Young platform, designed to scale from authentication to full e-commerce and content management.

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────┐
│    fartooyoung-users    │
│─────────────────────────│
│ email (PK)              │
│ name                    │
│ hashedPassword          │
│ userId (UUID)           │
│ createdAt               │
│ lastLogin               │
│ resetToken              │
│ resetExpires            │
│ shippingAddress         │
│ billingAddress          │
│ preferences             │
│ loyaltyPoints           │
│ isAuthor                │
│ authorProfile           │
│ publishedBooks[]        │
└─────────────────────────┘
            │
            │ 1:many (userId)
            ├─────────────────────────────────┬─────────────────────────────────┐
            │                                 │                                 │
            ▼                                 ▼                                 ▼
┌─────────────────────────┐         ┌─────────────────────────┐         ┌─────────────────────────┐
│   fartooyoung-orders    │         │  fartooyoung-donations  │         │ fartooyoung-book-clicks │
│─────────────────────────│         │─────────────────────────│         │─────────────────────────│
│ orderId (PK)            │         │ donationId (PK)         │         │ clickId (PK)            │
│ userId (FK)             │         │ userId (FK) [optional]  │         │ bookId (FK)             │
│ items[]                 │         │ amount                  │         │ userId (FK) [optional]  │
│ totalAmount             │         │ type                    │         │ timestamp               │
│ status                  │         │ campaign                │         │ referrer                │
│ shippingAddress         │         │ paymentMethod           │         │ amazonUrl               │
│ paymentMethod           │         │ stripePaymentId         │         └─────────────────────────┘
│ stripePaymentId         │         │ source                  │                   │
│ createdAt               │         │ createdAt               │                   │ many:1 (bookId)
│ shippedAt               │         │ processedAt             │                   │
└─────────────────────────┘         └─────────────────────────┘                   ▼
            │                                                           ┌─────────────────────────┐
            │ many:many (items[])                                       │   fartooyoung-books     │
            │                                                           │─────────────────────────│
            ▼                                                           │ bookId (PK)             │
┌─────────────────────────┐                                           │ title                   │
│  fartooyoung-products   │                                           │ author                  │
│─────────────────────────│                                           │ authorType              │
│ productId (PK)          │                                           │ description             │
│ name                    │                                           │ isbn                    │
│ description             │                                           │ publishedDate           │
│ price                   │                                           │ pages                   │
│ category                │                                           │ language                │
│ images[]                │                                           │ category                │
│ inventory               │                                           │ amazonUrl               │
│ status                  │                                           │ price                   │
│ createdAt               │                                           │ royaltyPercentage       │
│ tags[]                  │                                           │ coverImage              │
└─────────────────────────┘                                           │ previewPages[]          │
                                                                      │ authorId (FK)           │──┐
                                                                      │ authorBio               │  │
                                                                      │ authorPhoto             │  │
                                                                      │ featured                │  │
                                                                      │ status                  │  │
                                                                      │ createdAt               │  │
                                                                      │ updatedAt               │  │
                                                                      └─────────────────────────┘  │
                                                                                │                  │
                                                                                │ 1:many           │ 1:many (authorId)
                                                                                ▼                  │
                                                                      ┌─────────────────────────┐  │
                                                                      │fartooyoung-book-royalties│  │
                                                                      │─────────────────────────│  │
                                                                      │ royaltyId (PK)          │  │
                                                                      │ bookId (FK)             │  │
                                                                      │ amount                  │  │
                                                                      │ period                  │  │
                                                                      │ source                  │  │
                                                                      │ createdAt               │  │
                                                                      └─────────────────────────┘  │
                                                                                                   │
                                                                      ┌─────────────────────────┐  │
                                                                      │    fartooyoung-users    │◄─┘
                                                                      │      (if isAuthor)      │
                                                                      └─────────────────────────┘
```

---

## Current Tables (Phase 1 - Authentication)

### `fartooyoung-users`
**Purpose**: User authentication and complete profile management

| Field | Type | Purpose |
|-------|------|---------|
| `email` | String (PK) | Primary key, login identifier |
| `name` | String | User's display name |
| `hashedPassword` | String | bcrypt hashed password (never plain text) |
| `userId` | String (UUID) | Unique identifier, foreign key for other tables |
| `createdAt` | ISO String | Account creation timestamp |
| `lastLogin` | ISO String | Last successful login |
| `resetToken` | String (Optional) | Temporary password reset token (UUID) |
| `resetExpires` | ISO String (Optional) | Reset token expiration (15 minutes) |
| `shippingAddress` | Object | Default shipping address (null initially) |
| `billingAddress` | Object | Default billing information (null initially) |
| `preferences` | Object | User preferences and settings (empty object initially) |
| `loyaltyPoints` | Number | Reward system points (0 initially) |
| `isAuthor` | Boolean | Flag for book authors (false initially) |
| `authorProfile` | Object | Author bio and social links (null initially) |
| `publishedBooks` | Array | Array of book IDs authored by user (empty initially) |

### `fartooyoung-donations` 
**Purpose**: CRITICAL - Complete donation tracking and donor management

| Field | Type | Purpose |
|-------|------|---------|
| `donationId` | String (PK) | Primary key (UUID) |
| `userId` | String (Optional) | Links to users (anonymous donations allowed) |
| `amount` | Number | Donation amount in USD |
| `type` | String | one-time, recurring, monthly, annual |
| `campaign` | String | general, emergency, specific-campaign |
| `paymentMethod` | String | stripe, paypal, check, bank-transfer |
| `stripePaymentId` | String | Payment processor reference |
| `source` | String | website, event, mail-campaign, social-media |
| `createdAt` | ISO String | Donation date |
| `processedAt` | ISO String | Payment processing completion |

---

## Future Tables (Phase 2 - E-commerce & Content)

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

### Business Intelligence
- **Donations table** = Complete donor history and financial tracking
- **Book Royalties** = Amazon revenue attribution
- **Book Clicks** = Content marketing effectiveness

---

## Technical Specifications

### Primary Keys
- All tables use UUID strings as primary keys
- `fartooyoung-users` uses email as natural primary key
- Consistent naming: `tableId` format (userId, productId, etc.)

### Data Types
- **Strings**: Text fields, UUIDs, ISO date strings
- **Numbers**: Prices, quantities, percentages
- **Arrays**: Multiple values (images, tags, order items)
- **Objects**: Complex nested data (addresses, profiles)
- **Booleans**: Simple flags (featured, isAuthor)

### Security & Best Practices
- All passwords stored as bcrypt hashes (salt rounds: 10)
- Reset tokens are UUIDs with 15-minute expiration
- No plain text passwords anywhere in system
- Optional user associations (anonymous donations supported)

### DynamoDB Optimization
- Single-table design principles where applicable
- Consistent naming convention across all tables
- Optimized for Lambda function access patterns
- Future-proof schema allows adding fields without breaking changes
