# Far Too Young - Frontend Design

## Overview
Complete frontend architecture for Far Too Young platform using React, designed to integrate with the backend (backend-design.md) and database (database-design.md) systems.

---

## Frontend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                       │
│                            http://localhost:5173                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ User Interactions
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REACT APP (Vite)                                  │
│                                Port 5173                                        │
│─────────────────────────────────────────────────────────────────────────────────│
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │    App.jsx      │  │   Header.jsx    │  │ AuthModal.jsx   │                │
│  │─────────────────│  │─────────────────│  │─────────────────│                │
│  │• Central state  │  │• Navigation     │  │• Login form     │                │
│  │• Routing        │  │• Auth buttons   │  │• Register form  │                │
│  │• User context   │  │• Donate button  │  │• API calls      │                │
│  │• API base URL   │  │• Logo/branding  │  │• Form validation│                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ DonorDashboard  │  │ DonationModal   │  │   Page Routes   │                │
│  │─────────────────│  │─────────────────│  │─────────────────│                │
│  │• User profile   │  │• Stripe form    │  │• ChildMarriage  │                │
│  │• Donation hist  │  │• PayPal option  │  │• FounderTeam    │                │
│  │• Impact metrics │  │• Amount select  │  │• Partners       │                │
│  │• Account mgmt   │  │• Payment proc   │  │• WhatWeDo       │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ API Calls (fetch)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND API (Lambda)                                  │
│                                Port 3001                                        │
│─────────────────────────────────────────────────────────────────────────────────│
│  POST /auth/login          │  POST /auth/register     │  POST /auth/logout      │
│  POST /auth/forgot-password│  POST /auth/reset-password                         │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Database Queries
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DYNAMODB LOCAL                                     │
│                          fartooyoung-users table                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend-Backend-Database Integration

### Component → API → Database Flow

| Frontend Component          | API Endpoint              | Backend Function      | Database Table         | Purpose              |
|-----------------------------|---------------------------|-----------------------|------------------------|----------------------|
| `AuthModal.jsx` (Login)     | `POST /auth/login`        | `login.js`            | `fartooyoung-users`    | User authentication  |
| `AuthModal.jsx` (Register)  | `POST /auth/register`     | `register.js`         | `fartooyoung-users`    | Account creation     |
| `Header.jsx` (Logout)       | `POST /auth/logout`       | `logout.js`           | None                   | Session termination  |
| `DonorDashboard.jsx`        | `GET /user/profile`       | `get-profile.js`      | `fartooyoung-users`    | Load user data       |
| `DonationModal.jsx`         | `POST /donations/create`  | `create-donation.js`  | `fartooyoung-donations`| Process donations    |

---

## Current Components (Phase 1 - Authentication)

### `App.jsx`
**Purpose**: Central application state and routing management  
**Integrates With**: All backend authentication endpoints

| State Management            | API Integration           | Database Fields Used     |
|-----------------------------|---------------------------|--------------------------|
| `user` - Current user object| Login/Register responses  | `email`, `name` from `fartooyoung-users` |
| `isAuthenticated` - Login status | JWT token validation | N/A                      |
| `loading` - API call states | All endpoint responses    | N/A                      |

**API Integration:**
```javascript
// Central API configuration
const API_BASE_URL = 'http://localhost:3001';

// User state matches database user object
const [user, setUser] = useState({
  email: '',
  name: '',
  // Future: shippingAddress, preferences, etc.
});

// Authentication state management
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [token, setToken] = useState(localStorage.getItem('token'));
```

**Routing Integration:**
```javascript
// Routes match backend endpoints
<Routes>
  <Route path="/" element={<ChildMarriage />} />
  <Route path="/founder-team" element={<FounderTeam />} />
  <Route path="/partners" element={<Partners />} />
  <Route path="/what-we-do" element={<WhatWeDo />} />
  <Route path="/dashboard" element={<DonorDashboard />} />
</Routes>
```

### `AuthModal.jsx`
**Purpose**: User authentication interface  
**Integrates With**: `login.js` and `register.js` Lambda functions

| Form Fields                 | API Endpoint              | Database Fields           | Validation               |
|-----------------------------|---------------------------|---------------------------|--------------------------|
| Email, Password             | `POST /auth/login`        | `email`, `hashedPassword` | Email format, required fields |
| Email, Password, Name       | `POST /auth/register`     | All `fartooyoung-users` fields | Email uniqueness, password strength |

