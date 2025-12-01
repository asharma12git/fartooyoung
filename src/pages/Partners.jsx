import { useState } from 'react'
import PropTypes from 'prop-types'
import heroImage from '../assets/images/pages/partners/Sad-Girl.jpg'
import mediaAlertLogo from '../assets/images/pages/partners/Media-Alert.png'
import empowerWomenImage from '../assets/images/pages/partners/empower-women.jpg'
import chadaniJoshiImage from '../assets/images/pages/partners/mentors/Chanadani-Joshi.jpg'
import ritaThapaImage from '../assets/images/pages/partners/mentors/Rita-Thapa-bw.jpg'
import pramilaRijalImage from '../assets/images/pages/partners/mentors/Pramila-Rijal-Acharya-bw.jpg'
import undpLogo from '../assets/images/pages/partners/past-present-collabs/UNDP.png'
import unicefLogo from '../assets/images/pages/partners/past-present-collabs/UNICEF.png'
import usaidLogo from '../assets/images/pages/partners/past-present-collabs/USAID.png'
import saarcLogo from '../assets/images/pages/partners/past-present-collabs/SAARC.png'
import dfidLogo from '../assets/images/pages/partners/past-present-collabs/DFID.png'
import icrcLogo from '../assets/images/pages/partners/past-present-collabs/ICRC.png'
import jicaLogo from '../assets/images/pages/partners/past-present-collabs/JICA.png'
import fhiLogo from '../assets/images/pages/partners/past-present-collabs/FHI-Family-Health-International.png'
import nepalRedCrossLogo from '../assets/images/pages/partners/past-present-collabs/Nepal-Red-Cross-Society.png'
import psiLogo from '../assets/images/pages/partners/past-present-collabs/PSI.png'
import unWomenLogo from '../assets/images/pages/partners/past-present-collabs/UN-Women.png'
import europeanUnionLogo from '../assets/images/pages/partners/past-present-collabs/European-Union.png'
import bpKoiralaLogo from '../assets/images/pages/partners/past-present-collabs/BP-Koirala-India-Nepal-Foundation.png'
import nepalGovLogo from '../assets/images/pages/partners/past-present-collabs/Nepal-Government.png'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import PersonCard from '../components/PersonCard'
import { LAYOUT, GRADIENTS, BORDERS } from '../constants/styles'

