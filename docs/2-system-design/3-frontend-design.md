# Far Too Young - Frontend Design

## Overview
**PRODUCTION STATUS: ✅ LIVE** - Frontend architecture for Far Too Young platform at https://www.fartooyoung.org

**Current Implementation**: React app with authentication, donations, and responsive design deployed via CloudFront CDN  
**Backend Integration**: Connected to 17 Lambda functions via API Gateway at https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com

---

## Frontend Architecture Diagram

### **🟢 PRODUCTION ARCHITECTURE (Live System)**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              GLOBAL USERS                                       │
│                         https://www.fartooyoung.org                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS Requests
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFRONT CDN (E2PHSH4ED2AIN5)                        │
│                              Global Edge Locations                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Cache Miss → S3 Origin
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    S3 BUCKET (fartooyoung-frontend-production)                  │
│                              Static Website Hosting                             │
│─────────────────────────────────────────────────────────────────────────────────│
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │    App.jsx      │  │   Header.jsx    │  │ AuthModal.jsx   │                │
│  │─────────────────│  │─────────────────│  │─────────────────│                │
│  │• Central state  │  │• Navigation     │  │• Login form     │                │
│  │• Routing        │  │• Auth buttons   │  │• Register form  │                │
│  │• User context   │  │• Donate button  │  │• API calls      │                │
│  │• Production API │  │• Logo/branding  │  │• Form validation│                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ DonorDashboard  │  │ DonationModal   │  │   Page Routes   │                │
│  │─────────────────│  │─────────────────│  │─────────────────│                │
│  │• User profile   │  │• Live Stripe    │  │• ChildMarriage  │                │
│  │• Donation hist  │  │• Payment proc   │  │• FounderTeam    │                │
│  │• Subscriptions  │  │• Amount select  │  │• Partners       │                │
│  │• Account mgmt   │  │• Real payments  │  │• WhatWeDo       │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ API Calls (HTTPS)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (0o7onj0dr7) + 17 LAMBDA FUNCTIONS              │
│              https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com            │
│─────────────────────────────────────────────────────────────────────────────────│
│  POST /auth/login          │  POST /auth/register     │  POST /auth/logout      │
│  POST /donations/create    │  POST /stripe/webhook    │  GET /user/profile      │
│  POST /auth/forgot-password│  POST /auth/reset-password│  + 10 more functions   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Database Queries
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DYNAMODB PRODUCTION                                │
│     fartooyoung-production-users + donations + rate-limits tables              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### **🔵 LOCAL DEVELOPMENT ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DEVELOPER BROWSER                                  │
│                            http://localhost:5173                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ User Interactions
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REACT DEV SERVER (Vite)                           │
│                                Port 5173                                        │
│─────────────────────────────────────────────────────────────────────────────────│
│                          Same React Components                                  │
│                      (Uses .env.local for API URLs)                           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ API Calls (HTTP)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SAM CLI LOCAL API                                     │
│                          http://localhost:3001                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Database Queries
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DYNAMODB LOCAL                                     │
│                          http://localhost:8000                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend-Backend-Database Integration

### **🟢 PRODUCTION COMPONENT FLOW (Live System)**

| Frontend Component          | Production API Endpoint   | Lambda Function       | DynamoDB Table                    | Status    |
|-----------------------------|---------------------------|-----------------------|-----------------------------------|-----------|
| `AuthModal.jsx` (Login)     | `POST /auth/login`        | `LoginFunction`       | `fartooyoung-production-users`    | ✅ LIVE   |
| `AuthModal.jsx` (Register)  | `POST /auth/register`     | `RegisterFunction`    | `fartooyoung-production-users`    | ✅ LIVE   |
| `Header.jsx` (Logout)       | `POST /auth/logout`       | `LogoutFunction`      | None                              | ✅ LIVE   |
| `DonationModal.jsx`         | `POST /donations/create`  | `CreateDonationFunction` | `fartooyoung-production-donations` | ✅ LIVE   |
| `CheckoutButton.jsx`        | `POST /stripe/create-checkout-session` | `CreateCheckoutSessionFunction` | `fartooyoung-production-donations` | ✅ LIVE |
| `SubscriptionManager.jsx`   | `GET /stripe/list-subscriptions` | `ListSubscriptionsFunction` | None | ✅ LIVE |
| `AuthModal.jsx` (Reset)     | `POST /auth/forgot-password` | `ForgotPasswordFunction` | `fartooyoung-production-users` | ✅ LIVE   |
| Rate Limiting (All)         | All endpoints             | All functions         | `fartooyoung-production-rate-limits` | ✅ LIVE   |

