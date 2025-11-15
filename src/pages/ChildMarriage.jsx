import heroImage from '../assets/images/pages/child-marriage/FTY-MV-82.jpg'
import childBrideImage from '../assets/images/pages/child-marriage/Child-Bride.jpg'
import useCountUp from '../hooks/useCountUp'
import flagBangladesh from '../assets/images/pages/child-marriage/Flags/Flag_Bangladesh.png'
import flagNepal from '../assets/images/pages/child-marriage/Flags/Flag_Nepal.svg'
import flagUSA from '../assets/images/pages/child-marriage/Flags/Flag_USA.png'
import flagIndia from '../assets/images/pages/child-marriage/Flags/Flag_India.png'

const CountryCard = ({ flag, country, description }) => {
  return (
    <div className="group perspective-1000 h-96">
      <div className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
        {/* Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="relative h-full">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-100 via-blue-50 via-purple-50 to-pink-100 rounded-3xl"></div>
            
            {/* Content Container */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl h-full shadow-lg border border-white/50">
              <div className="h-full flex flex-col items-center justify-start pt-8 p-8">
                <div className="w-24 h-16 mb-8">
                  <img src={flag} alt={`${country} flag`} className="w-full h-full object-contain" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">{country}</h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Back */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-lg border border-orange-300 overflow-hidden">
          <div className="h-full flex items-center justify-center p-8">
            <p className="text-white text-center text-base leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const WhereWeWork = () => {
  const countries = [
    {
      flag: flagBangladesh,
      country: "Bangladesh",
      description: "Working with local communities to prevent child marriage and support girls' education through grassroots initiatives."
    },
    {
      flag: flagIndia,
      country: "India", 
      description: "Partnering with organizations to address child marriage in rural areas and empower girls through education programs."
    },
    {
      flag: flagNepal,
      country: "Nepal",
      description: "Supporting community-based programs that protect girls from early marriage and promote their rights."
    },
    {
      flag: flagUSA,
      country: "United States",
      description: "Raising awareness and mobilizing resources to support global efforts in ending child marriage worldwide."
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {countries.map((country, index) => (
        <CountryCard key={index} {...country} />
      ))}
    </div>
  )
}

const StatisticsGrid = () => {
  const [count38M, ref38M] = useCountUp(38, 2000)
  const [count102M, ref102M] = useCountUp(102, 2000)
  const [count5M, ref5M] = useCountUp(5, 2000)
  const [count10M, ref10M] = useCountUp(10, 2000)

  return (
    <div className="relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-100 via-blue-50 via-purple-50 to-pink-100 rounded-3xl"></div>
      
      {/* Content Container */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-white/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 38M Child Brides in Bangladesh */}
          <div ref={ref38M} className="text-center">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-2">
              Child Brides in Bangladesh
            </p>
            <div className="text-5xl md:text-6xl font-bold text-gray-900">
              {count38M}M
            </div>
          </div>

          {/* 102M Married in India before turning 15 */}
          <div ref={ref102M} className="text-center">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-2">
              Married in India before turning 15
            </p>
            <div className="text-5xl md:text-6xl font-bold text-gray-900">
              {count102M}M
            </div>
          </div>

          {/* 5M+ Child Brides in Nepal */}
          <div ref={ref5M} className="text-center">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-2">
              Child Brides in Nepal
            </p>
            <div className="text-5xl md:text-6xl font-bold text-gray-900">
              {count5M}M+
            </div>
          </div>

          {/* 10M+ Children At Risk due to COVID-19 */}
          <div ref={ref10M} className="text-center">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-2">
              Children At Risk due to COVID-19
            </p>
            <div className="text-5xl md:text-6xl font-bold text-gray-900">
              {count10M}M+
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ChildMarriage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Image with Filters */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            filter: 'grayscale(100%) sepia(25%) saturate(0.8) brightness(.55) contrast(1.0)'
          }}
        ></div>
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end items-center h-full text-center px-4 pb-32">
          <h2 className="text-4xl font-medium mb-8" style={{ color: '#f59e0b' }}>
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

      {/* A Child Bride Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Double Line - Content Width */}
          <div className="mb-8">
            <div className="w-full h-0.5 bg-black mb-1"></div>
            <div className="w-full h-0.5 bg-black"></div>
          </div>
          
          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Title and Description */}
            <div>
              <h2 className="text-4xl font-medium text-left text-gray-900 mb-8 leading-tight">A CHILD BRIDE</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Gender discrimination is embedded in 
                the legal system and social structures and that along with poverty is the root cause of child marriages. Every year 4 million girls under the age of 15 are victims of child, underage and forced marriages in South Asia. This illegal practice robs them of their rights to education, their reproductive rights and consensual marriage.
              </p>
              
              {/* Subtle divider line */}
              <div className="w-full h-px bg-gray-400 mb-6"></div>
              
              <p className="text-lg text-gray-700 leading-relaxed">
                Once married as children, the child brides are victims of lifelong servitude, domestic violence, pregnancy complications and death through early childbirth. Child brides are at risk of being trafficked and sold. Child marriage reinforces the gendered nature of poverty, with limited education and skills, bringing down the potential of the girl, her family, her community and her country. These hinder a girl throughout her adult life and into the next generation.
              </p>
            </div>
            
            {/* Right - Image */}
            <div className="h-full">
              <img 
                src={childBrideImage} 
                alt="Child bride awareness" 
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hear Ranju, Binita & Hema Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single Line Separator */}
          <div className="w-full h-px bg-black mb-8"></div>
          
          {/* Title */}
          <h2 className="text-4xl font-medium text-left text-gray-900 mb-8 leading-tight">HEAR RANJU, BINITA & HEMA</h2>
          
          {/* YouTube Video */}
          <div className="w-full aspect-video mb-8">
            <iframe
              className="w-full h-full rounded-lg shadow-lg"
              src="https://www.youtube.com/embed/cHmHZO4F0qs"
              title="Hear Ranju, Binita & Hema"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      {/* South Asia Statistics Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single Line Separator */}
          <div className="w-full h-px bg-black mb-8"></div>
          
          {/* Title */}
          <h2 className="text-4xl font-medium text-left text-gray-900 mb-16 leading-tight">
            SOUTH ASIA HAS WORLD'S HIGHEST NUMBER OF CHILD BRIDES
          </h2>
          
          {/* Statistics Grid */}
          <StatisticsGrid />
        </div>
      </div>

      {/* Where We Work Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single Line Separator */}
          <div className="w-full h-px bg-black mb-8"></div>
          
          {/* Title */}
          <h2 className="text-4xl font-medium text-left text-gray-900 mb-16 leading-tight">WHERE WE WORK</h2>
          
          {/* Flip Cards Grid */}
          <WhereWeWork />
          
        </div>
      </div>
    </div>
  )
}

export default ChildMarriage
