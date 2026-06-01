import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import defaultHero from '../assets/images/pages/what-we-do/carousel/nepal/IMG_0958.webp'

const BlogPost = ({ onDonateClick }) => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
        const res = await fetch(`${API_BASE_URL}/blog/posts/slug/${slug}`)
        const data = await res.json()
        if (data.success) setPost(data.post)
      } catch (err) {
        console.error('Error fetching post:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug])

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-white mb-4">Post not found</h1>
          <Link to="/blog" className="text-orange-400 hover:text-orange-300">← Back to Stories</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SEO
        title={`${post.title} | Far Too Young Stories`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
      />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div className="h-full bg-orange-500 transition-all duration-150" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      {/* Hero with Image */}
      <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url(${post.featured_image || defaultHero})`,
            filter: 'grayscale(100%) sepia(25%) saturate(0.8) brightness(.35) contrast(1.0)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        ></div>
        <div className="relative z-10 flex flex-col justify-end h-full pb-10 sm:pb-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
              <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>·</span>
              <span>{post.reading_time} min read</span>
              {post.category && (
                <>
                  <span>·</span>
                  <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full text-xs font-medium">{post.category}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">{post.title}</h1>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-gray-50">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">

          {/* Author + Share Row */}
          <div className="flex items-center justify-between mb-6 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {post.author?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{post.author}</p>
                <p className="text-xs text-gray-500">Founder, Far Too Young · Activist & Researcher</p>
              </div>
            </div>
            {/* Share Buttons */}
            <div className="flex items-center gap-3">
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://www.fartooyoung.org/blog/${post.slug}`)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.fartooyoung.org/blog/${post.slug}`)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.fartooyoung.org/blog/${post.slug}`)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Back link */}
          <Link to="/blog" className="text-sm text-orange-600 hover:text-orange-700 mb-8 inline-block">← Back to Stories</Link>

          {/* Content */}
          <div className="text-gray-700 text-lg leading-relaxed space-y-6">
            {post.content.split('\n').filter(p => p.trim()).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* FAQ Section */}
          {post.faq && post.faq.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {post.faq.map((item, i) => (
                  <div key={i}>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{item.question}</h3>
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="mt-10 p-6 bg-white border border-gray-200 rounded-xl">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">Stay updated on our work</h3>
                <p className="text-sm text-gray-500">Get stories and research delivered to your inbox monthly.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <input type="email" placeholder="Your email" className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 sm:w-48 focus:outline-none focus:border-orange-500" />
                <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">Subscribe</button>
              </div>
            </div>
          </div>

          {/* Donate CTA */}
          <div className="mt-8 relative p-6 sm:p-8 rounded-xl text-center overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/90"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-medium text-white mb-2">Help End Child Marriage</h3>
              <p className="text-gray-300 mb-4 text-sm">Your donation directly supports girls&apos; education and community programs.</p>
              <button onClick={onDonateClick} className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-medium text-sm">
                Donate Now
              </button>
            </div>
          </div>

          {/* Bottom back link */}
          <div className="mt-8 text-center">
            <Link to="/blog" className="text-sm text-orange-600 hover:text-orange-700 font-medium">← Back to Stories</Link>
          </div>

        </article>
      </div>
    </div>
  )
}

export default BlogPost
