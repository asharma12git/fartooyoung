import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const Blog = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

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
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Stories | Far Too Young"
        description="Articles about child marriage prevention, gender-based violence, girls' education, and advocacy. Stay informed about our work to protect children's rights."
        path="/blog"
      />

      {/* Hero */}
      <div className="bg-gray-900 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-4">Stories</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">Stories, statistics, and insights from our work to end child marriage and gender-based violence globally.</p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map(post => (
              <Link
                key={post.post_id}
                to={`/blog/${post.slug}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
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
                  <h2 className="text-xl sm:text-2xl font-medium text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">{post.title}</h2>
                  <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span>By {post.author}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Blog
