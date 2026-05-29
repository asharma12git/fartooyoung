import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import PropTypes from 'prop-types'

const PaymentForm = ({ amount, donorInfo, donationType, onSuccess, onError, loading, setLoading }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async () => {
    if (!stripe || !elements) return

    setIsProcessing(true)
    setLoading(true)
    onError('')

    try {
      console.log('Confirming payment...')
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          payment_method_data: {
            billing_details: {
              name: `${donorInfo.firstName} ${donorInfo.lastName}`,
              email: donorInfo.email,
            },
          },
        },
        redirect: 'if_required',
      })

      if (error) {
        console.log('Payment error:', error.message)
        onError(error.message)
        setIsProcessing(false)
        setLoading(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded!', paymentIntent.id)
        setIsProcessing(false)
        setLoading(false)
        onSuccess(paymentIntent)
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        onError('Additional authentication required. Please complete the verification.')
        setIsProcessing(false)
        setLoading(false)
      } else {
        // Payment may still be processing
        setIsProcessing(false)
        setLoading(false)
        onSuccess(paymentIntent)
      }
    } catch (err) {
      onError(err.message || 'Payment failed. Please try again.')
      setIsProcessing(false)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: `${donorInfo.firstName} ${donorInfo.lastName}`,
                email: donorInfo.email,
              },
            },
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || isProcessing || loading}
        className={`w-full text-white px-4 sm:px-6 py-3 rounded-md font-bold transition-colors flex items-center justify-center border border-orange-400/50 text-sm sm:text-base ${
          (isProcessing || loading)
            ? 'bg-orange-500/50 cursor-not-allowed'
            : 'bg-orange-500/80 hover:bg-orange-600/90'
        }`}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          `Donate $${amount}`
        )}
      </button>

      <div className="flex items-center justify-center text-white/50 text-xs">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Secured by Stripe • 256-bit encryption
      </div>
    </div>
  )
}

PaymentForm.propTypes = {
  amount: PropTypes.number.isRequired,
  donorInfo: PropTypes.object.isRequired,
  donationType: PropTypes.string,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
}

export default PaymentForm
