import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/images/shared/Far-Too-Young-Logo.png'

const Header = ({ onAuthClick, onDonateClick }) => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Child Marriage' },
    { path: '/founder-team', label: 'Founder & Team' },
    { path: '/partners', label: 'Partners' },
    { path: '/what-we-do', label: 'What We Do' }
  ]

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-40 py-6 pt-8">
          <div className="flex items-center justify-start">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Far Too Young" className="h-36 w-auto" />
            </Link>
          </div>
          
          <nav className="flex-1 flex justify-center items-center">
            <div className="flex space-x-8">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 text-xl font-medium transition-all duration-300 ${
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
          
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={onAuthClick}
              className="flex items-center space-x-2"
            >
              <span className="text-white/90 text-small font-medium transition-colors duration-300 hover:text-orange-200">Login</span>
              <div className="bg-orange-500/80 backdrop-blur-sm p-1.5 rounded-md border border-orange-400/50 hover:bg-orange-600/90 transition-colors duration-300">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </button>
            
            <div className="h-6 w-px bg-white/30"></div>
            
            <button
              onClick={onDonateClick}
              className="flex items-center space-x-2"
            >
              <span className="text-white/90 text-small font-medium transition-colors duration-300 hover:text-orange-200">Donate</span>
              <div className="bg-orange-500/80 backdrop-blur-sm p-1.5 rounded-md border border-orange-400/50 hover:bg-orange-600/90 transition-colors duration-300">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
