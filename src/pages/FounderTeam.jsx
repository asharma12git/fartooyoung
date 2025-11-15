import heroImage from '../assets/images/pages/founder-team/Avinash-Sharma.jpg'
import signatureImage from '../assets/images/pages/founder-team/Signature.png'

const FounderTeam = () => {
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
          
          {/* Letter Content */}
          <div className="w-full">
            <div className="relative">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-100 via-blue-50 via-purple-50 to-pink-100 rounded-3xl"></div>
              
              {/* Content Container */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-16 shadow-2xl border border-white/50">
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
                    <div className="w-[28rem] h-64 -ml-16">
                      <img src={signatureImage} alt="Avinash Sharma signature" className="w-full h-full object-contain object-left" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content will be added here */}
          
        </div>
      </div>
    </div>
  )
}

export default FounderTeam
