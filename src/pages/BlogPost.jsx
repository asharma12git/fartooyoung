import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEO from '../components/SEO'

const BlogPost = () => {
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

  // Scroll progress bar
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-gray-900 mb-4">Post not found</h1>
          <Link to="/blog" className="text-orange-600 hover:text-orange-700">← Back to blog</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${post.title} | Far Too Young Stories`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
      />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div className="h-full bg-orange-500 transition-all duration-150" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back link */}
        <Link to="/blog" className="text-sm text-gray-500 hover:text-orange-600 mb-8 inline-block">← Back to blog</Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span>{post.reading_time} min read</span>
            {post.category && (
              <>
                <span>·</span>
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">{post.category}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 leading-tight">{post.title}</h1>
        </header>

        {/* Author */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
            {post.author?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{post.author}</p>
            <p className="text-xs text-gray-500">Founder, Far Too Young</p>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {post.content}
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

        {/* Donate CTA */}
        <div className="mt-12 p-6 sm:p-8 bg-gray-900 rounded-xl text-center">
          <h3 className="text-xl font-medium text-white mb-2">Help End Child Marriage</h3>
          <p className="text-gray-300 mb-4">Your donation directly supports girls' education and community programs.</p>
          <Link to="/" className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-medium">
            Donate Now
          </Link>
        </div>

        {/* Keywords/Tags */}
        {post.keywords && post.keywords.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.keywords.map((kw, i) => (
              <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{kw}</span>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}

export default BlogPost
