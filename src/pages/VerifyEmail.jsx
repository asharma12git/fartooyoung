import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const VerifyEmail = ({ onAuthClick }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
        const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setMessage('Email verified successfully!')
          // Auto-redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/')
            onAuthClick() // Open login modal
          }, 2000)
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Network error. Please try again.')
      }
    }

    verifyEmail()
  }, [searchParams, navigate, onAuthClick])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {status === 'verifying' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          )}
          {status === 'success' && (
            <svg className="w-12 h-12 text-green-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {status === 'error' && (
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        <h2 className="text-2xl font-medium text-white mb-4">Email Verification</h2>
        <p className="text-white/80 mb-6">{message}</p>
        
        {status === 'success' && (
          <p className="text-green-400 text-sm">Redirecting to login...</p>
        )}
        
        {status === 'error' && (
          <button
            onClick={() => navigate('/')}
            className="bg-orange-500/80 hover:bg-orange-600/90 text-white px-6 py-2 rounded-md transition-all duration-300"
          >
            Go to Home
          </button>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
