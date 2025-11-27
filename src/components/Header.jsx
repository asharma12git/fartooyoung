import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import logo from '../assets/images/shared/Far-Too-Young-Logo.png'

const Header = ({ onAuthClick, onDonateClick, user, isLoggedIn }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleAuthClick = () => {
    if (isLoggedIn) {
      // Navigate to dashboard if logged in
      navigate('/dashboard')
    } else {
      // Show login modal if not logged in
      onAuthClick()
    }
  }

  const navItems = [
    { path: '/', label: 'Child Marriage' },
    { path: '/founder-team', label: 'Founder & Team' },
    { path: '/partners', label: 'Partners' },
    { path: '/what-we-do', label: 'What We Do' }
  ]

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-32 sm:h-36 lg:h-40 py-4 sm:py-6 pt-6 sm:pt-8">
          <div className="flex items-center justify-start">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Far Too Young" className="h-24 sm:h-32 md:h-40 lg:h-36 w-auto" />
            </Link>
          </div>
          
          <nav className="flex-1 flex justify-center items-center">
            {/* Desktop Navigation - Hidden on mobile and tablet, show only on larger screens */}
            <div className="hidden xl:flex space-x-8">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 text-lg xl:text-xl font-medium transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'text-white/90 border-b-2 border-orange-500'
                      : 'text-white/90 border-b-2 border-transparent hover:text-orange-200'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile Hamburger Button - Visible on mobile and tablet */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden flex items-center justify-center w-8 sm:w-10 md:w-12 lg:w-10 h-8 sm:h-10 md:h-12 lg:h-10 rounded-md bg-orange-500/80 backdrop-blur-sm border border-orange-400/50 hover:bg-orange-600/90 transition-colors duration-300"
            aria-label="Toggle mobile menu"
          >
            <svg 
              className="w-5 sm:w-6 md:w-7 lg:w-6 h-5 sm:h-6 md:h-7 lg:h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          <div className="hidden xl:flex items-center justify-end space-x-4">
            <button
              onClick={handleAuthClick}
              className="flex items-center space-x-2"
            >
              <span className="text-white/90 text-base xl:text-lg font-medium transition-colors duration-300 hover:text-orange-200">
                {isLoggedIn ? 
                  (user?.firstName 
                    ? user.firstName
                    : user?.name || 'Account'
                  ) : 'Login'
                }
              </span>
              <div className={`backdrop-blur-sm p-2 rounded-md border transition-colors duration-300 ${
                isLoggedIn 
                  ? 'bg-green-500/80 border-green-400/50 hover:bg-green-600/90' 
                  : 'bg-orange-500/80 border-orange-400/50 hover:bg-orange-600/90'
              }`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </button>
            
            <div className="h-6 w-px bg-white/30"></div>
            
            <button
              onClick={() => onDonateClick()}
              className="flex items-center space-x-2"
            >
              <span className="text-white/90 text-base xl:text-lg font-medium transition-colors duration-300 hover:text-orange-200">Donate</span>
              <div className="bg-orange-500/80 backdrop-blur-sm p-2 rounded-md border border-orange-400/50 hover:bg-orange-600/90 transition-colors duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Only visible when open */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm overflow-hidden">
          <div className="flex flex-col h-full pt-20 px-4 sm:px-6">
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-xl font-medium">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-orange-500/80 backdrop-blur-sm border border-orange-400/50 hover:bg-orange-600/90 transition-colors duration-300"
                aria-label="Close menu"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex-none p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg ring-1 ring-orange-500/30">
              <div className="space-y-3">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-3 px-4 text-base sm:text-lg font-medium transition-colors duration-300 rounded-md ${
                      location.pathname === item.path
                        ? 'text-white bg-orange-500/20 border-l-4 border-orange-400/50'
                        : 'text-white/90 hover:text-orange-200 hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Mobile Auth & Donate Buttons */}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  handleAuthClick()
                  setIsMobileMenuOpen(false)
                }}
                className={`flex-1 backdrop-blur-sm border transition-all duration-300 shadow-lg text-sm px-4 py-3 rounded-lg font-medium ${
                  isLoggedIn 
                    ? 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white' 
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                {isLoggedIn ? 
                  (user?.firstName 
                    ? user.firstName
                    : user?.name || 'Account'
                  ) : 'Login'
                }
              </button>

              <button
                onClick={() => {
                  onDonateClick()
                  setIsMobileMenuOpen(false)
                }}
                className="flex-1 bg-gradient-to-r from-orange-500/80 to-orange-600/80 backdrop-blur-sm border border-orange-400/50 hover:from-orange-600/90 hover:to-orange-700/90 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg text-sm"
              >
                Donate
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

Header.propTypes = {
  onAuthClick: PropTypes.func.isRequired,
  onDonateClick: PropTypes.func.isRequired,
  user: PropTypes.object,
  isLoggedIn: PropTypes.bool.isRequired
}

export default Header
