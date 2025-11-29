import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { 
  sanitizeFormData, 
  validateEmail, 
  validatePassword, 
  validateName,
  rateLimiter,
  createHoneypot,
  isBot
} from '../utils/security'

const AuthModal = ({ onClose, onLogin }) => {
  // Single state for current view - much cleaner!
  const [currentView, setCurrentView] = useState('login') // 'login' | 'register' | 'forgot' | 'reset'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    newPassword: '',
    token: ''
  })
  const [honeypot, setHoneypot] = useState(createHoneypot())
  const [validationErrors, setValidationErrors] = useState({})
  const [rateLimitError, setRateLimitError] = useState('')

  // Validation functions
  const validateFullName = (name) => {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 50) {
      return "Name must be 1-50 characters";
    }
    const validPattern = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!validPattern.test(trimmed)) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return null;
  };

  const validateEmail = (email) => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length > 254) {
      return "Email address is too long";
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (password.length > 128) {
      return "Password is too long";
    }
    const commonPasswords = [
      'password', 'password123', '12345678', 'qwerty',
      'abc123', 'letmein', 'welcome', 'admin'
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      return "Please choose a stronger password";
    }
    return null;
  };

  // API handlers
  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    setValidationErrors({})
    setRateLimitError('')

    // Check for bot activity (honeypot)
    if (isBot(honeypot.value)) {
      setError('Suspicious activity detected. Please try again later.')
      return
    }

    // Rate limiting check
    const rateLimitKey = `auth_${formData.email || 'unknown'}`
    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 1000 / 60)
      setRateLimitError(`Too many attempts. Please wait ${remainingTime} minutes before trying again.`)
      return
    }

    // Sanitize form data
    const sanitizedData = sanitizeFormData(formData)
    
    // Enhanced validation - simplified for now
    const errors = {}
    
    if (!sanitizedData.email || !sanitizedData.email.includes('@')) {
      errors.email = 'Please enter a valid email address'
    }

    if (currentView === 'register') {
      if (!sanitizedData.firstName || sanitizedData.firstName.length < 1) {
        errors.firstName = 'First name is required'
      }
      if (!sanitizedData.lastName || sanitizedData.lastName.length < 1) {
        errors.lastName = 'Last name is required'
      }
      if (!sanitizedData.password || sanitizedData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters'
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setLoading(true)

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const endpoint = currentView === 'login' ? '/auth/login' : '/auth/register'
      const payload = currentView === 'login'
        ? { email: sanitizedData.email, password: sanitizedData.password }
        : { 
            email: sanitizedData.email, 
            password: sanitizedData.password, 
            firstName: sanitizedData.firstName, 
            lastName: sanitizedData.lastName 
          }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        if (currentView === 'login') {
          // Login flow - set token and log user in
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          onLogin(data.user)
          onClose()
        } else {
          // Registration flow - show verification message
          setError('')
          setSuccess(data.message || 'Registration successful! Please check your email to verify your account.')
          setLoading(false) // Stop loading to show the message
          // Don't auto-login, don't close modal - let user see the message
          // Form will be disabled due to success state
        }
      } else {
        // Record failed attempt for rate limiting
        rateLimiter.recordAttempt(rateLimitKey)
        setError(data.message || 'Invalid credentials')
      }
    } catch (error) {
      // Record failed attempt for rate limiting
      rateLimiter.recordAttempt(rateLimitKey)
      setError('Request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true)

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (data.success) {
        if (data.resetToken) {
          // Local development - show token and switch to reset view
          setResetToken(data.resetToken)
          setFormData({ ...formData, token: data.resetToken }) // Pre-fill token
          setCurrentView('reset')
        } else {
          // Production - show email sent message
          setError('✅ Reset instructions sent! Check your email.')
          setTimeout(() => setError(''), 3000)
        }
      } else {
        setError(data.message || 'Failed to send reset email')
      }
    } catch (error) {
      setError('Request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.token || !formData.newPassword) {
      setError('Please fill in all fields')
      return
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true)

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: formData.token, newPassword: formData.newPassword })
      })

      const data = await response.json()

      if (data.success) {
        setError('✅ Password reset successful! You can now login with your new password.')
        setTimeout(() => {
          setError('')
          setCurrentView('login')
          setFormData({ ...formData, password: '', newPassword: '', token: '' })
        }, 2000)
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch (error) {
      setError('Request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Clear form when switching views
  const switchView = (view) => {
    setCurrentView(view)
    setError('')
    setSuccess('')
    setShowPassword(false)
    if (view !== 'reset') {
      setResetToken('')
      setFormData({ email: '', password: '', name: '', newPassword: '', token: '' })
    }
  }

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Get current view title
  const getTitle = () => {
    switch (currentView) {
      case 'login': return 'Login'
      case 'register': return 'Register'
      case 'forgot': return 'Reset Password'
      case 'reset': return 'New Password'
      default: return 'Login'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 sm:p-6 lg:p-8 w-full max-w-sm shadow-2xl relative ring-1 ring-orange-500/50">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 w-8 sm:w-10 h-8 sm:h-10 bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 text-white flex items-center justify-center transition-all duration-300 border border-orange-400/50 rounded-tr-lg"
          style={{ borderBottomLeftRadius: '0.5rem' }}
        >
          <svg className="w-4 sm:w-6 h-4 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-orange-400">
            {getTitle()}
          </h2>
        </div>

        {/* Error/Success Messages */}
        {(error || rateLimitError || success) && (
          <div className={`px-4 py-3 rounded-md backdrop-blur-sm mb-6 ${
            success || (error && error.startsWith('✅'))
              ? 'bg-green-500/20 border border-green-400/50 text-green-200'
              : 'bg-red-500/20 border border-red-400/50 text-red-200'
            }`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                {success || (error && error.startsWith('✅')) ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                )}
              </svg>
              {success || rateLimitError || error}
            </div>
          </div>
        )}

        {/* LOGIN VIEW */}
        {currentView === 'login' && (
          <form onSubmit={handleAuth} className="space-y-8">
            {/* Honeypot field - invisible to users, visible to bots */}
            <input
              type="text"
              name={honeypot.name}
              value={honeypot.value}
              onChange={(e) => setHoneypot({ ...honeypot, value: e.target.value })}
              style={honeypot.style}
              tabIndex={-1}
              autoComplete="off"
            />
            
            {/* Email Field */}
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  setError('')
                  setValidationErrors({ ...validationErrors, email: '' })
                }}
                className={`w-full px-0 py-3 bg-transparent border-0 border-b transition-all duration-300 peer focus:outline-none ${
                  validationErrors.email 
                    ? 'border-red-400 text-red-300 focus:border-red-500' 
                    : 'border-white/30 text-white focus:border-orange-500'
                }`}
                required
              />
              <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                formData.email 
                  ? validationErrors.email 
                    ? '-top-4 text-red-400' 
                    : '-top-4 text-orange-400'
                  : 'top-3 text-white/60'
                } peer-focus:-top-4 ${validationErrors.email ? 'peer-focus:text-red-400' : 'peer-focus:text-orange-400'}`}>
                Email
              </label>
              {validationErrors.email && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  setError('')
                }}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/30 text-white focus:outline-none focus:border-orange-500 transition-all duration-300 peer"
                required
              />
              <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${formData.password ? '-top-4 text-orange-400' : 'top-3 text-white/60'
                } peer-focus:-top-4 peer-focus:text-orange-400`}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-3 text-white/60 hover:text-white transition-colors duration-300"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => switchView('forgot')}
                className="text-white/80 hover:text-orange-200 transition-colors duration-300"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 disabled:bg-orange-300/60 text-white py-3 rounded-md text-base font-bold transition-all duration-300 border border-orange-400/50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>

            {/* Switch to Register */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => switchView('register')}
                className="text-white/80 hover:text-orange-200 text-base transition-colors duration-300"
              >
                Don't have an account? <span className="font-medium text-gray-300">Register</span>
              </button>
            </div>
          </form>
        )}

        {/* REGISTER VIEW */}
        {currentView === 'register' && (
          <form onSubmit={handleAuth} className="space-y-8">
            {/* First Name and Last Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value })
                    setError('')
                  }}
                  disabled={success || loading}
                  className={`w-full px-0 py-3 bg-transparent border-0 border-b border-white/30 text-white focus:outline-none focus:border-orange-500 transition-all duration-300 peer ${success ? 'opacity-50 cursor-not-allowed' : ''}`}
                  required
                />
                <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${formData.firstName ? '-top-4 text-orange-400' : 'top-3 text-white/60'
                  } peer-focus:-top-4 peer-focus:text-orange-400`}>
                  First Name
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value })
                    setError('')
                  }}
                  disabled={success || loading}
                  className={`w-full px-0 py-3 bg-transparent border-0 border-b border-white/30 text-white focus:outline-none focus:border-orange-500 transition-all duration-300 peer ${success ? 'opacity-50 cursor-not-allowed' : ''}`}
                  required
                />
                <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${formData.lastName ? '-top-4 text-orange-400' : 'top-3 text-white/60'
                  } peer-focus:-top-4 peer-focus:text-orange-400`}>
                  Last Name
                </label>
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  setError('')
                }}
                disabled={success || loading}
                className={`w-full px-0 py-3 bg-transparent border-0 border-b border-white/30 text-white focus:outline-none focus:border-orange-500 transition-all duration-300 peer ${success ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
              />
              <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${formData.email ? '-top-4 text-orange-400' : 'top-3 text-white/60'
                } peer-focus:-top-4 peer-focus:text-orange-400`}>
                Email
              </label>
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  setError('')
                }}
                disabled={success || loading}
                className={`w-full px-0 py-3 bg-transparent border-0 border-b border-white/30 text-white focus:outline-none focus:border-orange-500 transition-all duration-300 peer ${success ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
              />
              <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${formData.password ? '-top-4 text-orange-400' : 'top-3 text-white/60'
                } peer-focus:-top-4 peer-focus:text-orange-400`}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={success || loading}
                className={`absolute right-0 top-3 text-white/60 hover:text-white transition-colors duration-300 ${success ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 disabled:bg-orange-300/60 text-white py-3 rounded-md text-base font-bold transition-all duration-300 border border-orange-400/50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : success ? (
                'Check Your Email'
              ) : (
                'Register'
              )}
            </button>

            {/* Switch to Login - Hide when success */}
            {!success && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-white/80 hover:text-orange-200 text-base transition-colors duration-300"
                >
                  Already have an account? <span className="font-medium text-gray-300">Login</span>
                </button>
              </div>
            )}
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {currentView === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-8">
            <div className="text-center mb-6">
              <p className="text-white/80 text-sm">
                Enter your email address and we'll send you a reset token.
              </p>
            </div>

            {/* Email Field */}
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  setError('')
                }}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/30 text-white focus:outline-none focus:border-orange-500 transition-all duration-300 peer"
                required
              />
              <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${formData.email ? '-top-4 text-orange-400' : 'top-3 text-white/60'
                } peer-focus:-top-4 peer-focus:text-orange-400`}>
                Email
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 disabled:bg-orange-300/60 text-white py-3 rounded-md text-base font-bold transition-all duration-300 border border-orange-400/50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Reset Token'
              )}
            </button>

            {/* Manual Reset Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => switchView('reset')}
                className="text-orange-400 hover:text-orange-300 text-sm transition-colors duration-300"
              >
                Already have a reset token? Enter it here →
              </button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-white/80 hover:text-orange-200 text-base transition-colors duration-300"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD VIEW */}
        {currentView === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-8">
            <div className="text-center mb-6">
              <p className="text-white/80 text-sm mb-4">
                Copy the reset token and enter your new password.
              </p>
              {resetToken && (
                <div className="bg-black/30 p-3 rounded text-xs text-green-400 break-all font-mono mb-4">
                  {resetToken}
                </div>
              )}
            </div>

            {/* Token Field */}
            <div className="relative">
              <input
                type="text"
                value={formData.token}
                onChange={(e) => {
                  setFormData({ ...formData, token: e.target.value })
                  setError('')
                }}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/30 text-white focus:outline-none focus:border-orange-500 transition-all duration-300 peer"
                required
              />
              <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${formData.token ? '-top-4 text-orange-400' : 'top-3 text-white/60'
                } peer-focus:-top-4 peer-focus:text-orange-400`}>
                Reset Token
              </label>
            </div>

            {/* New Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => {
                  setFormData({ ...formData, newPassword: e.target.value })
                  setError('')
                }}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/30 text-white focus:outline-none focus:border-orange-500 transition-all duration-300 peer"
                required
              />
              <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${formData.newPassword ? '-top-4 text-orange-400' : 'top-3 text-white/60'
                } peer-focus:-top-4 peer-focus:text-orange-400`}>
                New Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-3 text-white/60 hover:text-white transition-colors duration-300"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 disabled:bg-orange-300/60 text-white py-3 rounded-md text-base font-bold transition-all duration-300 border border-orange-400/50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Resetting...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-white/80 hover:text-orange-200 text-base transition-colors duration-300"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

AuthModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
}

export default AuthModal