**Production API Base URL**: `https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com`

---

## 🟢 **CURRENT PRODUCTION COMPONENTS** (Live System)

### Complete Component List

| Component | Purpose | Status |
|-----------|---------|--------|
| `App.jsx` | Central state, routing, user context | ✅ LIVE |
| `Header.jsx` | Navigation, auth buttons, donate CTA | ✅ LIVE |
| `Footer.jsx` | Site links, contact emails, branding | ✅ LIVE |
| `AuthModal.jsx` | Login, register, password reset forms | ✅ LIVE |
| `DonationModal.jsx` | Stripe checkout, amount selection | ✅ LIVE |
| `CheckoutButton.jsx` | Stripe checkout session trigger | ✅ LIVE |
| `SubscriptionManager.jsx` | Subscription list, cancel/update | ✅ LIVE |
| `DonorDashboard.jsx` | Dashboard, donations, shop, settings tabs | ✅ LIVE |
| `PersonCard.jsx` | Reusable team member card (FounderTeam) | ✅ LIVE |
| `Card.jsx` | Generic card component | ✅ LIVE |
| `SectionTitle.jsx` | Consistent section headings | ✅ LIVE |
| `ChildMarriage.jsx` | Child marriage awareness page | ✅ LIVE |
| `FounderTeam.jsx` | Founder & team bios | ✅ LIVE |
| `Partners.jsx` | Partner organizations | ✅ LIVE |
| `WhatWeDo.jsx` | Programs, carousel, targets | ✅ LIVE |
| `VerifyEmail.jsx` | Email verification landing page | ✅ LIVE |
| `PaymentSuccess.jsx` | Post-donation success page | ✅ LIVE |
| `SubscriptionReturn.jsx` | Post-subscription return page | ✅ LIVE |

### `App.jsx` ✅ LIVE
**Purpose**: Central application state and routing management  
**Production Status**: Deployed at https://www.fartooyoung.org

| State Management            | Production API Integration | Database Fields Used     | Status    |
|-----------------------------|----------------------------|--------------------------|-----------|
| `user` - Current user object| Live authentication endpoints | `email`, `name` from production users table | ✅ LIVE |
| `isAuthenticated` - Login status | JWT token validation | N/A                      | ✅ LIVE |
| `loading` - API call states | All production endpoints  | N/A                      | ✅ LIVE |

**Production API Configuration:**
```javascript
// Production API configuration (.env.production)
const API_BASE_URL = 'https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com';

// User state matches production database schema
const [user, setUser] = useState({
  email: '',
  name: '',
  isVerified: false,
  // Production fields from fartooyoung-production-users-table
});

// Authentication state management
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [token, setToken] = useState(localStorage.getItem('token'));
```

### `AuthModal.jsx` ✅ LIVE
**Purpose**: User authentication interface  
**Production Status**: Processing real user registrations and logins

| Form Fields                 | Production API Endpoint   | Database Fields           | Validation Status        |
|-----------------------------|---------------------------|---------------------------|--------------------------|
| Email, Password             | `POST /auth/login`        | `email`, `hashedPassword` | ✅ Live validation       |
| Email, Password, Name       | `POST /auth/register`     | All production user fields | ✅ Live validation      |
| Email (Reset)               | `POST /auth/forgot-password` | `resetToken`, `resetExpires` | ✅ Live validation   |

**Production API Integration:**
```javascript
// Live login API call
const handleLogin = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    setUser(data.user);           // Production user object
    setToken(data.token);         // JWT token from production
    localStorage.setItem('token', data.token);
    setIsAuthenticated(true);
  }
};

// Live registration with email verification
const handleRegister = async (email, password, name) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  
  // Creates user in fartooyoung-production-users-table
  const data = await response.json();
  if (data.success) {
    // Email verification required in production
    setMessage('Please check your email to verify your account');
  }
};
```

### `Header.jsx` ✅ LIVE
**Purpose**: Navigation and authentication controls  
**Production Status**: Live navigation with authentication state

