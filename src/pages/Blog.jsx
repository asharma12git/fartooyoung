import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import heroImage from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0958.webp'

const categories = ['All', 'Education', 'Health', 'Norms & Culture', 'Policy & Justice', 'Research', 'Climate & Crisis']

const categoryGradients = {
  'Education': 'from-blue-500 to-blue-700',
  'Health': 'from-green-500 to-emerald-700',
  'Norms & Culture': 'from-teal-500 to-teal-700',
  'Policy & Justice': 'from-purple-500 to-purple-700',
  'Policy': 'from-purple-500 to-purple-700',
  'Research': 'from-slate-600 to-slate-800',
  'Climate & Crisis': 'from-orange-500 to-red-600',
  'Climate': 'from-orange-500 to-red-600',
  'Advocacy': 'from-amber-500 to-amber-700',
  'Statistics': 'from-indigo-500 to-indigo-700',
}

const categoryShortNames = {
  'Education': 'Education',
  'Health': 'Health',
  'Norms & Culture': 'Norms',
  'Policy & Justice': 'Policy',
  'Research': 'Research',
  'Climate & Crisis': 'Climate',
  'Climate': 'Climate',
  'Policy': 'Policy',
  'Advocacy': 'Advocacy',
  'Statistics': 'Stats',
}

