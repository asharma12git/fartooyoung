import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const DonationModal = ({ onClose, user }) => {
  const [donationType, setDonationType] = useState('one-time')
  const [amount, setAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('stripe')

  const presetAmounts = [25, 50, 100, 250, 500, 1000]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Save donation to localStorage if user is logged in
    if (user) {
      const donationAmount = amount === 'custom' ? parseFloat(customAmount) : amount
      const newDonation = {
        id: Date.now(), // Simple ID generation
        amount: donationAmount,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        type: donationType === 'one-time' ? 'One-time' : 'Monthly',
        status: 'Completed',
        paymentMethod: paymentMethod
      }
      
      // Get existing donations for this user
      const existingDonations = localStorage.getItem(`donations_${user.email}`)
      const donations = existingDonations ? JSON.parse(existingDonations) : []
      
      // Add new donation
      donations.push(newDonation)
      
      // Save back to localStorage
      localStorage.setItem(`donations_${user.email}`, JSON.stringify(donations))
    }
    
    onClose()
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xl font-medium text-white mb-3">
              Donation Type
            </label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setDonationType('one-time')}
                className={`flex-1 py-3 px-4 rounded-md text-base font-medium transition-all duration-300 ${
                  donationType === 'one-time'
                    ? 'bg-orange-500/80 text-white border border-orange-400/50'
                    : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                }`}
              >
                One-time
              </button>
              <button
                type="button"
                onClick={() => setDonationType('monthly')}
                className={`flex-1 py-3 px-4 rounded-md text-base font-medium transition-all duration-300 ${
                  donationType === 'monthly'
                    ? 'bg-orange-500/80 text-white border border-orange-400/50'
                    : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xl font-medium text-white mb-3">
              Amount
            </label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {presetAmounts.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`py-3 px-4 rounded-md text-base font-medium transition-all duration-300 ${
                    amount === preset
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
              className={`w-full py-3 px-4 rounded-md text-base font-medium transition-all duration-300 ${
                amount === 'custom'
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
                  className={`w-full mt-3 px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    customAmount && parseFloat(customAmount) < 5
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
            <label className="block text-xl font-medium text-white mb-3">
              Payment Method
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 w-4 h-4 text-orange-500 focus:ring-orange-500/50"
                />
                <span className="text-white text-base">Credit/Debit Card (Stripe)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 w-4 h-4 text-orange-500 focus:ring-orange-500/50"
                />
                <span className="text-white text-base">PayPal</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={!amount || (amount === 'custom' && !customAmount)}
            className="w-full bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 disabled:bg-orange-500/80 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md text-base font-bold transition-colors border border-orange-400/50"
          >
            {donationType === 'monthly' ? 'Donate Monthly' : 'Donate'} {amount === 'custom' ? customAmount : amount}
          </button>
          
          <div className="flex items-center justify-center mt-3 text-white/70">
            <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">100% Secure Donation</span>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  )
}

DonationModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object
}

export default DonationModal
