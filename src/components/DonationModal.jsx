import { useState } from 'react'

const DonationModal = ({ onClose }) => {
  const [donationType, setDonationType] = useState('one-time')
  const [amount, setAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('stripe')

  const presetAmounts = [25, 50, 100, 250, 500, 1000]

  const handleSubmit = (e) => {
    e.preventDefault()
    const finalAmount = amount === 'custom' ? customAmount : amount
    // Mock payment processing - in real app, this would integrate with Stripe/PayPal
    console.log('Donation attempt:', { donationType, amount: finalAmount, paymentMethod })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-medium text-white">Make a Donation</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
        </form>
      </div>
    </div>
  )
}

export default DonationModal
