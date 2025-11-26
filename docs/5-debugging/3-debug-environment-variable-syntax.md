# Debug Session 3: Environment Variable Syntax Error

**Date**: November 21, 2025  
**Context**: Frontend environment variable integration causing "process is not defined" error  
**Outcome**: ✅ Successfully resolved - Correct Vite syntax implemented

---

## Issue Encountered

### **Error Message**
```
AuthModal.jsx:43 Auth error: ReferenceError: process is not defined
    at handleSubmit (AuthModal.jsx:21:28)
```

### **User Experience**
- Login form submitted successfully
- Loading spinner appeared
- Error message: "Request failed. Please try again"
- No network request made to backend

### **Root Cause**
Used Node.js environment variable syntax (`process.env`) in browser/Vite environment where it's not available.

---

## Code Evolution

### **Original Working Code (Hard-coded)**
```javascript
// This worked fine - direct URL
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### **Broken Code (Wrong Syntax)**
```javascript
// Added environment variables but used Node.js syntax in browser
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

**Problem**: `process.env` is a Node.js global that doesn't exist in browser environments.

### **Fixed Code (Correct Vite Syntax)**
```javascript
// Correct Vite syntax for environment variables
const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

**Solution**: `import.meta.env` is the Vite-specific way to access environment variables in the browser.

---

## Environment Variable Syntax by Platform

### **Node.js (Backend/Server)**
```javascript
// Works in Lambda functions, Node.js servers
const secret = process.env.JWT_SECRET
const endpoint = process.env.DYNAMODB_ENDPOINT
```

### **Vite (Frontend/Browser)**
```javascript
// Works in React/Vite applications
const apiUrl = import.meta.env.REACT_APP_API_BASE_URL
const mode = import.meta.env.MODE  // development, production
```

### **Create React App (Alternative Frontend)**
```javascript
// Works in Create React App (not Vite)
const apiUrl = process.env.REACT_APP_API_BASE_URL
```

### **Next.js (Full-stack Framework)**
```javascript
// Server-side
const secret = process.env.JWT_SECRET

// Client-side
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

---

## Debugging Process

### **Step 1: Identify the Error**
- Browser console showed "process is not defined"
- Error occurred in AuthModal.jsx at environment variable access
- No network request was made (confirmed via Network tab)

### **Step 2: Understand the Context**
- Code was running in browser (Vite environment)
- `process.env` is Node.js-specific, not available in browsers
- Vite uses `import.meta.env` for environment variables

### **Step 3: Apply the Fix**
- Replace `process.env` with `import.meta.env`
- Test immediately to confirm fix
- Verify fallback URL still works when env var not set

### **Step 4: Verify Solution**
- Login functionality restored
- Environment variable support maintained
- Code now works in both development and production

---

## Key Learnings

### **Environment Variable Access Patterns**
| Platform | Syntax | Example |
|----------|--------|---------|
| Node.js/Lambda | `process.env.VAR_NAME` | `process.env.JWT_SECRET` |
| Vite/React | `import.meta.env.REACT_APP_VAR` | `import.meta.env.REACT_APP_API_URL` |
| Create React App | `process.env.REACT_APP_VAR` | `process.env.REACT_APP_API_URL` |

### **Vite-Specific Rules**
- Environment variables must be prefixed with `REACT_APP_`
- Access via `import.meta.env` not `process.env`
- Variables are replaced at build time, not runtime
- Only variables starting with `REACT_APP_` are exposed to browser

### **Common Mistakes**
- ❌ Using `process.env` in Vite applications
- ❌ Forgetting `REACT_APP_` prefix for client-side variables
- ❌ Assuming all build tools use same environment variable syntax

---

## Prevention Strategies

### **1. Know Your Build Tool**
- **Vite**: `import.meta.env.REACT_APP_*`
- **Create React App**: `process.env.REACT_APP_*`
- **Next.js**: `process.env.NEXT_PUBLIC_*` (client), `process.env.*` (server)

### **2. Test Environment Variables Early**
```javascript
// Add debugging to verify environment variable access
console.log('Environment check:', {
  apiUrl: import.meta.env.REACT_APP_API_BASE_URL,
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV
})
```

### **3. Use TypeScript for Better Error Catching**
```typescript
// TypeScript would catch this at compile time
interface ImportMetaEnv {
  readonly REACT_APP_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## Production Impact

### ✅ **No Production Issues**
- Error occurred during development
- Fixed before any production deployment
- Environment variable system now works correctly

### 🔄 **Improved Development Process**
- Better understanding of Vite environment variables
- Proper debugging documentation for future reference
- Cleaner separation between development and production configs

---

## Time Investment
- **Total Debug Time**: ~5 minutes
- **Root Cause**: Platform-specific environment variable syntax
- **Value**: Proper environment variable implementation for production readiness

## Key Takeaway
Different JavaScript environments (Node.js vs Browser) have different APIs for accessing environment variables. Always use the correct syntax for your specific build tool and runtime environment.
