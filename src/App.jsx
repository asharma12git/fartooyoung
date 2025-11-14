import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import ChildMarriage from './pages/ChildMarriage'
import FounderTeam from './pages/FounderTeam'
import Partners from './pages/Partners'
import WhatWeDo from './pages/WhatWeDo'
import AuthModal from './components/AuthModal'
import DonationModal from './components/DonationModal'
import { useState } from 'react'

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [showDonation, setShowDonation] = useState(false)

  return (
    <Router>
      <div className="min-h-screen bg-dark-900">
        <Header 
          onAuthClick={() => setShowAuth(true)}
          onDonateClick={() => setShowDonation(true)}
        />
        <main>
          <Routes>
            <Route path="/" element={<ChildMarriage />} />
            <Route path="/founder-team" element={<FounderTeam />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/what-we-do" element={<WhatWeDo />} />
          </Routes>
        </main>
        
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        {showDonation && <DonationModal onClose={() => setShowDonation(false)} />}
      </div>
    </Router>
  )
}

export default App
