import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { 
  sanitizeFormData, 
  validateEmail, 
  validateName,
  rateLimiter,
  createHoneypot,
  isBot
} from '../utils/security'

const DonationModal = ({ onClose, user, initialAmount = null }) => {
  const [donationType, setDonationType] = useState('one-time')
  const [amount, setAmount] = useState(initialAmount || 100)
  const [customAmount, setCustomAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [currentStep, setCurrentStep] = useState(initialAmount ? 2 : 1) // Skip to step 2 if amount provided
  const [donorInfo, setDonorInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })

  // Auto-fill user information if logged in
  useEffect(() => {
    if (user) {
      setDonorInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      })
    }
  }, [user])
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiration: '',
    cvc: ''
  })
  const [coverTransactionCosts, setCoverTransactionCosts] = useState(true)
  const [showTransactionTooltip, setShowTransactionTooltip] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showMonthlyPopup, setShowMonthlyPopup] = useState(false)
  const [honeypot, setHoneypot] = useState(createHoneypot())
  const [validationErrors, setValidationErrors] = useState({})

  const calculateFee = () => {
    const donationAmount = amount === 'custom' ? parseFloat(customAmount) || 0 : amount
    // Typical processing fee is around 2.9% + $0.30
    return (donationAmount * 0.029 + 0.30).toFixed(2)
  }

  const getTotalAmount = () => {
    const donationAmount = amount === 'custom' ? parseFloat(customAmount) || 0 : amount
    const fee = coverTransactionCosts ? parseFloat(calculateFee()) : 0
    const total = donationAmount + fee
    return total % 1 === 0 ? total.toString() : total.toFixed(2)
  }

  const presetAmounts = [25, 50, 100, 250, 500, 1000]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (currentStep === 1) {
      setCurrentStep(2)
      return
    }

    // Step 2 - Process donation with security checks
    setLoading(true)
    setError('')
    setValidationErrors({})

    // Check for bot activity (honeypot)
    if (isBot(honeypot.value)) {
      setError('Suspicious activity detected. Please try again later.')
      setLoading(false)
      return
    }

    // Rate limiting check
    const rateLimitKey = `donation_${donorInfo.email || 'unknown'}`
    if (!rateLimiter.canAttempt(rateLimitKey, 3, 5 * 60 * 1000)) { // 3 attempts per 5 minutes
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey, 3, 5 * 60 * 1000) / 1000 / 60)
      setError(`Too many donation attempts. Please wait ${remainingTime} minutes before trying again.`)
      setLoading(false)
      return
    }

    // Sanitize and validate donor information
    const sanitizedDonorInfo = sanitizeFormData(donorInfo)
    const errors = {}

    if (!validateName(sanitizedDonorInfo.firstName)) {
      errors.firstName = 'First name must contain only letters and be 1-50 characters'
    }
    if (!validateName(sanitizedDonorInfo.lastName)) {
      errors.lastName = 'Last name must contain only letters and be 1-50 characters'
    }
    if (!validateEmail(sanitizedDonorInfo.email)) {
      errors.email = 'Please enter a valid email address'
    }

    const donationAmount = amount === 'custom' ? parseFloat(customAmount) : amount
    if (!donationAmount || donationAmount < 5) {
      errors.amount = 'Minimum donation amount is $5'
    }
    if (donationAmount > 50000) {
      errors.amount = 'Maximum donation amount is $50,000. Please contact us for larger donations.'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setLoading(false)
      return
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

      const response = await fetch(`${API_BASE_URL}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: donationAmount,
          type: donationType,
          paymentMethod: paymentMethod,
          email: sanitizedDonorInfo.email,
          name: `${sanitizedDonorInfo.firstName} ${sanitizedDonorInfo.lastName}`,
          userId: user ? user.email : null // Link to user if logged in
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        // Record failed attempt for rate limiting
        rateLimiter.recordAttempt(rateLimitKey)
        setError(data.message || 'Donation failed. Please try again.')
      }
    } catch (err) {
      console.error('Donation error:', err)
      // Record failed attempt for rate limiting
      rateLimiter.recordAttempt(rateLimitKey)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-orange-500/50 relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 w-10 h-10 bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 text-white flex items-center justify-center transition-all duration-300 border border-orange-400/50 rounded-tr-lg z-10"
          style={{ borderBottomLeftRadius: '0.5rem' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex">
          {/* Left Column - Title and Image */}
          <div className="w-1/2 p-8 flex flex-col">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-orange-400 mb-4">Help Protect Children and Girls</h1>
              <p className="text-sm text-white/70 mt-8">Help our organization by donating today! We will be grateful.</p>
              <p className="text-sm text-white/70 mt-2">100% of your donation is tax deductible.</p>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <img
                src="/src/assets/images/components/donation-modal/5.jpg"
                alt="Children in need of protection"
                className="w-full h-auto max-h-[400px] object-cover object-top rounded-lg"
              />
            </div>
          </div>

          {/* Right Column - Donation Form */}
          <div className="w-1/2 p-8 border-l border-white/20">
            <form onSubmit={handleSubmit} className="min-h-[650px] flex flex-col justify-center">
              {currentStep === 1 ? (
                <div className="flex flex-col justify-evenly flex-1 space-y-0">
                  <div className="text-center mb-4 -mt-8">
                    <p className="text-white/70 text-sm leading-relaxed">Monthly giving helps Far Too Young keep girls at school. The more time a girl spends in education, the greater the reduction in risk of child marriage.</p>

                    {/* Elegant Divider */}
                    <div className="mt-4 flex items-center">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-3">
                      Donation Type
                    </label>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setDonationType('one-time')}
                        className={`flex-1 py-3 px-4 rounded-md text-base font-medium transition-all duration-300 ${donationType === 'one-time'
                          ? 'bg-orange-500/80 text-white border border-orange-400/50'
                          : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                          }`}
                      >
                        One-time
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDonationType('monthly')
                          setShowMonthlyPopup(true)
                        }}
                        className={`flex-1 py-3 px-4 rounded-md text-base font-medium transition-all duration-300 ${donationType === 'monthly'
                          ? 'bg-orange-500/80 text-white border border-orange-400/50'
                          : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                          }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-3">
                      Amount
                    </label>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {presetAmounts.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAmount(preset)}
                          className={`py-3 px-4 rounded-md text-base font-medium transition-all duration-300 ${amount === preset
                            ? 'bg-orange-500/80 text-white border border-orange-400/50'
                            : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                            }`}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAmount('custom')}
                      className={`w-full py-3 px-4 rounded-md text-base font-medium transition-all duration-300 ${amount === 'custom'
                        ? 'bg-orange-500/80 text-white border border-orange-400/50'
                        : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                        }`}
                    >
                      Custom Amount
                    </button>
                    {amount === 'custom' && (
                      <div>
                        <input
                          type="number"
                          placeholder="Enter amount (min $5)"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          min="5"
                          className={`w-full mt-3 px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 transition-all duration-300 ${customAmount && parseFloat(customAmount) < 5
                            ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                            : 'border-white/30 focus:ring-orange-500/50 focus:border-orange-500/50'
                            }`}
                          required
                        />
                        {customAmount && parseFloat(customAmount) < 5 && (
                          <p className="text-red-400 text-sm mt-2">Minimum donation is $5</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="mr-3 mt-1 w-4 h-4 text-orange-500 focus:ring-orange-500/50"
                        required
                      />
                      <span className="text-white text-sm">
                        I Agree to <button type="button" onClick={() => setShowTerms(true)} className="text-orange-400 hover:text-orange-300 underline">Terms and Conditions</button> *
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!amount || (amount === 'custom' && !customAmount) || !agreeToTerms}
                    className="w-full bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 disabled:bg-orange-500/80 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md text-base font-bold transition-colors border border-orange-400/50"
                  >
                    Continue to Payment
                  </button>

                  <div className="flex items-center justify-center mt-3 text-white/70">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">100% Secure Donation</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Honeypot field - invisible to users, visible to bots */}
                  <input
                    type="text"
                    name={honeypot.name}
                    value={honeypot.value}
                    onChange={(e) => setHoneypot({ ...honeypot, value: e.target.value })}
                    style={honeypot.style}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-white mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={donorInfo.firstName}
                        onChange={(e) => {
                          setDonorInfo({ ...donorInfo, firstName: e.target.value })
                          setValidationErrors({ ...validationErrors, firstName: '' })
                        }}
                        className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 transition-all duration-300 ${
                          validationErrors.firstName 
                            ? 'border-red-400 focus:ring-red-500/50 focus:border-red-500' 
                            : 'border-white/30 focus:ring-orange-500/50 focus:border-orange-500/50'
                        }`}
                        required
                      />
                      {validationErrors.firstName && (
                        <p className="text-red-400 text-sm mt-1">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-white mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={donorInfo.lastName}
                        onChange={(e) => setDonorInfo({ ...donorInfo, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-3">
                      Payment Method
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Left Column - Payment Method Selection */}
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('stripe')}
                          className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 text-left ${paymentMethod === 'stripe'
                            ? 'bg-orange-500/80 text-white border border-orange-400/50'
                            : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                            }`}
                        >
                          Credit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('apple')}
                          className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 text-left ${paymentMethod === 'apple'
                            ? 'bg-orange-500/80 text-white border border-orange-400/50'
                            : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                            }`}
                        >
                          Apple Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('google')}
                          className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 text-left ${paymentMethod === 'google'
                            ? 'bg-orange-500/80 text-white border border-orange-400/50'
                            : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                            }`}
                        >
                          Google Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('paypal')}
                          className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 text-left ${paymentMethod === 'paypal'
                            ? 'bg-orange-500/80 text-white border border-orange-400/50'
                            : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                            }`}
                        >
                          PayPal
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('venmo')}
                          className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 text-left ${paymentMethod === 'venmo'
                            ? 'bg-orange-500/80 text-white border border-orange-400/50'
                            : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                            }`}
                        >
                          Venmo
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wire')}
                          className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 text-left ${paymentMethod === 'wire'
                            ? 'bg-orange-500/80 text-white border border-orange-400/50'
                            : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                            }`}
                        >
                          Bank Wire
                        </button>
                      </div>

                      {/* Right Column - Payment Details */}
                      <div className="bg-white/5 border border-white/20 rounded-lg p-3">
                        {paymentMethod === 'stripe' && (
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Card Number"
                              value={cardInfo.cardNumber}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '') // Remove non-digits
                                value = value.replace(/(\d{4})(?=\d)/g, '$1 ') // Add space every 4 digits
                                if (value.length > 19) value = value.substring(0, 19) // Limit to 16 digits + 3 spaces
                                setCardInfo({ ...cardInfo, cardNumber: value })
                              }}
                              maxLength="19"
                              className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 text-sm"
                              required
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="MM/YY"
                                value={cardInfo.expiration}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, '') // Remove non-digits
                                  if (value.length >= 2) {
                                    value = value.substring(0, 2) + '/' + value.substring(2, 4)
                                  }
                                  setCardInfo({ ...cardInfo, expiration: value })
                                }}
                                maxLength="5"
                                className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 text-sm"
                                required
                              />
                              <input
                                type="text"
                                placeholder="CVC"
                                value={cardInfo.cvc}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, '') // Remove non-digits
                                  if (value.length > 4) value = value.substring(0, 4) // Limit to 4 digits
                                  setCardInfo({ ...cardInfo, cvc: value })
                                }}
                                maxLength="4"
                                className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 text-sm"
                                required
                              />
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'paypal' && (
                          <div className="text-center">
                            <button
                              type="button"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md text-sm font-medium transition-colors"
                            >
                              Pay with PayPal
                            </button>
                          </div>
                        )}

                        {paymentMethod === 'apple' && (
                          <div className="text-center">
                            <button
                              type="button"
                              className="w-full bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-md text-sm font-medium transition-colors"
                            >
                              Pay with Apple Pay
                            </button>
                          </div>
                        )}

                        {paymentMethod === 'google' && (
                          <div className="text-center">
                            <button
                              type="button"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md text-sm font-medium transition-colors"
                            >
                              Pay with Google Pay
                            </button>
                          </div>
                        )}

                        {paymentMethod === 'venmo' && (
                          <div className="text-center">
                            <button
                              type="button"
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md text-sm font-medium transition-colors"
                            >
                              Pay with Venmo
                            </button>
                          </div>
                        )}

                        {paymentMethod === 'wire' && (
                          <div className="text-center">
                            <p className="text-white/80 text-xs mb-3">Bank transfer instructions will be provided</p>
                            <button
                              type="button"
                              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md text-sm font-medium transition-colors"
                            >
                              Proceed with Bank Wire
                            </button>
                          </div>
                        )}

                        {/* Elegant Divider */}
                        <div className="my-4 flex items-center">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        </div>

                        {/* Total Amount */}
                        <div className="flex items-center justify-center h-16">
                          <div className="text-3xl font-bold text-orange-400">
                            ${getTotalAmount()}
                            {donationType === 'monthly' && <span className="text-base text-white/70 ml-1">/month</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Transaction Costs */}
                  <div className="relative">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={coverTransactionCosts}
                        onChange={(e) => setCoverTransactionCosts(e.target.checked)}
                        className="mr-3 mt-1 w-4 h-4 text-orange-500 focus:ring-orange-500/50"
                      />
                      <span
                        className="text-white text-sm flex items-center"
                        onMouseEnter={() => {
                          setTooltipType('text')
                          setShowTransactionTooltip(true)
                        }}
                        onMouseLeave={() => setShowTransactionTooltip(false)}
                      >
                        Cover transaction costs
                        <button
                          type="button"
                          onMouseEnter={() => {
                            setTooltipType('icon')
                            setShowTransactionTooltip(true)
                          }}
                          onMouseLeave={() => setShowTransactionTooltip(false)}
                          className="ml-2 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:bg-white/30 transition-colors"
                        >
                          ?
                        </button>
                      </span>
                    </div>

                    {/* Tooltip */}
                    {showTransactionTooltip && (
                      <div className="absolute left-0 top-8 bg-black/90 text-white text-xs p-3 rounded-lg shadow-lg z-10 max-w-xs">
                        {tooltipType === 'icon'
                          ? `By adding $${calculateFee()}, you help cover the necessary software and processing fees.`
                          : 'Would you like to cover the transaction costs so that we receive 100% of your gift?'
                        }
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-md text-base font-medium transition-colors border border-white/30"
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !donorInfo.firstName || !donorInfo.lastName || !donorInfo.email ||
                        (paymentMethod === 'stripe' && (!cardInfo.cardNumber || !cardInfo.expiration || !cardInfo.cvc))}
                      className="flex-1 bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md text-base font-bold transition-colors border border-orange-400/50 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        paymentMethod === 'stripe' ? 'Donate' :
                          paymentMethod === 'paypal' ? 'Donate' :
                            'Donate'
                      )}
                    </button>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Success Message Overlay */}
                  {success && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                        <p className="text-white/80">Your donation has been processed successfully.</p>
                        <p className="text-white/60 text-sm mt-2">Closing...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-60">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg w-full max-w-2xl max-h-[80vh] mx-4 shadow-2xl ring-1 ring-orange-500/50 relative flex flex-col">
            <button
              onClick={() => setShowTerms(false)}
              className="absolute top-0 right-0 w-10 h-10 bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 text-white flex items-center justify-center transition-all duration-300 border border-orange-400/50 rounded-tr-lg z-10"
              style={{ borderBottomLeftRadius: '0.5rem' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8 pb-4">
              <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center">Terms and Conditions</h2>
            </div>

            <div className="px-8 flex-1 overflow-y-auto" style={{
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

              <div className="text-white/90 space-y-4 text-sm leading-relaxed">
                <p className="font-medium text-orange-300">Do you consent to the following donation terms?</p>

                <p>
                  <strong>Gift Acceptance Policy:</strong> Acceptance of any contribution, gift, or grant is at the sole discretion of Far Too Young, Inc. We reserve the right to decline any donation that cannot be used consistently with our organizational purpose and mission.
                </p>

                <p>
                  <strong>Donor Financial Security:</strong> Far Too Young, Inc. will not accept any irrevocable gift, whether outright or life-income in character, if under any reasonable circumstances the gift would jeopardize the donor's financial security or well-being.
                </p>

                <p>
                  <strong>Tax and Legal Guidance:</strong> Far Too Young, Inc. does not provide advice regarding the tax or legal treatment of donations. We strongly encourage all donors to consult with their own qualified professional advisers, including tax attorneys, certified public accountants, or financial planners, to assist them in the donation process.
                </p>

                <p>
                  <strong>Use of Funds:</strong> All donations will be used to support our mission of ending child marriage and protecting vulnerable children and girls worldwide. Donors may designate specific programs, subject to organizational approval and feasibility.
                </p>

                <p>
                  <strong>Privacy and Recognition:</strong> Donor information will be kept confidential unless explicit permission is granted for recognition purposes. Donors may request anonymity at any time.
                </p>

                <p className="text-orange-200 font-medium">
                  By proceeding with your donation, you acknowledge that you have read, understood, and agree to these terms and conditions.
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4 p-8 pt-4">
              <button
                onClick={() => setShowTerms(false)}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-md text-base font-medium transition-colors border border-white/30"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAgreeToTerms(true)
                  setShowTerms(false)
                }}
                className="bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 text-white px-8 py-3 rounded-md text-base font-bold transition-colors border border-orange-400/50"
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Donation Popup */}
      {showMonthlyPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-60">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg w-full max-w-md mx-4 shadow-2xl ring-1 ring-orange-500/50 relative p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Monthly Giving</h3>
              <p className="text-white/90 text-sm mb-6 leading-relaxed">
                Please consider making your ${amount === 'custom' ? customAmount || '0' : amount} donation monthly. Your consistent support would mean the world to us and help us save more girls from child marriage. Will you help us make a lasting impact?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setDonationType('one-time')
                    setShowMonthlyPopup(false)
                  }}
                  className="flex-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors border border-white/30"
                >
                  Keep One-time
                </button>
                <button
                  onClick={() => setShowMonthlyPopup(false)}
                  className="flex-1 bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 text-white px-4 py-2 rounded-md text-sm font-bold transition-colors border border-orange-400/50"
                >
                  Yes, Monthly
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

DonationModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  initialAmount: PropTypes.number
}

export default DonationModal
