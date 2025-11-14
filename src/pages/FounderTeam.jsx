import heroImage from '../assets/images/pages/founder-team/Avinash-Sharma.jpg'

const FounderTeam = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Image with Filters */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            filter: 'sepia(25%) saturate(0.8) brightness(.65) contrast(1.0)'
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end items-start h-full pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h2 className="text-4xl font-medium text-white">
              Meet Our Founder
            </h2>
          </div>
        </div>
      </div>

      {/* Typography Testing Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div>
              <h3 className="text-4xl font-medium text-gray-900">Large Text (36px)</h3>
              <p className="text-gray-600">text-4xl font-medium</p>
            </div>
            
            <div>
              <h4 className="text-xl font-medium text-gray-900">Medium Text (20px)</h4>
              <p className="text-gray-600">text-xl font-medium</p>
            </div>
            
            <div>
              <p className="text-base text-gray-900">Small Text (16px)</p>
              <p className="text-gray-600">text-base</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-900">Extra Small Text (14px)</p>
              <p className="text-gray-600">text-sm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Founder Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center group-hover:bg-amber-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-4 group-hover:text-amber-800">Our Founder</h3>
              <p className="text-amber-700 leading-relaxed">
                Visionary leader with 15+ years in international development and women's rights advocacy.
              </p>
            </div>

            {/* Leadership Team Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-orange-900 mb-4 group-hover:text-orange-800">Leadership Team</h3>
              <p className="text-orange-700 leading-relaxed">
                Experienced professionals in child psychology, program management, and community outreach.
              </p>
            </div>

            {/* Advisory Board Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-red-900 mb-4 group-hover:text-red-800">Advisory Board</h3>
              <p className="text-red-700 leading-relaxed">
                Global experts providing strategic guidance and policy expertise from around the world.
              </p>
            </div>

            {/* Join Us Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center group-hover:bg-pink-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-pink-900 mb-4 group-hover:text-pink-800">Join Our Team</h3>
              <p className="text-pink-700 leading-relaxed">
                Passionate about making a difference? Explore opportunities to join our mission.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default FounderTeam
