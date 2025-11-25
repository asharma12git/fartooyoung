import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import logo from '../assets/images/shared/Far-Too-Young-Logo.png'

const DonorDashboard = ({ user, onLogout, onDonateClick, onUserUpdate, refreshKey }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userDonations, setUserDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [calculatorAmount, setCalculatorAmount] = useState(100)
  const [showSmartSuggestion, setShowSmartSuggestion] = useState(true)
  
  // Settings form state
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
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

  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Only submit if we're in editing mode
    if (!isEditing) {
      console.log('Form submitted but not in editing mode, ignoring')
      return
    }
    
    console.log('Submitting profile update...')
    setFormLoading(true)
    setMessage({ type: '', text: '' }) // Clear any existing messages
    setMessage({ type: '', text: '' })

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        // Update user state in parent component
        const updatedUser = { ...user, firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone }
        if (onUserUpdate) {
          onUserUpdate(updatedUser)
        }
        
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setIsEditing(false)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setFormLoading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    
    setPasswordLoading(true)
    setPasswordMessage({ type: '', text: '' })

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' })
        setIsChangingPassword(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setPasswordMessage({ type: 'error', text: data.message || 'Failed to change password' })
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) return null

  // Calculate real stats from user's donations
  const userStats = {
    totalDonations: userDonations.length,
    lifetimeTotal: Math.round(userDonations.reduce((sum, donation) => sum + donation.amount, 0) * 100) / 100,
    averageDonation: userDonations.length > 0
      ? Math.round(userDonations.reduce((sum, donation) => sum + donation.amount, 0) / userDonations.length * 100) / 100
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

          {/* Hero Header with Impact Summary */}
          <div className="mb-8">
            {/* Welcome Message */}
            <div className="text-center mb-6">
              <h2 className="text-4xl font-medium text-orange-400 mb-4">
                {(() => {
                  const displayName = user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.name || 'Friend'; // Fallback for old users or missing data
                    
                  const welcomeMessages = [
                    `Hello, ${displayName}!`,
                    `Great to see you, ${displayName}!`,
                    `Welcome back, ${displayName}!`,
                    `So glad you're here, ${displayName}!`,
                    `Thank you for returning, ${displayName}!`,
                    `Wonderful to see you again, ${displayName}!`,
                    `Your impact continues, ${displayName}!`,
                    `Ready to change lives, ${displayName}?`,
                    `Hope is here, ${displayName}!`,
                    `Making a difference, ${displayName}!`
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
                <img src={logo} alt="Far Too Young" className="h-48 w-auto opacity-90" />
              </div>
            </div>

            {/* Hero Impact Banner - Only show if user has donations */}
            {userDonations.length > 0 && (
              <div className="bg-gradient-to-r from-orange-500/30 via-orange-400/20 to-purple-500/30 backdrop-blur-sm border border-orange-400/50 rounded-xl p-8 text-center">
                <p className="text-white/90 text-lg mb-4 italic">
                  "Every donation creates ripples of hope across the world"
                </p>
                <div className="flex justify-center items-center space-x-8">
                  <div>
                    <div className="text-5xl font-bold text-white mb-1">{Math.floor(userStats.lifetimeTotal / 50)}</div>
                    <div className="text-white/70 text-sm">Girls Educated</div>
                  </div>
                  <div className="h-12 w-px bg-white/30"></div>
                  <div>
                    <div className="text-5xl font-bold text-orange-300 mb-1">${userStats.lifetimeTotal}</div>
                    <div className="text-white/70 text-sm">Total Impact</div>
                  </div>
                  <div className="h-12 w-px bg-white/30"></div>
                  <div>
                    <div className="text-5xl font-bold text-green-400 mb-1">{userStats.totalDonations}</div>
                    <div className="text-white/70 text-sm">Donations</div>
                  </div>
                </div>
              </div>
            )}

            {/* First-time donor message */}
            {userDonations.length === 0 && (
              <div className="bg-gradient-to-r from-orange-500/20 to-orange-400/10 backdrop-blur-sm border border-orange-400/40 rounded-xl p-8 text-center">
                <p className="text-white/90 text-xl mb-4">
                  Ready to make your first impact?
                </p>
                <p className="text-white/70 text-base mb-6">
                  Every donation helps girls around the world access education and build brighter futures.
                </p>
                <button
                  onClick={() => onDonateClick()}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                >
                  Make Your First Donation
                </button>
              </div>
            )}
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
              {/* Smart Donation Suggestion - AI Feature #1 */}
              {(() => {
                if (userDonations.length === 0) return null

                // Calculate smart suggestion
                const avgDonation = userStats.averageDonation
                const suggestedAmount = Math.round(avgDonation * 1.2) // 20% higher
                const currentYear = new Date().getFullYear()
                const yearDonations = userDonations.filter(d => d.createdAt?.startsWith(currentYear.toString()))
                const yearTotal = yearDonations.reduce((sum, d) => sum + d.amount, 0)
                const girlsEducatedSoFar = Math.floor(yearTotal / 50)
                const goalGirls = 10
                const progressPercent = Math.min((girlsEducatedSoFar / goalGirls) * 100, 100)

                return showSmartSuggestion ? (
                  <div className="bg-gradient-to-r from-orange-500/20 to-orange-400/10 backdrop-blur-sm border border-orange-400/40 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-2xl">🎯</span>
                          <h3 className="text-xl font-bold text-white">Smart Suggestion for You</h3>
                        </div>
                        <p className="text-white/90 text-lg mb-4">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.name || 'Friend'}, based on your giving pattern, a <span className="font-bold text-orange-300">${suggestedAmount}</span> donation this month would help you reach your goal of educating {goalGirls} girls this year. You're <span className="font-bold text-green-400">{Math.round(progressPercent)}%</span> there!
                        </p>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => onDonateClick(suggestedAmount)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                          >
                            Donate ${suggestedAmount} Now
                          </button>
                          <button 
                            onClick={() => setShowSmartSuggestion(false)}
                            className="text-white/60 hover:text-white text-sm transition-colors"
                          >
                            Maybe Later
                          </button>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="w-24 h-24 relative">
                          <svg className="transform -rotate-90 w-24 h-24">
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="#10b981"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${progressPercent * 2.51} 251`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{Math.round(progressPercent)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null
              })()}

              {/* Impact Insights - AI Feature #2 */}
              {(() => {
                if (userDonations.length === 0) return null

                // Calculate insights
                const totalDonors = 100 // In production, get from backend
                const avgAllDonors = 150 // In production, get from backend
                const percentile = userStats.lifetimeTotal > avgAllDonors ?
                  Math.min(Math.round((userStats.lifetimeTotal / avgAllDonors) * 50) + 50, 95) :
                  Math.round((userStats.lifetimeTotal / avgAllDonors) * 50)

                const currentYear = new Date().getFullYear()
                const lastYear = currentYear - 1
                const thisYearTotal = userDonations
                  .filter(d => d.createdAt?.startsWith(currentYear.toString()))
                  .reduce((sum, d) => sum + d.amount, 0)
                const lastYearTotal = userDonations
                  .filter(d => d.createdAt?.startsWith(lastYear.toString()))
                  .reduce((sum, d) => sum + d.amount, 0)
                const growthPercent = lastYearTotal > 0 ?
                  Math.round(((thisYearTotal - lastYearTotal) / lastYearTotal) * 100) : 0

                return (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">📊</span>
                      <h3 className="text-xl font-bold text-white">Your Impact Insights</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Donor Rank */}
                      <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-lg p-4 border border-orange-400/30 hover:scale-105 transform transition-transform">
                        <div className="text-3xl mb-2">🏆</div>
                        <div className="text-white/60 text-sm mb-1">Donor Rank</div>
                        <div className="text-white font-bold text-lg">Top {100 - percentile}%</div>
                      </div>
                      {/* Year Growth */}
                      <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-4 border border-green-400/30 hover:scale-105 transform transition-transform">
                        <div className="text-3xl mb-2">📈</div>
                        <div className="text-white/60 text-sm mb-1">Year Growth</div>
                        <div className="text-white font-bold text-lg">{growthPercent > 0 ? '+' : ''}{growthPercent}%</div>
                      </div>
                      {/* To Goal */}
                      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-4 border border-blue-400/30 hover:scale-105 transform transition-transform">
                        <div className="text-3xl mb-2">🎯</div>
                        <div className="text-white/60 text-sm mb-1">To Goal</div>
                        <div className="text-white font-bold text-lg">{Math.max(0, 10 - Math.floor(thisYearTotal / 50))} girls</div>
                      </div>
                      {/* This Year Donations */}
                      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-4 border border-purple-400/30 hover:scale-105 transform transition-transform">
                        <div className="text-3xl mb-2">⭐</div>
                        <div className="text-white/60 text-sm mb-1">This Year</div>
                        <div className="text-white font-bold text-lg">{userDonations.filter(d => d.createdAt?.startsWith(currentYear.toString())).length} donations</div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Impact Stats Cards - Existing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-6 border border-green-400/30 hover:scale-105 transform transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Girls Currently Supported</h3>
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 text-xl">👧</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{Math.floor(userStats.lifetimeTotal / 50)}</p>
                  <p className="text-white/60 text-sm mt-1">girls in school this month</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-6 border border-blue-400/30 hover:scale-105 transform transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Years of Education Funded</h3>
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 text-2xl">📚</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{(userStats.lifetimeTotal / 600).toFixed(1)}</p>
                  <p className="text-white/60 text-sm mt-1">years of education provided</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-6 border border-purple-400/30 hover:scale-105 transform transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Lives Completely Changed</h3>
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-purple-400 text-2xl">🎓</span>
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

              {/* Impact Calculator - AI Feature #3 */}
              {(() => {
                const calculateImpact = (amount) => {
                  return {
                    girlsEducated: Math.floor(amount / 50),
                    schoolKits: Math.floor(amount / 25),
                    teacherTraining: Math.floor(amount / 200),
                    schoolsSupported: Math.floor(amount / 500)
                  }
                }

                const impact = calculateImpact(calculatorAmount)

                return (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🔮</span>
                        <h3 className="text-xl font-bold text-white">Impact Calculator</h3>
                      </div>
                      <button
                        onClick={() => onDonateClick(calculatorAmount)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
                      >
                        Donate Now
                      </button>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-white/80 text-sm font-medium">Your Donation Amount</label>
                        <div className="text-2xl font-bold text-orange-400">${calculatorAmount}</div>
                      </div>
                      <input
                        type="range"
                        min="25"
                        max="500"
                        step="25"
                        value={calculatorAmount}
                        onChange={(e) => setCalculatorAmount(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #f97316 0%, #f97316 ${((calculatorAmount - 25) / 475) * 100}%, rgba(255,255,255,0.2) ${((calculatorAmount - 25) / 475) * 100}%, rgba(255,255,255,0.2) 100%)`
                        }}
                      />
                      <div className="flex justify-between text-white/50 text-xs mt-1">
                        <span>$25</span>
                        <span>$500</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-lg p-4 border border-orange-400/30">
                        <div className="text-3xl mb-2">👧</div>
                        <div className="text-white font-bold text-2xl">{impact.girlsEducated}</div>
                        <div className="text-white/70 text-sm">Girls Educated</div>
                        <div className="text-white/50 text-xs mt-1">(1 year)</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-4 border border-blue-400/30">
                        <div className="text-3xl mb-2">📚</div>
                        <div className="text-white font-bold text-2xl">{impact.schoolKits}</div>
                        <div className="text-white/70 text-sm">School Kits</div>
                        <div className="text-white/50 text-xs mt-1">(supplies)</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-4 border border-green-400/30">
                        <div className="text-3xl mb-2">👩‍🏫</div>
                        <div className="text-white font-bold text-2xl">{impact.teacherTraining}</div>
                        <div className="text-white/70 text-sm">Teacher Training</div>
                        <div className="text-white/50 text-xs mt-1">(sessions)</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-4 border border-purple-400/30">
                        <div className="text-3xl mb-2">🏫</div>
                        <div className="text-white font-bold text-2xl">{impact.schoolsSupported}</div>
                        <div className="text-white/70 text-sm">Schools Supported</div>
                        <div className="text-white/50 text-xs mt-1">(monthly)</div>
                      </div>
                    </div>
                  </div>
                )
              })()}

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
                          <div key={year} className={`rounded-lg p-4 min-w-[280px] flex-shrink-0 border transition-all hover:scale-[1.02] ${
                            years.indexOf(year) % 2 === 0
                              ? 'bg-gradient-to-br from-green-500/10 to-green-400/5 border-green-400/20'
                              : 'bg-gradient-to-br from-blue-500/10 to-blue-400/5 border-blue-400/20'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-semibold text-white">{year}</h4>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                years.indexOf(year) % 2 === 0
                                  ? 'bg-green-500/20'
                                  : 'bg-blue-500/20'
                              }`}>
                                <span className={`text-sm ${
                                  years.indexOf(year) % 2 === 0
                                    ? 'text-green-400'
                                    : 'text-blue-400'
                                }`}>📅</span>
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
                    onClick={() => onDonateClick()}
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
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-lg p-6 border border-orange-400/30 hover:scale-105 transform transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Total Donations</h3>
                    <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <span className="text-orange-400 text-lg">🎯</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{userStats.totalDonations}</p>
                  <p className="text-white/60 text-sm mt-1">donations made</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-6 border border-green-400/30 hover:scale-105 transform transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Lifetime Total</h3>
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 text-lg">💰</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">${userStats.lifetimeTotal.toLocaleString()}</p>
                  <p className="text-white/60 text-sm mt-1">total contributed</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-6 border border-blue-400/30 hover:scale-105 transform transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Average Donation</h3>
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 text-lg">📈</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">${userStats.averageDonation}</p>
                  <p className="text-white/60 text-sm mt-1">per donation</p>
                </div>
              </div>

              {/* Donation History */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Donation History</h3>
                  <button
                    onClick={() => onDonateClick()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
                  >
                    Donate Now
                  </button>
                </div>
                {userDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/60">No donations yet</p>
                    <p className="text-white/40 text-sm mt-2">Your donation history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userDonations.map((donation, index) => (
                      <div key={donation.id} className={`flex items-center justify-between py-4 px-4 rounded-lg border transition-all hover:scale-[1.02] ${
                        index % 2 === 0 
                          ? 'bg-gradient-to-r from-green-500/10 to-green-400/5 border-green-400/20' 
                          : 'bg-gradient-to-r from-blue-500/10 to-blue-400/5 border-blue-400/20'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            index % 2 === 0 
                              ? 'bg-green-500/20' 
                              : 'bg-blue-500/20'
                          }`}>
                            <span className={`text-lg ${
                              index % 2 === 0 
                                ? 'text-green-400' 
                                : 'text-blue-400'
                            }`}>💝</span>
                          </div>
                          <div>
                            <p className="text-white font-medium text-lg">${donation.amount}</p>
                            <p className="text-white/60">{donation.type} donation</p>
                            <p className="text-white/50 text-sm">
                              {donation.createdAt ? new Date(donation.createdAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZoneName: 'short'
                              }) : 'Date not available'}
                            </p>
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
                  {message.text && (
                    <div className={`p-3 rounded-lg text-sm ${message.type === 'success' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50"
                        disabled={!isEditing}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50"
                        disabled={!isEditing}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-white/50 text-xs mt-1">Email cannot be changed for security reasons</p>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50"
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true)
                          setMessage({ type: '', text: '' }) // Clear any existing messages
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={formLoading}
                          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          {formLoading && (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          <span>{formLoading ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false)
                            setMessage({ type: '', text: '' })
                            setFormData({
                              firstName: user.name?.split(' ')[0] || '',
                              lastName: user.name?.split(' ').slice(1).join(' ') || '',
                              phone: user.phone || ''
                            })
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-colors border border-white/20"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Change Password</h3>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passwordMessage.text && (
                    <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === 'success' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {passwordMessage.text}
                    </div>
                  )}

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50"
                        disabled={!isChangingPassword}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        disabled={!isChangingPassword}
                      >
                        {showPasswords.current ? (
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50"
                          disabled={!isChangingPassword}
                          minLength="8"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                          disabled={!isChangingPassword}
                        >
                          {showPasswords.new ? (
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
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50"
                          disabled={!isChangingPassword}
                          minLength="8"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                          disabled={!isChangingPassword}
                        >
                          {showPasswords.confirm ? (
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
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    {!isChangingPassword ? (
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Change Password
                      </button>
                    ) : (
                      <>
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          {passwordLoading && (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          <span>{passwordLoading ? 'Changing...' : 'Update Password'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingPassword(false)
                            setPasswordMessage({ type: '', text: '' })
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-colors border border-white/20"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </form>
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
  onUserUpdate: PropTypes.func,
  refreshKey: PropTypes.number.isRequired
}

export default DonorDashboard
