import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const AuthModal = ({ onClose, user, isLoggedIn, onLogin, onLogout }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
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
    
    onLogin(userData) // Call parent's login handler
  }

  const handleLogout = () => {
    onLogout() // Call parent's logout handler
    setFormData({ email: '', password: '', name: '' })
  }

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // User Dashboard/Landing Page (what they see after login)
  if (isLoggedIn && user) {
    // Mock data for demonstration
    const userStats = {
      totalDonations: 12,
      lifetimeTotal: 2450,
      averageDonation: 204
    }
    
    const recentDonations = [
      { id: 1, amount: 100, date: '2024-01-15', type: 'One-time', status: 'Completed' },
      { id: 2, amount: 50, date: '2024-01-01', type: 'Monthly', status: 'Completed' },
      { id: 3, amount: 250, date: '2023-12-20', type: 'One-time', status: 'Completed' },
      { id: 4, amount: 50, date: '2023-12-01', type: 'Monthly', status: 'Completed' }
    ]

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg w-full max-w-4xl mx-4 shadow-2xl ring-1 ring-orange-500/50 relative max-h-[90vh] flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-0 right-0 w-10 h-10 bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 text-white flex items-center justify-center transition-all duration-300 border border-orange-400/50 rounded-tr-lg z-20"
            style={{ borderBottomLeftRadius: '0.5rem' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-8 flex-1 overflow-y-auto" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(249, 115, 22, 0.6) transparent'
          }}>
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 6px;
              }
              div::-webkit-scrollbar-track {
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background: rgba(249, 115, 22, 0.6);
                border-radius: 3px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: rgba(249, 115, 22, 0.8);
              }
            `}</style>
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}!</h2>
              <p className="text-white/70">Manage your donations and profile</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-8 bg-white/5 p-1 rounded-lg">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'history', label: 'Donation History', icon: '📋' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-orange-500/80 text-white border border-orange-400/50'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white/80 text-sm font-medium">Total Donations</h3>
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span className="text-orange-400 text-lg">🎯</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{userStats.totalDonations}</p>
                    <p className="text-white/60 text-sm mt-1">donations made</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white/80 text-sm font-medium">Lifetime Total</h3>
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span className="text-orange-400 text-lg">💰</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white">${userStats.lifetimeTotal.toLocaleString()}</p>
                    <p className="text-white/60 text-sm mt-1">total contributed</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white/80 text-sm font-medium">Average Donation</h3>
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span className="text-orange-400 text-lg">📈</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white">${userStats.averageDonation}</p>
                    <p className="text-white/60 text-sm mt-1">per donation</p>
                  </div>
                </div>

                {/* Recent Donations */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Recent Donations</h3>
                  <div className="space-y-4">
                    {recentDonations.map(donation => (
                      <div key={donation.id} className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                            <span className="text-orange-400">❤️</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">${donation.amount}</p>
                            <p className="text-white/60 text-sm">{donation.type} • {donation.date}</p>
                          </div>
                        </div>
                        <span className="text-green-400 text-sm font-medium">{donation.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Donation History Tab */}
            {activeTab === 'history' && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-6">All Donations</h3>
                <div className="space-y-3">
                  {recentDonations.map(donation => (
                    <div key={donation.id} className="flex items-center justify-between py-4 px-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                          <span className="text-orange-400 text-lg">💝</span>
                        </div>
                        <div>
                          <p className="text-white font-medium text-lg">${donation.amount}</p>
                          <p className="text-white/60">{donation.type} donation</p>
                          <p className="text-white/50 text-sm">{donation.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-green-400 font-medium">{donation.status}</span>
                        <p className="text-white/60 text-sm mt-1">Receipt available</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Profile Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={user.name}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Preferences</h3>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" className="rounded border-white/30 bg-transparent text-orange-500 focus:ring-orange-500/50" defaultChecked />
                      <span className="text-white/80">Email notifications for donations</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" className="rounded border-white/30 bg-transparent text-orange-500 focus:ring-orange-500/50" defaultChecked />
                      <span className="text-white/80">Monthly impact reports</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" className="rounded border-white/30 bg-transparent text-orange-500 focus:ring-orange-500/50" />
                      <span className="text-white/80">SMS reminders for recurring donations</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-orange-200 transition-colors duration-300"
              >
                Sign out
              </button>
            </div>
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
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  isLoggedIn: PropTypes.bool.isRequired,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired
}

export default AuthModal
