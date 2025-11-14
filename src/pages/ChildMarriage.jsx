const ChildMarriage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Ending Child Marriage
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Every year, millions of girls are forced into marriage before their 18th birthday. 
          We're working to change that through education, advocacy, and direct intervention.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">The Crisis</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              Child marriage affects 12 million girls every year, robbing them of their childhood, 
              education, and future opportunities.
            </p>
            <p>
              Girls who marry before 18 are more likely to experience domestic violence, 
              have limited educational opportunities, and face serious health risks.
            </p>
          </div>
        </div>
        <div className="bg-dark-800 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-white mb-4">Key Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Girls affected annually:</span>
              <span className="text-blue-400 font-bold">12 million</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Countries with highest rates:</span>
              <span className="text-blue-400 font-bold">Sub-Saharan Africa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Economic impact:</span>
              <span className="text-blue-400 font-bold">$63 billion lost</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-800 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Approach</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Education</h3>
            <p className="text-gray-300">
              Providing educational opportunities and scholarships to keep girls in school.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Community Engagement</h3>
            <p className="text-gray-300">
              Working with families and communities to change attitudes and practices.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Legal Protection</h3>
            <p className="text-gray-300">
              Advocating for stronger laws and supporting enforcement mechanisms.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChildMarriage
