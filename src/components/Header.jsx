import { Link, useLocation } from 'react-router-dom'

const Header = ({ onAuthClick, onDonateClick }) => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Child Marriage' },
    { path: '/founder-team', label: 'Founder & Team' },
    { path: '/partners', label: 'Partners' },
    { path: '/what-we-do', label: 'What We Do' }
  ]

  return (
    <header className="bg-dark-800 border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <div className="w-32 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-dark-900 font-bold text-sm">LOGO</span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-6">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onAuthClick}
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Sign Up / Login"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button
              onClick={onDonateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Donate
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
