import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../assets/images/shared/Far-Too-Young-Logo.png'

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gradient-to-r from-orange-500/30 via-orange-400/20 to-purple-500/30 backdrop-blur-sm border border-orange-400/50 rounded-xl w-full max-w-md shadow-2xl mt-32 mb-8">
        <div className="p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Far Too Young" className="h-48 w-auto opacity-90" />
          </div>

          {/* Success Animation */}
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-white/80 mb-6">
            Thank you for your generous donation. Your contribution will help protect children and girls from child marriage.
          </p>

          {/* Session ID (if available) */}
          {sessionId && (
            <p className="text-white/60 text-sm mb-6">
              Transaction ID: {sessionId.slice(-8)}
            </p>
          )}

          {/* Countdown */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <p className="text-white/80 text-sm">
              Redirecting to your dashboard in <span className="font-bold text-green-400">{countdown}</span> seconds...
            </p>
          </div>

          {/* Manual Navigation */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-orange-500/80 hover:bg-orange-600/90 text-white px-6 py-3 rounded-md font-bold transition-colors border border-orange-400/50"
            >
              Go to Dashboard Now
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-md font-medium transition-colors border border-white/30"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
