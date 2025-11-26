# Debug Session 2: CORS Frontend-Backend Integration

**Date**: November 20, 2025  
**Context**: Connecting React frontend to working Lambda backend APIs  
**Outcome**: ✅ Successfully resolved - Frontend can now call backend APIs

---

## Issues Encountered & Solutions

### 1. Initial CORS Preflight Failure
**Error**: Browser blocking requests with CORS policy error
```
Access to fetch at 'http://localhost:3001/auth/login' from origin 'http://localhost:5173' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**SAM CLI Logs**: 
```
2025-11-20 16:13:49 127.0.0.1 - - [20/Nov/2025 16:13:49] "OPTIONS /auth/login HTTP/1.1" 403
```

**Root Cause**: Browser sends OPTIONS preflight request before POST, but Lambda function only handled POST requests

**Solution Attempt 1**: Added CORS headers to existing POST responses
```javascript
headers: { 'Access-Control-Allow-Origin': '*' }
```
**Result**: ❌ Still failed - preflight OPTIONS request not handled

---

### 2. SAM CLI CORS Configuration Not Working
**Error**: SAM template had CORS configured but OPTIONS requests still returned 403

**Template Configuration**:
```yaml
Cors:
  AllowMethods: "'POST,OPTIONS'"
  AllowHeaders: "'Content-Type,Authorization'"
  AllowOrigin: "'*'"
```

**Root Cause**: SAM CLI local development doesn't automatically handle CORS preflight like AWS API Gateway does in production

**Solution Attempt 2**: Added OPTIONS handling directly to Lambda function
```javascript
// Handle CORS preflight
if (event.httpMethod === 'OPTIONS') {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: ''
  };
}
```
**Result**: ❌ Still failed - SAM CLI not routing OPTIONS to Lambda

---

### 3. SAM CLI Not Routing OPTIONS Requests
**Error**: OPTIONS requests returning 403 with "Missing Authentication Token"

**Test Command**:
```bash
curl -X OPTIONS http://localhost:3001/auth/login -v
```

**Response**:
```
HTTP/1.1 403 FORBIDDEN
{"message":"Missing Authentication Token"}
```

**Root Cause**: SAM CLI wasn't routing OPTIONS requests to the Lambda function despite CORS configuration

**Final Solution**: Added explicit OPTIONS method to SAM template
```yaml
Events:
  LoginApi:
    Type: Api
    Properties:
      Path: /auth/login
      Method: post
      Cors:
        AllowMethods: "'POST,OPTIONS'"
        AllowHeaders: "'Content-Type,Authorization'"
        AllowOrigin: "'*'"
  LoginOptions:          # ← Added this
    Type: Api
    Properties:
      Path: /auth/login
      Method: options      # ← Explicit OPTIONS route
```

**Result**: ✅ SUCCESS - OPTIONS requests now routed to Lambda function

---

### 4. Frontend Error Handling Improvement
**Issue**: Generic "Login failed" message didn't show actual backend errors

**Original Code**:
```javascript
} catch (error) {
  alert('Login failed')
}
```

**Improved Code**:
```javascript
} catch (error) {
  console.error('Login error:', error)
  alert('Login failed: ' + error.message)
}
```

**Benefit**: Better debugging visibility for future issues

---

## Final Working Configuration

### Lambda Function (login.js)
```javascript
exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  try {
    // ... existing login logic
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, user, token })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
```

### SAM Template (template.yaml)
```yaml
LoginFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: lambda/auth/
    Handler: login.handler
    Runtime: nodejs18.x
    Events:
      LoginApi:
        Type: Api
        Properties:
          Path: /auth/login
          Method: post
          Cors:
            AllowMethods: "'POST,OPTIONS'"
            AllowHeaders: "'Content-Type,Authorization'"
            AllowOrigin: "'*'"
      LoginOptions:
        Type: Api
        Properties:
          Path: /auth/login
          Method: options
```

### Frontend (AuthModal.jsx)
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  try {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: formData.email, 
        password: formData.password 
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      localStorage.setItem('token', data.token)
      onLogin(data.user)
      onClose()
    } else {
      alert(data.message || 'Invalid credentials')
    }
  } catch (error) {
    console.error('Login error:', error)
    alert('Login failed: ' + error.message)
  }
}
```

---

## Success Result

**Frontend Request**: ✅ No CORS errors  
**Backend Response**: ✅ Proper error messages displayed  
**Test Results**:
- Valid credentials (gary@test.com/test123) → Success with JWT token
- Invalid credentials → "Invalid credentials" message
- Network errors → Detailed error messages

---

## Key Learnings

### CORS in Local Development
- SAM CLI local development behaves differently than AWS API Gateway
- Explicit OPTIONS routes required for SAM CLI
- Production deployment will handle CORS automatically

### Browser Security
- Browsers always send OPTIONS preflight for cross-origin requests
- Both OPTIONS and actual request must return proper CORS headers
- CORS errors appear in browser console, not server logs

### Debugging Strategy
- Test OPTIONS requests separately with curl
- Add console.log to frontend for visibility
- Check both browser console and server logs

---

## Production Impact

### ✅ No Changes Needed for AWS Deployment
- API Gateway handles CORS automatically
- Lambda function CORS code works in both environments
- Frontend code identical for local and production

### 🔄 Future Considerations
- Apply same CORS fixes to register.js, logout.js, etc.
- Consider CORS middleware for cleaner code
- Environment-specific CORS origins for production security

---

## Time Investment
- **Total Debug Time**: ~15 minutes
- **Root Cause**: Local development CORS complexity
- **Value**: Complete frontend-backend integration working

## Key Takeaway
CORS issues are common in local development but resolve automatically in AWS production. The explicit OPTIONS handling ensures compatibility across all environments.
