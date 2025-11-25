import { useState } from 'react'
import PropTypes from 'prop-types'

const CheckoutButton = ({ amount, donorInfo, donationType, onError, loading, setLoading }) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async () => {
    // Validate donor info first
    if (!donorInfo.firstName || !donorInfo.lastName || !donorInfo.email) {
      onError('Please fill in all required fields above.')
      return
    }

    console.log('Starting checkout process...')
    setLoading(true)
    setIsProcessing(true)
    onError('') // Clear any previous errors

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      
      const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          donor_info: donorInfo,
          donation_type: donationType || 'one-time'
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('HTTP error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Checkout session created:', data)

      if (data.error) {
        onError(data.error)
        setLoading(false)
        setIsProcessing(false)
        return
      }

      // Redirect to Stripe Checkout
      console.log('Redirecting to Stripe Checkout...')
      window.location.href = data.checkout_url

    } catch (err) {
      console.error('Checkout error:', err)
      const errorMessage = err.message || 'Failed to start checkout. Please try again.'
      onError(errorMessage)
      setLoading(false)
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-500/20 border border-blue-400/30 rounded-md p-3">
        <p className="text-blue-200 text-sm">
          <strong>Secure Checkout:</strong> You'll be redirected to Stripe's secure payment page
        </p>
      </div>

      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading || isProcessing}
        className={`w-full backdrop-blur-sm text-white px-6 py-3 rounded-md font-bold transition-colors flex items-center justify-center border border-orange-400/50 ${
          (loading || isProcessing)
            ? 'bg-orange-500/50 cursor-not-allowed' 
            : 'bg-orange-500/80 hover:bg-orange-600/90'
        }`}
      >
        {(loading || isProcessing) ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Redirecting to Checkout...
          </>
        ) : (
          `Donate $${amount} - Secure Checkout`
        )}
      </button>
    </div>
  )
}

CheckoutButton.propTypes = {
  amount: PropTypes.number.isRequired,
  donorInfo: PropTypes.object.isRequired,
  donationType: PropTypes.string,
  onError: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired
}

export default CheckoutButton
