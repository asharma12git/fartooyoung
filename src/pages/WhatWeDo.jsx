const WhatWeDo = () => {
  const programs = [
    {
      title: "Education & Scholarships",
      description: "Providing educational opportunities and financial support to keep girls in school.",
      impact: "2,500+ girls supported",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: "Community Outreach",
      description: "Working directly with families and communities to change attitudes and practices.",
      impact: "150+ communities reached",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "Legal Advocacy",
      description: "Supporting policy changes and legal protections for girls at risk.",
      impact: "12 policy changes achieved",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      )
    },
    {
      title: "Health & Support Services",
      description: "Providing healthcare, counseling, and support for survivors and at-risk girls.",
      impact: "1,800+ girls supported",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ]

  const regions = [
    { name: "Sub-Saharan Africa", countries: 15, programs: 45 },
    { name: "South Asia", countries: 8, programs: 32 },
    { name: "Middle East & North Africa", countries: 6, programs: 18 },
    { name: "Latin America", countries: 4, programs: 12 }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          What We Do
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Our comprehensive approach combines education, advocacy, and direct support 
          to end child marriage and empower girls worldwide.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Programs</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <div key={index} className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                  {program.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{program.title}</h3>
                  <p className="text-gray-300 mb-3">{program.description}</p>
                  <p className="text-blue-400 font-medium text-sm">{program.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Global Reach</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {regions.map((region, index) => (
            <div key={index} className="bg-dark-800 rounded-lg p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">{region.name}</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-2xl font-bold text-blue-400">{region.countries}</span>
                  <p className="text-gray-300 text-sm">Countries</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-blue-400">{region.programs}</span>
                  <p className="text-gray-300 text-sm">Active Programs</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-800 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Impact</h2>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">4,500+</div>
            <p className="text-gray-300">Girls Protected</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">180+</div>
            <p className="text-gray-300">Communities Engaged</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">33</div>
            <p className="text-gray-300">Countries Reached</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">95%</div>
            <p className="text-gray-300">Success Rate</p>
          </div>
        </div>
        <div className="text-center mt-8">
          <p className="text-gray-300 mb-6">
            Every donation directly supports our programs and helps us reach more girls in need.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
            Support Our Work
          </button>
        </div>
      </div>
    </div>
  )
}

export default WhatWeDo
