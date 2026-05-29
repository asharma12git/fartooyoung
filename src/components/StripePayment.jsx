import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import PropTypes from 'prop-types'
import PaymentForm from './PaymentForm'

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
console.log('Stripe key loaded:', stripeKey ? 'yes' : 'MISSING')
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const StripePayment = ({ amount, donorInfo, donationType, onSuccess, onError, loading, setLoading }) => {
  const [clientSecret, setClientSecret] = useState(null)
  const [loadingIntent, setLoadingIntent] = useState(true)

  useEffect(() => {
    const createIntent = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

        const response = await fetch(`${API_BASE_URL}/stripe/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: JSON.stringify({
            amount,
            donor_info: donorInfo,
            donation_type: donationType || 'one-time',
          }),
        })

        const data = await response.json()

        if (data.error) {
          onError(data.error)
          setLoadingIntent(false)
          return
        }

        setClientSecret(data.client_secret)
        setLoadingIntent(false)
      } catch (err) {
        onError(err.message === 'Load failed' || err.message === 'Failed to fetch'
          ? 'Connection issue. Please try again.'
          : err.message || 'Failed to initialize payment.')
        setLoadingIntent(false)
      }
    }

    createIntent()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount])

  if (loadingIntent) {
    return (
      <div className="flex items-center justify-center py-8">
        <svg className="animate-spin h-8 w-8 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-white/70">Preparing secure payment...</span>
      </div>
    )
  }

  if (!clientSecret) return null

  const appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#f97316',
      colorBackground: '#0a0a0a',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '6px',
      spacingUnit: '4px',
    },
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <PaymentForm
        amount={amount}
        donorInfo={donorInfo}
        donationType={donationType}
        onSuccess={onSuccess}
        onError={onError}
        loading={loading}
        setLoading={setLoading}
      />
    </Elements>
  )
}

StripePayment.propTypes = {
  amount: PropTypes.number.isRequired,
  donorInfo: PropTypes.object.isRequired,
  donationType: PropTypes.string,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
}

export default StripePayment