| UI Elements                 | Production Integration    | User State               | Status    |
|-----------------------------|---------------------------|--------------------------|-----------|
| Login/Register buttons      | Shows AuthModal           | `!isAuthenticated`       | ✅ LIVE   |
| User name display           | Production user context   | `user.name`              | ✅ LIVE   |
| Logout button               | `POST /auth/logout`       | Clears user state        | ✅ LIVE   |
| Donate button               | Shows DonationModal       | Any state                | ✅ LIVE   |

### `DonationModal.jsx` ✅ LIVE
**Purpose**: Live payment processing with Stripe  
**Production Status**: Processing real donations

| Payment Features            | Production Integration    | Database Storage         | Status    |
|-----------------------------|---------------------------|--------------------------|-----------|
| Stripe Checkout             | Live Stripe API           | `fartooyoung-production-donations` | ✅ LIVE |
| Amount Selection            | $25, $50, $100, Custom    | `amount` field           | ✅ LIVE   |
| Recurring Donations         | Stripe subscriptions      | `type` field             | ✅ LIVE   |
| Anonymous Donations         | Optional user association | `userId` optional        | ✅ LIVE   |

**Live Payment Integration:**
```javascript
// Production Stripe integration
const handleDonation = async (amount, type) => {
  const response = await fetch(`${API_BASE_URL}/donations/create`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : undefined
    },
    body: JSON.stringify({ amount, type })
  });
  
  const { sessionUrl } = await response.json();
  // Redirects to live Stripe Checkout
  window.location.href = sessionUrl;
};
```

---

## 🔵 **FUTURE EXPANSION COMPONENTS** (Planned Development)

### Books Section
- `BooksPage.jsx` - Book catalog display
- `BookDetail.jsx` - Individual book information
- `AuthorProfile.jsx` - Author information and books

**Integration:**
```javascript
// Books API integration
const loadBooks = async () => {
  const response = await fetch(`${API_BASE_URL}/books`);
  const books = await response.json();
  // Data from fartooyoung-books table
};

// Track book clicks
const trackBookClick = async (bookId, amazonUrl) => {
  await fetch(`${API_BASE_URL}/books/track-click`, {
    method: 'POST',
    body: JSON.stringify({ bookId, amazonUrl })
  });
  // Saves to fartooyoung-book-clicks table
};
```

### E-commerce Section
- `ProductCatalog.jsx` - Merchandise display
- `ShoppingCart.jsx` - Cart management
- `Checkout.jsx` - Order processing

**Integration:**
```javascript
// Products API integration
const loadProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  const products = await response.json();
  // Data from fartooyoung-products table
};

// Create order
const createOrder = async (cartItems) => {
  const response = await fetch(`${API_BASE_URL}/orders/create`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ items: cartItems })
  });
  // Saves to fartooyoung-orders table
};
```

---

## State Management Strategy

### **🟢 Production User Authentication State**
```javascript
// Production user state (matches fartooyoung-production-users-table schema)
const productionUserState = {
  // Core fields (always loaded from production database)
  email: "user@example.com",
  name: "John Doe",
  userId: "uuid-string",
  isVerified: true,
  createdAt: "2025-12-11T20:00:00.000Z",
  lastLogin: "2025-12-11T20:30:00.000Z",
  
  // Authentication state
  isAuthenticated: true,
  token: "jwt-token-string"
};
```

### **🟢 Production API Response Handling**
```javascript
// Standardized production API response format
const productionApiResponse = {
  success: true,
  data: { /* response data */ },
  message: "Operation successful",
  error: null,
  timestamp: "2025-12-11T20:30:00.000Z"
};

// Production error handling with user feedback
const handleProductionApiError = (response) => {
  if (!response.success) {
    setError(response.message);
    // Log to CloudWatch for monitoring
    console.error('API Error:', response.error);
  }
};
```

### **🔵 Future Extended User State**
```javascript
// Future user state (planned expansion fields)
const futureUserState = {
  // Current production fields
  ...productionUserState,
  
  // Future e-commerce fields
  shippingAddress: { /* address object */ },
  billingAddress: { /* address object */ },
  preferences: { /* user preferences */ },
  loyaltyPoints: 150,
  
  // Future author fields
  isAuthor: false,
  authorProfile: { /* author bio and social links */ },
  publishedBooks: [] // Array of book IDs
};
```

---

## UI/UX Design Patterns

