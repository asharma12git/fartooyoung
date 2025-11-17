import { useState } from 'react'
import PropTypes from 'prop-types'

const AuthModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  // Dummy login function for testing
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Simulate successful login/signup
    const userData = {
      name: formData.name || formData.email.split('@')[0],
      email: formData.email
    }
    
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    setFormData({ email: '', password: '', name: '' })
  }

  // User Dashboard/Landing Page (what they see after login)
  if (isLoggedIn && user) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
          
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👋</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user.name}!</h2>
              <p className="text-gray-600">You're successfully logged in</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Your Account</h3>
              <p className="text-sm text-gray-600">Email: {user.email}</p>
              <p className="text-sm text-gray-600">Member since: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-3 mb-6">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors">
                View Donation History
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                Update Profile
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                Newsletter Preferences
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Login/Signup Form
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Centered login form - slimmer width */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 w-full max-w-sm mx-4 shadow-2xl relative ring-1 ring-orange-500/50">
        {/* Close button - slightly darker */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 w-8 h-8 bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 text-white flex items-center justify-center transition-all duration-300 border border-orange-400/50 rounded-tr-lg"
          style={{ borderBottomLeftRadius: '0.5rem' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-medium text-orange-400">
            {isLogin ? 'Login' : 'Register'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {!isLogin && (
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              onChange={(e) => setFormData({...formData, email: e.target.value})}
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
              onChange={(e) => setFormData({...formData, password: e.target.value})}
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
            className="w-full bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 text-white py-3 rounded-md text-base font-bold transition-all duration-300 border border-orange-400/50 mt-8"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
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
  onClose: PropTypes.func.isRequired
}

export default AuthModal
