import heroImage from '../assets/images/pages/what-we-do/Child-Bride-Mom.jpeg'

const WhatWeDo = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Image with Filters */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            filter: 'grayscale(100%) sepia(25%) saturate(0.8) brightness(.6) contrast(1.0)',
            backgroundPosition: 'center 30%'
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end items-start h-full pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h2 className="text-4xl font-medium text-white">
              What We Do
            </h2>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Education & Scholarships Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center group-hover:bg-amber-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-amber-900 mb-4 group-hover:text-amber-800">Education & Scholarships</h3>
              <p className="text-base text-amber-700 leading-relaxed">
                Providing educational opportunities and financial support to keep girls in school and build brighter futures.
              </p>
            </div>

            {/* Community Outreach Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-orange-900 mb-4 group-hover:text-orange-800">Community Outreach</h3>
              <p className="text-base text-orange-700 leading-relaxed">
                Working directly with families and communities to change attitudes and practices around child marriage.
              </p>
            </div>

            {/* Legal Advocacy Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-red-900 mb-4 group-hover:text-red-800">Legal Advocacy</h3>
              <p className="text-base text-red-700 leading-relaxed">
                Supporting policy changes and legal protections for girls at risk of child marriage worldwide.
              </p>
            </div>

            {/* Health & Support Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center group-hover:bg-pink-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-pink-900 mb-4 group-hover:text-pink-800">Health & Support</h3>
              <p className="text-base text-pink-700 leading-relaxed">
                Providing healthcare, counseling, and comprehensive support for survivors and at-risk girls.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatWeDo
