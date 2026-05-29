import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import SEO from '../components/SEO'
import heroImage from '../assets/images/pages/child-marriage/FTY-MV-82.jpg'
import childBrideImage from '../assets/images/pages/child-marriage/a-child-bride/Child-Bride.jpg'
import useCountUp from '../hooks/useCountUp'
import flagBangladesh from '../assets/images/pages/child-marriage/where-we-work/Flag_Bangladesh.png'
import flagNepal from '../assets/images/pages/child-marriage/where-we-work/Flag_Nepal.svg'
import flagUSA from '../assets/images/pages/child-marriage/where-we-work/Flag_USA.png'
import flagIndia from '../assets/images/pages/child-marriage/where-we-work/Flag_India.png'
import protectRightsImage1 from '../assets/images/pages/child-marriage/protect-rights-of-the-child/cm-care-austrialia.jpg'
import protectRightsImage2 from '../assets/images/pages/child-marriage/protect-rights-of-the-child/Girls-studying-in-Nepal-Credit-Save-the-Children.jpg'
import protectRightsImage3 from '../assets/images/pages/child-marriage/protect-rights-of-the-child/girls-group.jpg'
import logoWatermark from '../assets/images/shared/Far-Too-Young-Logo.png'
import sdg1 from '../assets/images/pages/child-marriage/sdg/Sustainable_Development_Goal_1.png'
import sdg2 from '../assets/images/pages/child-marriage/sdg/Sustainable_Development_Goal_2.png'
import sdg3 from '../assets/images/pages/child-marriage/sdg/Sustainable_Development_Goal_3.png'
import sdg4 from '../assets/images/pages/child-marriage/sdg/Sustainable_Development_Goal_4.png'
import sdg5 from '../assets/images/pages/child-marriage/sdg/Sustainable_Development_Goal_05.png'
import sdg8 from '../assets/images/pages/child-marriage/sdg/Sustainable_Development_Goal_8.png'
import sdg10 from '../assets/images/pages/child-marriage/sdg/Sustainable_Development_Goal_10.png'
import sdg13 from '../assets/images/pages/child-marriage/sdg/Sustainable_Development_Goal_13.png'
import sdg16 from '../assets/images/pages/child-marriage/sdg/Sustainable_Development_Goal_16.png'

