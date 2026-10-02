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
  const [localRefresh, setLocalRefresh] = useState(0)
  const [calculatorAmount, setCalculatorAmount] = useState(100)
  const [showSmartSuggestion, setShowSmartSuggestion] = useState(true)
  // Rotating Smart Suggestion message: pick a random variation each time the dashboard opens
  const [suggestionVariant] = useState(() => Math.floor(Math.random() * 10))
  // Rotating hero greeting: fresh message each time the dashboard view opens
  const [greetingIndex] = useState(() => Math.floor(Math.random() * 10))
  // Rotating "Message from the Field": fresh quote each time the dashboard opens, then auto-rotates
  const [fieldMessageIndex, setFieldMessageIndex] = useState(() => Math.floor(Math.random() * 50))
  // Yearly Impact: show only the latest 3 years by default, expand to show the rest
  const [showAllYears, setShowAllYears] = useState(false)
  
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
      navigate('/?login=true')
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
  }, [user, refreshKey, localRefresh]) // Refetch when refreshKey changes

  // Annual Impact Calculator: start the slider at THIS YEAR's total giving.
  // Because it keys off the current calendar year, it naturally "resets" each January.
  const [calcInitialized, setCalcInitialized] = useState(false)
  useEffect(() => {
    if (!calcInitialized && userDonations.length > 0) {
      const yr = new Date().getFullYear().toString()
      const yearTotal = userDonations
        .filter(d => d.createdAt?.startsWith(yr))
        .reduce((sum, d) => sum + d.amount, 0)
      // Snap to nearest $25 step, clamp to slider range [0, 1200]
      const snapped = Math.min(12000, Math.max(0, Math.round(yearTotal / 50) * 50))
      setCalculatorAmount(snapped)
      setCalcInitialized(true)
    }
  }, [userDonations, calcInitialized])

  // Auto-rotate the "Message from the Field" with a slow cinematic crossfade.
  // Every ~60s: fade the current message out, swap, then fade the new one in.
  const [fieldVisible, setFieldVisible] = useState(true)
  useEffect(() => {
    const id = setInterval(() => {
      setFieldVisible(false) // start slow fade-out
      const swap = setTimeout(() => {
        setFieldMessageIndex(prev => prev + 1) // swap while invisible
        setFieldVisible(true)                  // slow fade-in
      }, 1200) // matches the CSS transition duration
      return () => clearTimeout(swap)
    }, 60000)
    return () => clearInterval(id)
  }, [])

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

  // Helper function to format payment method display with icon
  const formatPaymentMethod = (donation) => {
    const { paymentMethod, cardBrand, cardLast4, wallet } = donation
    if (!paymentMethod || paymentMethod === 'unknown') return { iconType: 'card', text: 'Unknown' }

    switch (paymentMethod) {
      case 'card':
        const brand = cardBrand ? cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1) : 'Card'
        return { 
          iconType: 'card',
          text: `${brand} ••••${cardLast4 || '****'}`,
          wallet: wallet
        }
      
      case 'us_bank_account':
        return { 
          iconType: 'bank',
          text: `Bank Account ••••${cardLast4 || '****'}`
        }
      
      default:
        return { 
          iconType: 'unknown',
          text: paymentMethod.replace(/_/g, ' ').toUpperCase()
        }
    }
  }

  // Calculate real stats from user's donations
  const userStats = {
    totalDonations: userDonations.length,
    lifetimeTotal: Math.round(userDonations.reduce((sum, donation) => sum + donation.amount, 0) * 100) / 100,
    thisYearTotal: Math.round(userDonations
      .filter(d => d.createdAt?.startsWith(new Date().getFullYear().toString()))
      .reduce((sum, donation) => sum + donation.amount, 0) * 100) / 100,
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
        {/* Close Button - absolute flush top-right */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-0 right-0 w-8 sm:w-10 h-8 sm:h-10 bg-orange-500/80 hover:bg-orange-600/90 text-white flex items-center justify-center transition-all duration-300 active:scale-95 active:opacity-90 border border-orange-400/50 rounded-tr-lg z-30"
          style={{ borderBottomLeftRadius: '0.5rem' }}
        >
          <svg className="w-4 sm:w-6 h-4 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Frozen top row */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="bg-orange-500/20 hover:bg-orange-500/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 active:scale-95 active:opacity-90 text-xs sm:text-sm font-medium border border-orange-500/30"
            >
              Sign Out
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="bg-green-500/20 hover:bg-green-500/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 active:scale-95 active:opacity-90 text-xs sm:text-sm font-medium border border-green-500/30"
              >
                Admin Panel
              </button>
            )}
          </div>
          {/* Full name — clean, right-aligned. On small screens show only the avatar to avoid crowding the buttons. */}
          {(user?.firstName || user?.name) && (
            <div className="flex items-center gap-2 ml-2 mr-9 sm:mr-10 flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400/40 to-purple-400/40 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {`${(user.firstName?.[0] || user.name?.[0] || '')}${(user.lastName?.[0] || '')}`.toUpperCase()}
              </div>
              <span className="hidden sm:inline text-orange-300 text-sm font-medium truncate max-w-xs">
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.name || user.firstName)}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable body */}
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
                  const displayName = user.firstName
                    || user.name?.split(' ')[0]
                    || 'Friend'; // Fallback for old users or missing data
                    
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

                  return welcomeMessages[greetingIndex % welcomeMessages.length]
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
                  Your Giving Journey
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

                // Suggested amount: donor's usual gift nudged up 20%
                const avgDonation = userStats.averageDonation
                const suggestedAmount = Math.round(avgDonation * 1.2)

                // This year's giving → girls educated ($50 = 1 girl)
                const currentYear = new Date().getFullYear()
                const yearDonations = userDonations.filter(d => d.createdAt?.startsWith(currentYear.toString()))
                const yearTotal = yearDonations.reduce((sum, d) => sum + d.amount, 0)
                const girlsEducatedSoFar = Math.floor(yearTotal / 50)

                // Milestone ladder: 10 → 25 → 50 → 100 → then +50 each step.
                // Goal is always the NEXT milestone above current progress, so it
                // keeps advancing and the donor is never "done".
                const MILESTONES = [10, 25, 50, 100]
                let goalGirls, prevMilestone
                if (girlsEducatedSoFar < MILESTONES[MILESTONES.length - 1]) {
                  const idx = MILESTONES.findIndex(m => girlsEducatedSoFar < m)
                  goalGirls = MILESTONES[idx]
                  prevMilestone = idx === 0 ? 0 : MILESTONES[idx - 1]
                } else {
                  // Beyond the ladder: next multiple of 50
                  goalGirls = Math.floor(girlsEducatedSoFar / 50) * 50 + 50
                  prevMilestone = goalGirls - 50
                }

                // Ring fills from the previous rung to the next, so it RESETS each level
                const span = goalGirls - prevMilestone
                const progressPercent = Math.min(Math.max(((girlsEducatedSoFar - prevMilestone) / span) * 100, 0), 100)
                const girlsToGo = Math.max(goalGirls - girlsEducatedSoFar, 0)

                // Did they just land exactly on a milestone? (celebrate + show next)
                const justReached = girlsEducatedSoFar > 0 && (MILESTONES.includes(girlsEducatedSoFar) || girlsEducatedSoFar % 50 === 0)

                // Reusable highlighted spans
                const name = user?.firstName || 'friend'
                const nGirls = <span className="font-bold text-green-400">{girlsEducatedSoFar}</span>
                const nAmount = <span className="font-bold text-orange-300">${suggestedAmount}</span>
                const nGoal = <span className="font-bold text-green-400">{goalGirls}</span>
                const nToGo = <span className="font-bold text-green-400">{girlsToGo}</span>

                // 10 warm variations for the in-progress message (rotates each time the dashboard opens)
                const inProgressVariations = [
                  <>Because of you, {name}, {nGirls} girls are in school this year. A {nAmount} gift could help you reach {nGoal} — that&apos;s {nToGo} more futures changed.</>,
                  <>{name}, your generosity has placed {nGirls} girls in classrooms this year. With {nAmount}, {nToGo} more could follow, all the way to {nGoal}.</>,
                  <>{nGirls} girls have hope because of you, {name}. A {nAmount} gift carries that light to {nToGo} more, on the path to {nGoal}.</>,
                  <>Thanks to your kindness, {name}, {nGirls} girls are learning this year. Just {nToGo} more would bring you to {nGoal} — a {nAmount} gift helps get there.</>,
                  <>You&apos;ve already changed {nGirls} young lives this year, {name}. A {nAmount} gift opens the door for {nToGo} more, toward {nGoal}.</>,
                  <>{name}, {nGirls} girls can dream bigger because of you. A gift of {nAmount} brings {nToGo} more within reach of {nGoal}.</>,
                  <>Your compassion has given {nGirls} girls a classroom this year, {name}. {nToGo} more would reach {nGoal} — and {nAmount} moves them closer.</>,
                  <>Every gift you&apos;ve given adds up, {name} — {nGirls} girls in school so far. A {nAmount} gift could carry {nToGo} more toward {nGoal}.</>,
                  <>{name}, you&apos;ve helped {nGirls} girls step into a brighter future this year. A {nAmount} gift could help {nToGo} more join them, on the way to {nGoal}.</>,
                  <>Hope looks like {nGirls} girls in school, {name} — and it&apos;s because of you. A {nAmount} gift brings {nToGo} more closer to {nGoal}.</>,
                ]

                return showSmartSuggestion ? (
                  <div className="bg-gradient-to-r from-orange-500/20 to-orange-400/10 backdrop-blur-sm border border-orange-400/40 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-1 h-5 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                          <h3 className="text-base font-bold text-white">Smart Suggestion</h3>
                        </div>
                        <p className="text-white/90 text-sm mb-3">
                          {girlsEducatedSoFar === 0 ? (
                            <>Welcome, {user?.firstName || 'friend'}. Your first <span className="font-bold text-orange-300">${suggestedAmount}</span> gift could put <span className="font-bold text-green-400">{Math.max(Math.floor(suggestedAmount / 50), 1)}</span> {Math.max(Math.floor(suggestedAmount / 50), 1) === 1 ? 'girl' : 'girls'} on the path to a brighter future.</>
                          ) : justReached ? (
                            <>What a milestone, {user?.firstName || 'friend'} — because of you, <span className="font-bold text-green-400">{girlsEducatedSoFar}</span> girls are in school this year. A <span className="font-bold text-orange-300">${suggestedAmount}</span> gift carries that hope onward toward <span className="font-bold text-green-400">{goalGirls}</span>.</>
                          ) : (
                            inProgressVariations[suggestionVariant % inProgressVariations.length]
                          )}
                        </p>
                        <div className="flex items-stretch rounded-lg overflow-hidden border border-orange-400/30 w-full max-w-md">
                          <button
                            onClick={() => onDonateClick(suggestedAmount)}
                            className="flex-1 bg-gradient-to-r from-orange-500/30 to-orange-600/40 hover:from-orange-500/40 hover:to-orange-600/50 text-white px-4 py-2.5 font-semibold transition-all duration-300 text-sm active:scale-95"
                          >
                            Donate ${suggestedAmount}
                          </button>
                          <div className="w-px bg-orange-400/30"></div>
                          <button
                            onClick={() => setShowSmartSuggestion(false)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 px-4 py-2.5 font-medium transition-all duration-300 text-sm active:scale-95"
                          >
                            I&apos;ll help another day
                          </button>
                        </div>
                      </div>
                      <div className="ml-4 text-center">
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
                        <div className="text-white/50 text-[10px] uppercase tracking-wider mt-1">to {goalGirls} girls</div>
                      </div>
                    </div>
                  </div>
                ) : null
              })()}

              {/* Annual Impact History */}
              {userDonations.length > 0 && (
                <>
                  {/* Your Yearly Impact Section */}
                  <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-indigo-400 to-blue-600 rounded-full"></div>
                      <h3 className="text-xl font-semibold text-white">Your Yearly Impact</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      // Get unique years from donations (newest first)
                      const years = [...new Set(userDonations.map(d => d.createdAt?.split('-')[0]))].sort((a, b) => b - a)
                      // Default to the latest 3 years; expand to show all
                      const visibleYears = showAllYears ? years : years.slice(0, 3)

                      return visibleYears.map(year => {
                        const yearDonations = userDonations.filter(d => d.createdAt?.startsWith(year))
                        const yearTotal = yearDonations.reduce((sum, d) => sum + d.amount, 0)
                        const yearCount = yearDonations.length
                        const girlsSupported = Math.floor(yearTotal / 50)

                        // 3-color cycle across the 3-column grid: green → blue → purple
                        const colorIdx = years.indexOf(year) % 3
                        const theme = [
                          { card: 'from-green-500/10 to-green-400/5 border-green-400/20' },
                          { card: 'from-blue-500/10 to-blue-400/5 border-blue-400/20' },
                          { card: 'from-purple-500/10 to-purple-400/5 border-purple-400/20' },
                        ][colorIdx]

                        // Personal, varied footer message — tier by the year's giving, name included,
                        // stable per year (keyed off the year digits so it doesn't flicker).
                        const fName = user?.firstName || 'friend'
                        const footerTiers = yearTotal >= 1000
                          ? [`You're on fire, ${fName}! 🔥`, `Unstoppable, ${fName}! 🌟`, `What a year, ${fName}! 🎉`]
                          : yearTotal >= 500
                          ? [`You showed up big, ${fName}! 💫`, `Big heart, ${fName}! 💛`, `Making waves, ${fName}! 🌊`]
                          : yearCount >= 5
                          ? [`Faithful as ever, ${fName}! ❤️`, `Steady and strong, ${fName}! 🙌`, `Always there, ${fName}! ✨`]
                          : [`Every bit counts, ${fName}! 🎯`, `You made a mark, ${fName}! 🌱`, `Thank you, ${fName}! 💛`]
                        const footerMsg = footerTiers[parseInt(year, 10) % footerTiers.length]

                        return (
                          <div className={`rounded-xl p-5 border bg-gradient-to-br transition-all hover:-translate-y-0.5 ${theme.card}`} key={year}>
                            {/* Year — hero of the card */}
                            <div className={`text-3xl font-bold tracking-tight mb-2 ${year === new Date().getFullYear().toString() ? 'text-orange-400' : 'text-white'}`}>{year}</div>
                            <div className="h-0.5 w-20 bg-white/20 rounded-full mb-4"></div>

                            {/* Stats — consistent label-left / value-right rows; Total is the big headline */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-white/70 text-sm">Total Given</span>
                                <span className="text-green-400 font-bold text-lg">${yearTotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/70">Girls Supported</span>
                                <span className="text-green-400 font-medium">{girlsSupported}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/70">Donations</span>
                                <span className="text-white font-medium">{yearCount}</span>
                              </div>
                              {yearTotal >= 6000 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-white/70">Lives Transformed</span>
                                  <span className="text-green-400 font-medium">{Math.floor(yearTotal / 6000)}</span>
                                </div>
                              )}
                            </div>

                            {/* Personal footer */}
                            <div className="mt-4 pt-3 border-t border-white/10">
                              <p className="text-white text-sm font-semibold text-left">{footerMsg}</p>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                  {(() => {
                    const yearCountTotal = [...new Set(userDonations.map(d => d.createdAt?.split('-')[0]))].length
                    if (yearCountTotal <= 3) return null
                    return (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => setShowAllYears(prev => !prev)}
                          className="flex items-center gap-1.5 text-orange-300 hover:text-orange-200 text-sm font-medium transition-colors active:scale-95"
                        >
                          {showAllYears ? (
                            <>Show less
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </>
                          ) : (
                            <>Show {yearCountTotal - 3} earlier {yearCountTotal - 3 === 1 ? 'year' : 'years'}
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </>
                          )}
                        </button>
                      </div>
                    )
                  })()}
                  </div>
                </>
              )}

              {/* Annual Impact Calculator — "Keep a Girl in School" support ladder */}
              {(() => {
                // Program pillars with per-girl annual cost (peer-benchmarked; tune to real FTY costs).
                // cum = cumulative cost to have unlocked this pillar for one girl. Full support = $480/yr.
                const PILLARS = [
                  { icon: '📚', title: 'School fees & essentials', line: 'Fees, uniform, books, and supplies so cost is never the reason she drops out', cost: 180, mo: 15, cum: 180 },
                  { icon: '🍛', title: 'Daily meals (tiffin)', line: 'Nutrition that keeps her in class', cost: 300, mo: 25, cum: 480 },
                  { icon: '🛺', title: 'Transport', line: 'Safe travel for girls in rural areas', cost: 180, mo: 15, cum: 660 },
                  { icon: '🏠', title: 'Family welfare checks', line: 'Support so parents keep her in school', cost: 240, mo: 20, cum: 900 },
                  { icon: '💬', title: 'Counselling', line: 'Guidance through her toughest moments', cost: 144, mo: 12, cum: 1044 },
                  { icon: '✊🏽', title: 'Empowerment', line: 'Confidence, life skills, and knowing her rights', cost: 156, mo: 13, cum: 1200 },
                ]
                const amt = calculatorAmount
                const PER_GIRL = 1200 // $1,200/yr ($100/mo) fully supports one girl across all pillars
                const girlsFullySupported = Math.floor(amt / PER_GIRL)
                // Per-girl spend drives which pillars are "covered": the in-progress girl's remainder,
                // or a full $480 if they're already supporting at least one girl.
                const perGirl = girlsFullySupported >= 1 ? PER_GIRL : (amt % PER_GIRL)
                const partialGirl = (amt % PER_GIRL) / PER_GIRL // 0..1 progress toward next girl
                const pct = Math.min((amt / 12000) * 100, 100)

                // Build the row of girl icons (cap at 10 displayed; overflow shown as ×N)
                const MAX_ICONS = 10
                const iconsToShow = Math.min(Math.max(girlsFullySupported + (partialGirl > 0 ? 1 : 0), 0), MAX_ICONS)
                const girlIcons = []
                for (let i = 0; i < iconsToShow; i++) {
                  const fill = i < girlsFullySupported ? 1 : partialGirl // full or partial for the in-progress one
                  girlIcons.push(fill)
                }

                return (
                  <>
                    {/* Elegant Divider */}
                    <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-teal-600 rounded-full"></div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">Your Impact This Year</h3>
                        </div>
                        <button
                          onClick={() => {
                            const more = Math.round(calculatorAmount - userStats.thisYearTotal)
                            onDonateClick(more > 0 ? more : calculatorAmount)
                          }}
                          className="bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 text-sm active:scale-95"
                        >
                          Give {calculatorAmount > userStats.thisYearTotal ? `$${Math.round(calculatorAmount - userStats.thisYearTotal)} More` : 'Now'}
                        </button>
                      </div>
                      <p className="text-white/60 text-sm mb-5">See how many girls your giving keeps in school this year.</p>

                      {/* Girl icons — fill in as giving increases ($480 = 1 girl fully supported) */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 text-center">
                        <div className="flex flex-wrap justify-center items-end gap-2.5 mb-3 min-h-[3.5rem]">
                          {girlIcons.length === 0 ? (
                            <span className="text-white/60 text-sm">Every journey begins with one girl. Explore what your giving can do.</span>
                          ) : girlIcons.map((fill, i) => {
                            const isComplete = fill >= 1
                            const color = isComplete ? '#22c55e' : '#f97316' // green = complete, orange = in progress
                            const gid = `girlfill_${i}_${Math.round(fill * 100)}`
                            return (
                              <svg key={i} width="36" height="54" viewBox="0 0 26 40" className="flex-shrink-0">
                                <defs>
                                  <linearGradient id={gid} x1="0" y1="1" x2="0" y2="0">
                                    <stop offset="0%" stopColor={color} />
                                    <stop offset={`${fill * 100}%`} stopColor={color} />
                                    <stop offset={`${fill * 100}%`} stopColor="rgba(255,255,255,0.15)" />
                                    <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
                                  </linearGradient>
                                </defs>
                                {/* refined schoolgirl silhouette: head, hair, A-line dress, legs */}
                                <g fill={`url(#${gid})`}>
                                  {/* hair / head */}
                                  <path d="M13 2 C9.7 2 7.5 4.3 7.5 7.2 C7.5 10 9.7 12 13 12 C16.3 12 18.5 10 18.5 7.2 C18.5 4.3 16.3 2 13 2 Z" />
                                  {/* dress (A-line) */}
                                  <path d="M13 12 C11 12 9.6 13.2 9 15 L5 30 L21 30 L17 15 C16.4 13.2 15 12 13 12 Z" />
                                  {/* legs */}
                                  <rect x="9.5" y="30" width="2.6" height="8" rx="1.1" />
                                  <rect x="13.9" y="30" width="2.6" height="8" rx="1.1" />
                                </g>
                              </svg>
                            )
                          })}
                          {girlsFullySupported > MAX_ICONS && (
                            <span className="text-green-400 font-bold text-lg ml-1 self-center">+{girlsFullySupported - MAX_ICONS}</span>
                          )}
                        </div>
                        <div className="text-white font-semibold text-sm">
                          {(() => {
                            const nm = user?.firstName || 'friend'
                            const words = ['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth']
                            const nextWord = words[girlsFullySupported] || `${girlsFullySupported + 1}th`
                            const g = girlsFullySupported
                            const partialClause = partialGirl > 0 ? <>, and you&apos;re <span className="text-orange-400 font-bold">{Math.round(partialGirl * 100)}%</span> of the way to a {nextWord}</> : null
                            if (g === 0) {
                              return <>You&apos;re <span className="text-orange-400 font-bold">{Math.round(partialGirl * 100)}%</span> of the way to keeping your first girl in school, {nm}. Every gift brings her closer. 💚🌸</>
                            }
                            // Enthusiasm escalates with the number of girls supported
                            let lead, emoji
                            if (g === 1) { lead = <>Thank you, {nm}. You&apos;re keeping <span className="text-green-400 font-bold">a girl</span> in school this year</>; emoji = '💚🌸' }
                            else if (g <= 3) { lead = <>Wonderful, {nm}! You&apos;re keeping <span className="text-green-400 font-bold">{g}</span> girls in school this year</>; emoji = '💚🌸' }
                            else if (g <= 6) { lead = <>Incredible, {nm}! <span className="text-green-400 font-bold">{g}</span> girls are in school because of you</>; emoji = '🌟🌸' }
                            else if (g <= 9) { lead = <>Extraordinary, {nm}! You&apos;re changing <span className="text-green-400 font-bold">{g}</span> lives this year</>; emoji = '🔥🌸' }
                            else { lead = <>You&apos;re a hero, {nm}! <span className="text-green-400 font-bold">{g}</span> girls&apos; futures are transformed because of you</>; emoji = '👑🌸' }
                            return <>{lead}{partialClause}. {emoji}</>
                          })()}
                        </div>
                      </div>

                      {/* Slider */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white/70 text-sm">Your giving in {new Date().getFullYear()}</span>
                          <div className="text-2xl font-bold text-green-400">${calculatorAmount.toLocaleString()}</div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="12000"
                          step="50"
                          value={calculatorAmount}
                          onChange={(e) => { setCalculatorAmount(parseInt(e.target.value)); setShowSmartSuggestion(false) }}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #22c55e 0%, #22c55e ${pct}%, rgba(255,255,255,0.2) ${pct}%, rgba(255,255,255,0.2) 100%)`
                          }}
                        />
                        <style>{`
                          @keyframes thumbPulse {
                            0%, 100% { filter: drop-shadow(0 0 2px rgba(249,115,22,0.5)); transform: scale(1); }
                            50% { filter: drop-shadow(0 0 9px rgba(249,115,22,0.95)); transform: scale(1.6); }
                          }
                          .slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 20px; background: #f97316; clip-path: polygon(0 0, 100% 50%, 0 100%); cursor: pointer; animation: thumbPulse 1.6s ease-in-out infinite; }
                          .slider:hover::-webkit-slider-thumb, .slider:active::-webkit-slider-thumb { animation: none; filter: drop-shadow(0 0 4px rgba(249,115,22,0.7)); }
                          .slider::-moz-range-thumb { width: 16px; height: 20px; background: #f97316; border: none; clip-path: polygon(0 0, 100% 50%, 0 100%); cursor: pointer; animation: thumbPulse 1.6s ease-in-out infinite; }
                          .slider:hover::-moz-range-thumb, .slider:active::-moz-range-thumb { animation: none; filter: drop-shadow(0 0 4px rgba(249,115,22,0.7)); }
                        `}</style>
                        <div className="flex justify-between text-white/50 text-xs mt-1">
                          <span>$0</span>
                          <span>$12,000+</span>
                        </div>
                      </div>
                    </div>

                    {/* Where & How We Help — dynamic: pillars fill in based on your giving PER girl */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">Where &amp; How We Help</h3>
                        </div>
                      </div>
                      <p className="text-white/60 text-sm mb-3">A multi-pronged approach so girls stay in school and families never feel they must marry them off early — working alongside families and communities <span className="text-white/80">across South Asia</span>.</p>
                      {perGirl > 0 && <p className="text-white/70 text-sm mb-4">At your current level, each girl you support receives:</p>}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-sm font-semibold">Cost to support one girl</span>
                        <span className="text-white/50 text-xs">per girl · <span className="text-green-400 font-semibold">$100/mo</span> · <span className="text-green-400 font-semibold">$1,200/yr</span> full support</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {PILLARS.map(p => {
                          const covered = perGirl >= p.cum
                          return (
                            <div key={p.title} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${covered ? 'bg-green-500/10 border-green-400/30' : 'bg-white/5 border-white/10'}`}>
                              <span className={`text-3xl ${covered ? '' : 'grayscale opacity-40'}`}>{p.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-sm font-semibold ${covered ? 'text-white' : 'text-white/50'}`}>{p.title}</span>
                                  {covered && <span className="text-green-400 text-xs">✓</span>}
                                </div>
                                <div className={`text-xs mt-0.5 ${covered ? 'text-white/70' : 'text-white/40'}`}>{p.line}</div>
                                <div className={`text-xs font-bold mt-1.5 ${covered ? 'text-green-400' : 'text-white/50'}`}>${p.mo}/mo <span className="font-normal text-white/40">·</span> ${p.cost}/yr</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <a href="/what-we-do" className="inline-block mt-4 text-orange-300 hover:text-orange-200 text-sm font-medium transition-colors">Learn more about our work →</a>
                    </div>
                  </>
                )
              })()}

              {/* Make a Lasting Impact — one-time big-impact giving options */}
              <>
                {/* Elegant Divider */}
                <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-600 rounded-full"></div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Make a Lasting Impact</h3>
                  </div>
                  <p className="text-white/60 text-sm mb-5">A single gift can change a girl&apos;s entire future. Choose the legacy you&apos;d like to leave.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { amount: 1200, emoji: '🌸', title: 'Support a Girl for a Year', desc: 'A full year of school, meals, transport, and support for one girl.' },
                      { amount: 6000, emoji: '🌱', title: 'Fund Complete Elementary', desc: 'Five years of education, ages 5 to 10. A foundation for life.' },
                      { amount: 12000, emoji: '🎓', title: 'Life-Changing Champion', desc: 'A girl\u2019s entire education, ages 5 to 14. A life completely transformed.' },
                    ].map(goal => (
                      <div key={goal.amount} className="bg-gradient-to-br from-purple-500/15 to-pink-500/10 border border-purple-400/25 rounded-xl p-5 flex flex-col hover:-translate-y-0.5 transition-all">
                        <div className="text-5xl mb-3">{goal.emoji}</div>
                        <h4 className="text-white font-bold text-base mb-1">{goal.title}</h4>
                        <p className="text-white/60 text-xs mb-4 flex-1">{goal.desc}</p>
                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-3">${goal.amount.toLocaleString()}</div>
                        <button
                          onClick={() => onDonateClick(goal.amount)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-95"
                        >
                          Give ${goal.amount.toLocaleString()}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>


              {/* A Message from the Field — rotates each time the dashboard opens */}
              <>
                {/* Elegant Divider */}
                <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                {(() => {
                  const FIELD_MESSAGES = [
                    'Because someone believed in me, I get to sit in a classroom instead of a wedding hall.',
                    'I used to walk two hours to school. Now I have a way to get there, and a reason to keep going.',
                    'My parents wanted to marry me at fourteen. My teacher and this program helped them see another future for me.',
                    'I want to be a nurse one day. For the first time, that dream feels possible.',
                    'When I wear my uniform, I feel like I belong. Thank you for giving me that.',
                    'My little sister sees me studying and now she wants to stay in school too.',
                    'The meals at school mean I can focus on my lessons instead of my hunger.',
                    'I was so close to being pulled out of school. Someone far away made sure I stayed.',
                    'I am the first girl in my family to reach secondary school. I will not be the last.',
                    'Every book you helped me get is a door you opened for me.',
                    'My father used to say school was not for girls. Now he walks me to the gate.',
                    'I passed my exams this year. I cried, because I never thought I would get the chance.',
                    'Thank you for seeing girls like me, even from so far away.',
                    'I want to become a teacher so other girls can have what I was given.',
                    'The counsellor told me my voice matters. No one had ever said that to me.',
                    'I am still a child, and because of you, I get to stay one a little longer.',
                    'My friends who left school are already married. I am still dreaming.',
                    'With my uniform and my books, I feel ready to face anything.',
                    'I learned that I have rights. That knowledge changed everything for me.',
                    'My mother says I am her hope now. I carry that proudly.',
                    'School is the safest place I know. Thank you for keeping me here.',
                    'I used to be afraid of my future. Now I am curious about it.',
                    'Someone paid for my fees this year. I promise to make it count.',
                    'I want to study science. My teacher says I have a gift for it.',
                    'When the floods came, I thought school was over for me. It was not.',
                    'I stand a little taller now, knowing people believe in girls like me.',
                    'My grandmother was married at twelve. I am thirteen, and I am in school.',
                    'The transport you provide means my parents no longer worry about my safety.',
                    'I read to the younger children now. They look up to me.',
                    'I did not know a girl could lead. Now I lead my study group.',
                    'Every day in school is a day I am not someone\u2019s bride.',
                    'Thank you for believing my education is worth it. I believe it too now.',
                    'I want to go to university. I say it out loud now, without fear.',
                    'My name means hope. For the first time, it feels true.',
                    'I was ready to give up. The support I received told me not to.',
                    'I help my mother in the evenings and study by lamplight. I will not waste this chance.',
                    'The empowerment classes taught me to say no, and to dream yes.',
                    'I am learning English. One day I want to tell my own story to the world.',
                    'My village is proud of me now. That felt impossible a year ago.',
                    'You gave me more than school. You gave me a future I can choose.',
                    'I want to be a doctor and come back to help my community.',
                    'The welfare visits kept my family strong enough to keep me in class.',
                    'I used to think marriage was my only path. Now I see many.',
                    'My teacher believed in me before I believed in myself.',
                    'I finished the year at the top of my class. I am just getting started.',
                    'For every girl still waiting, I study harder, so she knows it is possible.',
                    'Thank you, from a girl who gets to be a girl.',
                    'I am safe, I am learning, and I am dreaming. All because someone cared.',
                    'My future used to belong to others. Now it belongs to me.',
                    'When I grow up, I will give to a girl the way someone gave to me.',
                  ]
                  const msg = FIELD_MESSAGES[fieldMessageIndex % FIELD_MESSAGES.length]
                  const FIELD_NAMES = [
                    { n: 'Aisha', c: 'Bangladesh' }, { n: 'Priya', c: 'India' }, { n: 'Anjali', c: 'Nepal' },
                    { n: 'Fatima', c: 'Bangladesh' }, { n: 'Meena', c: 'India' }, { n: 'Sunita', c: 'Nepal' },
                    { n: 'Lakshmi', c: 'India' }, { n: 'Nabila', c: 'Bangladesh' }, { n: 'Rina', c: 'Nepal' },
                    { n: 'Kavya', c: 'India' }, { n: 'Sita', c: 'Nepal' }, { n: 'Zara', c: 'Bangladesh' },
                    { n: 'Deepa', c: 'India' }, { n: 'Nasrin', c: 'Bangladesh' }, { n: 'Pooja', c: 'Nepal' },
                    { n: 'Ritu', c: 'India' }, { n: 'Sabina', c: 'Nepal' }, { n: 'Tahmina', c: 'Bangladesh' },
                    { n: 'Uma', c: 'India' }, { n: 'Yasmin', c: 'Bangladesh' }, { n: 'Asha', c: 'Nepal' },
                    { n: 'Bina', c: 'Nepal' }, { n: 'Chandni', c: 'India' }, { n: 'Divya', c: 'India' },
                    { n: 'Gita', c: 'Nepal' }, { n: 'Hasina', c: 'Bangladesh' }, { n: 'Indira', c: 'India' },
                    { n: 'Jaya', c: 'India' }, { n: 'Kiran', c: 'Nepal' }, { n: 'Lata', c: 'India' },
                    { n: 'Mira', c: 'Nepal' }, { n: 'Nita', c: 'India' }, { n: 'Parvati', c: 'Nepal' },
                    { n: 'Rani', c: 'India' }, { n: 'Shanti', c: 'Nepal' }, { n: 'Taslima', c: 'Bangladesh' },
                    { n: 'Usha', c: 'India' }, { n: 'Vidya', c: 'India' }, { n: 'Sara', c: 'Bangladesh' },
                    { n: 'Amina', c: 'Bangladesh' }, { n: 'Laxmi', c: 'Nepal' }, { n: 'Rekha', c: 'India' },
                    { n: 'Shabnam', c: 'Bangladesh' }, { n: 'Sarita', c: 'Nepal' }, { n: 'Neha', c: 'India' },
                    { n: 'Rupa', c: 'Nepal' }, { n: 'Monira', c: 'Bangladesh' }, { n: 'Komal', c: 'India' },
                    { n: 'Devi', c: 'Nepal' }, { n: 'Ruksana', c: 'Bangladesh' },
                  ]
                  const person = FIELD_NAMES[fieldMessageIndex % FIELD_NAMES.length]
                  return (
                    <div className="bg-gradient-to-r from-orange-500/10 to-orange-400/10 backdrop-blur-sm border border-orange-400/30 rounded-lg p-6 overflow-hidden">
                      <div
                        className="flex items-center space-x-4"
                        style={{
                          transition: 'opacity 1.2s ease-in-out, transform 1.2s ease-in-out',
                          opacity: fieldVisible ? 1 : 0,
                          transform: fieldVisible ? 'translateY(0)' : 'translateY(-12px)'
                        }}
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-400 text-3xl sm:text-4xl">💌</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1.5">A Message from the Field</h3>
                          <p className="text-white/85 text-sm sm:text-base italic leading-relaxed">&ldquo;{msg}&rdquo;</p>
                          <p className="text-orange-400 text-xs mt-2">{person.n}, {person.c}</p>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </>
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div className="space-y-6 lg:space-y-8">
              {/* Donation History & Subscriptions - Two Column Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                {/* Left Column - Donation History */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col h-[600px]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-pink-600 rounded-full"></div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white">Donation History</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLocalRefresh(prev => prev + 1)}
                        className="bg-green-500/20 hover:bg-green-500/30 text-white px-3 py-2 rounded-md font-medium transition-all duration-300 text-sm border border-green-500/30 active:scale-95 active:opacity-90"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => onDonateClick()}
                        className="bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 text-sm"
                      >
                        Donate Now
                      </button>
                    </div>
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
                      {userDonations.slice(0, 20).map((donation) => (
                        <div key={donation.id} className={`flex items-center justify-between py-2 px-3 rounded-md border hover:bg-white/10 transition-all ${
                          donation.type === 'monthly'
                            ? 'bg-white/5 border-green-400/30' 
                            : 'bg-white/5 border-orange-400/30'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              donation.type === 'monthly'
                                ? 'bg-green-500/20' 
                                : 'bg-orange-500/20'
                            }`}>
                              {donation.type === 'monthly' ? (
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                              <div className="flex items-center space-x-2 mt-1">
                                {(() => {
                                  const paymentMethod = formatPaymentMethod(donation)
                                  return (
                                    <>
                                      {paymentMethod.iconType === 'bank' ? (
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                        </svg>
                                      ) : paymentMethod.iconType === 'card' ? (
                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                      ) : (
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                      )}
                                      <p className="text-white/40 text-xs">{paymentMethod.text}</p>
                                      {paymentMethod.wallet === 'apple_pay' && (
                                        <span className="text-xs bg-black/30 text-white/70 px-2 py-0.5 rounded"> Pay</span>
                                      )}
                                      {paymentMethod.wallet === 'google_pay' && (
                                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">G Pay</span>
                                      )}
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-white/60 font-medium text-sm">{donation.status}</span>
                            <p className={`text-xs ${
                              donation.type === 'monthly' ? 'text-green-400' : 'text-orange-400'
                            }`}>{donation.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-white/30 text-xs mt-auto pt-4">Transfers may take a few minutes to appear.</p>
                </div>

                {/* Right Column - Subscriptions */}
                <div className="flex flex-col">
                  <SubscriptionManager userEmail={user.email} onDonateClick={onDonateClick} refreshKey={localRefresh} />
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
                      className="bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 active:scale-95 active:opacity-90"
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
                      className="bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 active:scale-95 active:opacity-90"
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
