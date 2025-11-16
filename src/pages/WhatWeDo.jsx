import { useState, useEffect } from 'react'
import heroImage from '../assets/images/pages/what-we-do/Child-Bride-Mom.jpeg'
import joinMovementImage from '../assets/images/pages/what-we-do/fty-join-the-movement.png'
import DonationModal from '../components/DonationModal'

// Import carousel images
import carouselImage1 from '../assets/images/pages/what-we-do/carousel/FTY-MV-82-scaled.jpg'
import carouselImage2 from '../assets/images/pages/what-we-do/carousel/FTY-MV-81.jpg'
import carouselImage3 from '../assets/images/pages/what-we-do/carousel/FTY-MV-84.jpg'

const WhatWeDo = () => {
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Carousel images array
  const imageArray = [
    { src: carouselImage1, name: 'Community Workshop' },
    { src: carouselImage2, name: 'Education Program' },
    { src: carouselImage3, name: 'Awareness Campaign' }
  ]
  
  const totalSlides = Math.ceil(imageArray.length / 2)
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  // Auto-play carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [totalSlides])
  return (
    <div className="min-h-screen">
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      {/* Hero Section with Background Image */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Image with Filters */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            filter: 'grayscale(100%) sepia(25%) saturate(0.8) brightness(.6) contrast(1.0)',
            backgroundPosition: 'center 30%'
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end items-start h-full pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h2 className="text-4xl font-medium text-white">
              What We Do
            </h2>
          </div>
        </div>
      </div>

      {/* FAR TOO YOUNG Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="w-full h-0.5 bg-black mb-1"></div>
            <div className="w-full h-0.5 bg-black"></div>
          </div>
          
          <h2 className="text-4xl font-medium text-left text-gray-900 mb-8 leading-tight">FAR TOO YOUNG</h2>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="flex items-center justify-center h-full">
              <div className="space-y-6 border border-gray-300 rounded-lg p-6 shadow-sm">
              <div className="text-lg leading-snug text-gray-700 italic" 
                   style={{
                     fontFamily: 'Dancing Script, cursive',
                     letterSpacing: '0.5px',
                     lineHeight: '1.4'
                   }}>
                <p className="mb-3">I was far too young to be a bride,<br />
                Can't you see, can't you see,<br />
                I am still a child?<br />
                You sent me away to be a wife<br />
                To a man unknown to spend my life.</p>
                
                <p className="mb-3">It was time for learning and for play,<br />
                Time to do the things, my way.<br />
                So much more, I had to grow,<br />
                Why did you have to let me go?</p>
                
                <p className="mb-3">Mother, father, what despair<br />
                Turned me from your loving care,<br />
                Worked and threatened, torn apart,<br />
                Pain and sorrow broke my heart.</p>
                
                <p className="mb-3">I was far too young to bear a child<br />
                So crushed, so weak, I nearly died.</p>
                
                <p className="mb-4">I sing this song for all to hear,<br />
                I ask for help from far and near,<br />
                Please keep us children safe,<br />
                Please stop this curse,<br />
                Before this gets much too worse...</p>
              </div>
              
              {/* SoundCloud Player Placeholder */}
              <div className="mt-8">
                {/* SoundCloud embed will go here */}
              </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center h-full">
              <img 
                src={joinMovementImage} 
                alt="Join the Movement" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            </div>
          </div>
          
          {/* SoundCloud Player Section */}
          <div className="mt-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-medium text-gray-800 mb-2">🎵 Listen to the Poem Above</h3>
                <p className="text-gray-600 text-sm">Experience the words as a song</p>
              </div>
              <div className="w-full">
                {/* SoundCloud embed iframe will go here */}
                <iframe 
                  width="100%" 
                  height="166" 
                  scrolling="no" 
                  frameBorder="no" 
                  allow="autoplay"
                  src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/far-too-young/far-too-young-new-final-version-effects-will-be-added&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                  className="rounded-lg"
                >
                </iframe>
              </div>
              
              {/* Donate Button */}
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowDonationModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-4 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 rounded-full"
                >
                  DONATE NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Pronged Approach Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium text-gray-900 mb-6 underline decoration-2 underline-offset-8">Our Multi-Pronged Approach</h2>
            <p className="text-xl text-gray-600 whitespace-nowrap">
              Helping reduce and eventually eradicate child marriage and save the child brides from harm.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* First Row */}
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.5s_forwards] border border-orange-200">
              <div className="text-3xl font-bold text-orange-500 mb-4">01</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Education</h3>
              <p className="text-gray-600 text-sm">Ensuring educational facilities to every girl. Providing scholarships to stay in schools.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_1s_forwards] border border-orange-200">
              <div className="text-3xl font-bold text-orange-500 mb-4">02</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Justice</h3>
              <p className="text-gray-600 text-sm">Assisting local authorities to implement the law and reiterate it within communities.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_1.5s_forwards] border border-orange-200">
              <div className="text-3xl font-bold text-orange-500 mb-4">03</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Engage</h3>
              <p className="text-gray-600 text-sm">Engaging with and supporting community based organizations in their work to bring about changes.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_2s_forwards] border border-orange-200">
              <div className="text-3xl font-bold text-orange-500 mb-4">04</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Mobilize</h3>
              <p className="text-gray-600 text-sm">Involving men and mobilizing communities and families to change their perception and keep children safe and women free from violence and abuse.</p>
            </div>
            
            {/* Second Row */}
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_2.5s_forwards] border border-orange-200">
              <div className="text-3xl font-bold text-orange-500 mb-4">05</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Awareness</h3>
              <p className="text-gray-600 text-sm">Increasing awareness and advocacy programs at local, national and international levels.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_3s_forwards] border border-orange-200">
              <div className="text-3xl font-bold text-orange-500 mb-4">06</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Empowerment</h3>
              <p className="text-gray-600 text-sm">Empowering girls and women and enabling them to make their own choices.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_3.5s_forwards] border border-orange-200">
              <div className="text-3xl font-bold text-orange-500 mb-4">07</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Counselling</h3>
              <p className="text-gray-600 text-sm">Counselling child brides and helping to break the vicious cycle.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_4s_forwards] border border-orange-200">
              <div className="text-3xl font-bold text-orange-500 mb-4">08</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Poverty Reduction</h3>
              <p className="text-gray-600 text-sm">Providing vocational skills and job opportunities to increase means of earning.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Presence Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium text-gray-900 mb-6 underline decoration-2 underline-offset-8">Our Presence</h2>
            <p className="text-xl text-gray-600">
              Locations across South Asia where we work to end child marriage.
            </p>
          </div>
          
          {/* Map Card */}
          <div className="relative p-8 rounded-[2.5rem] shadow-2xl border border-gray-300" style={{ background: 'linear-gradient(135deg, rgba(22, 160, 133, 0.15) 0%, rgba(244, 208, 63, 0.15) 100%), linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
            <div className="relative bg-white rounded-[1.5rem] overflow-hidden shadow-inner">
              <iframe
                src="https://www.google.com/maps/d/u/0/embed?mid=1ymaVHjK-zm-DYGNl6btbiPcJA9JJ-Nc&ehbc=2E312F&noprof=1"
                width="100%"
                height="600"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              ></iframe>
            </div>
          </div>

          {/* Country Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Nepal */}
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-blue-500">
              <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                Nepal
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Doti
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Banke
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Nawalpur District
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Gorkha
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Rautahat
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Dhanusa
                </div>
              </div>
            </div>

            {/* Bangladesh */}
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4" style={{ borderLeftColor: '#c2195b' }}>
              <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: '#c2195b' }}></div>
                Bangladesh
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2" style={{ fill: '#c2195b' }} viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Nilphamari
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2" style={{ fill: '#c2195b' }} viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Gazipur
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2" style={{ fill: '#c2195b' }} viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Dhaka
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2" style={{ fill: '#c2195b' }} viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Rangpur
                </div>
              </div>
            </div>

            {/* India */}
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-orange-500">
              <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                India
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-orange-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Uttar Pradesh
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-orange-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Jharkhand
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-orange-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Bihar
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-orange-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Chhattisgarh
                </div>
              </div>
            </div>
          </div>

          {/* Work Showcase Carousel */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-medium text-gray-900 mb-4">Our Work in Action</h3>
              <p className="text-lg text-gray-600">Documenting our impact across communities.</p>
            </div>
            
            {/* Carousel Container */}
            <div className="relative p-6 rounded-[2rem] shadow-2xl border border-gray-300" style={{ background: 'linear-gradient(135deg, rgba(22, 160, 133, 0.15) 0%, rgba(244, 208, 63, 0.15) 100%), linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {imageArray.slice(currentSlide * 2, currentSlide * 2 + 2).map((image, index) => (
                  <div key={index} className="relative bg-white rounded-[1rem] overflow-hidden shadow-inner aspect-[4/3]">
                    <img 
                      src={image.src} 
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                
                {/* Fill empty slots if odd number of images */}
                {imageArray.slice(currentSlide * 2, currentSlide * 2 + 2).length === 1 && (
                  <div className="relative bg-white rounded-[1rem] overflow-hidden shadow-inner aspect-[4/3]">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg">Add more images</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Carousel Controls */}
              {totalSlides > 1 && (
                <div className="flex justify-center mt-6 space-x-4">
                  <button 
                    onClick={prevSlide}
                    className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-600">‹</span>
                  </button>
                  <div className="flex space-x-2 items-center">
                    {Array.from({ length: totalSlides }, (_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full ${i === currentSlide ? 'bg-orange-500' : 'bg-gray-300'}`}
                      ></div>
                    ))}
                  </div>
                  <button 
                    onClick={nextSlide}
                    className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-600">›</span>
                  </button>
                </div>
              )}
            </div>
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

export default WhatWeDo
