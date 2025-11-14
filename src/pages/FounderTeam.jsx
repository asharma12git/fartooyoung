const FounderTeam = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Former UN Women advocate with 15 years of experience in international development and women's rights.",
      image: "/api/placeholder/300/300"
    },
    {
      name: "Dr. Amara Okafor",
      role: "Program Director",
      bio: "Child psychologist and researcher specializing in trauma recovery and educational interventions.",
      image: "/api/placeholder/300/300"
    },
    {
      name: "Maria Santos",
      role: "Community Outreach Manager",
      bio: "Grassroots organizer with deep connections in affected communities across three continents.",
      image: "/api/placeholder/300/300"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Our Founder & Team
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Meet the passionate individuals dedicated to ending child marriage and 
          empowering girls worldwide.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Mission</h2>
        <div className="bg-dark-800 rounded-lg p-8">
          <p className="text-lg text-gray-300 text-center leading-relaxed">
            Founded in 2020, Far Too Young emerged from a deep commitment to protecting 
            girls' rights and futures. Our team combines decades of experience in international 
            development, child protection, and community organizing to create lasting change 
            in the fight against child marriage.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, index) => (
          <div key={index} className="bg-dark-800 rounded-lg p-6 text-center">
            <div className="w-32 h-32 bg-dark-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
            <p className="text-blue-400 font-medium mb-3">{member.role}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{member.bio}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-dark-800 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Join Our Team</h2>
        <div className="text-center">
          <p className="text-gray-300 mb-6">
            We're always looking for passionate individuals to join our mission. 
            Whether you're interested in fieldwork, research, or advocacy, there's a place for you.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
            View Open Positions
          </button>
        </div>
      </div>
    </div>
  )
}

export default FounderTeam
