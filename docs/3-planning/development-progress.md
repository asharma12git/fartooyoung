# Far Too Young - Development Guide

## Project Overview
React donation platform for child marriage prevention organization with AWS serverless backend.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: AWS Lambda + DynamoDB + API Gateway
- **Local Testing**: SAM CLI (Serverless Application Model) + Docker
- **Authentication**: JWT tokens + bcrypt password hashing

---

## Project Structure

### `/src/` - Frontend React Application
```
src/
├── components/
│   ├── Header.jsx          # Navigation bar with auth/donate buttons
│   ├── AuthModal.jsx       # Login/register modal (clean form only)
│   └── DonationModal.jsx   # Stripe/PayPal donation processing
├── pages/
│   ├── ChildMarriage.jsx   # Main landing page
│   ├── FounderTeam.jsx     # Team information page
│   ├── Partners.jsx        # Partner organizations page
│   ├── WhatWeDo.jsx        # Programs and impact page
│   └── DonorDashboard.jsx  # User dashboard with donation history
├── App.jsx                 # Main app with routing + state management
└── main.jsx               # React entry point
```

### `/backend/` - AWS Lambda Functions
```
backend/
├── template.yaml           # SAM template defining all AWS resources
├── package.json           # Node.js dependencies (aws-sdk, bcryptjs, jsonwebtoken)
└── lambda/auth/           # Authentication Lambda functions
    ├── login.js           # POST /auth/login - JWT token creation
    ├── register.js        # POST /auth/register - User creation with password hash
    ├── logout.js          # POST /auth/logout - Token invalidation
    ├── forgot-password.js # POST /auth/forgot-password - Password reset email
    └── reset-password.js  # POST /auth/reset-password - Password update
```

---

## Development Phases Completed

### Phase 1: Frontend Foundation ✅
- **Created**: React app with Vite + Tailwind CSS
- **Built**: 4 core pages (ChildMarriage, FounderTeam, Partners, WhatWeDo)
- **Added**: Responsive design with dark theme
- **Implemented**: React Router for navigation

### Phase 2: Authentication System ✅
- **Extracted**: DonorDashboard from AuthModal into separate page
- **Created**: Clean login/register modal (AuthModal.jsx)
- **Built**: Full dashboard page with glassmorphism design
- **Added**: Proper routing with /dashboard route
- **Implemented**: Central state management in App.jsx

### Phase 3: Backend Infrastructure ✅
- **Created**: 5 Lambda functions for authentication
- **Built**: SAM template.yaml for AWS deployment
- **Added**: JWT token authentication system
- **Implemented**: bcrypt password hashing for security
- **Setup**: CORS configuration for frontend integration

### Phase 4: Local Testing Setup 🚧 (Current)
- **Installed**: SAM CLI (Serverless Application Model) for local Lambda testing
- **Setup**: Docker for containerized Lambda execution
- **Ready**: Local API server on localhost:3001
- **Communication**: React app makes API calls to Lambda functions locally
- **Local Development Artitecture Stack**: 
  - Frontend Server: localhost:5173 (React app)
  - Backend API Server: localhost:3001 (Lambda functions via SAM CLI)
  - Database Server: localhost:8000 (DynamoDB Local via Docker)
- **Next**: Test authentication endpoints locally