**API Integration:**
```javascript
// Login API call
const handleLogin = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    setUser(data.user);           // Sets: { email, name }
    setToken(data.token);         // JWT token
    localStorage.setItem('token', data.token);
    setIsAuthenticated(true);
  }
};

// Register API call (creates full user object)
const handleRegister = async (email, password, name) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  
  // Backend creates complete user with all database fields
  const data = await response.json();
  if (data.success) {
    setUser(data.user);
    setToken(data.token);
    // User object now includes: shippingAddress, preferences, etc.
  }
};
```

### `Header.jsx`
**Purpose**: Navigation and authentication controls  
**Integrates With**: `logout.js` Lambda function

| UI Elements                 | API Integration           | User State               |
|-----------------------------|---------------------------|--------------------------|
| Login/Register buttons      | Shows AuthModal           | `!isAuthenticated`       |
| User name display           | User context              | `user.name`              |
| Logout button               | `POST /auth/logout`       | Clears user state        |
| Donate button               | Shows DonationModal       | Any state                |

**API Integration:**
```javascript
// Logout API call
const handleLogout = async () => {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    }
  });
  
  // Clear frontend state
  setUser(null);
  setToken(null);
  setIsAuthenticated(false);
  localStorage.removeItem('token');
};
```

### `DonorDashboard.jsx`
**Purpose**: User profile and donation management  
**Integrates With**: Future user profile and donation endpoints

| Dashboard Sections          | Future API Endpoints      | Database Tables           |
|-----------------------------|---------------------------|---------------------------|
| Profile Information         | `GET /user/profile`       | `fartooyoung-users`       |
| Donation History            | `GET /donations/history`  | `fartooyoung-donations`   |
| Impact Metrics              | `GET /donations/impact`   | `fartooyoung-donations`   |
| Account Settings            | `PUT /user/profile`       | `fartooyoung-users`       |

**Future API Integration:**
```javascript
// Load user profile (includes all database fields)
const loadUserProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const userData = await response.json();
  // Full user object from fartooyoung-users table:
  // { email, name, shippingAddress, preferences, loyaltyPoints, etc. }
};

// Load donation history
const loadDonationHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/donations/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const donations = await response.json();
  // Array of donations from fartooyoung-donations table
};
```

### `DonationModal.jsx`
**Purpose**: Payment processing interface  
**Integrates With**: Future donation processing endpoints

| Payment Options             | Future API Endpoints      | Database Tables           |
|-----------------------------|---------------------------|---------------------------|
| Stripe Integration          | `POST /donations/create`  | `fartooyoung-donations`   |
| PayPal Integration          | `POST /donations/create`  | `fartooyoung-donations`   |
| Recurring Setup             | `POST /donations/recurring`| `fartooyoung-donations`   |

---

## Future Components (Phase 2 - E-commerce & Content)

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

### User Authentication State
```javascript
// Central user state (matches database schema)
const userState = {
  // Core fields (always loaded)
  email: "gary@test.com",
  name: "Gary Smith",
  
  // Extended fields (loaded on dashboard)
  shippingAddress: { /* address object */ },
  billingAddress: { /* address object */ },
  preferences: { /* user preferences */ },
  loyaltyPoints: 150,
  isAuthor: false,
  
  // Authentication
  isAuthenticated: true,
  token: "jwt-token-string"
};
```

### API Response Handling
```javascript
// Standardized API response format (matches backend design)
const apiResponse = {
  success: true,
  data: { /* response data */ },
  message: "Operation successful",
  error: null
};

// Error handling
const handleApiError = (response) => {
  if (!response.success) {
    setError(response.message);
    // Show user-friendly error message
  }
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

### Local Development
1. **Frontend Server**: `npm run dev` (port 5173)
2. **Backend API**: SAM CLI (port 3001)
3. **Database**: DynamoDB Local (port 8000)
4. **Hot Reload**: Instant updates during development

### API Integration Testing
1. **Mock Data**: Initial development with mock responses
2. **Local Backend**: Integration with SAM CLI endpoints
3. **Error Scenarios**: Test network failures and edge cases
4. **Performance**: Optimize API calls and loading states

### Production Deployment
1. **Build Process**: `npm run build` creates optimized bundle
2. **Static Hosting**: Deploy to AWS S3 + CloudFront
3. **API URLs**: Update to production API Gateway endpoints
4. **Environment Variables**: Configure for production environment
