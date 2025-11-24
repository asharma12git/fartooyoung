// Security utilities for input sanitization and validation

// Sanitize string input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim()
}

// Sanitize email input
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email
  
  return email
    .toLowerCase()
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .trim()
}

// Enhanced email validation
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  const sanitized = sanitizeEmail(email)
  
  if (!emailRegex.test(sanitized)) return false
  if (sanitized.length > 254) return false // RFC 5321 limit
  if (sanitized.includes('..')) return false // No consecutive dots
  
  return true
}

// Enhanced password validation
export const validatePassword = (password) => {
  if (typeof password !== 'string') return { valid: false, message: 'Password must be a string' }
  if (!password) return { valid: false, message: 'Password is required' }
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' }
  if (password.length > 128) return { valid: false, message: 'Password too long' }
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain uppercase letter' }
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain lowercase letter' }
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain number' }
  if (!/[!@#$%^&*]/.test(password)) return { valid: false, message: 'Password must contain special character (!@#$%^&*)' }
  
  // Check for common weak passwords
  const weakPasswords = ['password', '12345678', 'qwerty123', 'admin123']
  if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
    return { valid: false, message: 'Password too common, please choose a stronger password' }
  }
  
  return { valid: true, message: 'Password is strong' }
}

// Validate name input
export const validateName = (name) => {
  if (typeof name !== 'string') return false
  const sanitized = sanitizeInput(name)
  if (sanitized.length < 1 || sanitized.length > 50) return false
  if (!/^[a-zA-Z\s'-]+$/.test(sanitized)) return false // Only letters, spaces, hyphens, apostrophes
  return true
}

// Validate phone number
export const validatePhone = (phone) => {
  if (!phone) return true // Phone is optional
  if (typeof phone !== 'string') return false
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '') // Remove formatting
  if (!/^\+?[1-9]\d{9,14}$/.test(cleaned)) return false // International format
  return true
}

// Rate limiting utility (client-side)
class RateLimiter {
  constructor() {
    this.attempts = new Map()
  }
  
  canAttempt(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    const now = Date.now()
    const userAttempts = this.attempts.get(key) || []
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < windowMs)
    
    if (recentAttempts.length >= maxAttempts) {
      return false
    }
    
    return true
  }
  
  recordAttempt(key) {
    const now = Date.now()
    const userAttempts = this.attempts.get(key) || []
    userAttempts.push(now)
    this.attempts.set(key, userAttempts)
  }
  
  getRemainingTime(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now()
    const userAttempts = this.attempts.get(key) || []
    const recentAttempts = userAttempts.filter(time => now - time < windowMs)
    
    if (recentAttempts.length < maxAttempts) return 0
    
    const oldestAttempt = Math.min(...recentAttempts)
    return Math.max(0, windowMs - (now - oldestAttempt))
  }
}

export const rateLimiter = new RateLimiter()

// Honeypot field component (invisible to users, visible to bots)
export const createHoneypot = () => ({
  name: 'website_url', // Common bot target
  value: '',
  style: {
    position: 'absolute',
    left: '-9999px',
    opacity: 0,
    pointerEvents: 'none',
    tabIndex: -1
  }
})

// Check if honeypot was filled (indicates bot)
export const isBot = (honeypotValue) => {
  return honeypotValue && honeypotValue.trim().length > 0
}

// Sanitize form data object
export const sanitizeFormData = (formData) => {
  const sanitized = {}
  
  for (const [key, value] of Object.entries(formData)) {
    if (key === 'email') {
      sanitized[key] = sanitizeEmail(value)
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}
