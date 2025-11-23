import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import logo from '../assets/images/shared/Far-Too-Young-Logo.png'

const DonorDashboard = ({ user, onLogout, onDonateClick, refreshKey }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userDonations, setUserDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/')
    }
  }, [user, navigate])

  // Fetch user donations from API
  useEffect(() => {
    const fetchDonations = async () => {
      if (!user?.email) return

      setLoading(true) // Show loading when refetching
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
        const token = localStorage.getItem('token')

        if (!token) {
          console.error('No authentication token found')
          setUserDonations([])
          setLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/donations`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()

        if (data.success) {
          setUserDonations(data.donations)
        } else {
          console.error('Failed to fetch donations:', data.message)
          setUserDonations([])
        }
      } catch (error) {
        console.error('Error fetching donations:', error)
        setUserDonations([])
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [user, refreshKey]) // Refetch when refreshKey changes

  if (!user) return null

  // Calculate real stats from user's donations
  const userStats = {
    totalDonations: userDonations.length,
    lifetimeTotal: userDonations.reduce((sum, donation) => sum + donation.amount, 0),
    averageDonation: userDonations.length > 0
      ? Math.round(userDonations.reduce((sum, donation) => sum + donation.amount, 0) / userDonations.length)
      : 0
  }

  const recentDonations = userDonations
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4) // Show last 4 donations

  const handleLogout = () => {
    localStorage.removeItem('loginTimestamp')
    onLogout()
    navigate('/')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg w-full max-w-7xl mx-4 shadow-2xl ring-1 ring-orange-500/50 relative max-h-[90vh] flex flex-col">
        {/* Sign Out Button - Top Left */}
        <button
          onClick={handleLogout}
          className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium border border-white/20 z-10"
        >
          Sign Out
        </button>

        {/* Close Button - Top Right */}
        <button
          onClick={() => navigate('/')}
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
            <h2 className="text-4xl font-medium text-orange-400 mb-4">
              {(() => {
                const welcomeMessages = [
                  `Hello, ${user.name}!`,
                  `Great to see you, ${user.name}!`,
                  `Welcome back, ${user.name}!`,
                  `So glad you're here, ${user.name}!`,
                  `Thank you for returning, ${user.name}!`,
                  `Wonderful to see you again, ${user.name}!`,
                  `Your impact continues, ${user.name}!`,
                  `Ready to change lives, ${user.name}?`,
                  `Hope is here, ${user.name}!`,
                  `Making a difference, ${user.name}!`
                ]

                let loginTime = localStorage.getItem('loginTimestamp')
                if (!loginTime) {
                  loginTime = Date.now()
                  localStorage.setItem('loginTimestamp', loginTime)
                }
                const messageIndex = Math.floor(parseInt(loginTime) / 1000) % welcomeMessages.length

                return welcomeMessages[messageIndex]
              })()}
            </h2>
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Far Too Young" className="h-36 w-auto opacity-90" />
            </div>
            <p className="text-white/80 text-base italic max-w-2xl mx-auto">
              "Every donation creates ripples of hope across the world"
            </p>
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
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-lg font-medium transition-all duration-300 ${activeTab === tab.id
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
                      <span className="text-orange-400 text-xl">👧</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{Math.floor(userStats.lifetimeTotal / 50)}</p>
                  <p className="text-white/60 text-sm mt-1">girls in school this month</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Years of Education Funded</h3>
                    <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <span className="text-orange-400 text-2xl">📚</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{(userStats.lifetimeTotal / 600).toFixed(1)}</p>
                  <p className="text-white/60 text-sm mt-1">years of education provided</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Lives Completely Changed</h3>
                    <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <span className="text-orange-400 text-2xl">🎓</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{Math.floor(userStats.lifetimeTotal / 6000)}</p>
                  <p className="text-white/60 text-sm mt-1">girls fully educated (age 5-14)</p>
                </div>
              </div>

              {/* Thank You Note - Slimmed */}
              <div className="bg-gradient-to-r from-orange-500/10 to-orange-400/10 backdrop-blur-sm border border-orange-400/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-400">💌</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">A Message from the Field</h3>
                    <p className="text-white/80 text-sm italic">
                      "Every donation brings hope to girls like me. Thank you for caring about our education and future!"
                    </p>
                    <p className="text-orange-400 text-xs mt-1">- From all the girls at Far Too Young</p>
                  </div>
                </div>
              </div>

              {/* Progress Towards Goals */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Your Impact Goals for 2025</h3>

                {/* Current Month Summary - Three Column Format */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Month Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span className="text-orange-400 text-lg">📊</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">This Month's Impact</h4>
                        <p className="text-white/60 text-sm">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>

                    {/* Girls Educated */}
                    <div className="text-center">
                      <h4 className="text-white/80 text-sm font-medium mb-1">Girls Educated</h4>
                      <p className="text-2xl font-bold text-orange-400">
                        {(() => {
                          const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
                          const monthlyDonations = userDonations.filter(d => d.createdAt?.startsWith(currentMonth))
                          const monthlyTotal = monthlyDonations.reduce((sum, d) => sum + d.amount, 0)
                          return Math.floor(monthlyTotal / 50)
                        })()}
                      </p>
                    </div>

                    {/* Donated This Month */}
                    <div className="text-center">
                      <h4 className="text-white/80 text-sm font-medium mb-1">Donated</h4>
                      <p className="text-xl font-bold text-white">
                        ${(() => {
                          const currentMonth = new Date().toISOString().slice(0, 7)
                          const monthlyDonations = userDonations.filter(d => d.createdAt?.startsWith(currentMonth))
                          return monthlyDonations.reduce((sum, d) => sum + d.amount, 0)
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-white/70 text-xs mb-2">$50/month per girl covers:</p>
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="text-orange-400 text-base">📚</span>
                        <span className="text-white/60">School fees</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-orange-400 text-base">👕</span>
                        <span className="text-white/60">Uniforms</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-orange-400 text-base">🚌</span>
                        <span className="text-white/60">Transport</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-orange-400 text-base">🏠</span>
                        <span className="text-white/60">Welfare checks</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-orange-400 text-base">🤝</span>
                        <span className="text-white/60">Support</span>
                      </div>
                    </div>
                  </div>
                </div>

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

              {/* Annual Impact History */}
              {userDonations.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">Your Impact Journey</h3>
                    {/* Kindest Donation - Compact Version */}
                    {(() => {
                      const currentYear = new Date().getFullYear().toString()
                      const currentYearDonations = userDonations.filter(d => d.createdAt?.startsWith(currentYear))

                      if (currentYearDonations.length > 0) {
                        const highestDonation = Math.max(...currentYearDonations.map(d => d.amount))
                        return (
                          <div className="flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                            <span className="text-orange-400 text-sm">👑</span>
                            <div className="text-right">
                              <p className="text-white font-medium text-sm">${highestDonation}</p>
                              <p className="text-white/60 text-xs">{currentYear} Best</p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>

                  <div className="flex space-x-4 overflow-x-auto pb-2" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(249, 115, 22, 0.6) transparent'
                  }}>
                    <style jsx>{`
                      div::-webkit-scrollbar {
                        height: 6px;
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
                    {(() => {
                      // Get unique years from donations
                      const years = [...new Set(userDonations.map(d => d.createdAt?.split('-')[0]))].sort((a, b) => b - a)

                      return years.map(year => {
                        const yearDonations = userDonations.filter(d => d.createdAt?.startsWith(year))
                        const yearTotal = yearDonations.reduce((sum, d) => sum + d.amount, 0)
                        const yearCount = yearDonations.length
                        const girlsSupported = Math.floor(yearTotal / 50)

                        return (
                          <div key={year} className="bg-white/5 border border-white/10 rounded-lg p-4 min-w-[280px] flex-shrink-0">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-semibold text-white">{year}</h4>
                              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <span className="text-orange-400 text-sm">📅</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/70 text-sm">Donations</span>
                                <span className="text-white font-medium">{yearCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70 text-sm">Total Impact</span>
                                <span className="text-white font-medium">${yearTotal}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70 text-sm">Girls Supported</span>
                                <span className="text-orange-400 font-medium">{girlsSupported}</span>
                              </div>
                              {yearTotal >= 6000 && (
                                <div className="flex justify-between">
                                  <span className="text-white/70 text-sm">Lives Transformed</span>
                                  <span className="text-green-400 font-medium">{Math.floor(yearTotal / 6000)}</span>
                                </div>
                              )}
                            </div>

                            {/* Year highlight */}
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <p className="text-white/60 text-xs">
                                {yearTotal >= 1000 ? '🌟 Amazing year!' :
                                  yearTotal >= 500 ? '💫 Great impact!' :
                                    yearCount >= 5 ? '❤️ Consistent supporter!' :
                                      '🎯 Making a difference!'}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Continue Your Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={onDonateClick}
                    className="bg-orange-500/80 hover:bg-orange-600/90 text-white py-3 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
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

              {/* Donation History */}
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
                            <p className="text-white/50 text-sm">{donation.createdAt?.split('T')[0]}</p>
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

          {/* Other tabs */}
          {activeTab === 'orders' && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📦</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">E-commerce Coming Soon</h3>
                <p className="text-white/60 mb-6">We're working on bringing you merchandise and educational materials to support our cause.</p>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">⭐</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Wishlist Coming Soon</h3>
                <p className="text-white/60 mb-6">Save your favorite items and get notified when they become available.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

DonorDashboard.propTypes = {
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
  onDonateClick: PropTypes.func.isRequired,
  refreshKey: PropTypes.number.isRequired
}

export default DonorDashboard
