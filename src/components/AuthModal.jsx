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
    // Get user-specific donations from localStorage
    const getUserDonations = () => {
      const donations = localStorage.getItem(`donations_${user.email}`)
      return donations ? JSON.parse(donations) : []
    }

    const userDonations = getUserDonations()
    
    // Calculate real stats from user's donations
    const userStats = {
      totalDonations: userDonations.length,
      lifetimeTotal: userDonations.reduce((sum, donation) => sum + donation.amount, 0),
      averageDonation: userDonations.length > 0 
        ? Math.round(userDonations.reduce((sum, donation) => sum + donation.amount, 0) / userDonations.length)
        : 0
    }
    
    const recentDonations = userDonations
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4) // Show last 4 donations

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg w-full max-w-6xl mx-4 shadow-2xl ring-1 ring-orange-500/50 relative max-h-[90vh] flex flex-col">
          {/* Sign Out Button - Top Left */}
          <button
            onClick={handleLogout}
            className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium border border-white/20 z-10"
          >
            Sign Out
          </button>
          
          {/* Close Button - Top Right */}
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
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-medium text-orange-400 mb-2">Welcome back, {user.name}!</h2>
              <p className="text-white/70">Manage your donations and profile</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-8 bg-white/5 p-1 rounded-lg">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'donations', label: 'Donations', icon: '❤️' },
                { id: 'orders', label: 'Orders', icon: '📦' },
                { id: 'wishlist', label: 'Wishlist', icon: '⭐' },
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
                {/* Impact Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white/80 text-sm font-medium">Girls Currently Supported</h3>
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span className="text-orange-400 text-lg">👩‍🎓</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{Math.floor(userStats.lifetimeTotal / 50)}</p>
                    <p className="text-white/60 text-sm mt-1">girls in school this month</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white/80 text-sm font-medium">Months of Education</h3>
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span className="text-orange-400 text-lg">📚</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{Math.floor(userStats.lifetimeTotal / 50)}</p>
                    <p className="text-white/60 text-sm mt-1">total months funded</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white/80 text-sm font-medium">Lives Completely Changed</h3>
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span className="text-orange-400 text-lg">🌟</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{Math.floor(userStats.lifetimeTotal / 6000)}</p>
                    <p className="text-white/60 text-sm mt-1">girls fully educated (age 5-14)</p>
                  </div>
                </div>

                {/* Progress Towards Goals */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Your Impact Goals for 2025</h3>
                  <div className="space-y-6">
                    {/* Goal 1: Support 1 Girl for 1 Year */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80">Support 1 Girl for 1 Year ($600)</span>
                        <span className="text-orange-400 font-medium">${userStats.lifetimeTotal}/$600</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((userStats.lifetimeTotal / 600) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-white/60 text-sm mt-1">${Math.max(600 - userStats.lifetimeTotal, 0)} more to reach goal</p>
                    </div>

                    {/* Goal 2: Complete Elementary Education */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80">Fund Complete Elementary (5 years - $3,000)</span>
                        <span className="text-orange-400 font-medium">${userStats.lifetimeTotal}/$3,000</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((userStats.lifetimeTotal / 3000) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-white/60 text-sm mt-1">Ages 5-10: Foundation for life</p>
                    </div>

                    {/* Goal 3: Life-Changing Champion */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80">Life-Changing Champion ($6,000)</span>
                        <span className="text-orange-400 font-medium">${userStats.lifetimeTotal}/$6,000</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((userStats.lifetimeTotal / 6000) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-white/60 text-sm mt-1">Complete education: Age 5-14 (10 years)</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity & Next Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Impact</h3>
                    {recentDonations.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-white/60 text-sm">Start making an impact today!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentDonations.slice(0, 3).map(donation => (
                          <div key={donation.id} className="flex items-center space-x-3 py-2">
                            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                              <span className="text-orange-400 text-sm">💝</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm">${donation.amount} donation</p>
                              <p className="text-white/60 text-xs">{donation.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Kindest Donation */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Your Kindest Donation</h3>
                    {userDonations.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-white/60 text-sm">Your largest donation will appear here</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-orange-400 text-xl">👑</span>
                        </div>
                        <p className="text-2xl font-bold text-white">${Math.max(...userDonations.map(d => d.amount))}</p>
                        <p className="text-white/60 text-sm mt-1">
                          {userDonations.find(d => d.amount === Math.max(...userDonations.map(d => d.amount)))?.date}
                        </p>
                        <p className="text-orange-400 text-xs mt-2">
                          {Math.max(...userDonations.map(d => d.amount)) >= 600 ? '🌟 Life-Changing Impact!' : 
                           Math.max(...userDonations.map(d => d.amount)) >= 300 ? '💫 Amazing Generosity!' : 
                           '❤️ Beautiful Kindness!'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thank You Note */}
                <div className="bg-gradient-to-r from-orange-500/10 to-orange-400/10 backdrop-blur-sm border border-orange-400/30 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-400 text-xl">💌</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-3">A Message from the Field</h3>
                      {userStats.lifetimeTotal >= 6000 ? (
                        <div>
                          <p className="text-white/90 italic mb-2">
                            "Dear friend, because of your incredible support, I completed my entire education from Grade 1 to 10! 
                            I am now studying to become a teacher so I can help other girls like me. You changed my whole life. 
                            Thank you from the bottom of my heart."
                          </p>
                          <p className="text-orange-400 text-sm font-medium">- Priya, Age 16, Graduate</p>
                        </div>
                      ) : userStats.lifetimeTotal >= 3000 ? (
                        <div>
                          <p className="text-white/90 italic mb-2">
                            "Thank you so much for helping me go to school! I just finished Grade 5 and I love learning math. 
                            My dream is to become a doctor and help people in my village. You are making my dreams possible!"
                          </p>
                          <p className="text-orange-400 text-sm font-medium">- Anita, Age 11, Grade 5</p>
                        </div>
                      ) : userStats.lifetimeTotal >= 600 ? (
                        <div>
                          <p className="text-white/90 italic mb-2">
                            "I am so happy to be in school this year! I learned to read and write, and my favorite subject is science. 
                            Thank you for believing in me and giving me this chance to learn."
                          </p>
                          <p className="text-orange-400 text-sm font-medium">- Meera, Age 8, Grade 2</p>
                        </div>
                      ) : userStats.lifetimeTotal >= 50 ? (
                        <div>
                          <p className="text-white/90 italic mb-2">
                            "Thank you for helping me stay in school! Every day I learn something new. 
                            Today I learned to write my name perfectly. I am so excited to keep learning!"
                          </p>
                          <p className="text-orange-400 text-sm font-medium">- Kavya, Age 6, Grade 1</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-white/90 italic mb-2">
                            "Every donation, no matter the size, brings hope to girls like me. 
                            Thank you for caring about our education and our future. Together, we can change the world!"
                          </p>
                          <p className="text-orange-400 text-sm font-medium">- From all the girls at Far Too Young</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Continue Your Impact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button className="bg-orange-500/80 hover:bg-orange-600/90 text-white py-3 px-4 rounded-lg transition-colors text-sm font-medium">
                      🎯 Make Another Donation
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors text-sm font-medium border border-white/20">
                      📚 Read Success Stories
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors text-sm font-medium border border-white/20">
                      📢 Share Our Mission
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Donations Tab */}
            {activeTab === 'donations' && (
              <div className="space-y-8">
                {/* Donation Stats Cards */}
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

                {/* All Donations History */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Donation History</h3>
                  {userDonations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/60">No donations yet</p>
                      <p className="text-white/40 text-sm mt-2">Your donation history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userDonations.map(donation => (
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
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📦</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">E-commerce Coming Soon</h3>
                  <p className="text-white/60 mb-6">We're working on bringing you merchandise and educational materials to support our cause.</p>
                  <div className="bg-white/5 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-white/80 text-sm">Future features:</p>
                    <ul className="text-white/60 text-sm mt-2 space-y-1">
                      <li>• Awareness merchandise</li>
                      <li>• Educational materials</li>
                      <li>• Event tickets</li>
                      <li>• Digital resources</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">⭐</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Wishlist Coming Soon</h3>
                  <p className="text-white/60 mb-6">Save your favorite items and get notified when they become available.</p>
                  <div className="bg-white/5 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-white/80 text-sm">Planned features:</p>
                    <ul className="text-white/60 text-sm mt-2 space-y-1">
                      <li>• Save favorite products</li>
                      <li>• Get availability notifications</li>
                      <li>• Share wishlists</li>
                      <li>• Quick purchase options</li>
                    </ul>
                  </div>
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
              <p className="text-white/60 text-sm text-center">
                Need help? Contact us at support@fartooyoung.org
              </p>
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