const Partners = ({ onDonateClick }) => {

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

  const collaborationPartners = [
    { name: "UNDP", logo: undpLogo },
    { name: "UNICEF", logo: unicefLogo },
    { name: "USAID", logo: usaidLogo },
    { name: "SAARC", logo: saarcLogo },
    { name: "DFID", logo: dfidLogo },
    { name: "ICRC", logo: icrcLogo },
    { name: "JICA", logo: jicaLogo },
    { name: "FHI 360", logo: fhiLogo },
    { name: "Nepal Red Cross Society", logo: nepalRedCrossLogo },
    { name: "PSI", logo: psiLogo },
    { name: "UN Women", logo: unWomenLogo },
    { name: "European Union", logo: europeanUnionLogo },
    { name: "BP Koirala India Nepal Foundation", logo: bpKoiralaLogo },
    { name: "Government of Nepal", logo: nepalGovLogo }
  ]

  return (
    <div className="min-h-screen">
      <style jsx>{`
        @keyframes floatMove {
          0% { transform: translate(0, 0) scale(0.8); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translate(20px, -30px) scale(1.2); opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(-15px, 25px) scale(0.6); opacity: 0; }
        }
        @keyframes slideIn {
          0% { transform: translateX(-100px) scale(0.5); opacity: 0; }
          30% { opacity: 1; }
          70% { transform: translateX(50px) scale(1.3); opacity: 1; }
          100% { transform: translateX(100px) scale(0.7); opacity: 0; }
        }
        @keyframes fadeScale {
          0% { transform: scale(0.3); opacity: 0; }
          25% { transform: scale(1.5); opacity: 1; }
          75% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.4); opacity: 0; }
        }
        .float-1 { animation: floatMove 8s infinite; }
        .float-2 { animation: slideIn 6s infinite; }
        .float-3 { animation: fadeScale 7s infinite; }
      `}</style>
      {/* Hero Section with Background Image */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            filter: 'sepia(25%) saturate(0.8) brightness(.65) contrast(1.0)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100%',
            minWidth: '100%'
          }}
        ></div>
        
        <div className="relative z-10 flex flex-col justify-end items-start h-full pb-16 sm:pb-24 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white">Partners</h2>
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
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-left text-gray-900 mb-12 lg:mb-16 leading-tight">AFFILIATE</h2>
          
          <Card gradient={GRADIENTS.METALLIC_GRAY} border={BORDERS.GRAY} padding="p-8 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center">
                <div className="w-60 sm:w-72 lg:w-80 h-60 sm:h-72 lg:h-80 mx-auto mb-6 lg:mb-8 flex items-center justify-center p-4 lg:p-6">
                  <img 
                    src={mediaAlertLogo} 
                    alt="Media Alert Logo" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                <div className="text-left">
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                    Established in 1993 as a non-profit NGO under the Social Welfare Council of Nepal. For the past 30 years, Media Alert has worked in Nepal, South Asia, and internationally on communication projects with various partner community-based organizations.
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Media Alert's expertise lies in community-based programs, enter-educate approach, skill and capacity building, advocacy, social marketing, research and planning, monitoring and evaluation.
                  </p>
                </div>
              </div>
              
              <div className="text-gray-600 text-sm sm:text-base leading-relaxed space-y-4">
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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

      {/* Local Level Partnership Section */}
      <div className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <SectionTitle>LOCAL LEVEL PARTNERSHIP</SectionTitle>
          
          <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-900 rounded-lg overflow-hidden">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${empowerWomenImage})`,
                filter: 'brightness(0.4) contrast(1.2)'
              }}
            ></div>
            
            {/* Animated Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                <div className="absolute text-white font-bold float-1" style={{top: '10%', left: '10%', animationDelay: '0s', fontSize: 'clamp(12px, 2.5vw, 18px)'}}>
                  Health Posts
                </div>
                <div className="absolute text-white font-medium float-2" style={{top: '25%', right: '15%', animationDelay: '1s', fontSize: 'clamp(10px, 2vw, 14px)'}}>
                  Civil Societies
                </div>
                <div className="absolute text-white font-bold float-3" style={{top: '40%', left: '20%', animationDelay: '2s', fontSize: 'clamp(14px, 3vw, 20px)'}}>
                  Hospitals
                </div>
                <div className="absolute text-white font-light float-1" style={{top: '15%', left: '50%', animationDelay: '3s', fontSize: 'clamp(8px, 1.5vw, 12px)'}}>
                  Community Based Organizations
                </div>
                <div className="absolute text-white font-semibold float-2" style={{top: '55%', right: '25%', animationDelay: '4s', fontSize: 'clamp(11px, 2.2vw, 16px)'}}>
                  Co-operatives
                </div>
                <div className="absolute text-white font-bold float-3" style={{top: '70%', left: '15%', animationDelay: '5s', fontSize: 'clamp(10px, 2vw, 15px)'}}>
                  Women Leaders
                </div>
                <div className="absolute text-white font-medium float-1" style={{top: '30%', right: '35%', animationDelay: '6s', fontSize: 'clamp(9px, 1.8vw, 13px)'}}>
                  Elected Leaders
                </div>
                <div className="absolute text-white font-light float-2" style={{top: '85%', left: '40%', animationDelay: '7s', fontSize: 'clamp(8px, 1.5vw, 11px)'}}>
                  Village Development Committees
                </div>
                <div className="absolute text-white font-bold float-3" style={{top: '20%', left: '75%', animationDelay: '0.5s', fontSize: 'clamp(12px, 2.5vw, 17px)'}}>
                  Municipalities
                </div>
                <div className="absolute text-white font-medium float-1" style={{top: '50%', left: '60%', animationDelay: '1.5s', fontSize: 'clamp(8px, 1.5vw, 12px)'}}>
                  Community Support Groups
                </div>
                <div className="absolute text-white font-semibold float-2" style={{top: '75%', right: '10%', animationDelay: '2.5s', fontSize: 'clamp(13px, 2.8vw, 19px)'}}>
                  Media
                </div>
                <div className="absolute text-white font-bold float-3" style={{top: '35%', left: '5%', animationDelay: '3.5s', fontSize: 'clamp(10px, 2vw, 14px)'}}>
                  Local Governments
                </div>
                <div className="absolute text-white font-medium float-1" style={{top: '65%', left: '70%', animationDelay: '4.5s', fontSize: 'clamp(9px, 1.8vw, 13px)'}}>
                  Education Institutions
                </div>
                <div className="absolute text-white font-light float-2" style={{top: '5%', right: '30%', animationDelay: '5.5s', fontSize: 'clamp(15px, 3.2vw, 21px)'}}>
                  Wards
                </div>
                <div className="absolute text-white font-bold float-3" style={{top: '80%', left: '25%', animationDelay: '6.5s', fontSize: 'clamp(11px, 2.2vw, 16px)'}}>
                  Schools
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Past & Present Collaboration Section */}
      <div className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <SectionTitle>PAST & PRESENT COLLABORATION</SectionTitle>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {collaborationPartners.map((partner, index) => (
              <div 
                key={index}
                className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 flex items-center justify-center mb-2 sm:mb-3">
                  <img 
                    src={partner.logo} 
                    alt={`${partner.name} logo`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <p className="text-xs text-gray-600 text-center font-medium leading-tight">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Donate Section */}
      <div className="py-16 bg-gray-50">
        <div className={LAYOUT.CONTAINER}>
          <div className="text-center">
            <button
              onClick={() => onDonateClick()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 sm:px-10 lg:px-12 py-3 sm:py-4 text-base sm:text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 rounded-full"
            >
              DONATE NOW
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

Partners.propTypes = {
  onDonateClick: PropTypes.func.isRequired
}

export default Partners
