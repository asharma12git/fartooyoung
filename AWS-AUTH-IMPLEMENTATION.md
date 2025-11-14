# AWS Authentication Implementation Guide

## AWS Infrastructure Required

### 1. DynamoDB Table
```bash
Table Name: fartooyoung-users
Partition Key: userId (String)
Global Secondary Index: email-index (email as partition key)
```

### 2. Lambda Functions
- `auth-login` - POST /auth/login
- `auth-register` - POST /auth/register

### 3. API Gateway
- REST API with CORS enabled
- Base URL: `https://api.fartooyoung.org` (example)

### 4. Secrets Manager
- Secret: `fartooyoung/jwt-secret`

## Code Changes Required

### 1. Create API Service Layer

**File: `src/services/authService.js`** (NEW FILE)
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-api-gateway-url.amazonaws.com/prod'

export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      throw new Error('Login failed')
    }
    
    const data = await response.json()
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },

  async register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    
    if (!response.ok) {
      throw new Error('Registration failed')
    }
    
    const data = await response.json()
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  getToken() {
    return localStorage.getItem('token')
  }
}
```

### 2. Create Auth Context

**File: `src/context/AuthContext.jsx`** (NEW FILE)
```javascript
import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    setUser(data.user)
    return data
  }

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password)
    setUser(data.user)
    return data
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 3. Update App.jsx

**File: `src/App.jsx`** (MODIFY EXISTING)
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'  // ADD THIS
import Header from './components/Header'
import ChildMarriage from './pages/ChildMarriage'
import FounderTeam from './pages/FounderTeam'
import Partners from './pages/Partners'
import WhatWeDo from './pages/WhatWeDo'
import AuthModal from './components/AuthModal'
import DonationModal from './components/DonationModal'
import { useState } from 'react'

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [showDonation, setShowDonation] = useState(false)

  return (
    <AuthProvider>  {/* WRAP WITH AuthProvider */}
      <Router>
        <div className="min-h-screen bg-dark-900">
          <Header 
            onAuthClick={() => setShowAuth(true)}
            onDonateClick={() => setShowDonation(true)}
          />
          <main>
            <Routes>
              <Route path="/" element={<ChildMarriage />} />
              <Route path="/founder-team" element={<FounderTeam />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/what-we-do" element={<WhatWeDo />} />
            </Routes>
          </main>
          
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
          {showDonation && <DonationModal onClose={() => setShowDonation(false)} />}
        </div>
      </Router>
    </AuthProvider>  {/* CLOSE AuthProvider */}
  )
}

export default App
```

### 4. Update AuthModal.jsx

**File: `src/components/AuthModal.jsx`** (REPLACE EXISTING handleSubmit)
```javascript
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'  // ADD THIS

const AuthModal = ({ onClose }) => {
  const { login, register } = useAuth()  // ADD THIS
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)  // ADD THIS
  const [error, setError] = useState('')  // ADD THIS
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  // REPLACE THE EXISTING handleSubmit FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await register(formData.name, formData.email, formData.password)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ADD ERROR DISPLAY AFTER THE FORM, BEFORE THE TOGGLE BUTTON
  // {error && (
  //   <div className="mt-4 p-3 bg-red-600 bg-opacity-20 border border-red-600 rounded-md">
  //     <p className="text-red-400 text-sm">{error}</p>
  //   </div>
  // )}

  // UPDATE SUBMIT BUTTON TO SHOW LOADING STATE
  // <button
  //   type="submit"
  //   disabled={loading}
  //   className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 rounded-md font-medium transition-colors"
  // >
  //   {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
  // </button>

  // ... rest of component remains the same
}
```

### 5. Update Header.jsx

**File: `src/components/Header.jsx`** (MODIFY EXISTING)
```javascript
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'  // ADD THIS

const Header = ({ onAuthClick, onDonateClick }) => {
  const { user, logout } = useAuth()  // ADD THIS
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Child Marriage' },
    { path: '/founder-team', label: 'Founder & Team' },
    { path: '/partners', label: 'Partners' },
    { path: '/what-we-do', label: 'What We Do' }
  ]

  // REPLACE THE AUTH BUTTON SECTION WITH:
  // <div className="flex items-center space-x-4">
  //   {user ? (
  //     <div className="flex items-center space-x-3">
  //       <span className="text-gray-300 text-sm">Hello, {user.name}</span>
  //       <button
  //         onClick={logout}
  //         className="text-gray-300 hover:text-white transition-colors text-sm"
  //       >
  //         Logout
  //       </button>
  //     </div>
  //   ) : (
  //     <button
  //       onClick={onAuthClick}
  //       className="text-gray-300 hover:text-white transition-colors"
  //       aria-label="Sign Up / Login"
  //     >
  //       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  //       </svg>
  //     </button>
  //   )}
  //   <button
  //     onClick={onDonateClick}
  //     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
  //   >
  //     Donate
  //   </button>
  // </div>

  // ... rest of component remains the same
}
```

### 6. Environment Variables

**File: `.env`** (NEW FILE)
```
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com/prod
```

## Lambda Function Examples

### Login Lambda (`auth-login`)
```javascript
const AWS = require('aws-sdk')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const dynamodb = new AWS.DynamoDB.DocumentClient()
const secretsManager = new AWS.SecretsManager()

exports.handler = async (event) => {
  const { email, password } = JSON.parse(event.body)
  
  // Get JWT secret
  const secret = await secretsManager.getSecretValue({ SecretId: 'fartooyoung/jwt-secret' }).promise()
  const jwtSecret = JSON.parse(secret.SecretString).secret
  
  // Find user by email
  const result = await dynamodb.query({
    TableName: 'fartooyoung-users',
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: { ':email': email }
  }).promise()
  
  if (result.Items.length === 0) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) }
  }
  
  const user = result.Items[0]
  const validPassword = await bcrypt.compare(password, user.passwordHash)
  
  if (!validPassword) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) }
  }
  
  const token = jwt.sign({ userId: user.userId }, jwtSecret, { expiresIn: '7d' })
  
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      token,
      user: { userId: user.userId, name: user.name, email: user.email }
    })
  }
}
```

## Summary of Changes

1. **Create**: `src/services/authService.js` - API calls
2. **Create**: `src/context/AuthContext.jsx` - State management  
3. **Create**: `.env` - Environment variables
4. **Modify**: `src/App.jsx` - Add AuthProvider wrapper
5. **Modify**: `src/components/AuthModal.jsx` - Replace mock with real API calls
6. **Modify**: `src/components/Header.jsx` - Show user state and logout

The key change is in `AuthModal.jsx` where you replace the mock `console.log` with actual API calls to your AWS Lambda functions.
