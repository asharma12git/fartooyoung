import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import SubscriptionManager from '../components/SubscriptionManager'
import logo from '../assets/images/shared/Far-Too-Young-Logo.png'

const DonorDashboard = ({ user, onLogout, onDonateClick, onUserUpdate, refreshKey }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeShopSubtab, setActiveShopSubtab] = useState('orders') // For Shop subtabs
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

  // Phone number formatting function
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/[^\d]/g, '')
    
    // Limit to 10 digits for US format
    const limitedPhone = phoneNumber.slice(0, 10)
    
    // Format as (123) 456-7890
    if (limitedPhone.length < 4) return limitedPhone
    if (limitedPhone.length < 7) {
      return `(${limitedPhone.slice(0, 3)}) ${limitedPhone.slice(3)}`
    }
    return `(${limitedPhone.slice(0, 3)}) ${limitedPhone.slice(3, 6)}-${limitedPhone.slice(6)}`
  }
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg w-full max-w-7xl shadow-2xl ring-1 ring-orange-500/50 relative max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Sign Out Button - Top Left */}
        <button
          onClick={handleLogout}
          className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium border border-white/20 z-10"
        >
          Sign Out
        </button>

        {/* Close Button - Top Right */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-0 right-0 w-8 sm:w-10 h-8 sm:h-10 bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 text-white flex items-center justify-center transition-all duration-300 border border-orange-400/50 rounded-tr-lg z-20"
          style={{ borderBottomLeftRadius: '0.5rem' }}
        >
          <svg className="w-4 sm:w-6 h-4 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 sm:p-6 lg:p-16 flex-1 overflow-y-auto" style={{
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
          <div className="mb-6 lg:mb-8">
            {/* Welcome Message */}
            <div className="text-center mb-4 lg:mb-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light bg-gradient-to-r from-white via-orange-200 to-purple-200 bg-clip-text text-transparent mb-3 lg:mb-4 tracking-wide">
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
              <div className="flex justify-center mb-3 lg:mb-4">
                <img src={logo} alt="Far Too Young" className="h-32 sm:h-40 lg:h-48 w-auto opacity-90" />
              </div>
            </div>

            {/* Hero Impact Banner - Only show if user has donations */}
            {userDonations.length > 0 && (
              <div className="bg-white/5 rounded-lg p-6 sm:p-8 lg:p-10 text-center">
                <p className="text-lg sm:text-xl mb-6 sm:mb-8 font-medium tracking-wide bg-gradient-to-r from-orange-300 via-orange-200 to-orange-400 bg-clip-text text-transparent">
                  Your Impact Journey
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-12 lg:space-x-16">
                  <div className="group">
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-light mb-2 bg-gradient-to-r from-orange-300 via-orange-200 to-orange-400 bg-clip-text text-transparent">
                      {Math.floor(userStats.lifetimeTotal / 50)}
                    </div>
                    <div className="text-white/50 text-xs sm:text-sm uppercase tracking-wider font-light">Girls Educated</div>
                  </div>
                  <div className="hidden sm:block h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                  <div className="group">
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-light mb-2 bg-gradient-to-r from-orange-300 via-orange-200 to-orange-400 bg-clip-text text-transparent">
                      ${userStats.lifetimeTotal}
                    </div>
                    <div className="text-white/50 text-xs sm:text-sm uppercase tracking-wider font-light">Total Impact</div>
                  </div>
                  <div className="hidden sm:block h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                  <div className="group">
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-light mb-2 bg-gradient-to-r from-orange-300 via-orange-200 to-orange-400 bg-clip-text text-transparent">
                      {userStats.totalDonations}
                    </div>
                    <div className="text-white/50 text-xs sm:text-sm uppercase tracking-wider font-light">Donations</div>
                  </div>
                </div>
              </div>
            )}

            {/* First-time donor message */}
            {userDonations.length === 0 && (
              <div className="bg-gradient-to-r from-orange-500/20 to-orange-400/10 backdrop-blur-sm border border-orange-400/40 rounded-xl p-4 sm:p-6 lg:p-8 text-center">
                <p className="text-white/90 text-lg sm:text-xl mb-3 sm:mb-4">
                  Ready to make your first impact?
                </p>
                <p className="text-white/70 text-sm sm:text-base mb-4 sm:mb-6">
                  Every donation helps girls around the world access education and build brighter futures.
                </p>
                <button
                  onClick={() => onDonateClick()}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-base sm:text-lg transition-all transform hover:scale-105"
                >
                  Make Your First Donation
                </button>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap sm:flex-nowrap space-x-1 mb-6 lg:mb-8 bg-white/5 p-1 rounded-lg overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'donations', label: 'Donations', icon: '❤️' },
              { id: 'shop', label: 'Shop', icon: '🛍️' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max flex items-center justify-center space-x-1 sm:space-x-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md text-sm sm:text-lg font-medium transition-all duration-300 relative ${activeTab === tab.id
                  ? 'text-white'
                  : 'text-white/70 hover:text-white hover:bg-orange-500/10'
                  }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-orange-500/60 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Elegant Divider */}
          <div className="mb-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 lg:space-y-8">
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
                  <div className="bg-gradient-to-r from-orange-500/20 to-orange-400/10 backdrop-blur-sm border border-orange-400/40 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-1 h-5 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                          <h3 className="text-base font-bold text-white">Smart Suggestion</h3>
                        </div>
                        <p className="text-white/90 text-sm mb-3">
                          A <span className="font-bold text-orange-300">${suggestedAmount}</span> donation would help you reach your goal of educating {goalGirls} girls this year. You're <span className="font-bold text-green-400">{Math.round(progressPercent)}%</span> there!
                        </p>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => onDonateClick(suggestedAmount)}
                            className="bg-gradient-to-r from-orange-400/20 to-orange-600/30 hover:from-orange-400/30 hover:to-orange-600/40 text-white/80 hover:text-white px-4 py-1.5 rounded-md font-medium transition-all duration-300 text-sm border border-orange-400/20"
                          >
                            Donate ${suggestedAmount}
                          </button>
                          <button 
                            onClick={() => setShowSmartSuggestion(false)}
                            className="text-white/60 hover:text-white text-xs transition-colors"
                          >
                            Maybe Later
                          </button>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="w-16 h-16 relative">
                          <svg className="transform -rotate-90 w-16 h-16">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="6"
                              fill="none"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="#10b981"
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray={`${progressPercent * 1.76} 176`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{Math.round(progressPercent)}%</span>
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
                  <>
                    {/* Your Impact Insights Section */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full"></div>
                        <h3 className="text-lg sm:text-xl font-bold text-white">Your Impact Insights</h3>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                        {/* Donor Rank */}
                        <div className="bg-gradient-to-br from-orange-500/5 to-white/5 rounded-lg p-4 border border-orange-400/10 hover:from-orange-500/10 hover:to-white/10 transition-all text-center">
                          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          </div>
                          <div className="text-white font-bold text-xl mb-1">Top {100 - percentile}%</div>
                          <div className="text-white/60 text-xs">Donor Rank</div>
                        </div>
                        {/* Year Growth */}
                        <div className="bg-gradient-to-br from-orange-500/5 to-white/5 rounded-lg p-4 border border-orange-400/10 hover:from-orange-500/10 hover:to-white/10 transition-all text-center">
                          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div className="text-white font-bold text-xl mb-1">{growthPercent > 0 ? '+' : ''}{growthPercent}%</div>
                          <div className="text-white/60 text-xs">Year Growth</div>
                        </div>
                        {/* To Goal */}
                        <div className="bg-gradient-to-br from-orange-500/5 to-white/5 rounded-lg p-4 border border-orange-400/10 hover:from-orange-500/10 hover:to-white/10 transition-all text-center">
                          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                          </div>
                          <div className="text-white font-bold text-xl mb-1">{Math.max(0, 10 - Math.floor(thisYearTotal / 50))} girls</div>
                          <div className="text-white/60 text-xs">To Goal</div>
                        </div>
                        {/* This Year Donations */}
                        <div className="bg-gradient-to-br from-orange-500/5 to-white/5 rounded-lg p-4 border border-orange-400/10 hover:from-orange-500/10 hover:to-white/10 transition-all text-center">
                          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <div className="text-white font-bold text-xl mb-1">{userDonations.filter(d => d.createdAt?.startsWith(currentYear.toString())).length} donations</div>
                          <div className="text-white/60 text-xs">This Year</div>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}

              {/* Impact Stats Cards - Existing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-gradient-to-br from-orange-500/5 to-white/5 rounded-lg p-6 border border-orange-400/10 hover:from-orange-500/10 hover:to-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Girls Currently Supported</h3>
                    <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{Math.floor(userStats.lifetimeTotal / 50)}</p>
                  <p className="text-white/60 text-sm mt-1">girls in school this month</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/5 to-white/5 rounded-lg p-6 border border-orange-400/10 hover:from-orange-500/10 hover:to-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Years of Education Funded</h3>
                    <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{(userStats.lifetimeTotal / 600).toFixed(1)}</p>
                  <p className="text-white/60 text-sm mt-1">years of education provided</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/5 to-white/5 rounded-lg p-6 border border-orange-400/10 hover:from-orange-500/10 hover:to-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Lives Completely Changed</h3>
                    <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{Math.floor(userStats.lifetimeTotal / 6000)}</p>
                  <p className="text-white/60 text-sm mt-1">girls fully educated (age 5-14)</p>
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
                  <>
                    {/* Elegant Divider */}
                    <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    
                    {/* Impact Calculator Section */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-teal-600 rounded-full"></div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">Impact Calculator</h3>
                        </div>
                      <button
                        onClick={() => onDonateClick(calculatorAmount)}
                        className="bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 text-sm"
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
                      <div className="bg-gradient-to-br from-green-500/5 to-white/5 rounded-lg p-6 border border-green-400/10 hover:from-green-500/10 hover:to-white/10 transition-all text-center">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{impact.girlsEducated}</div>
                        <div className="text-green-300 text-xs font-medium mb-1">(1 year)</div>
                        <div className="text-white/60 text-xs">Girls Educated</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/5 to-white/5 rounded-lg p-6 border border-green-400/10 hover:from-green-500/10 hover:to-white/10 transition-all text-center">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{impact.schoolKits}</div>
                        <div className="text-green-300 text-xs font-medium mb-1">(supplies)</div>
                        <div className="text-white/60 text-xs">School Kits</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/5 to-white/5 rounded-lg p-6 border border-green-400/10 hover:from-green-500/10 hover:to-white/10 transition-all text-center">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{impact.teacherTraining}</div>
                        <div className="text-green-300 text-xs font-medium mb-1">(sessions)</div>
                        <div className="text-white/60 text-xs">Teacher Training</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/5 to-white/5 rounded-lg p-6 border border-green-400/10 hover:from-green-500/10 hover:to-white/10 transition-all text-center">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{impact.schoolsSupported}</div>
                        <div className="text-green-300 text-xs font-medium mb-1">(monthly)</div>
                        <div className="text-white/60 text-xs">Schools Supported</div>
                      </div>
                    </div>
                    </div>
                  </>
                )
              })()}

              {/* Progress Towards Goals */}
              <>
                {/* Elegant Divider */}
                <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                {/* Your Impact Goals for 2025 Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-600 rounded-full"></div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Your Impact Goals for 2025</h3>
                  </div>

                {/* Current Month Summary - Three Column Format */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Month Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
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
                          return monthlyDonations.reduce((sum, d) => sum + d.amount, 0).toFixed(2)
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <p className="text-white/70 text-base mb-3">$50/month per girl covers:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-base justify-items-center">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-white/60">School fees</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-white/60">Uniforms</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="text-white/60">Transport</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-white/60">Welfare checks</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-white/60">Support</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Goal 1: Support 1 Girl for 1 Year */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                      <span className="text-white/80 text-sm">Support 1 Girl for 1 Year ($600)</span>
                      <span className="text-orange-400 font-medium text-sm">${userStats.lifetimeTotal}/$600</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 sm:h-3">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 sm:h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((userStats.lifetimeTotal / 600) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-white/60 text-xs mt-1">${Math.max(600 - userStats.lifetimeTotal, 0).toFixed(2)} more to reach goal</p>
                  </div>

                  {/* Goal 2: Complete Elementary Education */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                      <span className="text-white/80 text-sm">Fund Complete Elementary (5 years - $3,000)</span>
                      <span className="text-orange-400 font-medium text-sm">${userStats.lifetimeTotal}/$3,000</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 sm:h-3">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 sm:h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((userStats.lifetimeTotal / 3000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-white/60 text-xs mt-1">Ages 5-10: Foundation for life</p>
                  </div>

                  {/* Goal 3: Life-Changing Champion */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                      <span className="text-white/80 text-sm">Life-Changing Champion ($6,000)</span>
                      <span className="text-orange-400 font-medium text-sm">${userStats.lifetimeTotal}/$6,000</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 sm:h-3">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 sm:h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((userStats.lifetimeTotal / 6000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-white/60 text-xs mt-1">Complete education: Age 5-14 (10 years)</p>
                  </div>
                </div>
                </div>
              </>

              {/* Annual Impact History */}
              {userDonations.length > 0 && (
                <>
                  {/* Elegant Divider */}
                  <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  
                  {/* Your Impact Journey Section */}
                  <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-indigo-400 to-blue-600 rounded-full"></div>
                      <h3 className="text-xl font-semibold text-white">Your Impact Journey</h3>
                    </div>
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

                  <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-3 pt-2 px-1" style={{
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
                          <div key={year} className={`rounded-lg p-3 sm:p-4 min-w-[240px] sm:min-w-[280px] flex-shrink-0 border transition-all hover:scale-[1.02] ${
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
                                <span className="text-white font-medium">${yearTotal.toFixed(2)}</span>
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
                </>
              )}

              {/* Quick Actions */}
              <>
                {/* Elegant Divider */}
                <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                {/* Continue Your Impact Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-1 h-5 bg-gradient-to-b from-emerald-400 to-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-white">Continue Your Impact</h3>
                  </div>

                  {/* Message from the Field */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-orange-400/10 backdrop-blur-sm border border-orange-400/30 rounded-lg p-4 mb-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <button
                    onClick={() => onDonateClick()}
                    className="bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white py-3 px-4 rounded-lg transition-all duration-300 text-sm font-medium"
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
              </>
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div className="space-y-6 lg:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-gradient-to-br from-blue-500/5 to-white/5 rounded-lg p-6 border border-blue-400/10 hover:from-blue-500/10 hover:to-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Total Donations</h3>
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{userStats.totalDonations}</p>
                  <p className="text-white/60 text-sm mt-1">donations made</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/5 to-white/5 rounded-lg p-6 border border-blue-400/10 hover:from-blue-500/10 hover:to-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Lifetime Total</h3>
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white">${userStats.lifetimeTotal.toLocaleString()}</p>
                  <p className="text-white/60 text-sm mt-1">total contributed</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/5 to-white/5 rounded-lg p-6 border border-blue-400/10 hover:from-blue-500/10 hover:to-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Average Donation</h3>
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white">${userStats.averageDonation}</p>
                  <p className="text-white/60 text-sm mt-1">per donation</p>
                </div>
              </div>

              {/* Donation History & Subscriptions - Two Column Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                {/* Left Column - Donation History */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col h-[600px]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-pink-600 rounded-full"></div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white">Donation History</h3>
                    </div>
                    <button
                      onClick={() => onDonateClick()}
                      className="bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 text-sm"
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
                    <div className="space-y-3 flex-1 overflow-y-auto overflow-x-hidden" style={{
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
                      {userDonations.slice(0, 20).map((donation, index) => (
                        <div key={donation.id} className={`flex items-center justify-between py-2 px-3 rounded-md border hover:bg-white/10 transition-all ${
                          donation.type === 'monthly'
                            ? 'bg-gradient-to-r from-purple-500/10 to-purple-400/5 border-purple-400/20' 
                            : 'bg-white/5 border border-white/10'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              donation.type === 'monthly'
                                ? 'bg-purple-500/20' 
                                : 'bg-green-500/20'
                            }`}>
                              {donation.type === 'monthly' ? (
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-3">
                                <p className="text-white font-medium">${donation.amount}</p>
                                <p className="text-white/50 text-xs">
                                  {donation.createdAt ? new Date(donation.createdAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZoneName: 'short'
                                  }) : 'Date not available'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-white/60 font-medium text-sm">{donation.status}</span>
                            <p className={`text-xs ${
                              donation.type === 'monthly' ? 'text-purple-400' : 'text-green-400'
                            }`}>{donation.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column - Subscriptions */}
                <div>
                  <SubscriptionManager userEmail={user.email} />
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Profile Settings Section */}
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-violet-400 to-purple-600 rounded-full"></div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Profile Settings</h3>
                </div>
                
                <div className="space-y-4">
                  {message.text && (
                    <div className={`p-3 rounded-lg text-sm ${message.type === 'success' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      value={formatPhoneNumber(formData.phone)}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                      maxLength={14}
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
                        className="bg-gradient-to-r from-white/10 to-purple-500/20 hover:from-white/20 hover:to-purple-500/30 text-white/80 hover:text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 border border-white/20"
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

              {/* Elegant Divider */}
              <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              {/* Change Password Section */}
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-600 rounded-full"></div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Change Password</h3>
                </div>
                
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        className="bg-gradient-to-r from-white/10 to-purple-500/20 hover:from-white/20 hover:to-purple-500/30 text-white/80 hover:text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 border border-white/20"
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

              {/* Elegant Divider */}
              <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              {/* Preferences Section */}
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-teal-400 to-cyan-600 rounded-full"></div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Preferences</h3>
                </div>
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

          {/* Shop Tab with Subtabs */}
          {activeTab === 'shop' && (
            <div className="space-y-6">
              {/* Shop Subtabs */}
              <div className="flex space-x-2 bg-white/5 p-1 rounded-lg w-fit">
                {[
                  { id: 'orders', label: 'Orders', icon: '📦' },
                  { id: 'wishlist', label: 'Wishlist', icon: '⭐' }
                ].map(subtab => (
                  <button
                    key={subtab.id}
                    onClick={() => setActiveShopSubtab(subtab.id)}
                    className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                      activeShopSubtab === subtab.id
                        ? 'bg-orange-500/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{subtab.icon}</span>
                    <span>{subtab.label}</span>
                  </button>
                ))}
              </div>

              {/* Orders Subtab Content */}
              {activeShopSubtab === 'orders' && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4">E-commerce Coming Soon</h3>
                    <p className="text-white/60 mb-6">We're working on bringing you merchandise and educational materials to support our cause.</p>
                    <button
                      onClick={() => onDonateClick()}
                      className="bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                    >
                      Make a Donation Instead
                    </button>
                  </div>
                </div>
              )}

              {/* Wishlist Subtab Content */}
              {activeShopSubtab === 'wishlist' && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4">Wishlist Coming Soon</h3>
                    <p className="text-white/60 mb-6">Save your favorite items and get notified when they become available.</p>
                    <button
                      onClick={() => onDonateClick()}
                      className="bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                    >
                      Make a Donation Instead
                    </button>
                  </div>
                </div>
              )}
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
