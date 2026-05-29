import { useState, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import SEO from '../components/SEO'
import heroImage from '../assets/images/pages/what-we-do/Child-Bride-Mom.jpeg'
import joinMovementImage from '../assets/images/pages/what-we-do/fty-join-the-movement.png'
import storyImage1a from '../assets/images/pages/what-we-do/storytelling-for-advocacy/Father_Marshall_D._Moran-kBB_cIR_3-transformed.webp'
import storyImage1b from '../assets/images/pages/what-we-do/storytelling-for-advocacy/Fr.-Marshal-D-Moran-Color-Ham-Radio-BW.webp'
import storyImage2 from '../assets/images/pages/what-we-do/storytelling-for-advocacy/fty-the-film-collage.jpg'
import taraImage1 from '../assets/images/pages/what-we-do/the-tara-campaign/02-c.jpg'
import taraImage2 from '../assets/images/pages/what-we-do/the-tara-campaign/02-d.jpg'
import taraImage3 from '../assets/images/pages/what-we-do/the-tara-campaign/03-a.jpg'
import taraImage4 from '../assets/images/pages/what-we-do/the-tara-campaign/03-c.jpg'

// Nepal field photos — research and community engagement across Nepal
import img0709 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0709.webp'
import img0728 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0728.webp'
import img0731 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0731.webp'
import img0740 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0740.webp'
import img0742 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0742.webp'
import img0748 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0748.webp'
import img0749 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0749.webp'
import img0751 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0751.webp'
import img0752 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0752.webp'
import img0757 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0757.webp'
import img0758 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0758.webp'
import img0767 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0767.webp'
import img0770 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0770.webp'
import img0774 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0774.webp'
import img0775 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0775.webp'
import img0780 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0780.webp'
import img0800 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0800.webp'
import img0803 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0803.webp'
import img0808 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0808.webp'
import img0811 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0811.webp'
import img0812 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0812.webp'
import img0815 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0815.webp'
import img0819 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0819.webp'
import img0821 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0821.webp'
import img0827 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0827.webp'
import img0832 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0832.webp'
import img0833 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0833.webp'
import img0834 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0834.webp'
import img0837 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0837.webp'
import img0850 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0850.webp'
import img0851 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0851.webp'
import img0853 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0853.webp'
import img0856 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0856.webp'
import img0867 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0867.webp'
import img0897 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0897.webp'
import img0908 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0908.webp'
import img0910 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0910.webp'
import img0915 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0915.webp'
import img0916 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0916.webp'
import img0918 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0918.webp'
import img0919 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0919.webp'
import img0924 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0924.webp'
import img0930 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0930.webp'
import img0955 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0955.webp'
import img0956 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0956.webp'
import img0957 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0957.webp'
import img0958 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0958.webp'
import img0962 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0962.webp'
import img0972 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0972.webp'
import img0983 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0983.webp'
import photo1 from '../assets/images/pages/what-we-do/carousel/nepal/PHOTO-2024-10-16-09-10-16.webp'
import photo2 from '../assets/images/pages/what-we-do/carousel/nepal/PHOTO-2024-10-16-09-10-17-3.webp'
import photo3 from '../assets/images/pages/what-we-do/carousel/nepal/PHOTO-2024-10-16-09-10-19-2.webp'
import photo4 from '../assets/images/pages/what-we-do/carousel/nepal/PHOTO-2024-10-16-09-10-20-2.webp'
import photo5 from '../assets/images/pages/what-we-do/carousel/nepal/PHOTO-2024-10-16-09-10-21-3.webp'
import photo6 from '../assets/images/pages/what-we-do/carousel/nepal/PHOTO-2024-10-16-09-10-22-3.webp'
import photo7 from '../assets/images/pages/what-we-do/carousel/nepal/PHOTO-2024-10-16-09-11-44.webp'
import photo8 from '../assets/images/pages/what-we-do/carousel/nepal/PHOTO-2024-10-16-09-11-45-2.webp'

// Bangladesh field photos — collaboration with VISCOM (Visual Communication Ltd.)
// Source: Far Too Young research phase, key areas in Bangladesh
import bdFilmScreening1 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/1-community-film-screening/DSC08205.JPG'
import bdFilmScreening2 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/1-community-film-screening/DSC08296.JPG'
import bdFilmScreening3 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/1-community-film-screening/DSC08299.JPG'
import bdInteraction1 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/2-interactions-with-community-members/DSC03870.JPG'
import bdInteraction2 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/2-interactions-with-community-members/DSC05334.JPG'
import bdInteraction3 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/2-interactions-with-community-members/DSC05354.JPG'
import bdClassroom1 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/3-classroom-interaction/DSCN8359.JPG'
import bdClassroom2 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/3-classroom-interaction/DSCN8756.JPG'
import bdClassroom3 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/3-classroom-interaction/IMG_4500.JPG'
import bdFocusGroup1 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/4-focus-group-discussions/DOT_WHASH_Koyra_038 (1 of 1).jpg'
import bdFocusGroup2 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/4-focus-group-discussions/SA_Ab. Gani. pri. school  (11).jpg'
import bdFocusGroup3 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/4-focus-group-discussions/SA_Ab. Gani. pri. school  (4).jpg'
import bdTraining1 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/5-training-and-education/DSCN3491.JPG'
import bdTraining2 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/5-training-and-education/DSCN8153.JPG'
import bdTraining3 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/5-training-and-education/WP_20141221_087.jpg'

const WhatWeDo = ({ onDonateClick }) => {
  const [zoomedImage, setZoomedImage] = useState(null)

  // Counter animation component
  const Counter = ({ end, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef()

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true)
          }
        },
        { threshold: 0.1 }
      )

      if (ref.current) {
        observer.observe(ref.current)
      }

      return () => observer.disconnect()
    }, [isVisible])

    useEffect(() => {
      if (!isVisible) return

      let startTime
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)

        setCount(Math.floor(progress * end))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }, [isVisible, end, duration])

    return (
      <div ref={ref} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4">
        {count.toLocaleString()}{suffix}
      </div>
    )
  }

  // Carousel images array
  const imageArray = [
    { src: img0709, name: 'Community Engagement' },
    { src: img0728, name: 'Educational Workshop' },
    { src: img0731, name: 'Awareness Program' },
    { src: img0740, name: 'Youth Empowerment' },
    { src: img0742, name: 'Skills Training' },
    { src: img0748, name: 'Health Education' },
    { src: img0749, name: 'Community Outreach' },
    { src: img0751, name: 'Women Empowerment' },
    { src: img0752, name: 'Educational Support' },
    { src: img0757, name: 'Counseling Session' },
    { src: img0758, name: 'Community Workshop' },
    { src: img0767, name: 'Awareness Campaign' },
    { src: img0770, name: 'Youth Program' },
    { src: img0774, name: 'Educational Initiative' },
    { src: img0775, name: 'Community Support' },
    { src: img0780, name: 'Skills Development' },
    { src: img0800, name: 'Empowerment Session' },
    { src: img0803, name: 'Community Meeting' },
    { src: img0808, name: 'Educational Program' },
    { src: img0811, name: 'Awareness Workshop' },
    { src: img0812, name: 'Youth Engagement' },
    { src: img0815, name: 'Community Outreach' },
    { src: img0819, name: 'Educational Support' },
    { src: img0821, name: 'Skills Training' },
    { src: img0827, name: 'Women Empowerment' },
    { src: img0832, name: 'Community Workshop' },
    { src: img0833, name: 'Awareness Program' },
    { src: img0834, name: 'Educational Initiative' },
    { src: img0837, name: 'Youth Program' },
    { src: img0850, name: 'Community Support' },
    { src: img0851, name: 'Skills Development' },
    { src: img0853, name: 'Empowerment Session' },
    { src: img0856, name: 'Educational Workshop' },
    { src: img0867, name: 'Community Engagement' },
    { src: img0897, name: 'Awareness Campaign' },
    { src: img0908, name: 'Youth Empowerment' },
    { src: img0910, name: 'Community Meeting' },
    { src: img0915, name: 'Educational Support' },
    { src: img0916, name: 'Skills Training' },
    { src: img0918, name: 'Women Empowerment' },
    { src: img0919, name: 'Community Workshop' },
    { src: img0924, name: 'Awareness Program' },
    { src: img0930, name: 'Educational Initiative' },
    { src: img0955, name: 'Youth Program' },
    { src: img0956, name: 'Community Support' },
    { src: img0957, name: 'Skills Development' },
    { src: img0958, name: 'Empowerment Session' },
    { src: img0962, name: 'Educational Workshop' },
    { src: img0972, name: 'Community Engagement' },
    { src: img0983, name: 'Awareness Campaign' },
    { src: photo1, name: 'Field Work Documentation' },
    { src: photo2, name: 'Community Impact' },
    { src: photo3, name: 'Program Implementation' },
    { src: photo4, name: 'Educational Outreach' },
    { src: photo5, name: 'Community Development' },
    { src: photo6, name: 'Awareness Activities' },
    { src: photo7, name: 'Youth Engagement' },
    { src: photo8, name: 'Empowerment Programs' },
    // Bangladesh — VISCOM partnership
    { src: bdFilmScreening1, name: 'Community Film Screening - Bangladesh' },
    { src: bdFilmScreening2, name: 'Community Film Screening - Bangladesh' },
    { src: bdFilmScreening3, name: 'Community Film Screening - Bangladesh' },
    { src: bdInteraction1, name: 'Community Interaction - Bangladesh' },
    { src: bdInteraction2, name: 'Community Interaction - Bangladesh' },
    { src: bdInteraction3, name: 'Community Interaction - Bangladesh' },
    { src: bdClassroom1, name: 'Classroom Interaction - Bangladesh' },
    { src: bdClassroom2, name: 'Classroom Interaction - Bangladesh' },
    { src: bdClassroom3, name: 'Classroom Interaction - Bangladesh' },
    { src: bdFocusGroup1, name: 'Focus Group Discussion - Bangladesh' },
    { src: bdFocusGroup2, name: 'Focus Group Discussion - Bangladesh' },
    { src: bdFocusGroup3, name: 'Focus Group Discussion - Bangladesh' },
    { src: bdTraining1, name: 'Training & Education - Bangladesh' },
    { src: bdTraining2, name: 'Training & Education - Bangladesh' },
    { src: bdTraining3, name: 'Training & Education - Bangladesh' }
  ]

  // Shuffle images once per page visit
  const shuffledImages = useMemo(() => {
    const arr = [...imageArray]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [])

  // Crossfade logic — auto every 3s or triggered by See More
  const [visibleImages, setVisibleImages] = useState(shuffledImages.slice(0, 4))
  const [prevImages, setPrevImages] = useState(shuffledImages.slice(0, 4))
  const [fadingCells, setFadingCells] = useState([false, false, false, false])
  const nextIndexRef = useRef(4)
  const isAnimatingRef = useRef(false)
  const autoTimerRef = useRef(null)
  const visibleImagesRef = useRef(visibleImages)

  useEffect(() => {
    visibleImagesRef.current = visibleImages
  }, [visibleImages])

  const runFadeSequence = () => {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true

    const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5)

    order.forEach((cellIndex, step) => {
      setTimeout(() => {
        setPrevImages(() => [...visibleImagesRef.current])
        setFadingCells(prev => { const u = [...prev]; u[cellIndex] = true; return u })
        setTimeout(() => {
          setVisibleImages(prev => {
            const u = [...prev]
            u[cellIndex] = shuffledImages[nextIndexRef.current % shuffledImages.length]
            nextIndexRef.current++
            return u
          })
          setFadingCells(prev => { const u = [...prev]; u[cellIndex] = false; return u })
          if (step === 3) isAnimatingRef.current = false
        }, 1500)
      }, step * 1500)
    })
  }

  useEffect(() => {
    const initial = setTimeout(() => runFadeSequence(), 3000)
    autoTimerRef.current = setInterval(() => {
      runFadeSequence()
    }, 7500) // 6s sequence + 1.5s pause between cycles
    return () => {
      clearInterval(autoTimerRef.current)
      clearTimeout(initial)
    }
  }, [shuffledImages])

  const resumeTimerRef = useRef(null)
  const clickDeckRef = useRef([])
  const clickStarted = useRef(false)

  const handleSeeMore = () => {
    // Stop auto fade
    clearInterval(autoTimerRef.current)
    clearTimeout(resumeTimerRef.current)
    isAnimatingRef.current = false
    setFadingCells([false, false, false, false])

    // On first click, create a shuffled deck of all images
    if (!clickStarted.current || clickDeckRef.current.length === 0) {
      clickStarted.current = true
      const deck = [...imageArray]
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]
      }
      clickDeckRef.current = deck
    }

    // Take next 4 from the shuffled deck
    const newImages = clickDeckRef.current.splice(0, 4)
    // If less than 4 remaining, pad from a fresh shuffle
    if (newImages.length < 4) {
      const deck = [...imageArray]
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]
      }
      clickDeckRef.current = deck
      while (newImages.length < 4) {
        newImages.push(clickDeckRef.current.shift())
      }
    }

    setPrevImages(newImages)
    setVisibleImages(newImages)

    // Resume auto fade after 5s of no clicks
    resumeTimerRef.current = setTimeout(() => {
      clickStarted.current = false
      autoTimerRef.current = setInterval(() => {
        runFadeSequence()
      }, 7500)
    }, 5000)
  }

  return (
    <div className="min-h-screen">
      <SEO
        title="What We Do | Far Too Young"
        description="Learn how Far Too Young fights child marriage through education, justice, community engagement, storytelling, and multi-pronged advocacy across South Asia."
        path="/what-we-do"
      />
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
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
            filter: 'grayscale(100%) sepia(25%) saturate(0.8) brightness(.6) contrast(1.0)',
            backgroundPosition: 'center 30%',
            backgroundSize: 'cover',
            minHeight: '100%',
            minWidth: '100%'
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end items-start h-full pb-16 sm:pb-24 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white">
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

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-left text-gray-900 mb-6 lg:mb-8 leading-tight">Far Too Young<br /><span className="text-xl sm:text-2xl lg:text-3xl">A Child Bride's Song</span></h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="border border-gray-300 rounded-lg p-4 shadow-sm h-full flex flex-col justify-start">
              <div className="text-base sm:text-lg leading-snug text-gray-700 italic"
                style={{
                  fontFamily: 'Lora, serif',
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
                <p className="text-sm text-gray-500 mt-4 not-italic">© Far Too Young, Inc.</p>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-lg shadow-xl border-2 border-gray-300 p-2 bg-gradient-to-br from-teal-200/20 via-pink-200/20 to-purple-300/20">
                <div className="bg-white rounded-lg overflow-hidden shadow-inner h-full">
                  <img
                    src={joinMovementImage}
                    alt="Join the Movement"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SoundCloud Player Section */}
          <div className="mt-8 lg:mt-12">
            <div className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-200">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">🎵 Listen to the Poem Above</h3>
                <p className="text-gray-600 text-sm">Experience the words as a song</p>
              </div>
              <div className="w-full">
                {/* SoundCloud embed iframe will go here */}
                <iframe
                  width="100%"
                  height="200"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/far-too-young/far-too-young-new-final-version-effects-will-be-added&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                  className="rounded-lg min-h-[180px] sm:min-h-[200px]"
                  style={{ minHeight: '180px' }}
                >
                </iframe>
              </div>

              {/* Donate Button */}
              <div className="mt-4 sm:mt-6">
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
      </div>

      {/* Multi-Pronged Approach Section */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4 lg:mb-6 underline decoration-2 underline-offset-8">Our Multi-Pronged Approach</h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Helping reduce and eventually eradicate child marriage and save the child brides from harm.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
      <div className="bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4 lg:mb-6 underline decoration-2 underline-offset-8">Our Presence</h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Locations across South Asia where we work to end child marriage.
            </p>
          </div>

          {/* Map Card */}
          <div className="relative p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl border border-gray-300 bg-gradient-to-br from-orange-200/20 via-purple-200/20 to-purple-300/20">
            <div className="relative bg-white rounded-[1rem] sm:rounded-[1.25rem] lg:rounded-[1.5rem] overflow-hidden shadow-inner">
              <iframe
                src="https://www.google.com/maps/d/u/0/embed?mid=1ymaVHjK-zm-DYGNl6btbiPcJA9JJ-Nc&ehbc=2E312F&noprof=1"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full sm:h-[500px] lg:h-[600px]"
              ></iframe>
            </div>
          </div>

          {/* Country Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8 lg:mt-12">
            {/* Nepal */}
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-blue-500">
              <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                Nepal
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Doti
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Banke
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Nawalpur District
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Gorkha
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Rautahat
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
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
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Nilphamari
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2" style={{ fill: '#c2195b' }} viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Gazipur
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2" style={{ fill: '#c2195b' }} viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Dhaka
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2" style={{ fill: '#c2195b' }} viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
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
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Uttar Pradesh
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-orange-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Jharkhand
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-orange-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Bihar
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-3 h-3 mr-2 fill-orange-500" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Chhattisgarh
                </div>
              </div>
            </div>
          </div>

          {/* Work Showcase Carousel */}
          <div className="mt-12 lg:mt-16">
            <div className="text-center mb-8 lg:mb-12">
              <h3 className="text-2xl sm:text-3xl font-medium text-gray-900 mb-3 lg:mb-4">Our Work in Action</h3>
              <p className="text-base sm:text-lg text-gray-600">Documenting our impact across communities.</p>
            </div>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {visibleImages.map((image, index) => (
                <div
                  key={index}
                  className="rounded-lg shadow-xl border-2 border-gray-300 p-2 bg-gradient-to-br from-teal-200/20 via-pink-200/20 to-purple-300/20"
                >
                  <div className="relative bg-white rounded-lg overflow-hidden shadow-inner aspect-[4/3]">
                    <img
                      src={prevImages[index]?.src}
                      alt={prevImages[index]?.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <img
                      src={image.src}
                      alt={image.name}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ${fadingCells[index] ? 'opacity-0' : 'opacity-100'}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* See More Button */}
            <div className="text-center mt-6">
              <button
                onClick={handleSeeMore}
                className="px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors shadow-md"
              >
                See More
              </button>
            </div>
          </div>
        </div>

        {/* Donate Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => onDonateClick()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-4 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 rounded-full"
          >
            DONATE NOW
          </button>
        </div>
      </div>

      {/* Story-telling for Advocacy Section */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4 lg:mb-6 underline decoration-2 underline-offset-8">Story-telling for Advocacy</h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Real stories that drive change and inspire action against child marriage.
            </p>
          </div>

          {/* Story 1 - Image Left, Text Right */}
          <div className="mb-16 lg:mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="relative space-y-3">
                {/* First Image - Ham Radio */}
                <div className="aspect-[3/2] rounded-lg shadow-xl border-2 border-gray-300 p-2 bg-gradient-to-br from-teal-200/20 via-pink-200/20 to-purple-300/20">
                  <div className="bg-white rounded-lg overflow-hidden shadow-inner h-full">
                    <img
                      src={storyImage1b}
                      alt="Father Marshal D Moran with Ham Radio"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Second Image - Portrait */}
                <div className="aspect-[3/2] rounded-lg shadow-xl border-2 border-gray-300 p-2 bg-gradient-to-br from-teal-200/20 via-pink-200/20 to-purple-300/20">
                  <div className="bg-white rounded-lg overflow-hidden shadow-inner h-full">
                    <img
                      src={storyImage1a}
                      alt="Father Marshall D. Moran"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-6 border border-gray-300 rounded-lg p-6 shadow-sm h-full flex flex-col justify-start">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-medium text-red-600 underline decoration-2 underline-offset-4">Honoring Father Moran</h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                  Father Marshall D. Moran, a pioneering American Jesuit priest, transformed education in Nepal through his belief that quality education protects and empowers children. In 1951, he founded St. Xavier&#39;s School in Godavari, Kathmandu, expanding access to high school and college education for boys and girls from all socioeconomic backgrounds, while also supporting girls from marginalized communities to attend schools across Nepal. Father Moran believed that education brings knowledge, health awareness, dignity, empowerment, and the ability to challenge harmful social norms that place children at risk.
                </p>
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                  A renowned Ham Radio operator with the call sign 9N1MM, he also mobilized global networks to support humanitarian efforts across Nepal and Asia. His lifelong commitment to education led to the establishment of several schools that provided opportunities to countless children who would otherwise have been denied the fundamental right to education.
                </p>
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                  In honor of his enduring legacy, Far Too Young, Inc. continues to advance the importance of quality education through the Fr. Moran Education Fund with its partners. The initiative provides scholarships and small financial grants to help marginalized boys and girls complete high school, protecting them from exploitation, abuse, gender-based violence, and harmful practices such as child marriage. Thousands of children and their families across Nepal have benefited from the fund.
                </p>
              </div>
            </div>
          </div>

          {/* Story 2 - Text Left, Image Right */}
          <div className="mb-16 lg:mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6 border border-gray-300 rounded-lg p-6 shadow-sm lg:order-1 h-full flex flex-col justify-start">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-medium text-red-600 underline decoration-2 underline-offset-4">Far Too Young - The Film</h3>
                <p className="text-sm sm:text-base leading-snug text-gray-600 italic mb-4"
                  style={{
                    fontFamily: 'Lora, serif',
                    letterSpacing: '0.5px',
                    lineHeight: '1.4'
                  }}>
                  'In every classroom, in every community, in every country of the world'
                </p>
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                  Following years of research and screenplay development based on actual case studies, an educational feature film centered on the fundamental right to education and the urgent fight against all forms of Gender-Based Violence, with a particular focus on the devastating impact of child marriage, is poised to enter full production in the near future.
                </p>
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                  Upon completion, this impactful film will be widely disseminated across diverse global audiences through a multi-lingual distribution strategy, aiming to raise awareness and inspire action towards a more equitable and just society.
                </p>
              </div>
              <div className="relative lg:order-2">
                <div className="aspect-[4/5] rounded-lg shadow-xl border-2 border-gray-300 p-2 bg-gradient-to-br from-teal-200/20 via-pink-200/20 to-purple-300/20">
                  <div className="bg-white rounded-lg overflow-hidden shadow-inner h-full">
                    <img
                      src={storyImage2}
                      alt="Far Too Young - The Film Collage"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Story 3 - Image Left, Text Right */}
          <div className="mb-8 lg:mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="relative">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {/* Top Left Image */}
                  <div className="aspect-square rounded-lg shadow-xl border-2 border-gray-300 p-2 bg-gradient-to-br from-teal-200/20 via-pink-200/20 to-purple-300/20 cursor-pointer" onClick={() => setZoomedImage(taraImage1)}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-inner h-full">
                      <img
                        src={taraImage1}
                        alt="Tara Campaign Comic 1"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Top Right Image */}
                  <div className="aspect-square rounded-lg shadow-xl border-2 border-gray-300 p-2 bg-gradient-to-br from-teal-200/20 via-pink-200/20 to-purple-300/20 cursor-pointer" onClick={() => setZoomedImage(taraImage2)}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-inner h-full">
                      <img
                        src={taraImage2}
                        alt="Tara Campaign Comic 2"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Bottom Left Image */}
                  <div className="aspect-square rounded-lg shadow-xl border-2 border-gray-300 p-2 bg-gradient-to-br from-teal-200/20 via-pink-200/20 to-purple-300/20 cursor-pointer" onClick={() => setZoomedImage(taraImage3)}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-inner h-full">
                      <img
                        src={taraImage3}
                        alt="Tara Campaign Comic 3"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Bottom Right Image */}
                  <div className="aspect-square rounded-lg shadow-xl border-2 border-gray-300 p-2 bg-gradient-to-br from-teal-200/20 via-pink-200/20 to-purple-300/20 cursor-pointer" onClick={() => setZoomedImage(taraImage4)}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-inner h-full">
                      <img
                        src={taraImage4}
                        alt="Tara Campaign Comic 4"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 border border-gray-300 rounded-lg p-6 shadow-sm h-full flex flex-col justify-start">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-medium text-red-600 underline decoration-2 underline-offset-4">The Tara Campaign</h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                  The Tara Campaign uses illustrations and comic for awareness and advocacy. It tells the story of Tara, a child bride and a young mother who now fights against all forms of Gender Based Violence including child, underage and forced marriages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Target for 2026 | 2027 Section */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4 lg:mb-6 underline decoration-2 underline-offset-8">Our Target for 2026 | 2027</h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Strategic goals and milestones for advancing our mission against child marriage.
            </p>
          </div>

          {/* Target content - 3x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Target 1 */}
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.5s_forwards] border border-orange-200 min-h-[200px] flex flex-col justify-center">
              <Counter end={20} suffix="M+" />
              <p className="text-gray-600 text-sm">Reach people through awareness and advocacy against child marriage in communities and countries.</p>
            </div>

            {/* Target 2 */}
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_1s_forwards] border border-orange-200 min-h-[200px] flex flex-col justify-center">
              <Counter end={6000} suffix="+" />
              <p className="text-gray-600 text-sm">Provide additional scholarships to keep girl children in school.</p>
            </div>

            {/* Target 3 */}
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_1.5s_forwards] border border-orange-200 min-h-[200px] flex flex-col justify-center">
              <Counter end={4000} suffix="+" />
              <p className="text-gray-600 text-sm">Provide vocational skills to young brides.</p>
            </div>

            {/* Target 4 */}
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_2s_forwards] border border-orange-200 min-h-[200px] flex flex-col justify-center">
              <Counter end={20000} suffix="+" />
              <p className="text-gray-600 text-sm">Provide additional counselling to young brides.</p>
            </div>

            {/* Target 5 */}
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_2.5s_forwards] border border-orange-200 min-h-[200px] flex flex-col justify-center">
              <Counter end={1200} suffix="+" />
              <p className="text-gray-600 text-sm">Form new partnerships and local bodies.</p>
            </div>

            {/* Target 6 */}
            <div className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_3s_forwards] border border-orange-200 min-h-[200px] flex flex-col justify-center">
              <Counter end={1800} suffix="+" />
              <p className="text-gray-600 text-sm">Partnership and programs in new schools.</p>
            </div>
          </div>
        </div>

        {/* Donate Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => onDonateClick()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 lg:px-12 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 rounded-full"
          >
            DONATE NOW
          </button>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setZoomedImage(null)}>
          <div className="relative max-w-4xl max-h-screen p-4">
            <img
              src={typeof zoomedImage === 'string' ? zoomedImage : zoomedImage.src}
              alt={typeof zoomedImage === 'string' ? 'Zoomed image' : zoomedImage.name}
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

WhatWeDo.propTypes = {
  onDonateClick: PropTypes.func.isRequired
}

export default WhatWeDo
