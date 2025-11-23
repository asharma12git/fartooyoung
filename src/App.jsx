import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ChildMarriage from './pages/ChildMarriage'
import FounderTeam from './pages/FounderTeam'
import Partners from './pages/Partners'
import WhatWeDo from './pages/WhatWeDo'
import DonorDashboard from './pages/DonorDashboard'
import AuthModal from './components/AuthModal'
import DonationModal from './components/DonationModal'
import { useState } from 'react'

/**
 * App Content component to access navigate hook
 */
function AppContent() {
  const navigate = useNavigate()

  // Global modal state management
  const [showAuth, setShowAuth] = useState(false)
  const [showDonation, setShowDonation] = useState(false)

  // Global authentication state
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Refresh key to trigger dashboard data reload
  const [refreshKey, setRefreshKey] = useState(0)

  // Authentication handlers
  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    setShowAuth(false) // Close auth modal after login
    navigate('/dashboard') // Navigate to dashboard
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  const handleAuthClick = () => {
    setShowAuth(true)
  }

  const handleDonationClose = () => {
    setShowDonation(false)
    setRefreshKey(prev => prev + 1) // Trigger dashboard refresh
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Global navigation header */}
      <Header
        onAuthClick={handleAuthClick}
        onDonateClick={() => setShowDonation(true)}
        user={user}
        isLoggedIn={isLoggedIn}
      />

      {/* Main content area with page routing */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ChildMarriage />} />
          <Route path="/founder-team" element={<FounderTeam />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/what-we-do" element={<WhatWeDo />} />
          <Route
            path="/dashboard"
            element={
              <DonorDashboard
                user={user}
                onLogout={handleLogout}
                onDonateClick={() => setShowDonation(true)}
                refreshKey={refreshKey}
              />
            }
          />
        </Routes>
      </main>

      {/* Global footer - hide on dashboard */}
      <Routes>
        <Route path="/dashboard" element={null} />
        <Route path="*" element={<Footer />} />
      </Routes>

      {/* Global modals - conditionally rendered */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
        />
      )}
      {showDonation && <DonationModal onClose={handleDonationClose} user={user} />}
    </div>
  )
}

/**
 * Main App component - Root of the Far Too Young application
 */
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
