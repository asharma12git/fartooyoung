import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const SubscriptionManager = ({ userEmail }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [subscriptions, setSubscriptions] = useState([])
  const [inactiveSubscriptions, setInactiveSubscriptions] = useState([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true)

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
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-orange-400 mb-3 sm:mb-4">Subscriptions</h3>
      
      {/* Active Subscriptions List */}
      {loadingSubscriptions ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-white/60">Loading subscriptions...</span>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* Active Subscriptions */}
          {subscriptions.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Active Subscriptions
              </h4>
              <div className="space-y-2">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="bg-white/5 border border-white/10 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm sm:text-base">
                          ${sub.amount} / {sub.interval}
                        </p>
                        <p className="text-white/60 text-xs sm:text-sm">
                          {sub.cancel_at_period_end 
                            ? `Cancels on ${new Date(sub.current_period_end * 1000).toLocaleDateString()}`
                            : `Next payment: ${new Date(sub.current_period_end * 1000).toLocaleDateString()}`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          sub.cancel_at_period_end 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {sub.cancel_at_period_end ? 'Ending' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Subscriptions */}
          {inactiveSubscriptions.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Past Subscriptions
              </h4>
              <div className="space-y-2">
                {inactiveSubscriptions.map((sub) => (
                  <div key={sub.id} className="bg-white/5 border border-gray-400/20 rounded-lg p-2 sm:p-3 opacity-75">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 font-medium text-sm sm:text-base">
                          ${sub.amount} / {sub.interval}
                        </p>
                        <p className="text-white/50 text-xs sm:text-sm">
                          Canceled on {new Date(sub.canceled_at * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400">
                          Canceled
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Subscriptions */}
          {subscriptions.length === 0 && inactiveSubscriptions.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
              <p className="text-white/60 text-center text-sm sm:text-base">No subscriptions found</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-white/80 text-sm">
          Manage your recurring donations and payment methods
        </p>
        <button
          onClick={handleManageSubscription}
          disabled={isLoading}
          className={`backdrop-blur-sm text-white px-4 py-2 rounded-md font-medium transition-all duration-300 flex items-center space-x-2 border border-orange-400/50 hover:scale-105 ${
            isLoading
              ? 'bg-orange-500/50 cursor-not-allowed' 
              : 'bg-orange-500/80 hover:bg-orange-600/90 hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Manage</span>
            </>
          )}
        </button>
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