const CategoryPlaceholder = ({ category }) => {
  const gradient = categoryGradients[category] || 'from-gray-500 to-gray-700'
  const shortLabel = categoryShortNames[category] || category || 'Article'
  const fullLabel = category || 'Article'
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center p-1`}>
      <span className="text-white/80 text-[8px] font-bold uppercase tracking-wider text-center leading-tight xl:hidden">{shortLabel}</span>
      <span className="text-white/80 text-[9px] font-bold uppercase tracking-wider text-center leading-tight hidden xl:block">{fullLabel}</span>
    </div>
  )
}

const Blog = () => {
  const [posts, setPosts] = useState([])
  const [research, setResearch] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(null) // null = latest

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
        const [postsRes, researchRes] = await Promise.all([
          fetch(`${API_BASE_URL}/blog/posts`),
          fetch(`${API_BASE_URL}/research/articles`)
        ])
        const postsData = await postsRes.json()
        const researchData = await researchRes.json()
        if (postsData.success) setPosts(postsData.posts)
        if (researchData.success) setResearch(researchData.articles)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen">
      <SEO
        title="Stories | Far Too Young"
        description="Articles about child marriage prevention, gender-based violence, girls' education, and advocacy. Stay informed about our work to protect children's rights."
        path="/blog"
      />

      {/* Hero Section */}
      <div className="relative h-[60vh] sm:h-[70vh] lg:h-screen overflow-hidden">
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
      <div className="bg-gray-50 pt-12 sm:pt-16 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Category Tabs + Month Nav */}
          {/* Category Tabs */}
          {/* Mobile/iPad: dropdown */}
          <div className="xl:hidden mb-4 flex items-center gap-3">
            <select
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value); setCurrentMonth(null) }}
              className="flex-1 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="Latest Research">Latest Research</option>
            </select>
          </div>
          {/* Desktop: tabs */}
          <div className="hidden xl:flex items-center border-b border-gray-200 mb-4">
            <div className="flex-1 flex items-center gap-2 lg:gap-3 xl:justify-between mr-4 lg:mr-8 xl:mr-12 overflow-x-auto">
              {categories.map((cat, i) => (
                <div key={cat} className="flex items-center gap-2 lg:gap-3 xl:gap-4">
                  {i > 0 && <span className="hidden xl:block h-4 w-px bg-gray-300 mb-3"></span>}
                  <button
                    onClick={() => { setActiveFilter(cat); setCurrentMonth(null) }}
                    className={`pb-3 text-xs lg:text-sm xl:text-base font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeFilter === cat
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                </div>
              ))}
            </div>
            {/* Orange divider + Latest Research - aligned with right panel */}
            <div className="hidden xl:flex items-center w-80 pl-8 flex-shrink-0 border-l border-orange-500">
              <button
                onClick={() => { setActiveFilter('Latest Research'); setCurrentMonth(null) }}
                className={`pb-3 text-sm sm:text-base font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeFilter === 'Latest Research'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-orange-600'
                }`}
              >
                Latest Research
              </button>
            </div>
          </div>

          {/* Latest Research Full View (when tab is active) */}
          {activeFilter === 'Latest Research' ? (
            <div className="space-y-4">
              {research.map(article => (
                <a key={article.article_id} href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-100 transition group">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors leading-snug">{article.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{article.source} · {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              ))}
            </div>
          ) : (
          <>
          {/* Main layout: Left content + Right panel */}
          <div className="flex flex-col xl:flex-row">
            {/* Left side */}
            <div className="flex-1 pr-0 xl:pr-8">
              {/* Year + Month Tabs */}
              {(() => {
                const filteredPosts = activeFilter === 'All' ? posts : posts.filter(p => p.category === activeFilter)
                const monthsMap = {}
                filteredPosts.forEach(p => {
                  const k = p.published_at ? p.published_at.slice(0, 7) : ''
                  if (k && !monthsMap[k]) monthsMap[k] = []
                  if (k) monthsMap[k].push(p)
                })
                const allMonthKeys = Object.keys(monthsMap).sort()
                const years = [...new Set(allMonthKeys.map(k => k.slice(0, 4)))].sort()
                const monthsInYear = allMonthKeys.filter(k => k.startsWith(String(currentYear)))
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                const activeMonthKey = currentMonth || monthsInYear[monthsInYear.length - 1] || ''

                return (
                  <div className="flex items-center gap-4 mb-6">
                    {/* Year dropdown */}
                    <select
                      value={currentYear}
                      onChange={(e) => { setCurrentYear(parseInt(e.target.value)); setCurrentMonth(null) }}
                      className="text-sm font-medium text-orange-600 bg-transparent border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    {/* Month tabs */}
                    <div className="flex items-center gap-4 overflow-x-auto">
                      {monthsInYear.map((mk, i) => {
                        const monthNum = parseInt(mk.slice(5, 7)) - 1
                        return (
                          <div key={mk} className="flex items-center gap-4">
                            {i > 0 && <span className="h-3 w-px bg-gray-200"></span>}
                            <button
                              onClick={() => setCurrentMonth(mk)}
                              className={`text-sm font-medium transition-colors border-b-2 pb-1 whitespace-nowrap ${
                                activeMonthKey === mk
                                  ? 'border-orange-500 text-orange-600'
                                  : 'border-transparent text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              {monthNames[monthNum]}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Blog Posts */}
              {(() => {
                const filteredPosts = activeFilter === 'All' ? posts : posts.filter(p => p.category === activeFilter)
                const months = {}
                filteredPosts.forEach(post => {
                  const key = post.published_at ? post.published_at.slice(0, 7) : ''
                  if (key && !months[key]) months[key] = []
                  if (key) months[key].push(post)
                })
                const monthsInYear = Object.keys(months).filter(k => k.startsWith(String(currentYear))).sort()
                const activeMonthKey = currentMonth || monthsInYear[monthsInYear.length - 1] || ''
                const monthPosts = months[activeMonthKey] || []

                return loading ? (
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
                          <div className="flex items-center gap-2 text-xs text-orange-600 mb-1">
                            <span>{post.reading_time || 3} min read</span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-1">{post.title}</h3>
                          <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>
                          <p className="text-xs text-gray-400 mt-2">{post.author} · {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="w-20 h-16 lg:w-24 lg:h-20 xl:w-28 xl:h-20 flex-shrink-0 rounded overflow-hidden">
                          {post.image_url ? (
                            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                          ) : (
                            <CategoryPlaceholder category={post.category} />
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              })()}

              {/* Mobile/iPad: Latest Research (hidden on desktop) */}
              <div className="xl:hidden border-t border-gray-300 mt-8 pt-8">
                <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wide mb-4">Latest Research</h3>
                <div className="space-y-3 mb-6">
                  {research.slice(0, 10).map(article => (
                    <a key={article.article_id} href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 group">
                      <span className="text-orange-400 mt-1.5 text-[6px]">●</span>
                      <div>
                        <p className="text-sm text-gray-900 group-hover:text-orange-600 transition-colors leading-snug">{article.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{article.source} · {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="border-t border-gray-300 pt-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Stay Informed</h3>
                  <p className="text-xs text-gray-500 mb-3">Updates on our work, delivered monthly.</p>
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-orange-500 mb-2"
                  />
                  <button onClick={(e) => { e.preventDefault(); e.target.closest('div').querySelector('.newsletter-msg').classList.remove('hidden') }} className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    Subscribe
                  </button>
                  <p className="newsletter-msg hidden text-xs text-orange-600 mt-2">Thank you for your interest! Our newsletter is launching soon. Please check back shortly.</p>
                </div>
              </div>

              {/* Top Research */}
              <div className="border-t border-gray-300 mt-8 pt-8">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-8">Top Research</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                  {research.slice(0, 10).map((article, i) => (
                    <a key={article.article_id} href={article.url} target="_blank" rel="noopener noreferrer" className="flex gap-4 group">
                      <span className="text-2xl font-bold text-gray-200 leading-none">{i + 1}</span>
                      <div>
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-1">{article.source} <span className="text-gray-400 font-normal">· {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span></p>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors leading-snug">{article.title}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden xl:block w-px bg-gray-300 flex-shrink-0"></div>

            {/* Right Panel */}
            <div className="hidden xl:flex xl:flex-col w-80 pl-8 flex-shrink-0">
              <div className="sticky top-8">
              {/* Research Articles */}
              <div className="flex-1">
                <div className="space-y-3">
                  {research.slice(0, 10).map(article => (
                    <a key={article.article_id} href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 group">
                      <span className="text-orange-400 mt-1.5 text-[6px]">●</span>
                      <div>
                        <p className="text-sm text-gray-900 group-hover:text-orange-600 transition-colors leading-snug">{article.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{article.source} · {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Stay Informed */}
              <div className="border-t border-gray-300 pt-6 mt-8">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Stay Informed</h3>
                <p className="text-xs text-gray-500 mb-3">Updates on our work, delivered monthly.</p>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-orange-500 mb-2"
                />
                <button onClick={(e) => { e.preventDefault(); e.target.closest('div').querySelector('.newsletter-msg').classList.remove('hidden') }} className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                  Subscribe
                </button>
                <p className="newsletter-msg hidden text-xs text-orange-600 mt-2">Thank you for your interest! Our newsletter is launching soon. Please check back shortly.</p>
              </div>
              </div>
            </div>
          </div>

          {/* Full-width horizontal divider */}
          <div className="h-px bg-gray-300 mt-8"></div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Blog