### Authentication Flow
1. **Landing Page** → User clicks "Login" in Header
2. **AuthModal Opens** → User enters credentials
3. **API Call** → Frontend calls `/auth/login`
4. **Success Response** → User state updated, modal closes
5. **Dashboard Redirect** → User navigated to `/dashboard`

### Donation Flow
1. **Any Page** → User clicks "Donate" button
2. **DonationModal Opens** → User selects amount and payment method
3. **Payment Processing** → Stripe/PayPal integration
4. **API Call** → Frontend calls `/donations/create`
5. **Success** → Thank you message, donation recorded

### Error Handling
- **Network Errors** → Retry mechanism with user notification
- **Validation Errors** → Inline form validation
- **Authentication Errors** → Redirect to login
- **Server Errors** → User-friendly error messages

---

## Technical Specifications

### React Architecture
- **React 18** with functional components and hooks
- **Vite** for fast development and building
- **React Router DOM** for client-side routing
- **Tailwind CSS** for styling and responsive design

### API Integration
- **Fetch API** for HTTP requests
- **JWT Token** authentication with localStorage
- **Error Boundaries** for graceful error handling
- **Loading States** for better user experience

### State Management
- **React Context** for global user state
- **useState/useEffect** for component-level state
- **localStorage** for token persistence
- **Custom hooks** for API calls

### Responsive Design
- **Mobile-first** approach with Tailwind CSS
- **Dark theme** optimized for accessibility
- **Glassmorphism** design for modern UI
- **Touch-friendly** interactions for mobile devices

---

## Development Workflow

### **🟢 Production Deployment (Current)**
1. **Build Process**: `npm run build -- --mode production` creates optimized bundle
2. **S3 Upload**: `aws s3 sync dist/ s3://fartooyoung-frontend-production --delete`
3. **CDN Invalidation**: `aws cloudfront create-invalidation --distribution-id E2PHSH4ED2AIN5 --paths "/*"`
4. **Live Result**: https://www.fartooyoung.org serves globally via CloudFront

### **🔵 Local Development**
1. **Frontend Server**: `npm run dev` (port 5173)
2. **Backend API**: SAM CLI `sam local start-api` (port 3001)
3. **Database**: DynamoDB Local (port 8000)
4. **Hot Reload**: Instant updates during development

### **🔄 CI/CD Automation**
1. **Trigger**: Push to `staging` or `main` branch (instant webhook via CodeStar)
2. **CodePipeline V2**: Path-based trigger — only runs when `src/`, `public/`, or `package.json` changes
3. **Build**: Inline buildspec in pipeline template (npm ci → build → S3 sync → CloudFront invalidation)
4. **Result**: Zero-downtime deployment in ~2 minutes

### **🧪 API Integration Testing**
1. **Production Testing**: Live API endpoints with real data
2. **Local Development**: SAM CLI with local DynamoDB
3. **Error Scenarios**: Test network failures and edge cases
4. **Performance**: Monitor CloudWatch metrics for optimization

---

## 🚀 **PRODUCTION STATUS SUMMARY**

**✅ LIVE FRONTEND**: https://www.fartooyoung.org
- **React 18 + Vite**: Optimized production build
- **CloudFront CDN**: Global distribution (E2PHSH4ED2AIN5)
- **S3 Static Hosting**: fartooyoung-frontend-production bucket
- **HTTPS**: SSL certificate via AWS Certificate Manager
- **Responsive Design**: Mobile-first with Tailwind CSS

**🔗 LIVE INTEGRATIONS**:
- **API Gateway**: 17 Lambda functions via https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com
- **Stripe Payments**: Live donation processing
- **Email Verification**: SES integration for user accounts
- **Rate Limiting**: DynamoDB-based API protection

**📊 PRODUCTION METRICS**:
- **Performance**: <2s page load globally
- **Availability**: 99.9% uptime via CloudFront
- **Security**: HTTPS enforcement, CORS protection
- **Cost**: ~$1.20/month for CDN and storage

**🔮 EXPANSION ROADMAP**:
- **Phase 2**: E-commerce components (products, cart, checkout)
- **Phase 3**: Book platform components (catalog, author profiles)
- **Phase 4**: Advanced dashboard with analytics

---

*Last Updated: May 26, 2026*  
*Production Frontend Status: ✅ LIVE and serving global users*
