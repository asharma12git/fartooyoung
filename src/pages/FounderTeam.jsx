import { useState } from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/images/pages/founder-team/Avinash-Sharma.jpg'
import signatureImage from '../assets/images/pages/founder-team/avinash-sharma/Signature.png'
import mattFriedmanImage from '../assets/images/pages/founder-team/our-team/Matt-Friedman.jpg'
import raviBaralImage from '../assets/images/pages/founder-team/our-team/Ravi-Baral-Royal-Nepal-Films.jpg'
import ashutoshSharmaImage from '../assets/images/pages/founder-team/our-team/Ashutosh-Sharma.jpg'
import oshinBistaImage from '../assets/images/pages/founder-team/our-team/Oshin-Bista.jpg'
import sooryaBaralImage from '../assets/images/pages/founder-team/our-team/Soorya-Baral.png'
import DonationModal from '../components/DonationModal'
import Card from '../components/Card'
import { GRADIENTS, BORDERS } from '../constants/styles'

const FounderTeam = () => {
  const [showDonationModal, setShowDonationModal] = useState(false)

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
        <div className="relative z-10 flex flex-col justify-end items-start h-full pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h2 className="text-4xl font-medium text-white">
              Meet Our Founder
            </h2>
          </div>
        </div>
      </div>

      {/* Avinash Sharma Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Double Line - Content Width */}
          <div className="mb-8">
            <div className="w-full h-0.5 bg-black mb-1"></div>
            <div className="w-full h-0.5 bg-black"></div>
          </div>
          
          {/* Title and Subtitle */}
          <div className="mb-8">
            <h2 className="text-4xl font-medium text-left text-gray-900 mb-4 leading-tight">AVINASH SHARMA</h2>
            <h3 className="text-xl font-medium text-left text-gray-700 mb-6">Founder & CEO</h3>
            
            {/* Single divider line */}
            <div className="w-full h-px bg-gray-400"></div>
          </div>
          
          {/* Section Title */}
          <h3 className="text-2xl font-medium text-center text-gray-900 mb-12 leading-tight">ENDING GENDER BASED VIOLENCE: A CALL TO ACTION</h3>
          
          <div className="w-full">
            <Card gradient={GRADIENTS.METALLIC_GRAY} border={BORDERS.GRAY} padding="p-16" hover={false}>
              <p className="text-xl text-gray-900 mb-8 leading-relaxed font-serif">Dear Friends,</p>
                
                <p className="text-lg text-gray-800 mb-8 leading-relaxed text-justify font-serif">
                  From a young age, I've been deeply drawn to social service with a passion to serve the communities and give back to society. Witnessing the struggles of those less fortunate, both in my native Nepal and later in the United States, ignited a desire within me to make a difference. I believe that everyone deserves a chance to live a life free from violence, poverty and injustice.
                </p>
                
                <p className="text-lg text-gray-800 mb-8 leading-relaxed text-justify font-serif">
                  I am a Data Scientist by profession and also the Founder of Far Too Young, Inc., a non-profit dedicated to ending all forms of gender based violence and child marriage in particular. Child marriage is a form of gender-based violence as it denies girls their fundamental rights and bodily autonomy. It has severe consequences, including limited education, increased risk of domestic violence, and significant health risks for both mother and child.
                </p>
                
                <p className="text-lg text-gray-800 mb-8 leading-relaxed text-justify font-serif">
                  Having witnessed the devastating impact of poverty and inequality in both Nepal and the US, I'm committed to creating a more just world. Child marriage is a grave violation of human rights, robbing children of their childhoods, education, and health. It perpetuates poverty and hinders social progress.
                </p>
                
                <p className="text-lg text-gray-800 mb-8 leading-relaxed text-justify font-serif">
                  Through Far Too Young, we are conducting research, supporting community organizations, providing education to children and raising awareness about this issue. We believe that by working together, we can make a significant impact in ending child marriage and empowering young boys and girls.
                </p>
                
                <p className="text-lg text-gray-800 mb-8 leading-relaxed text-justify font-serif">
                  Large organizations and governments are not doing enough. And at the current rate of progress, Gender Based Violence and particularly child marriage will not end anytime soon unless individuals and charities come together.
                </p>
                
                <p className="text-lg text-gray-800 mb-8 leading-relaxed text-justify font-serif">
                  I urge you to consider supporting our work with a generous donation. Every contribution, no matter the size, will help us make a difference.
                </p>
                
                <p className="text-lg text-gray-800 mb-10 leading-relaxed font-serif">
                  Thank you for your compassion and support.
                </p>
                
                <p className="text-lg text-gray-800 mb-12 leading-relaxed font-serif">
                  Best Wishes for 2025.
                </p>
                
                <div className="flex items-start justify-start">
                  <div>
                    <p className="text-lg text-gray-800 mb-3 font-serif">Sincerely,</p>
                    <div className="w-[28rem] h-48 -ml-16 mb-4">
                      <img src={signatureImage} alt="Avinash Sharma signature" className="w-full h-full object-contain object-left" />
                    </div>
                    <p className="text-sm text-gray-600 italic font-serif">
                      "Love cannot remain by itself — it has no meaning. Love has to be put into action and that action is service." – Mother Teresa
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <button 
                    onClick={() => setShowDonationModal(true)}
                    className="group/btn relative inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span>DONATE</span>
                  </button>
                </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Our Team Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single Line Separator */}
          <div className="w-full h-px bg-black mb-8"></div>
          
          {/* Title */}
          <h2 className="text-4xl font-medium text-left text-gray-900 mb-16 leading-tight">OUR TEAM</h2>
          
          {/* Team Panels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Chief Advisor Panel */}
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>
              <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-orange-100/30 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <h3 className="text-xl font-medium text-left text-gray-700 mb-6">CHIEF ADVISOR</h3>
                <div className="w-full h-px bg-gray-400 mb-6"></div>
                
                {/* Photo */}
                <div className="w-full h-80 mb-6">
                  <img 
                    src={mattFriedmanImage} 
                    alt="Matt Friedman - Chief Advisor" 
                    className="w-full h-full object-cover object-center rounded-2xl"
                  />
                </div>
                
                {/* Biography */}
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed text-justify">
                    Mr. Matthew S. Friedman, the CEO of The Mekong Club, is a leading, internationally renowned global expert on modern slavery and human trafficking. As an award-winning public speaker, author, filmmaker, and philanthropist, Matthew regularly advises heads of governments and intelligence agencies. Each year he is cited at least 40 times in the news media (CNN, Bloomberg, Reuters, Associated Press, the Financial Times, the Economist, etc.) and invited to speak at major international conferences around the world.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    As an award-winning inspirational and motivational speaker, Matthew has given more than 900 presentations including 129 keynote speeches. He has also authored 13 books.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    Matthew has managed and directed tens of millions of dollars in major humanitarian portfolios impacting millions of people for the World Bank, the U.S. State Department, and the United Nations. His work over the last 30 years of pioneering and managing international anti-human trafficking projects from Nepal, Bangladesh, Thailand, and Hong Kong has given him access to many influential networks in different countries throughout the world.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    A long-time supporter of film and the media arts, Matthew was an executive producer and advisor on four award-winning films, one of which was nominated for an Emmy and another executive produced by Emma Thompson.
                  </p>
                </div>
              </div>
            </div>

            {/* Senior Partner Panel */}
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>
              <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-100/30 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <h3 className="text-xl font-medium text-left text-gray-700 mb-6">SENIOR PARTNER</h3>
                <div className="w-full h-px bg-gray-400 mb-6"></div>
                
                {/* Photo */}
                <div className="w-full h-80 mb-6">
                  <img 
                    src={raviBaralImage} 
                    alt="Ravi Baral - Senior Partner" 
                    className="w-full h-full object-cover object-center rounded-2xl"
                  />
                </div>
                
                {/* Biography */}
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed text-justify">
                    Mr. Ravi Baral is an award-winning and critically acclaimed filmmaker based in Nepal with 30 years of experience in the industry. He has led over three dozen film projects (writing, directing) in domains like public health communication, human trafficking, reproductive and child health, and gender equality with partners like USAID, DFID, UN Women, the World Bank, and others. He has also produced a documentary on the tripartite (China-Japan-Nepal) expedition to Mount Everest.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    Ravi Baral founded Media Alert and Relief Foundation in 1993, a non-profit that alerts the public through education on areas of health, population, women empowerment, the environment, and other social issues. He writes and directs infomercials, edutainment film projects, PSAs, documentaries, and awareness campaigns.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    Ravi produced and directed Chameli, a full-length feature on anti-girl trafficking which was partly funded by UNIFEM and USAID and won four Nepal Motion Picture Awards. He also directed and produced Ramjham, a musical for peace. The motive of the film was to recover the lost peace of Nepal and its eroding democracy through a celluloid campaign.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    Ravi was also the co-producer of the internationally acclaimed documentary on child trafficking, The Day My God Died, which was nominated for the Emmys in 2005. Ravi has been a media consultant to many communications projects undertaken by INGOs and other private, government, and donor organizations in Nepal and South Asia. He will be directing Far Too Young, a full-length edutainment film which he also wrote after many years of joint research. The film project is currently in pre-production.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Second Row - Three Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* VP & Chief of Operations Panel */}
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>
              <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-orange-100/30 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <h3 className="text-xl font-medium text-left text-gray-700 mb-6">VP & CHIEF OF OPERATIONS</h3>
                <div className="w-full h-px bg-gray-400 mb-6"></div>
                
                {/* Photo */}
                <div className="w-full h-80 mb-6">
                  <img 
                    src={ashutoshSharmaImage} 
                    alt="Ashutosh Sharma - VP & Chief of Operations" 
                    className="w-full h-full object-cover object-center rounded-2xl"
                  />
                </div>
                
                {/* Biography */}
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed text-justify">
                    Mr. Ashutosh Sharma, after completing his education in computer science, joined Norfolk Southern. There he is a technical lead and senior full-stack engineer. He oversees multiple initiatives and is recognized as a leader in developing and managing large-scope projects. He works closely with the executive team to understand and fine-tune the roadmap for overall direction and aims of the programs and company's vision.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    At Far Too Young, Ashutosh, with his vast knowledge and skills, leads to guide the organization's mission. As VP and Chief of Operations, he oversees the activities of Far Too Young in South Asia and the US. A value-driven leader, he enables those around him to be relentless and curious in taking challenges head-on. Mr. Sharma believes in giving back to the community, which he says brings joy and fulfillment in life. He has supported many charitable causes around the world from an early age.
                  </p>
                </div>
              </div>
            </div>

            {/* Director of Special Projects Panel */}
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>
              <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-100/30 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <h3 className="text-xl font-medium text-left text-gray-700 mb-6">DIRECTOR OF SPECIAL PROJECTS</h3>
                <div className="w-full h-px bg-gray-400 mb-6"></div>
                
                {/* Photo */}
                <div className="w-full h-80 mb-6">
                  <img 
                    src={oshinBistaImage} 
                    alt="Oshin Bista - Director of Special Projects" 
                    className="w-full h-full object-cover object-center rounded-2xl"
                  />
                </div>
                
                {/* Biography */}
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed text-justify">
                    Ms. Oshin Bista, MA in Anthropology from Columbia University, is based in New York. As a Nepali girl born during the decade-long civil war, she witnessed violence and discrimination against vulnerable populations like women and girls from an early age. Moving to Bosnia and Herzegovina at 16 and later to the US at 19, she saw even more nuanced ways conflict and inequality affected children's well-being and life opportunities.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    She realized that violence against children, women, and other vulnerable groups was not limited to developing economies but was inherent to many institutions worldwide. This realization motivated her to pursue sociocultural issues academically.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    At Far Too Young, Oshin is currently leading the Tara Campaign against child marriage.
                  </p>
                </div>
              </div>
            </div>

            {/* Director of Communications Panel */}
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>
              <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-amber-100/30 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <h3 className="text-xl font-medium text-left text-gray-700 mb-6">DIRECTOR OF COMMUNICATIONS</h3>
                <div className="w-full h-px bg-gray-400 mb-6"></div>
                
                {/* Photo */}
                <div className="w-full h-80 mb-6">
                  <img 
                    src={sooryaBaralImage} 
                    alt="Soorya Baral - Director of Communications" 
                    className="w-full h-full object-cover object-center rounded-2xl"
                  />
                </div>
                
                {/* Biography */}
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed text-justify">
                    Mr. Soorya Baral has led several innovative campaigns against HIV/AIDS, human trafficking, and violence against women in South Asia. He has about a dozen short films to his credit on subjects like environment, sustainable tourism, nutrition, good governance, and gender-based violence. He has also worked as a consultant to private organizations in developing and implementing communications and marketing plans.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    Soorya Baral has been involved in Far Too Young since its inception and is responsible for the development, production, and dissemination of communications materials. He also liaises with various community-based organizations, target audiences, as well as local governments in countries Far Too Young works with its partner NGOs.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    With an education in management, Soorya also received training at the New York-based prestigious Stella Adler Studio of Acting. He finds happiness in spreading love and compassion to the greater community.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Association Section */}
          <div className="text-center mt-16">
            <Link 
              to="/partners" 
              className="inline-block bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 animate-pulse"
            >
              Associations
            </Link>
            
            {/* Visual indicator */}
            <p className="text-gray-600 text-sm mt-3 italic">Click to view our partnerships</p>
          </div>
          
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}
    </div>
  )
}

export default FounderTeam