const ProtectRightsPanel = ({ image, title, description }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="group">
      <div className="relative">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>

        {/* Content Container */}
        <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl shadow-lg border border-orange-100/30 overflow-hidden transition-transform duration-300 group-hover:scale-105">
          <div className="aspect-video w-full overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">{title}</h3>
            <div className="text-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group/btn relative inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {isExpanded && (
              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <p className="text-gray-900 text-sm leading-relaxed text-justify font-medium whitespace-pre-line">{description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ProtectRights = () => {
  const panels = [
    {
      image: protectRightsImage2,
      title: "GBV : Child Marriage",
      description: "Gender Based Violence (GBV), already a global crisis, has increased many folds after the COVID-19 pandemic. Children and women have been futher abused, trapped and isolated as a result of the health crisis. Economic hardships, social instability, captivity and helplessness have futher made situations worst for them. Domestic and sexual violence human trafficking and child marriage is on the the rise like never before.\n\nThe pandemic has put an additional 10 million underage girls at risk of child, underage and forced marriages and now over 150 million child marriages are expected to take place by 2030. By 2030, the world's target is to eliminate the practice, but reaching this goal will require coordinated action and additional investment. Many countries around the world are struggling to meet this goal. To end child marriage by 2030, progress must be 17 times faster than the progress of the last decade according to UNICEF.\n\nFar Too Young, Inc is committed to the fight against child marriage and eliminate this practice and urgency to prioritize children for all recovery efforts to protect the coming generation from being the lost one."
    },
    {
      image: protectRightsImage1,
      title: "Why is Child Marriage Wrong",
      description: "Child marriage is a gross violation of human rights as it not only robs children of their childhood but leaves them vulnerable to violence, physical and mental abuse. Child marriages lead to disruption in education and in teenage pregnancies (mostly leading to higher risk and complications during childbirth) affecting the sexual health and development of the mother. With the well-being and future of the child bride and the lives and livelihood of her family at stake, eradication of this social injustice would have a direct impact on the welfare and prosperity of the wider population and nations."
    },
    {
      image: protectRightsImage3,
      title: "Why Child Marriage Happens",
      description: "Child marriage is rooted in gender inequality as girls are treated inferior to male children. Girls are denied their human rights such as access to education and health services. Laws protecting girls aren't enforced.\n\nStigma against premarital sex and unwanted pregnancies which is believed to bring shame and dishonor to the family forces girls to marry when they reach puberty. Poverty and insecurities lead families to marry girls early as it reduces financial burden on them.\n\nMarrying off girls early also means girls' families pay less dowry and the grooms' families bring in unpaid labor and servitude. Young girls are considered to be obedient and more hardworking. Old traditional practices like gauna, prevalent in Bihar, Uttar Pradesh and other states in India and the terai in Nepal force girls to marry as children."
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {panels.map((panel, index) => (
        <ProtectRightsPanel key={index} {...panel} />
      ))}
    </div>
  )
}

const CountryCard = ({ flag, country, description, frontDescription }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleCardClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFlipped(prev => !prev)
  }

  return (
    <div 
      className="group perspective-1000 h-[28rem] cursor-pointer touch-manipulation"
      onClick={handleCardClick}
      onTouchEnd={handleCardClick}
    >
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d md:group-hover:rotate-y-180 ${
        isFlipped ? 'rotate-y-180' : ''
      }`}>
        {/* Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="relative h-full">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>

            {/* Content Container */}
            <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl h-full shadow-lg border border-slate-100/30">
              <div className="h-full flex flex-col items-center justify-start pt-8 p-8">
                <div className="w-28 h-18 mb-8">
                  <img src={flag} alt={`${country} flag`} className="w-full h-full object-contain" />
                </div>
                <h3 className="text-3xl font-semibold text-gray-900 mb-12">{country}</h3>
                {frontDescription && (
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wider text-justify leading-relaxed">{frontDescription}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl shadow-lg border border-slate-100/30 overflow-hidden">
          <div className="relative h-full">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>

            {/* Subtle Logo Watermark */}
            <div
              className="absolute inset-0 bg-center bg-no-repeat rounded-3xl opacity-90"
              style={{
                backgroundImage: `url(${logoWatermark})`,
                backgroundSize: '500px 500px'
              }}
            ></div>

            {/* Content Container */}
            <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl h-full">
              <div className="h-full flex items-center justify-center p-8">
                <div className="max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                  <p className="text-gray-900 text-justify text-sm leading-relaxed font-medium whitespace-pre-line">{description}</p>
                </div>
              </div>
            </div>
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
      frontDescription: "Bangladesh continues to have one of the world's highest rates of child marriage, with nearly half of women aged 20–24 married before age 18 despite gradual progress over the last two decades.",
      description: "Poverty, school dropout, climate displacement, and concerns surrounding girls' safety remain major drivers, particularly in rural communities. The latest comprehensive and evidence-based report Accelerating Efforts to End Child Marriage, highlights three key pillars for accelerating progress: investing in girls' education, expanding health services to reduce adolescent pregnancy, and shifting harmful social norms. The report identifies Bangladesh as a leading example where targeted financial incentives and community interventions significantly reduced child marriage while generating measurable economic and social returns. UNICEF and development agencies warn that economic instability and reductions in global aid could slow recent gains, despite growing success from adolescent girls' programs and community-led advocacy."
    },
    {
      flag: flagIndia,
      country: "India",
      frontDescription: "According to UNICEF, India has reduced child marriage prevalence from 53% in 1996 to 23% in 2021, yet with 222 million child brides, it still accounts for one of the world's largest absolute numbers due to its population size.",
      description: "Child marriage remains concentrated in poorer rural regions (27% rural vs 15% urban), where gender inequality, economic insecurity, and limited educational opportunities persist—prevalence reaches 40% among the poorest households and 48% among girls with no schooling. An estimated 1.5 million girls under 18 are still married each year. The latest evidence-based report from Columbia SIPA emphasizes three pillars—girls' education, adolescent reproductive health, and social norm transformation—as essential to ending child marriage at scale. Several Indian states have intensified prevention campaigns through school monitoring systems, helplines, and local surveillance during traditional marriage seasons. Despite national progress, localized increases in child marriage cases continue to be reported in some states."
    },
    {
      flag: flagNepal,
      country: "Nepal",
      frontDescription: "According to UNICEF, 35% of women in Nepal were married before age 18 — significantly above the South Asian average of 25% — making it one of the highest rates in the region for a country of its size.",
      description: "With 5.4 million child brides and 1.5 million married before age 15, Nepal's prevalence is disproportionately high for a population of only 30 million. The rate reaches 52% among the poorest households and 72% among girls with no schooling. Enforcement gaps and longstanding social traditions continue to sustain the practice despite a legal minimum marriage age of 20. The latest evidence-based report from Columbia SIPA stresses that sustainable progress depends on three core pillars: expanding girls' education, strengthening adolescent health services, and changing the norms that perpetuate early marriage. Recent studies have revealed inconsistencies in how local authorities and courts interpret and implement child marriage laws. At the same time, youth-led advocacy movements and school-based interventions are increasingly helping delay marriage and keep girls in education."
    },
    {
      flag: flagUSA,
      country: "United States",
      frontDescription: "As of 2026, only 17 U.S. states and Washington, D.C. have fully banned child marriage — meaning 33 states still permit minors to marry through parental or judicial exceptions.",
      description: "Between 2000 and 2018, nearly 300,000 minors were married in the United States, with 86% being girls married to adult men. Three states—California, Mississippi, and New Mexico—still set no statutory minimum age for marriage at all. The states that have enacted full bans include Connecticut, Delaware, Massachusetts, Minnesota, New Jersey, New York, Pennsylvania, Vermont, Michigan, Rhode Island, Washington, Virginia, New Hampshire, Maine, Oregon, Missouri, and most recently Oklahoma in 2026. Child marriage is not solely a developing-world issue—the same pillars of education, health protections, and social norm change are critical in developed countries as well. Survivor-led organizations have increasingly reframed child marriage as a human rights and gender equality issue, and according to UNICEF-USA, the biggest barrier to ending the practice remains lack of public awareness and legislative will."
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {countries.map((country, index) => (
        <CountryCard key={country.country} {...country} />
      ))}
    </div>
  )
}

const SDGCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const sdgImages = [sdg1, sdg2, sdg3, sdg4, sdg5, sdg8, sdg10, sdg13, sdg16]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => prev + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>

      {/* Content Container */}
      <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-amber-100/30 overflow-hidden">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / 2)}%)` // Mobile: 2 cards
            }}
            onTransitionEnd={() => {
              if (currentIndex >= sdgImages.length) {
                // Instantly reset to beginning without animation
                setTimeout(() => {
                  setCurrentIndex(0)
                }, 50)
              }
            }}
          >
            {[...sdgImages, ...sdgImages].map((image, index) => (
              <div key={index} className="flex-shrink-0 w-1/2 sm:w-1/3 lg:w-1/6 px-2 sm:px-3">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={image}
                    alt={`SDG ${(index % sdgImages.length) + 1}`}
                    className="w-full h-auto rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center mt-4 sm:mt-6 space-x-2">
          {sdgImages.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex % sdgImages.length
                ? 'w-6 sm:w-8 bg-orange-500'
                : 'w-2 bg-gray-300'
                }`}
            />
          ))}
        </div>
      </div>
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
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-3xl"></div>

      {/* Content Container */}
      <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-orange-100/30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 38M Child Brides in Bangladesh */}
          <div ref={ref38M} className="text-center">
            <p className="text-base font-medium text-gray-600 uppercase tracking-wider mb-2">
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

const ChildMarriage = ({ onDonateClick }) => {

  return (
    <div className="min-h-screen">
      <SEO
        title="End Child Marriage Globally | Far Too Young"
        description="Far Too Young is a nonprofit working to end child marriage worldwide through education, advocacy, and community empowerment. Join the movement to protect children's rights."
        path="/"
      />
      {/* Hero Section with Background Image */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Image with Filters */}
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
            filter: 'grayscale(100%) sepia(25%) saturate(0.8) brightness(.55) contrast(1.0)',
            backgroundPosition: 'center 20%',
            backgroundSize: 'cover',
            minHeight: '100%',
            minWidth: '100%'
          }}
        ></div>
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium mb-4 sm:mb-6 lg:mb-8" style={{ color: '#f09819' }}>
            Restoring Hopes, Restoring Smiles ®
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-white mb-4 sm:mb-6 lg:mb-8 leading-relaxed max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto">
            Far Too Young envisions a society free from child, underage and forced marriages -
            a society where girls and women feel valued and reach their full potential.
          </p>

          <p className="text-sm sm:text-base text-white mb-6 sm:mb-8 lg:mb-12">
            Please Support Us.
          </p>

          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <button
              onClick={() => onDonateClick()}
              className="group/btn relative inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span>DONATE</span>
            </button>
          </div>

          <div className="text-xs sm:text-sm text-white/80 italic text-center space-y-1 max-w-xs sm:max-w-md lg:max-w-lg mx-auto">
            <p>Tax ID: 87-3583633</p>
            <p>Far Too Young is a United States 501(c)(3) Non-Profit Organization.</p>
            <p>Our work is supported entirely through donations. 100 percent of your contribution is tax deductible.</p>
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
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Title and Description */}
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-left text-gray-900 mb-6 sm:mb-8 leading-tight">A CHILD BRIDE</h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6 text-justify">
                Gender discrimination is embedded in the legal system and social structures; along with poverty, it is the root cause of child marriage. Globally, this illegal practice robs over 12 million girls yearly of their childhoods and forces them into marriages before adulthood, heavily impacting South Asia and sub-Saharan Africa. Specifically, every year 4 million girls under the age of 15 are victims of child, underage, and forced marriages in South Asia alone. This deprivation denies them their rights to education, reproductive healthcare, and consensual marriage.
              </p>

              {/* Subtle divider line */}
              <div className="w-full h-px bg-gray-400 mb-4 sm:mb-6"></div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-justify">
                Once married, child brides face lifelong servitude, domestic violence, pregnancy complications, and early childbirth mortality. They are also at a high risk of being trafficked or sold. Ultimately, child marriage reinforces the gendered nature of poverty and inflicts a staggering economic toll, costing the global economy an estimated $175 billion annually in lost productivity and healthcare expenses. By limiting a girl&#39;s education and skills, it diminishes her lifetime expected earnings, stunts her community, and restricts her country&#39;s economic development—hindering her throughout adulthood and into the next generation.
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
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-left text-gray-900 mb-6 sm:mb-8 leading-tight">HEAR RANJU, BINITA & HEMA</h2>

          {/* YouTube Video */}
          <div className="relative">
            {/* iPad Frame */}
            <div className="relative p-3 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl border border-gray-300 bg-gradient-to-r from-orange-200/20 via-purple-200/20 to-purple-300/20">
              {/* Screen */}
              <div className="relative bg-black rounded-[1rem] sm:rounded-[1.25rem] lg:rounded-[1.5rem] overflow-hidden shadow-inner">
                {/* Video Container */}
                <div className="w-full aspect-video">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/cHmHZO4F0qs"
                    title="Hear Ranju, Binita & Hema"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Home Button */}
              <div className="flex justify-center mt-3 sm:mt-4 lg:mt-6">
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-slate-200 rounded-full shadow-inner border-2 border-slate-400"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* South Asia Statistics Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single Line Separator */}
          <div className="w-full h-px bg-black mb-8"></div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-left text-gray-900 mb-12 lg:mb-16 leading-tight">
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
          <div className="hidden lg:block w-full h-px bg-black mb-6 lg:mb-8"></div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-left text-gray-900 mb-12 lg:mb-16 leading-tight">WHERE WE WORK</h2>

          {/* Flip Cards Grid */}
          <WhereWeWork />

        </div>
      </div>

      {/* Protect the Rights of the Girl Child Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single Line Separator */}
          <div className="hidden lg:block w-full h-px bg-black mb-8"></div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-left text-gray-900 mb-12 lg:mb-16 leading-tight">PROTECT THE RIGHTS OF THE GIRL CHILD</h2>

          {/* Panels Grid */}
          <ProtectRights />
        </div>
      </div>

      {/* SDG Goals Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single Line Separator */}
          <div className="w-full h-px bg-black mb-8"></div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-medium text-left text-gray-900 mb-12 lg:mb-16 leading-tight">IF WE DO NOT END CHILD MARRIAGE, NINE SUSTAINABLE DEVELOPMENT GOALS CANNOT BE MET</h2>

          {/* SDG Carousel */}
          <SDGCarousel />

        </div>
      </div>
    </div>
  )
}

ChildMarriage.propTypes = {
  onDonateClick: PropTypes.func.isRequired
}

export default ChildMarriage
