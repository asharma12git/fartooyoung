import heroImage from '../assets/images/pages/what-we-do/Child-Bride-Mom.jpeg'
import joinMovementImage from '../assets/images/pages/what-we-do/fty-join-the-movement.png'

const WhatWeDo = () => {
  return (
    <div className="min-h-screen">
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
        </div>
      </div>
    </div>
  )
}

export default WhatWeDo
