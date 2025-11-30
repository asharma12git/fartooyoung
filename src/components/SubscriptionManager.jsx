import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const SubscriptionManager = ({ userEmail }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [subscriptions, setSubscriptions] = useState([])
  const [inactiveSubscriptions, setInactiveSubscriptions] = useState([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true)

  // Categorize subscriptions
  const activeSubscriptions = subscriptions.filter(sub => !sub.cancel_at_period_end)
  const endingSoonSubscriptions = subscriptions.filter(sub => sub.cancel_at_period_end)
  const cancelledSubscriptions = inactiveSubscriptions.slice(0, 10) // Limit to last 10

  // Fetch user subscriptions on component mount
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/stripe/list-subscriptions?customer_email=${encodeURIComponent(userEmail)}`)
        const data = await response.json()
        
        if (data.active_subscriptions) {
          setSubscriptions(data.active_subscriptions)
        }
        if (data.inactive_subscriptions) {
          setInactiveSubscriptions(data.inactive_subscriptions)
        }
      } catch (err) {
        console.error('Failed to fetch subscriptions:', err)
      } finally {
        setLoadingSubscriptions(false)
      }
    }

    if (userEmail) {
      fetchSubscriptions()
    }
  }, [userEmail])

  const handleManageSubscription = async () => {
    setIsLoading(true)
    setError('')

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/stripe/create-portal-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: userEmail,
          return_url: `${window.location.origin}/subscription-return`
        })
      })

      const data = await response.json()
      
      if (data.portal_url) {
        window.location.href = data.portal_url
      } else {
        setError(data.error || 'Failed to access subscription management')
      }
    } catch (err) {
      setError('Failed to access subscription management')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6 flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
          <h3 className="text-lg sm:text-xl font-bold text-white">Subscriptions</h3>
        </div>
        <button
          onClick={handleManageSubscription}
          disabled={isLoading}
          className={`bg-gradient-to-r from-white/10 to-purple-500/20 hover:from-white/20 hover:to-purple-500/30 text-white/80 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-white/20 text-sm ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Loading...' : 'Manage'}
        </button>
      </div>
      
      {/* Active Subscriptions List */}
      {loadingSubscriptions ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-white/60">Loading subscriptions...</span>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5 mb-4 sm:mb-6 flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {/* Active Subscriptions (Green) */}
          {activeSubscriptions.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Active Subscriptions
              </h4>
              <div className="space-y-2">
                {activeSubscriptions.map((sub) => (
                  <div key={sub.id} className="bg-white/5 border border-green-400/30 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm sm:text-base">
                          ${sub.amount} / {sub.interval}
                        </p>
                        <p className="text-white/60 text-xs sm:text-sm">
                          Next payment: {new Date(sub.current_period_end * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-400/30">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ending Soon Subscriptions (Yellow) */}
          {endingSoonSubscriptions.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
                Ending Soon
              </h4>
              <div className="space-y-2">
                {endingSoonSubscriptions.map((sub) => (
                  <div key={sub.id} className="bg-white/5 border border-yellow-400/30 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm sm:text-base">
                          ${sub.amount} / {sub.interval}
                        </p>
                        <p className="text-yellow-400/80 text-xs sm:text-sm font-medium">
                          ⚠️ Ends on {new Date(sub.current_period_end * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-400/30">
                        Ending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Subscriptions (Red) */}
          {cancelledSubscriptions.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                Cancelled Subscriptions
                {inactiveSubscriptions.length > 10 && (
                  <span className="ml-2 text-xs text-white/40">(showing last 10)</span>
                )}
              </h4>
              <div className="space-y-2">
                {cancelledSubscriptions.map((sub) => (
                  <div key={sub.id} className="bg-white/5 border border-red-400/20 rounded-lg p-3 sm:p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 font-medium text-sm sm:text-base">
                          ${sub.amount} / {sub.interval}
                        </p>
                        <p className="text-white/50 text-xs sm:text-sm">
                          Cancelled on {new Date(sub.canceled_at * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-400/20">
                        Cancelled
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Subscriptions */}
          {activeSubscriptions.length === 0 && endingSoonSubscriptions.length === 0 && cancelledSubscriptions.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
              <p className="text-white/60 text-center text-sm sm:text-base">No subscriptions found</p>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <p className="text-white/80 text-sm">
          Manage your recurring donations and payment methods
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-md p-3 mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

SubscriptionManager.propTypes = {
  userEmail: PropTypes.string.isRequired
}

export default SubscriptionManager
