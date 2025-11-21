import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const AuthModal = ({ onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  // Real API login/register function
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('') // Clear any previous errors
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
            <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-md backdrop-blur-sm">
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
                Username
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
              type="password"
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
            <div className="absolute right-0 top-3 text-white/60">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
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
      </div>
    </div>
  )
}

AuthModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired
}

export default AuthModal
