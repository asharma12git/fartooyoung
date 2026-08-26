import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
      setError('Password must include uppercase, lowercase, number, and special character.')
      return
    }

    setLoading(true)
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setTimeout(() => navigate('/'), 3000)
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-white mb-4">Invalid Reset Link</h2>
          <p className="text-white/60 text-sm">This password reset link is invalid or has expired. Please request a new one.</p>
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-all active:scale-95">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Password Reset Successful</h2>
          <p className="text-white/60 text-sm">You can now log in with your new password. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-2 text-center">Reset Your Password</h2>
        <p className="text-white/60 text-sm text-center mb-6">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/80 text-sm font-medium block mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 text-sm"
            />
          </div>
          <div>
            <label className="text-white/80 text-sm font-medium block mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 text-sm"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-white/40 text-xs text-center mt-4">Password must be at least 8 characters with uppercase, lowercase, number, and special character.</p>
      </div>
    </div>
  )
}

export default ResetPassword
