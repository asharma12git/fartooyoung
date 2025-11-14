const Partners = () => {
  const partners = [
    {
      name: "UNICEF",
      type: "UN Agency",
      description: "Global partnership for child protection and education initiatives.",
      logo: "/api/placeholder/200/100"
    },
    {
      name: "Girls Not Brides",
      type: "Global Partnership",
      description: "Collaborative efforts to end child marriage through advocacy and research.",
      logo: "/api/placeholder/200/100"
    },
    {
      name: "Plan International",
      type: "NGO",
      description: "Joint programs focusing on girls' education and empowerment.",
      logo: "/api/placeholder/200/100"
    },
    {
      name: "Ford Foundation",
      type: "Foundation",
      description: "Funding support for community-based intervention programs.",
      logo: "/api/placeholder/200/100"
    }
  ]

  const localPartners = [
    {
      name: "Community Health Workers Network",
      location: "Kenya",
      focus: "Health education and family planning"
    },
    {
      name: "Girls Education Initiative",
      location: "Bangladesh",
      focus: "School retention and scholarship programs"
    },
    {
      name: "Women's Rights Collective",
      location: "India",
      focus: "Legal advocacy and support services"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Our Partners
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          We collaborate with organizations worldwide to maximize our impact 
          and create sustainable change in communities.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Global Partners</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {partners.map((partner, index) => (
            <div key={index} className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{partner.name}</h3>
                  <p className="text-blue-400 text-sm font-medium mb-2">{partner.type}</p>
                  <p className="text-gray-300 text-sm">{partner.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Local Partners</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {localPartners.map((partner, index) => (
            <div key={index} className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">{partner.name}</h3>
              <p className="text-blue-400 text-sm font-medium mb-2">{partner.location}</p>
              <p className="text-gray-300 text-sm">{partner.focus}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-800 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Partnership Opportunities</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">For Organizations</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Joint program development</li>
              <li>• Resource sharing and capacity building</li>
              <li>• Research collaboration</li>
              <li>• Advocacy and policy work</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-4">For Corporations</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Corporate social responsibility programs</li>
              <li>• Employee engagement initiatives</li>
              <li>• Skills-based volunteering</li>
              <li>• Funding and sponsorship opportunities</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
            Become a Partner
          </button>
        </div>
      </div>
    </div>
  )
}

export default Partners
