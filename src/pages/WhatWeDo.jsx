import { useState } from 'react'
import heroImage from '../assets/images/pages/what-we-do/Child-Bride-Mom.jpeg'
import joinMovementImage from '../assets/images/pages/what-we-do/fty-join-the-movement.png'
import DonationModal from '../components/DonationModal'

const WhatWeDo = () => {
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [selectedAreas, setSelectedAreas] = useState([])

  const toggleArea = (area) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    )
  }
  return (
    <div className="min-h-screen">
      <style jsx>{`
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
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.5s_forwards]">
              <div className="text-3xl font-bold text-orange-500 mb-4">01</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Education</h3>
              <p className="text-gray-600 text-sm">Ensuring educational facilities to every girl. Providing scholarships to stay in schools.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_1s_forwards]">
              <div className="text-3xl font-bold text-orange-500 mb-4">02</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Justice</h3>
              <p className="text-gray-600 text-sm">Assisting local authorities to implement the law and reiterate it within communities.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_1.5s_forwards]">
              <div className="text-3xl font-bold text-orange-500 mb-4">03</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Engage</h3>
              <p className="text-gray-600 text-sm">Engaging with and supporting community based organizations in their work to bring about changes.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_2s_forwards]">
              <div className="text-3xl font-bold text-orange-500 mb-4">04</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Mobilize</h3>
              <p className="text-gray-600 text-sm">Involving men and mobilizing communities and families to change their perception and keep children safe and women free from violence and abuse.</p>
            </div>
            
            {/* Second Row */}
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_2.5s_forwards]">
              <div className="text-3xl font-bold text-orange-500 mb-4">05</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Awareness</h3>
              <p className="text-gray-600 text-sm">Increasing awareness and advocacy programs at local, national and international levels.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_3s_forwards]">
              <div className="text-3xl font-bold text-orange-500 mb-4">06</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Empowerment</h3>
              <p className="text-gray-600 text-sm">Empowering girls and women and enabling them to make their own choices.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_3.5s_forwards]">
              <div className="text-3xl font-bold text-orange-500 mb-4">07</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Counselling</h3>
              <p className="text-gray-600 text-sm">Counselling child brides and helping to break the vicious cycle.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_4s_forwards]">
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
              Locations across South Asia where we work to end child marriage
            </p>
          </div>
          
          <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-orange-100/30 overflow-hidden">
            {/* Map Container */}
            <div className="relative w-full h-[500px] rounded-lg border-2 border-gray-300 overflow-hidden">
              
              {/* Google Maps Embed */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7252937.594936147!2d77.2090212!3d23.5937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30635ff06b92b791%3A0xd78c4fa1854213a6!2sIndia!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              ></iframe>
              
              {/* Hide Google Maps UI elements */}
              <div className="absolute top-0 left-0 w-48 h-16 bg-transparent pointer-events-none" style={{backdropFilter: 'blur(8px)'}}></div>
              
              {/* Blinking Country Markers */}
              <div className="absolute inset-0 pointer-events-none">
                
                {/* Nepal Marker - Blue (Kathmandu) - moved NE */}
                <div className="absolute top-16 left-1/2 transform translate-x-6 pointer-events-auto">
                  <div className="w-5 h-5 bg-blue-600/70 rounded-full border-2 border-white shadow-lg animate-ping"></div>
                  <div className="absolute top-0 left-0 w-5 h-5 bg-blue-600/70 rounded-full border-2 border-white shadow-lg"></div>
                </div>
                
                {/* India Marker - Red (New Delhi) */}
                <div className="absolute top-52 left-1/3 transform translate-x-20 pointer-events-auto">
                  <div className="w-5 h-5 bg-red-600/70 rounded-full border-2 border-white shadow-lg animate-ping"></div>
                  <div className="absolute top-0 left-0 w-5 h-5 bg-red-600/70 rounded-full border-2 border-white shadow-lg"></div>
                </div>
                
                {/* Bangladesh Marker - Orange (Dhaka) */}
                <div className="absolute top-44 right-1/4 transform -translate-x-24 pointer-events-auto">
                  <div className="w-5 h-5 bg-orange-600/70 rounded-full border-2 border-white shadow-lg animate-ping"></div>
                  <div className="absolute top-0 left-0 w-5 h-5 bg-orange-600/70 rounded-full border-2 border-white shadow-lg"></div>
                </div>

                {/* Dynamic Area Dots */}
                {selectedAreas.includes('Doti') && (
                  <div className="absolute top-16 left-1/2 transform -translate-x-8">
                    <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Sukhet') && (
                  <div className="absolute top-18 left-1/2 transform translate-x-4">
                    <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Banke') && (
                  <div className="absolute top-22 left-1/2 transform -translate-x-4">
                    <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Rupandehi') && (
                  <div className="absolute top-24 left-1/2 transform translate-x-8">
                    <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Nawalparasi') && (
                  <div className="absolute top-26 left-1/2 transform -translate-x-6">
                    <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Makwanpur') && (
                  <div className="absolute top-28 left-1/2 transform translate-x-6">
                    <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Gorkha') && (
                  <div className="absolute top-30 left-1/2 transform -translate-x-10">
                    <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Sindhupalchok') && (
                  <div className="absolute top-32 left-1/2 transform translate-x-10">
                    <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Rutahat') && (
                  <div className="absolute top-34 left-1/2 transform -translate-x-2">
                    <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Dhanusa') && (
                  <div className="absolute top-36 left-1/2 transform translate-x-2">
                    <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}

                {/* India Area Dots */}
                {selectedAreas.includes('Uttar Pradesh') && (
                  <div className="absolute top-40 left-1/2 transform -translate-x-8">
                    <div className="w-4 h-4 bg-red-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Bihar') && (
                  <div className="absolute top-44 left-1/2 transform translate-x-4">
                    <div className="w-4 h-4 bg-red-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Bilphamari') && (
                  <div className="absolute top-48 left-1/2 transform -translate-x-4">
                    <div className="w-4 h-4 bg-red-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Jharkhand') && (
                  <div className="absolute top-52 left-1/2 transform translate-x-8">
                    <div className="w-4 h-4 bg-red-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Chattisgarh') && (
                  <div className="absolute top-56 left-1/2 transform -translate-x-6">
                    <div className="w-4 h-4 bg-red-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}

                {/* Bangladesh Area Dots */}
                {selectedAreas.includes('Gazipur') && (
                  <div className="absolute top-28 right-1/4 transform -translate-x-4">
                    <div className="w-4 h-4 bg-orange-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Dhaka') && (
                  <div className="absolute top-32 right-1/4 transform translate-x-2">
                    <div className="w-4 h-4 bg-orange-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
                {selectedAreas.includes('Rangpur') && (
                  <div className="absolute top-36 right-1/4 transform -translate-x-2">
                    <div className="w-4 h-4 bg-orange-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Areas Grid Table */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Nepal Areas */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Nepal</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div 
                    onClick={() => toggleArea('Doti')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Doti') ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-50 hover:bg-blue-100'}`}
                  >
                    Doti
                  </div>
                  <div 
                    onClick={() => toggleArea('Sukhet')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Sukhet') ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-50 hover:bg-blue-100'}`}
                  >
                    Sukhet
                  </div>
                  <div 
                    onClick={() => toggleArea('Banke')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Banke') ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-50 hover:bg-blue-100'}`}
                  >
                    Banke
                  </div>
                  <div 
                    onClick={() => toggleArea('Rupandehi')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Rupandehi') ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-50 hover:bg-blue-100'}`}
                  >
                    Rupandehi
                  </div>
                  <div 
                    onClick={() => toggleArea('Nawalparasi')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Nawalparasi') ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-50 hover:bg-blue-100'}`}
                  >
                    Nawalparasi
                  </div>
                  <div 
                    onClick={() => toggleArea('Makwanpur')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Makwanpur') ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-50 hover:bg-blue-100'}`}
                  >
                    Makwanpur
                  </div>
                  <div 
                    onClick={() => toggleArea('Gorkha')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Gorkha') ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-50 hover:bg-blue-100'}`}
                  >
                    Gorkha
                  </div>
                  <div 
                    onClick={() => toggleArea('Sindhupalchok')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Sindhupalchok') ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-50 hover:bg-blue-100'}`}
                  >
                    Sindhupalchok
                  </div>
                  <div 
                    onClick={() => toggleArea('Rutahat')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Rutahat') ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-50 hover:bg-blue-100'}`}
                  >
                    Rutahat
                  </div>
                  <div 
                    onClick={() => toggleArea('Dhanusa')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Dhanusa') ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-50 hover:bg-blue-100'}`}
                  >
                    Dhanusa
                  </div>
                </div>
              </div>
              
              {/* India Areas */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-lg mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-900">India</h3>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                  <div 
                    onClick={() => toggleArea('Uttar Pradesh')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Uttar Pradesh') ? 'bg-red-200 border-2 border-red-400' : 'bg-red-50 hover:bg-red-100'}`}
                  >
                    Uttar Pradesh
                  </div>
                  <div 
                    onClick={() => toggleArea('Bihar')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Bihar') ? 'bg-red-200 border-2 border-red-400' : 'bg-red-50 hover:bg-red-100'}`}
                  >
                    Bihar
                  </div>
                  <div 
                    onClick={() => toggleArea('Bilphamari')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Bilphamari') ? 'bg-red-200 border-2 border-red-400' : 'bg-red-50 hover:bg-red-100'}`}
                  >
                    Bilphamari
                  </div>
                  <div 
                    onClick={() => toggleArea('Jharkhand')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Jharkhand') ? 'bg-red-200 border-2 border-red-400' : 'bg-red-50 hover:bg-red-100'}`}
                  >
                    Jharkhand
                  </div>
                  <div 
                    onClick={() => toggleArea('Chattisgarh')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Chattisgarh') ? 'bg-red-200 border-2 border-red-400' : 'bg-red-50 hover:bg-red-100'}`}
                  >
                    Chattisgarh
                  </div>
                </div>
              </div>
              
              {/* Bangladesh Areas */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-orange-600 rounded-full border-2 border-white shadow-lg mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Bangladesh</h3>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                  <div 
                    onClick={() => toggleArea('Gazipur')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Gazipur') ? 'bg-orange-200 border-2 border-orange-400' : 'bg-orange-50 hover:bg-orange-100'}`}
                  >
                    Gazipur
                  </div>
                  <div 
                    onClick={() => toggleArea('Dhaka')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Dhaka') ? 'bg-orange-200 border-2 border-orange-400' : 'bg-orange-50 hover:bg-orange-100'}`}
                  >
                    Dhaka
                  </div>
                  <div 
                    onClick={() => toggleArea('Rangpur')}
                    className={`py-1 px-2 rounded cursor-pointer transition-colors ${selectedAreas.includes('Rangpur') ? 'bg-orange-200 border-2 border-orange-400' : 'bg-orange-50 hover:bg-orange-100'}`}
                  >
                    Rangpur
                  </div>
                </div>
              </div>
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
