import { useState } from 'react'
import heroImage from '../assets/images/pages/what-we-do/Child-Bride-Mom.jpeg'
import joinMovementImage from '../assets/images/pages/what-we-do/fty-join-the-movement.png'
import DonationModal from '../components/DonationModal'

const WhatWeDo = () => {
  const [showDonationModal, setShowDonationModal] = useState(false)
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
              Locations across South Asia where we work to end child marriage
            </p>
          </div>
          
          {/* Map Card */}
          <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl transition-all duration-300 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-8">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
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
