import { useState, useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import PropTypes from 'prop-types'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const EmbeddedCheckout = ({ amount, donorInfo, donationType, onSuccess, onError }) => {
  const [stripe, setStripe] = useState(null)
  const [elements, setElements] = useState(null)
  const [paymentElement, setPaymentElement] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const paymentElementRef = useRef(null)

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await stripePromise
        setStripe(stripeInstance)
        
        // Create payment intent
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/stripe/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            donor_info: donorInfo,
            donation_type: donationType
          })
        })

        const data = await response.json()
        if (data.client_secret) {
          const elementsInstance = stripeInstance.elements({
            clientSecret: data.client_secret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#f97316',
                colorBackground: 'rgba(255, 255, 255, 0.1)',
                colorText: '#ffffff',
                colorDanger: '#ef4444',
                fontFamily: 'system-ui, sans-serif',
                borderRadius: '6px'
              }
            }
          })
          setElements(elementsInstance)
          
          // Create and mount payment element
          const paymentEl = elementsInstance.create('payment', {
            layout: {
              type: 'tabs',
              defaultCollapsed: false
            }
          })
          setPaymentElement(paymentEl)
          
          // Mount when ref is available
          if (paymentElementRef.current) {
            paymentEl.mount(paymentElementRef.current)
          }
        } else {
          onError(data.error || 'Failed to initialize payment')
        }
      } catch (error) {
        onError('Failed to initialize payment')
      } finally {
        setIsLoading(false)
      }
    }

    initializeStripe()
  }, [amount, donorInfo, donationType, onError])

  // Mount payment element when ref becomes available
  useEffect(() => {
    if (paymentElement && paymentElementRef.current && !isLoading) {
      paymentElement.mount(paymentElementRef.current)
    }
  }, [paymentElement, isLoading])

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements) return

    setIsProcessing(true)
    console.log('Starting payment confirmation...')

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: `${donorInfo.firstName} ${donorInfo.lastName}`,
            email: donorInfo.email
          }
        }
      },
      redirect: 'if_required'
    })

    console.log('Payment result:', { error, paymentIntent })

    if (error) {
      console.log('Payment error:', error.message)
      onError(error.message)
      setIsProcessing(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      console.log('Payment succeeded!')
      onSuccess({ paymentIntent })
    } else {
      console.log('Payment status:', paymentIntent?.status)
      onError('Payment processing failed')
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-white">Loading payment form...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-md p-4">
        <div ref={paymentElementRef} className="min-h-[200px]"></div>
      </div>
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full backdrop-blur-sm text-white px-6 py-3 rounded-md font-bold transition-colors flex items-center justify-center border border-orange-400/50 ${
          isProcessing
            ? 'bg-orange-500/50 cursor-not-allowed' 
            : 'bg-orange-500/80 hover:bg-orange-600/90'
        }`}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          `Donate $${amount} Now`
        )}
      </button>
    </form>
  )
}

EmbeddedCheckout.propTypes = {
  amount: PropTypes.number.isRequired,
  donorInfo: PropTypes.object.isRequired,
  donationType: PropTypes.string,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
}

export default EmbeddedCheckout
