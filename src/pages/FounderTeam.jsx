import { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import heroImage from '../assets/images/pages/founder-team/Avinash-Sharma.jpg'
import signatureImage from '../assets/images/pages/founder-team/avinash-sharma/Signature.png'
import mattFriedmanImage from '../assets/images/pages/founder-team/our-team/Matt-Friedman.jpg'
import raviBaralImage from '../assets/images/pages/founder-team/our-team/Ravi-Baral-Royal-Nepal-Films.jpg'
import ashutoshSharmaImage from '../assets/images/pages/founder-team/our-team/Ashutosh-Sharma.jpg'
import oshinBistaImage from '../assets/images/pages/founder-team/our-team/Oshin-Bista.jpg'
import sooryaBaralImage from '../assets/images/pages/founder-team/our-team/Soorya-Baral.png'
import Card from '../components/Card'
import { GRADIENTS, BORDERS } from '../constants/styles'

const FounderTeam = ({ onDonateClick }) => {

  return (
    <div className="min-h-screen">
      <SEO
        title="Founder & Team | Far Too Young"
        description="Meet the founder and team behind Far Too Young — dedicated advocates working to end child marriage through research, education, and global partnerships."
        path="/founder-team"
      />
      {/* Hero Section with Background Image */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Image with Filters */}
        <div 
          className="absolute inset-0 bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            filter: 'grayscale(100%) sepia(25%) saturate(0.8) brightness(.55) contrast(1.0)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100%',
            minWidth: '100%'
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end items-start h-full pb-16 sm:pb-24 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white">
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-left text-gray-900 mb-4 leading-tight">AVINASH SHARMA</h2>
            <h3 className="text-lg sm:text-xl font-medium text-left text-gray-700 mb-6">Founder & CEO</h3>
            
            {/* Single divider line */}
            <div className="w-full h-px bg-gray-400"></div>
          </div>
          
          {/* Section Title */}
          <h3 className="text-xl sm:text-2xl font-medium text-center text-gray-900 mb-8 lg:mb-12 leading-tight">Ending Child Marriage: A Call to Action</h3>
          
          <div className="w-full">
            <Card gradient={GRADIENTS.METALLIC_GRAY} border={BORDERS.GRAY} padding="p-8 lg:p-16" hover={false}>
              <p className="text-lg sm:text-xl text-gray-900 mb-6 lg:mb-8 leading-relaxed font-serif">Dear Friends,</p>
              <p className="text-base sm:text-lg text-gray-800 mb-6 lg:mb-8 leading-relaxed text-justify font-serif">
                  Right now, as you read this, a girl somewhere in the world is being told her life will take a different path, one she did not choose. Her education ends. Her independence fades. Her future narrows.
                </p>
                
                <p className="text-base sm:text-lg text-gray-800 mb-6 lg:mb-8 leading-relaxed text-justify font-serif">
                  This happens nearly 12 million times every year, across continents, cultures, and communities. While the numbers are highest in South Asia and Sub-Saharan Africa, the reality exists far beyond borders, often hidden in plain sight.
                </p>
                
                <p className="text-base sm:text-lg text-gray-800 mb-6 lg:mb-8 leading-relaxed text-justify font-serif">
                  Child marriage reshapes the course of a girl's life. It pulls her out of school, limits her ability to earn, and places her in situations she is neither physically nor emotionally prepared for. Early pregnancies bring serious health risks for both mother and child. Economic dependence becomes the norm. In many cases, so do isolation, violence, and the weight of responsibilities far beyond her years. What begins as a single decision often becomes a cycle, repeating across generations.
                </p>
                
                <p className="text-base sm:text-lg text-gray-800 mb-6 lg:mb-8 leading-relaxed text-justify font-serif">
                  For years, efforts to address this issue have made progress, but not at the pace or scale required. The systems in place are not enough on their own. Real change demands something deeper: a shift in awareness, in attitudes, and in the choices communities make every day.
                </p>
                
                <p className="text-base sm:text-lg text-gray-800 mb-6 lg:mb-8 leading-relaxed text-justify font-serif">
                  That is why <em>Far Too Young</em> is producing a social impact film, also called <strong>Far Too Young</strong>, born from years of research, writing, and direct engagement with the communities most affected by child marriage and the vulnerable children at its center. The story is grounded in real experiences and designed to do what statistics alone cannot: make people feel the urgency of this crisis and move them to act.
                </p>
                
                <p className="text-base sm:text-lg text-gray-800 mb-6 lg:mb-8 leading-relaxed text-justify font-serif">
                  This social impact film project has completed all pre-production. Our goal is to bring the film, once completed, to the global stage, including international forums, film festivals, and policy circles, while simultaneously placing it in classrooms and communities worldwide, where its impact can be most immediate and lasting. The film is not just a piece of storytelling. It is a tool for sustained, measurable change.
                </p>
                
                <p className="text-base sm:text-lg text-gray-800 mb-6 lg:mb-8 leading-relaxed text-justify font-serif">
                  Because change does not happen in isolation. It grows through collective effort, when individuals, communities, and institutions begin to see differently and respond with intention. We invite you to be part of that shift.
                </p>
                
                <p className="text-base sm:text-lg text-gray-800 mb-6 lg:mb-8 leading-relaxed text-justify font-serif">
                  Your support helps extend this work: into classrooms, into communities, into the policy conversations that shape how the next generation thinks and acts. It helps create space for girls to remain in school, to gain knowledge, and to shape their own futures. This is not only about preventing harm. It is about creating possibility.
                </p>
                
                <p className="text-base sm:text-lg text-gray-800 mb-8 lg:mb-10 leading-relaxed font-serif">
                  Thank you for standing with us.
                </p>
                
                <p className="text-base sm:text-lg text-gray-800 mb-10 lg:mb-12 leading-relaxed font-serif">
                  <strong>Best wishes for {new Date().getFullYear()},</strong>
                </p>
                
                <div className="flex items-start justify-start">
                  <div>
                    <div className="w-48 sm:w-80 lg:w-[28rem] h-32 sm:h-40 lg:h-48 -ml-8 sm:-ml-12 lg:-ml-16 mb-4">
                      <img src={signatureImage} alt="Avinash Sharma signature" className="w-full h-full object-contain object-left" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 italic font-serif">
                      "Love cannot remain by itself — it has no meaning. Love has to be put into action and that action is service." – Mother Teresa
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 lg:mt-8 text-center">
                  <button 
                    onClick={() => onDonateClick()}
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
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-left text-gray-900 mb-12 lg:mb-16 leading-tight">OUR TEAM</h2>
          
          {/* Team Panels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Chief Advisor Panel */}
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>
              <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-orange-100/30 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <h3 className="text-lg sm:text-xl font-medium text-left text-gray-700 mb-6">CHIEF ADVISOR</h3>
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
                <h3 className="text-lg sm:text-xl font-medium text-left text-gray-700 mb-6">CO-FOUNDER</h3>
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
                    Ravi Baral is an award-winning filmmaker with over three decades of experience using cinema as a tool for social change. He has written, directed, and produced more than three dozen films and campaigns addressing public health, human trafficking, gender equality, and social justice, in collaboration with the World Bank, USAID, DFID, the European Union, UN Women, UNICEF, and Johns Hopkins University.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    Baral began his career in 1987 with NTV, producing documentaries and anchoring Spotlight, while becoming South and Southeast Asia&#39;s first VJ through Music Magazine—a pioneering platform that engaged youth on social issues through entertainment. In 1993, he co-founded multiple nonprofit initiatives focused on public education, producing impactful documentaries, edutainment films, and large-scale behavior change campaigns.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    His feature film Chameli (1999/2000), on girl trafficking, won four National Awards in Nepal and gained international recognition, praised by leaders including Madeleine Albright and Kofi Annan. He also co-produced the Emmy-nominated documentary The Day My God Died (2005). Beyond filmmaking, Baral has served as a media consultant and communication specialist to international organizations, shaping strategies that bridge policy, communities, and storytelling. His advocacy extends into publishing, including Maynati, a collection addressing modern-day slavery.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    Importantly, Baral has been working on the issue of child marriage since the early 1990s, well before it gained global attention, contributing to awareness efforts across South Asia. In recent years, he has renewed this focus through short films such as Kalikai Umerama (2022) and <em>Far Too Young</em> (2021), building toward his most ambitious project yet.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    He will direct <em>Far Too Young</em>, a feature-length social impact film developed through years of research across South Asia, representing the culmination of his life&#39;s work: a powerful fusion of storytelling, advocacy, and lived experience aimed at inspiring global action.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Second Row - Three Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8 lg:mt-12">
            {/* Chief of Operations Panel */}
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>
              <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-orange-100/30 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <h3 className="text-base sm:text-lg lg:text-xl font-medium text-left text-gray-700 mb-6">CHIEF OF OPERATIONS</h3>
                <div className="w-full h-px bg-gray-400 mb-6"></div>
                
                {/* Photo */}
                <div className="w-full h-80 mb-6">
                  <img 
                    src={ashutoshSharmaImage} 
                    alt="Ashutosh Sharma - Chief of Operations" 
                    className="w-full h-full object-cover object-center rounded-2xl"
                  />
                </div>
                
                {/* Biography */}
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed text-justify">
                    After completing his education in computer science, Ashutosh Sharma joined Norfolk Southern, where he serves as a Technical Lead and Senior Full-Stack Engineer. In this role, he oversees key technical initiatives and is recognized for designing and executing large-scale projects. He collaborates closely with the executive leadership team to align engineering roadmaps with the company&#39;s long-term strategic vision.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    At Far Too Young, Ashutosh leverages his extensive technical expertise to guide the organization&#39;s global mission. Serving as Chief Operating Officer, he directs operational activities across South Asia. A purpose-driven leader, he empowers cross-functional teams to tackle complex gender-based violence issues with curiosity and resilience. Deeply committed to community service from an early age, Ashutosh believes that serving communities brings profound joy and fulfillment.
                  </p>
                </div>
              </div>
            </div>

            {/* Director of Special Projects Panel */}
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>
              <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-100/30 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <h3 className="text-base sm:text-lg lg:text-xl font-medium text-left text-gray-700 mb-6">DIRECTOR OF SPECIAL PROJECTS</h3>
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
                    Ms. Oshin Bista, MA in Anthropology from Columbia University. As a Nepali girl born during the decade-long civil war, she witnessed violence and discrimination against vulnerable populations like women and girls from an early age. Moving to Bosnia and Herzegovina at 16 and later to the US at 19, she saw even more nuanced ways conflict and inequality affected children's well-being and life opportunities.
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
                <h3 className="text-base sm:text-lg lg:text-xl font-medium text-left text-gray-700 mb-6">DIRECTOR OF COMMUNICATIONS</h3>
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
                    Mr. Soorya Baral has led innovative campaigns addressing HIV/AIDS, human trafficking, violence against women, and other critical social issues across South Asia. He has produced over a dozen short films on environmental conservation, sustainable tourism, nutrition, good governance, economic empowerment, and gender-based violence, and has consulted for various organizations on communication strategies and social marketing campaigns.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    Involved with Far Too Young since its inception, Soorya has played a key role in developing, producing, and disseminating communication materials for the initiative. He works closely with community-based organizations, local governments, partner NGOs, and target communities in the countries where Far Too Young operates. During the project&#39;s eight-year research and writing process, he served as chief field coordinator, overseeing community engagement, participatory storytelling, and grassroots outreach. Through Far Too Young and its partner initiatives, he has also supported programs focused on education, economic upliftment, and the empowerment of marginalized men, women, and children.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-justify mt-4">
                    With a background in management and training at the New York-based Stella Adler Studio of Acting, Soorya finds happiness in spreading love, dignity, and compassion throughout the greater community.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Association Section */}
          <div className="text-center mt-12 lg:mt-16">
            <Link 
              to="/partners" 
              onClick={() => window.scrollTo(0, 0)}
              className="inline-block bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 animate-pulse"
            >
              Associations
            </Link>
            
            {/* Visual indicator */}
            <p className="text-gray-600 text-xs sm:text-sm mt-3 italic">Click to view our partnerships</p>
          </div>
          
        </div>
      </div>

    </div>
  )
}

FounderTeam.propTypes = {
  onDonateClick: PropTypes.func.isRequired
}

export default FounderTeam
