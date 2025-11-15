import heroImage from '../assets/images/pages/partners/Sad-Girl.jpg'
import mediaAlertLogo from '../assets/images/pages/partners/Media-Alert.png'
import chadaniJoshiImage from '../assets/images/pages/partners/mentors/Chanadani-Joshi.jpg'
import ritaThapaImage from '../assets/images/pages/partners/mentors/Rita-Thapa-bw.jpg'
import pramilaRijalImage from '../assets/images/pages/partners/mentors/Pramila-Rijal-Acharya-bw.jpg'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import PersonCard from '../components/PersonCard'
import { LAYOUT, GRADIENTS, BORDERS } from '../constants/styles'

const Partners = () => {
  const mentors = [
    {
      name: "MRS. CHADANI JOSHI",
      image: chadaniJoshiImage,
      alt: "Mrs. Chadani Joshi",
      biography: [
        "Mrs. Joshi is a gender, rights, and policy specialist with over 52 years of experience. In her initial years, she served as the Joint Secretary as well as the Chief of Development Programs for the Government of Nepal. During her tenure, she initiated the pioneering PCRW Program that gave rural women in Nepal access to production credit.",
        "She has also contributed immensely to gender-responsive budgets in the country. In 1990, she set up the UNIFEM (now known as UN Women) South Asia Regional Office and devoted 18 years molding it into a knowledge-based organization. As the Regional Director, she furthered UNIFEM's development agenda by supporting innovative and experimental programs benefiting women while keeping in mind national and regional priorities.",
        "In 2017, the Ministry of Women, Children and Social Welfare, Government of Nepal appointed Ms. Joshi as the Chair of the Think Tank of the Ministry. Presently, she is also a member of the UN Women's Civil Society Advisory Group. She was honored with a Lifetime Achievement Award by the President of Nepal in 2009."
      ]
    },
    {
      name: "MRS. RITA THAPA",
      image: ritaThapaImage,
      alt: "Mrs. Rita Thapa",
      biography: [
        "Mrs. Thapa is widely recognized for her groundbreaking work in founding Tewa, Nepal's first and only fund for women. She has over thirty-five years of experience as a feminist educator, community activist, initiating and supporting institutions for women's empowerment and for peace.",
        "Thapa also founded and led (2001-2009) Nagarik Aawaz, an initiative for conflict transformation and peace-building in Nepal. In recognition of this exceptional \"innovative contribution to the public good,\" Rita received the rare honor of being named an Ashoka Fellow.",
        "She served as a past Board Member and Chair of the Global Fund for Women and the Urgent Action Fund. In 2005, she was included in the 1000 Women for Peace Nomination for the Nobel Peace Prize. She also served on the Board of the Global Fund for Community Foundation and the South Asian Women's Fund."
      ]
    },
    {
      name: "MRS. PRAMILA RIJAL ACHARYA",
      image: pramilaRijalImage,
      alt: "Mrs. Pramila Rijal Acharya",
      biography: [
        "Mrs. Rijal is the President of South Asian Women Development Forum (SAWDF), a SAARC recognized body, with long-standing experience and recognition in bringing together a consortium of women-led institutions with extensive work around women's entrepreneurship through SAWDF Chapters in South Asia.",
        "Mrs. Rijal is the Board member of the Industry, Commerce, Promotion Dialogue Council headed by The Prime Minister of Nepal. She is the past President of The Federation of Women Entrepreneur Associations of Nepal (FWEAN) and Charter President of Zonta Club, Kathmandu. She has served as a board member of several boards in Nepal including the Institute of Foreign Affairs, Industrial Promotional Board, and the National Women's Commission.",
        "As a social entrepreneur, she is the recipient of several awards as the harbinger of change on the advancement and empowerment of women at the national and regional level. She has been conferred the Prabal Jana Sewa Shree medal by the Right Honorable President of Nepal, one of Nepal's highest civilian awards."
      ]
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            filter: 'sepia(25%) saturate(0.8) brightness(.65) contrast(1.0)'
          }}
        ></div>
        
        <div className="relative z-10 flex flex-col justify-end items-start h-full pb-32">
          <div className={LAYOUT.CONTAINER}>
            <h2 className="text-4xl font-medium text-white">Partners</h2>
          </div>
        </div>
      </div>

      {/* Affiliate Section */}
      <div className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <div className="mb-8">
            <div className="w-full h-0.5 bg-black mb-1"></div>
            <div className="w-full h-0.5 bg-black"></div>
          </div>
          
          <h2 className="text-4xl font-medium text-left text-gray-900 mb-16 leading-tight">AFFILIATE</h2>
          
          <Card gradient={GRADIENTS.METALLIC_GRAY} border={BORDERS.GRAY} padding="p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center">
                <div className="w-80 h-80 mx-auto mb-8 flex items-center justify-center p-6">
                  <img 
                    src={mediaAlertLogo} 
                    alt="Media Alert Logo" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                <div className="text-left">
                  <p className="text-gray-600 text-base leading-relaxed mb-4">
                    Established in 1993 as a non-profit NGO under the Social Welfare Council of Nepal. For the past 30 years, Media Alert has worked in Nepal, South Asia, and internationally on communication projects with various partner community-based organizations.
                  </p>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Media Alert's expertise lies in community-based programs, enter-educate approach, skill and capacity building, advocacy, social marketing, research and planning, monitoring and evaluation.
                  </p>
                </div>
              </div>
              
              <div className="text-gray-600 text-base leading-relaxed space-y-4">
                <p>Media Alert uses behavior change communication (BCC) in creating awareness, increasing knowledge base, building approval, and influencing behavior. It has designed and implemented many unique campaigns especially targeting marginalized grassroots audiences.</p>
                <p>The organization has produced and disseminated scores of shorts and documentaries, public service spots, and several edutainment film campaigns against modern day slavery, human trafficking, child marriage, HIV/AIDS, on gender equality, women empowerment, human rights, health, the environment, democracy, and peace building to educate and empower people and communities.</p>
                <p>Media Alert regularly conducts seminars and workshops on communication and strategies, campaign development, social marketing, and BCC with development partners, government bodies, and international non-governmental organizations.</p>
                <p>Since its establishment, Media Alert runs the Fr. Moran Education Fund which provides scholarships to needy children across Nepal, runs regular free clinics and health camps, and has been providing help and support to victims of man-made disasters and people with health emergencies.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Mentors Section */}
      <div className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <SectionTitle>MENTORS</SectionTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mentors.map((mentor, index) => (
              <PersonCard
                key={index}
                name={mentor.name}
                image={mentor.image}
                alt={mentor.alt}
                biography={mentor.biography}
                gradient={GRADIENTS.METALLIC_GRAY}
                border={BORDERS.GRAY}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Partners
