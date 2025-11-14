import { useState } from 'react'

const DonationModal = ({ onClose }) => {
  const [donationType, setDonationType] = useState('one-time')
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('stripe')

  const presetAmounts = [25, 50, 100, 250, 500]

  const handleSubmit = (e) => {
    e.preventDefault()
    const finalAmount = amount === 'custom' ? customAmount : amount
    // Mock payment processing - in real app, this would integrate with Stripe/PayPal
    console.log('Donation attempt:', { donationType, amount: finalAmount, paymentMethod })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Make a Donation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Donation Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="one-time"
                  checked={donationType === 'one-time'}
                  onChange={(e) => setDonationType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-white">One-time</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="monthly"
                  checked={donationType === 'monthly'}
                  onChange={(e) => setDonationType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-white">Monthly</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {presetAmounts.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    amount === preset
                      ? 'bg-blue-600 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAmount('custom')}
              className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                amount === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Custom Amount
            </button>
            {amount === 'custom' && (
              <input
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full mt-2 px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                <span className="text-white">Credit/Debit Card (Stripe)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                <span className="text-white">PayPal</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={!amount || (amount === 'custom' && !customAmount)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-md font-medium transition-colors"
          >
            Donate ${amount === 'custom' ? customAmount : amount} {donationType === 'monthly' ? '/month' : ''}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DonationModal
