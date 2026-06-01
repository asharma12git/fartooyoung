import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import heroImage from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0958.webp'
import placeholderImg from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/2-interactions-with-community-members/DSC05334.JPG'
import img2 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/3-classroom-interaction/DSCN8756.JPG'
import img3 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0740.webp'
import img4 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/1-community-film-screening/DSC08296.JPG'
import img5 from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0827.webp'
import img6 from '../assets/images/pages/what-we-do/carousel/bangladesh-viscom/5-training-and-education/DSCN3491.JPG'

const placeholderImages = [placeholderImg, img2, img3, img4, img5, img6]

const categories = ['All', 'Education', 'Health', 'Norms & Culture', 'Policy & Justice', 'Research', 'Climate & Crisis']

const Blog = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
        const res = await fetch(`${API_BASE_URL}/blog/posts`)
        const data = await res.json()
        if (data.success) setPosts(data.posts)
      } catch (err) {
        console.error('Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <div className="min-h-screen">
      <SEO
        title="Stories | Far Too Young"
        description="Articles about child marriage prevention, gender-based violence, girls' education, and advocacy. Stay informed about our work to protect children's rights."
        path="/blog"
      />

      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
            filter: 'grayscale(100%) sepia(25%) saturate(0.8) brightness(.55) contrast(1.0)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            minHeight: '100%',
            minWidth: '100%'
          }}
        ></div>
        <div className="relative z-10 flex flex-col justify-end items-start h-full pb-16 sm:pb-24 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white">Stories That Matter</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Category Tabs + Month Nav */}
          <div className="flex items-end border-b border-gray-200 mb-8">
            <div className="flex-1 flex justify-between overflow-x-auto scrollbar-hide pr-6">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveFilter(cat); setCurrentMonthIndex(0) }}
                  className={`pb-3 text-base font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeFilter === cat
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex items-center justify-center gap-2 pb-3 pl-8 border-l border-gray-300 w-72">
              <button
                onClick={() => setCurrentMonthIndex(prev => Math.min(prev + 1, Math.max((posts.length > 0 ? 10 : 0) - 1, 0)))}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
              >
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-sm font-medium text-orange-600 min-w-[100px] text-center">{(() => { const filteredPosts = activeFilter === 'All' ? posts : posts.filter(p => p.category === activeFilter); const months = {}; filteredPosts.forEach(p => { const d = new Date(p.published_at); const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; if(!months[k]) months[k]=[]; months[k].push(p); }); const sorted = Object.keys(months).sort().reverse(); const cur = sorted[currentMonthIndex]; return cur ? new Date(cur+'-01').toLocaleDateString('en-US',{month:'short',year:'numeric'}) : ''; })()}</span>
              <button
                onClick={() => setCurrentMonthIndex(prev => Math.max(prev - 1, 0))}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
              >
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              {currentMonthIndex > 0 && (
                <button onClick={() => setCurrentMonthIndex(0)} className="text-xs text-orange-600 font-medium ml-1 hover:text-orange-700">Latest</button>
              )}
            </div>
          </div>

          {(() => {
            const filteredPosts = activeFilter === 'All' ? posts : posts.filter(p => p.category === activeFilter)
            
            // Group posts by month
            const months = {}
            filteredPosts.forEach(post => {
              const date = new Date(post.published_at)
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              if (!months[key]) months[key] = []
              months[key].push(post)
            })
            const sortedMonths = Object.keys(months).sort().reverse()
            const currentMonth = sortedMonths[currentMonthIndex] || sortedMonths[0]
            const monthPosts = months[currentMonth] || []
            const monthLabel = currentMonth ? new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''

            return (
            <>
              {/* Grid + Sidebar */}
              <div className="flex flex-col lg:flex-row gap-0">

                {/* Posts Grid */}
                <div className="flex-1 pr-0 lg:pr-8">
                  {loading ? (
                    <div className="text-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    </div>
                  ) : monthPosts.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-gray-500 text-lg">No posts in this category yet.</p>
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 [&>*:nth-last-child(-n+2)]:border-b-0">
                    {monthPosts.map((post, index) => (
                      <Link
                        key={post.post_id}
                        to={`/blog/${post.slug}`}
                        className="flex gap-4 py-5 border-b border-gray-300 group px-4 md:odd:border-r md:odd:border-r-gray-300"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            {post.category && (
                              <span className="text-orange-600 font-semibold uppercase">{post.category}</span>
                            )}
                            <span>·</span>
                            <span>{post.reading_time} min read</span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-1">{post.title}</h3>
                          <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>
                          <p className="text-xs text-gray-400 mt-2">{post.author} · {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="w-24 h-20 sm:w-28 sm:h-20 flex-shrink-0 rounded overflow-hidden">
                          <img
                            src={post.featured_image || placeholderImages[index % placeholderImages.length]}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="w-full lg:w-72 lg:sticky lg:top-8 lg:self-start lg:border-l lg:border-gray-300 lg:pl-8">

                  {/* Latest Research */}
                  <div className="pb-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Latest Research</h3>
                    <div className="space-y-3">
                      <a href="https://www.unicef.org/protection/child-marriage" target="_blank" rel="noopener noreferrer" className="block group">
                        <p className="text-sm text-gray-900 group-hover:text-orange-600 transition-colors leading-snug">Child Marriage – Overview & Data</p>
                        <p className="text-xs text-gray-400 mt-0.5">UNICEF · 2026</p>
                      </a>
                      <a href="https://www.who.int/news/item/23-04-2025-who-releases-new-guideline-to-prevent-adolescent-pregnancies-and-improve-girls--health" target="_blank" rel="noopener noreferrer" className="block group">
                        <p className="text-sm text-gray-900 group-hover:text-orange-600 transition-colors leading-snug">Preventing Adolescent Pregnancies</p>
                        <p className="text-xs text-gray-400 mt-0.5">WHO · Apr 2025</p>
                      </a>
                      <a href="https://www.girlsnotbrides.org/en/learning-resources/resource-centre/international-funding-end-child-marriage-2015-2024-report/" target="_blank" rel="noopener noreferrer" className="block group">
                        <p className="text-sm text-gray-900 group-hover:text-orange-600 transition-colors leading-snug">Funding to End Child Marriage: Decade Review</p>
                        <p className="text-xs text-gray-400 mt-0.5">Girls Not Brides · Mar 2026</p>
                      </a>
                      <a href="https://igp.sipa.columbia.edu/news/child-marriage-human-rights-crisis-and-costs-world-175-billion-year-new-research-provides" target="_blank" rel="noopener noreferrer" className="block group">
                        <p className="text-sm text-gray-900 group-hover:text-orange-600 transition-colors leading-snug">Accelerating Efforts to End Child Marriage</p>
                        <p className="text-xs text-gray-400 mt-0.5">Columbia SIPA · Mar 2026</p>
                      </a>
                      <a href="https://www.nature.com/articles/d41586-026-00720-8" target="_blank" rel="noopener noreferrer" className="block group">
                        <p className="text-sm text-gray-900 group-hover:text-orange-600 transition-colors leading-snug">Child Marriage Reduced 80% in Nigeria</p>
                        <p className="text-xs text-gray-400 mt-0.5">Nature · 2026</p>
                      </a>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-300 my-6"></div>

                  {/* Newsletter */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Stay Informed</h3>
                    <p className="text-xs text-gray-500 mb-3">Updates on our work, delivered monthly.</p>
                    <input
                      type="email"
                      placeholder="Your email"
                      className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-orange-500 mb-2"
                    />
                    <button className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                      Subscribe
                    </button>
                  </div>

                </aside>
              </div>
            </>
          )
          })()}

          {/* Top Research */}
          <div className="border-t border-gray-300 mt-8 pt-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-8">Top Research</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
              {[
                { num: 1, title: 'Accelerating Efforts to End Child Marriage', source: 'COLUMBIA SIPA', date: 'Mar 2026', url: 'https://igp.sipa.columbia.edu/news/child-marriage-human-rights-crisis-and-costs-world-175-billion-year-new-research-provides' },
                { num: 2, title: 'Marriage of Adolescent Girls Reduced by 80% in Nigeria', source: 'NATURE', date: '2026', url: 'https://www.nature.com/articles/d41586-026-00720-8' },
                { num: 3, title: 'International Funding to End Child Marriage: A Decade Review', source: 'GIRLS NOT BRIDES', date: 'Mar 2026', url: 'https://www.girlsnotbrides.org/en/learning-resources/resource-centre/international-funding-end-child-marriage-2015-2024-report/' },
                { num: 4, title: 'Protecting Progress: Impact of Funding Cuts on Ending Child Marriage', source: 'UNFPA / UNICEF', date: 'Nov 2025', url: 'https://www.unicef.org/documents/protecting-progress-global-impact-funding-cuts-ending-child-marriage-0' },
                { num: 5, title: 'Bangladesh: 39% Surge in Child Marriage Due to Climate Change', source: 'IRC', date: 'Dec 2023', url: 'https://www.rescue.org/press-release/bangladesh-irc-study-reveals-staggering-39-surge-child-marriage-due-climate-change' },
                { num: 6, title: 'Meta-analysis of Evidence on Child Marriage in South Asia', source: 'UNICEF ROSA', date: 'Dec 2024', url: 'https://www.unicef.org/rosa/reports/meta-synthesis-and-meta-analysis-evidence-child-marriage-south-asia' },
                { num: 7, title: 'Prevalence of Intimate Partner Violence Among Child Marriage Victims', source: 'THE LANCET', date: 'Mar 2025', url: 'https://www.thelancet.com/journals/eclinm/article/PIIS2589-5370(25)00016-1/fulltext' },
                { num: 8, title: 'The Investment Case for Prevention in South-East Asia', source: 'UNFPA', date: 'Mar 2025', url: 'https://asiapacific.unfpa.org/en/publications/technical-brief-investment-case-prevention-adolescent-pregnancy-and-child-marriage' },
              ].map(item => (
                <a key={item.num} href={item.url} target="_blank" rel="noopener noreferrer" className="flex gap-4 group">
                  <span className="text-2xl font-bold text-gray-200 leading-none">{item.num}</span>
                  <div>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-1">{item.source} <span className="text-gray-400 font-normal">· {item.date}</span></p>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors leading-snug">{item.title}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blog
