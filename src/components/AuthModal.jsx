import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const AuthModal = ({ onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  // Name validation function
  const validateFullName = (name) => {
    const trimmed = name.trim();
    
    // Length check
    if (trimmed.length < 1 || trimmed.length > 50) {
      return "Name must be 1-50 characters";
    }
    
    // Pattern check - letters, spaces, hyphens, apostrophes, accents
    const validPattern = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!validPattern.test(trimmed)) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    
    return null; // Valid
  };

  // Email validation function
  const validateEmail = (email) => {
    const trimmed = email.trim().toLowerCase();
    
    // Length check
    if (trimmed.length > 254) {
      return "Email address is too long";
    }
    
    // Format check only - no domain restrictions
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      return "Please enter a valid email address";
    }
    
    return null; // Valid - accepts ANY domain
  };

  // Password validation function
  const validatePassword = (password) => {
    // Length check
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    
    if (password.length > 128) {
      return "Password is too long";
    }
    
    // Check against common weak passwords
    const commonPasswords = [
      'password', 'password123', '12345678', 'qwerty', 
      'abc123', 'letmein', 'welcome', 'admin'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      return "Please choose a stronger password";
    }
    
    return null; // Valid
  };

  // Forgot password handler
  const handleForgotPassword = async (email) => {
    setLoading(true)
    setError('')
    
    try {
      const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // In local development, show the token for testing
        setResetToken(data.resetToken || 'Check DynamoDB Admin for reset token')
        setError('') // Clear any errors
      } else {
        setError(data.message || 'Failed to send reset email')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setError('Request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  };

  // Reset password handler
  const handleResetPassword = async (token, newPassword) => {
    setLoading(true)
    setError('')
    
    try {
      const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setError('')
        setShowForgotPassword(false)
        setResetToken('')
        // Show success message in the error area (green styling)
        setError('✅ Password reset successful! You can now login with your new password.')
        // Auto-hide success message after 3 seconds
        setTimeout(() => setError(''), 3000)
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setError('Request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  };

  // Real API login/register function
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('') // Clear any previous errors
    
    // Validate email for both login and registration
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    // Validate name for registration
    if (!isLogin) {
      const nameError = validateFullName(formData.name);
      if (nameError) {
        setError(nameError);
        return;
      }
      
      // Validate password strength for registration only
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }
    
    setLoading(true)
    
    try {
      const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem('token', data.token)
        onLogin(data.user) // Use real user data from backend
        onClose() // Close modal after successful login
      } else {
        setError(data.message || 'Invalid credentials')
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError('Request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Centered login form */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 w-full max-w-sm mx-4 shadow-2xl relative ring-1 ring-orange-500/50">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 w-10 h-10 bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 text-white flex items-center justify-center transition-all duration-300 border border-orange-400/50 rounded-tr-lg"
          style={{ borderBottomLeftRadius: '0.5rem' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-medium text-orange-400">
            {isLogin ? 'Login' : 'Register'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className={`px-4 py-3 rounded-md backdrop-blur-sm ${
              error.startsWith('✅') 
                ? 'bg-green-500/20 border border-green-400/50 text-green-200'
                : 'bg-red-500/20 border border-red-400/50 text-red-200'
            }`}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          {!isLogin && (
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({...formData, name: e.target.value})
                  setError('')
                }}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/30 text-white focus:outline-none focus:border-orange-500 transition-all duration-300 peer"
                required={!isLogin}
              />
              <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                formData.name ? '-top-4 text-orange-400' : 'top-3 text-white/60'
              } peer-focus:-top-4 peer-focus:text-orange-400`}>
                Full Name
              </label>
              <div className="absolute right-0 top-3 text-white/60">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          )}
          
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({...formData, email: e.target.value})
                setError('')
              }}
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/30 text-white focus:outline-none focus:border-orange-500 transition-all duration-300 peer"
              required
            />
            <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${
              formData.email ? '-top-4 text-orange-400' : 'top-3 text-white/60'
            } peer-focus:-top-4 peer-focus:text-orange-400`}>
              Email
            </label>
            <div className="absolute right-0 top-3 text-white/60">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => {
                setFormData({...formData, password: e.target.value})
                setError('')
              }}
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/30 text-white focus:outline-none focus:border-orange-500 transition-all duration-300 peer"
              required
            />
            <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${
              formData.password ? '-top-4 text-orange-400' : 'top-3 text-white/60'
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

          {isLogin ? (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-white/30 bg-transparent text-orange-500 focus:ring-orange-500/50"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-white/80 hover:text-orange-200 transition-colors duration-300"
              >
                Forgot password?
              </button>
            </div>
          ) : (
            <div className="text-sm">
              <label className="flex items-center text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-white/30 bg-transparent text-orange-500 focus:ring-orange-500/50"
                  required
                />
                Agree to Terms & Conditions
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 disabled:bg-orange-300/60 text-white py-3 rounded-md text-base font-bold transition-all duration-300 border border-orange-400/50 mt-8"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </div>
            ) : (
              isLogin ? 'Login' : 'Register'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            className="text-white/80 hover:text-orange-200 text-base transition-colors duration-300"
          >
            {isLogin ? (
              <>Don't have an account? <span className="font-medium text-gray-300">Register</span></>
            ) : (
              <>Already have an account? <span className="font-medium text-gray-300">Login</span></>
            )}
          </button>
        </div>

        {/* Simple Forgot Password Section */}
        {showForgotPassword && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-lg font-medium text-orange-400 mb-3">Reset Password</h3>
            
            {!resetToken ? (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                  id="forgotEmail"
                />
                <button
                  onClick={() => {
                    const email = document.getElementById('forgotEmail').value
                    if (email) handleForgotPassword(email)
                  }}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded"
                >
                  {loading ? 'Getting Token...' : 'Get Reset Token'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-white/80 text-sm">Your reset token:</p>
                <div className="bg-black/30 p-2 rounded text-xs text-green-400 break-all font-mono">
                  {resetToken}
                </div>
                <input
                  type="text"
                  placeholder="Paste the token here"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                  id="resetToken"
                />
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                  id="newPassword"
                />
                <button
                  onClick={() => {
                    const token = document.getElementById('resetToken').value
                    const newPassword = document.getElementById('newPassword').value
                    if (token && newPassword) handleResetPassword(token, newPassword)
                  }}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}
            
            <button
              onClick={() => {
                setShowForgotPassword(false)
                setResetToken('')
                setError('')
              }}
              className="mt-3 text-white/60 hover:text-white text-sm"
            >
              ← Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

AuthModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired
}

export default AuthModal
