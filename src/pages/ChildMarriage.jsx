import heroImage from '../assets/images/pages/child-marriage/FTY-MV-82.jpg'

const ChildMarriage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div 
        className="relative h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end items-center h-full text-center px-4 pb-32">
          <h2 className="text-4xl font-medium text-brand-orange mb-8">
            Restoring Hopes, Restoring Smiles ®
          </h2>
          
          <p className="text-small text-white mb-8 leading-relaxed max-w-3xl mx-auto">
            Far Too Young envisions a society free from child, underage and forced marriages - 
            a society where girls and women feel valued and reach their full potential.
          </p>
          
          <p className="text-small text-white mb-12">
            Please Support Us.
          </p>
          
          <button className="bg-orange-500/80 backdrop-blur-sm hover:bg-orange-600/90 text-white px-6 py-3 rounded-md text-base font-bold transition-colors mb-8 border border-orange-400/50">
            DONATE
          </button>
          
          <div className="text-xs text-white/80 italic max-w-4xl mx-auto">
            <p className="mb-2">
              Far Too Young Inc is a United States non-profit recognized by the IRS as a 501(c)(3) charitable organization.
            </p>
            <p>
              Our work is supported entirely through donations. 100 percent of your contribution is tax deductible.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Our Mission Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center group-hover:bg-amber-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-headline text-amber-900 mb-4 group-hover:text-amber-800">Our Mission</h3>
              <p className="text-body text-amber-700 leading-relaxed">
                Ending child marriage through education, advocacy, and community empowerment worldwide.
              </p>
            </div>

            {/* Global Impact Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-headline text-orange-900 mb-4 group-hover:text-orange-800">Global Impact</h3>
              <p className="text-body text-orange-700 leading-relaxed">
                12 million girls affected annually. We're changing lives across continents.
              </p>
            </div>

            {/* Education Programs Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <h3 className="text-headline text-red-900 mb-4 group-hover:text-red-800">Education</h3>
              <p className="text-body text-red-700 leading-relaxed">
                Scholarships and programs keeping girls in school and building brighter futures.
              </p>
            </div>

            {/* Get Involved Section */}
            <div className="group cursor-pointer bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center group-hover:bg-pink-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-headline text-pink-900 mb-4 group-hover:text-pink-800">Get Involved</h3>
              <p className="text-body text-pink-700 leading-relaxed">
                Join our community of advocates working to protect children worldwide.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ChildMarriage
