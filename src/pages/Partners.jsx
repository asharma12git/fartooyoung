import heroImage from '../assets/images/pages/partners/Sad-Girl.jpg'

const Partners = () => {
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
              Partners
            </h2>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Global Partners Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center group-hover:bg-amber-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-amber-900 mb-4 group-hover:text-amber-800">Global Partners</h3>
              <p className="text-base text-amber-700 leading-relaxed">
                UN agencies, international NGOs, and foundations working together for global change.
              </p>
            </div>

            {/* Local Partners Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-orange-900 mb-4 group-hover:text-orange-800">Local Partners</h3>
              <p className="text-base text-orange-700 leading-relaxed">
                Grassroots organizations and community leaders driving change at the local level.
              </p>
            </div>

            {/* Corporate Partners Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-red-900 mb-4 group-hover:text-red-800">Corporate Partners</h3>
              <p className="text-base text-red-700 leading-relaxed">
                Businesses supporting our mission through CSR programs and employee engagement.
              </p>
            </div>

            {/* Partnership Opportunities Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center group-hover:bg-pink-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-pink-900 mb-4 group-hover:text-pink-800">Join Us</h3>
              <p className="text-base text-pink-700 leading-relaxed">
                Explore partnership opportunities and become part of our global network.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Partners
