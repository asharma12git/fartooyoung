import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('research')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { navigate('/dashboard'); return }
    const parsed = JSON.parse(userData)
    if (parsed.role !== 'admin') { navigate('/dashboard'); return }
    setLoading(false)
  }, [navigate])

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><p className="text-white/50">Loading...</p></div>

  return (
    <div className="min-h-screen bg-black/60 backdrop-blur-sm">
      {/* Nav spacer */}
      <div className="h-44 border-b border-orange-500/50"></div>

      {/* Body content */}
      <div className="max-w-[90rem] mx-auto px-6 sm:px-8 py-12">
        {/* Header row */}
        <div className="flex items-end justify-between mb-10">
          <h1 className="text-2xl font-light text-white tracking-wide">Admin Panel</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/20 transition-all duration-300 active:scale-95 active:opacity-90">
            ← Donor Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-10 pb-4">
          {['research', 'posts'].map((tab, i) => (
            <div key={tab} className="flex items-center gap-6">
              {i > 0 && <div className="h-4 w-px bg-white/20"></div>}
              <button
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-1 transition-all border-b-2 ${
                  activeTab === tab
                    ? 'border-orange-500 text-white'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                {tab === 'research' ? 'Research Articles' : 'Blog Posts'}
              </button>
            </div>
          ))}
        </div>

        {/* Info guide */}
        {activeTab === 'research' && (
          <div className="mb-8 border border-orange-500/30 rounded-lg p-4 bg-orange-500/5">
            <p className="text-orange-300/90 text-xs font-medium mb-2">How Research Articles Work</p>
            <ol className="text-white/50 text-xs space-y-1 list-decimal list-inside">
              <li>Every <span className="text-white/70">Monday at 10am UTC</span>, our system automatically fetches articles from WHO, UNICEF, UN News & more</li>
              <li>New articles arrive as <span className="text-white/70">Pending</span> — they won't appear on the public site until you approve them</li>
              <li><span className="text-white/70">Approve</span> relevant articles → they show on the blog sidebar for visitors</li>
              <li><span className="text-white/70">Star ★</span> your favourites → AI will prioritize these when generating blog posts</li>
              <li>You can also <span className="text-white/70">manually add</span> articles by pasting a URL</li>
            </ol>
          </div>
        )}
        {activeTab === 'posts' && (
          <div className="mb-8 border border-orange-500/30 rounded-lg p-4 bg-orange-500/5">
            <p className="text-orange-300/90 text-xs font-medium mb-2">How Blog Posts Work</p>
            <ol className="text-white/50 text-xs space-y-1 list-decimal list-inside">
              <li>AI generates draft posts from <span className="text-white/70">starred research articles</span> — these arrive as Drafts</li>
              <li>All auto-generated posts are authored as <span className="text-white/70">Far Too Young, Inc.</span> — you can change the author when editing</li>
              <li>Review and <span className="text-white/70">edit</span> the content, title, and images before publishing</li>
              <li>Click <span className="text-white/70">Publish</span> when ready → post goes live on the Stories page</li>
              <li>You can also <span className="text-white/70">create posts manually</span> using the editor</li>
              <li>Unpublish or delete posts anytime — changes are instant</li>
            </ol>
          </div>
        )}

        {activeTab === 'research' && <ResearchTab />}
        {activeTab === 'posts' && <PostsTab />}
      </div>
    </div>
  )
}

// ─── SORTABLE HEADER ──────────────────────────────────────────
// Default sort indicators: which columns are active in default mode and their direction
const DEFAULT_SORT_FIELDS = { status: 'asc', starred: 'desc', date: 'desc' }

function SortHeader({ label, field, sort, setSort, className = '', align = 'left' }) {
  const isActive = sort && sort.field === field
  const isDefault = !sort && DEFAULT_SORT_FIELDS[field]
  const defaultDir = DEFAULT_SORT_FIELDS[field]

  const toggle = () => {
    if (isActive) setSort({ field, dir: sort.dir === 'asc' ? 'desc' : 'asc' })
    else setSort({ field, dir: 'asc' })
  }
  const justify = align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
  return (
    <th className={`px-4 py-3 ${className}`}>
      <button onClick={toggle} className={`flex items-center gap-1 font-medium text-xs uppercase tracking-wider transition hover:text-white/70 ${justify} w-full`}>
        <span className={isActive ? 'text-orange-300' : isDefault ? 'text-yellow-400' : 'text-white/40'}>{label}</span>
        <span className="flex flex-col text-[10px] leading-[11px]">
          <span className={isActive && sort.dir === 'asc' ? 'text-orange-300' : isDefault && defaultDir === 'asc' ? 'text-yellow-400' : 'text-white/20'}>▲</span>
          <span className={isActive && sort.dir === 'desc' ? 'text-orange-300' : isDefault && defaultDir === 'desc' ? 'text-yellow-400' : 'text-white/20'}>▼</span>
        </span>
      </button>
    </th>
  )
}

// ─── RESEARCH TAB ─────────────────────────────────────────────
function ResearchTab() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState(null) // null = default smart sort
  const [showAdd, setShowAdd] = useState(false)

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/research`, { headers })
      const data = await res.json()
      if (data.success) setArticles(data.articles)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { fetchArticles() }, [])

  const updateArticle = async (id, body) => {
    try {
      const res = await fetch(`${API_URL}/admin/research/${id}`, { method: 'PUT', headers, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.success) {
        setArticles(prev => [...prev.map(a => a.article_id === id ? { ...a, ...body } : a)])
      } else {
        alert('Action failed — try logging out and back in.')
      }
    } catch (e) {
      alert('Network error — check your connection.')
    }
  }

  const deleteArticle = async (id) => {
    if (!confirm('This will permanently remove this article. You will need to re-add it manually if you want it back. Continue?')) return
    await fetch(`${API_URL}/admin/research/${id}`, { method: 'DELETE', headers })
    setArticles(prev => prev.filter(a => a.article_id !== id))
  }

  const filtered = articles.filter(a => {
    if (filter === 'all') return true
    if (filter === 'pending') return !a.status || a.status === 'pending'
    if (filter === 'approved') return a.status === 'approved'
    if (filter === 'rejected') return a.status === 'rejected'
    if (filter === 'starred') return a.starred
    return true
  }).sort((a, b) => {
    // Default: approved first, then starred, then newest date
    if (!sort) {
      const statusOrder = { approved: 0, pending: 1, rejected: 2 }
      const sA = statusOrder[a.status || 'pending'] ?? 1
      const sB = statusOrder[b.status || 'pending'] ?? 1
      if (sA !== sB) return sA - sB
      if ((b.starred ? 1 : 0) !== (a.starred ? 1 : 0)) return (b.starred ? 1 : 0) - (a.starred ? 1 : 0)
      return new Date(b.published_at) - new Date(a.published_at)
    }
    const dir = sort.dir === 'asc' ? 1 : -1
    if (sort.field === 'date') return dir * (new Date(a.published_at) - new Date(b.published_at))
    if (sort.field === 'source') return dir * (a.source || '').localeCompare(b.source || '')
    if (sort.field === 'tier') return dir * ((a.tier || 9) - (b.tier || 9))
    if (sort.field === 'title') return dir * (a.title || '').localeCompare(b.title || '')
    if (sort.field === 'starred') return dir * ((a.starred ? 1 : 0) - (b.starred ? 1 : 0))
    if (sort.field === 'status') return dir * (a.status || 'pending').localeCompare(b.status || 'pending')
    return 0
  })

  if (loading) return <p className="text-white/50">Loading articles...</p>

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-6 overflow-x-auto pb-2 sm:pb-0">
          {['all', 'pending', 'approved', 'starred', 'rejected'].map((f, i) => (
            <div key={f} className="flex items-center gap-6">
              {i > 0 && <div className="h-4 w-px bg-white/20"></div>}
              <button
                onClick={() => setFilter(f)}
                className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  filter === f
                    ? 'border-orange-500 text-orange-300'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSort(null)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300 ${sort ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-white/5 text-white/30 border-white/10 cursor-default'}`} disabled={!sort}>
            ↺ Reset sort
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="bg-orange-500/20 hover:bg-orange-500/30 text-white px-4 py-2 rounded-lg text-sm font-medium border border-orange-500/30 transition-all duration-300 active:scale-95 active:opacity-90">
            + Add Article
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && <AddArticleForm onAdded={(a) => { setArticles(prev => [a, ...prev]); setShowAdd(false) }} headers={headers} />}

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr>
              <SortHeader label="★" field="starred" sort={sort} setSort={setSort} className="w-10" align="center" />
              <SortHeader label="Article" field="title" sort={sort} setSort={setSort} className="" align="left" />
              <SortHeader label="Source" field="source" sort={sort} setSort={setSort} className="w-36" align="left" />
              <SortHeader label="Date" field="date" sort={sort} setSort={setSort} className="w-24" align="center" />
              <SortHeader label="Status" field="status" sort={sort} setSort={setSort} className="w-24" align="center" />
              <th className="text-center px-4 py-3 font-medium text-white/40 text-xs uppercase tracking-wider w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(article => (
              <tr key={article.article_id} className="hover:bg-white/5 transition">
                <td className="px-4 py-3 text-center">
                  <button onClick={() => updateArticle(article.article_id, { starred: !article.starred })} className={`text-lg transition ${article.starred ? 'text-yellow-400' : 'text-white/20 hover:text-yellow-400'}`}>★</button>
                </td>
                <td className="px-4 py-3">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:text-orange-300 transition line-clamp-2">
                    {article.title}
                  </a>
                </td>
                <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">{article.source}</td>
                <td className="px-4 py-3 text-white/50 text-xs text-center whitespace-nowrap">{article.published_at?.slice(0, 10)}</td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={article.status} />
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                  {(!article.status || article.status === 'pending') && (
                    <>
                      <button onClick={() => updateArticle(article.article_id, { status: 'approved' })} className="text-green-400 hover:text-green-300 inline-flex" title="Approve">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button onClick={() => updateArticle(article.article_id, { status: 'rejected' })} className="text-red-400 hover:text-red-300 inline-flex" title="Reject">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </>
                  )}
                  <button onClick={() => deleteArticle(article.article_id)} className="text-white/40 hover:text-red-400 inline-flex transition" title="Delete">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-white/30 py-8">No articles found</p>}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const s = status || 'pending'
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-300 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  }
  return (
    <span className={`px-3 py-1 rounded border text-xs ${colors[s]}`}>{s}</span>
  )
}

function AddArticleForm({ onAdded, headers }) {
  const sourceTiers = {
    'UNICEF': 1, 'WHO': 1, 'UN News': 1, 'UNFPA': 1, 'World Bank': 1,
    'Nature': 2, 'The Lancet': 2,
    'Human Rights Watch': 3, 'Girls Not Brides': 3, 'Save the Children': 3, 'Plan International': 3, 'Population Council': 3, 'IRC': 3,
    'Columbia SIPA': 4, 'Accelerate Hub': 4, 'Oxford / UNICEF': 4,
  }
  const [form, setForm] = useState({ title: '', source: '', url: '', tier: 3, published_at: '', customSource: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tiers, setTiers] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/admin/tiers`, { headers })
      .then(r => r.json())
      .then(d => { if (d.success) setTiers(d.tiers) })
      .catch(() => {})
  }, [])

  const handleSourceChange = (source) => {
    setForm({ ...form, source, tier: sourceTiers[source] || 4 })
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const source = form.source === '__new__' ? form.customSource : form.source
      const payload = { source, url: form.url, tier: form.tier }
      const res = await fetch(`${API_URL}/admin/research`, { method: 'POST', headers, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.success) onAdded(data.article)
      else setError(data.message || 'Failed to add article')
    } catch (e) { setError('Network error') }
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3">
      <select value={form.source} onChange={e => e.target.value === '__new__' ? setForm({ ...form, source: '__new__' }) : handleSourceChange(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-orange-500/50 focus:outline-none">
        <option value="" className="bg-gray-900">Source...</option>
        <option value="__new__" className="bg-gray-900">+ Add New Source</option>
        {Object.keys(sourceTiers).filter(s => s !== 'Other').map(s => (
          <option key={s} value={s} className="bg-gray-900">{s}</option>
        ))}
      </select>
      {form.source === '__new__' && (
        <>
          <input placeholder="Source name (e.g. NY Times)" required value={form.customSource || ''} onChange={e => setForm({ ...form, customSource: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-orange-500/50 focus:outline-none w-48" />
          <select value={form.tier} onChange={e => setForm({ ...form, tier: parseInt(e.target.value) })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-orange-500/50 focus:outline-none">
            {tiers.map(t => <option key={t.tier_id} value={t.tier_id} className="bg-gray-900">{t.description}</option>)}
          </select>
        </>
      )}
      <input placeholder="URL" required type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-orange-500/50 focus:outline-none min-w-[200px]" />
      <button type="submit" disabled={saving || (!form.source || (form.source === '__new__' && !form.customSource)) || !form.url} className="bg-green-500/20 hover:bg-green-500/30 text-white px-4 py-2.5 rounded-lg text-sm font-medium border border-green-500/30 transition-all duration-300 disabled:opacity-50">
        {saving ? 'Validating...' : 'Add'}
      </button>
      {error && <p className="w-full text-red-400 text-xs mt-1">{error}</p>}
    </form>
  )
}

// ─── POSTS TAB ─────────────────────────────────────────────────
function PostsTab() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingPost, setEditingPost] = useState(null)

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/blog/posts?all=true`, { headers })
      const data = await res.json()
      if (data.success) setPosts(data.posts)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const publishPost = async (id) => {
    await fetch(`${API_URL}/blog/posts/${id}/publish`, { method: 'POST', headers })
    setPosts(prev => prev.map(p => p.post_id === id ? { ...p, status: 'published', published_at: new Date().toISOString() } : p))
  }

  const unpublishPost = async (id) => {
    await fetch(`${API_URL}/blog/posts/${id}`, { method: 'PUT', headers, body: JSON.stringify({ status: 'draft' }) })
    setPosts(prev => prev.map(p => p.post_id === id ? { ...p, status: 'draft' } : p))
  }

  const deletePost = async (id) => {
    if (!confirm('Delete this post permanently?')) return
    await fetch(`${API_URL}/blog/posts/${id}`, { method: 'DELETE', headers })
    setPosts(prev => prev.filter(p => p.post_id !== id))
  }

  if (loading) return <p className="text-white/50">Loading posts...</p>

  if (editingPost) {
    return <PostEditor post={editingPost} onClose={() => { setEditingPost(null); fetchPosts() }} headers={headers} />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-white/50">{posts.length} posts ({posts.filter(p => p.status === 'published').length} published, {posts.filter(p => p.status !== 'published').length} drafts)</p>
        <button onClick={() => setEditingPost({})} className="bg-orange-500/20 hover:bg-orange-500/30 text-white px-4 py-2 rounded-lg text-sm font-medium border border-orange-500/30 transition-all duration-300 active:scale-95 active:opacity-90">
          + New Post
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-white/40 text-xs uppercase tracking-wider">Title</th>
              <th className="text-left px-4 py-3 font-medium text-white/40 text-xs uppercase tracking-wider w-28">Category</th>
              <th className="text-left px-4 py-3 font-medium text-white/40 text-xs uppercase tracking-wider w-24">Status</th>
              <th className="text-left px-4 py-3 font-medium text-white/40 text-xs uppercase tracking-wider w-28">Date</th>
              <th className="text-right px-4 py-3 font-medium text-white/40 text-xs uppercase tracking-wider w-44">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {posts.map(post => (
              <tr key={post.post_id} className="hover:bg-white/5 transition">
                <td className="px-4 py-3 text-white/90">{post.title}</td>
                <td className="px-4 py-3 text-white/50 text-xs">{post.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded border text-xs ${post.status === 'published' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>
                    {post.status || 'draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">{(post.published_at || post.created_at)?.slice(0, 10)}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => setEditingPost(post)} className="text-blue-400 hover:text-blue-300 text-xs font-medium">Edit</button>
                  {post.status === 'published'
                    ? <button onClick={() => unpublishPost(post.post_id)} className="text-yellow-400 hover:text-yellow-300 text-xs font-medium">Unpublish</button>
                    : <button onClick={() => publishPost(post.post_id)} className="text-green-400 hover:text-green-300 text-xs font-medium">Publish</button>
                  }
                  <button onClick={() => deletePost(post.post_id)} className="text-red-400/50 hover:text-red-300 text-xs font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && <p className="text-center text-white/30 py-8">No posts yet</p>}
      </div>
    </div>
  )
}

// ─── POST EDITOR ─────────────────────────────────────────────
function PostEditor({ post, onClose, headers }) {
  const isNew = !post.post_id
  const [form, setForm] = useState({
    title: post.title || '',
    content: post.content || '',
    excerpt: post.excerpt || '',
    category: post.category || 'Education',
    image_url: post.image_url || '',
    author: post.author || 'Far Too Young, Inc.',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loadingContent, setLoadingContent] = useState(!isNew && !post.content)

  // Fetch full post content if not included in listing
  useEffect(() => {
    if (!isNew && !post.content && post.slug) {
      fetch(`${API_URL}/blog/posts/slug/${post.slug}`)
        .then(r => r.json())
        .then(d => {
          if (d.success && d.post) {
            setForm(prev => ({ ...prev, content: d.post.content || '' }))
          }
          setLoadingContent(false)
        })
        .catch(() => setLoadingContent(false))
    }
  }, [post.slug])

  const categories = ['Education', 'Health', 'Norms & Culture', 'Policy & Justice', 'Research', 'Climate & Crisis']

  const uploadImage = async (file) => {
    setUploading(true)
    try {
      const res = await fetch(`${API_URL}/admin/upload-image`, {
        method: 'POST', headers,
        body: JSON.stringify({ fileName: file.name, contentType: file.type })
      })
      const data = await res.json()
      if (data.uploadUrl) {
        await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
        setForm(prev => ({ ...prev, image_url: data.publicUrl }))
      }
    } catch (e) { console.error(e) }
    setUploading(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (isNew) {
        await fetch(`${API_URL}/blog/posts`, { method: 'POST', headers, body: JSON.stringify(form) })
      } else {
        await fetch(`${API_URL}/blog/posts/${post.post_id}`, { method: 'PUT', headers, body: JSON.stringify(form) })
      }
      onClose()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">{isNew ? 'New Post' : 'Edit Post'}</h2>
        <button onClick={onClose} className="text-white/40 hover:text-white transition">✕ Close</button>
      </div>

      <div className="space-y-4">
        <input
          placeholder="Post title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-lg font-semibold text-white placeholder-white/30 focus:border-orange-500/50 focus:outline-none"
        />

        <div className="flex gap-4">
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500/50 focus:outline-none">
            {categories.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
          </select>
          <input
            placeholder="Author"
            value={form.author}
            onChange={e => setForm({ ...form, author: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-orange-500/50 focus:outline-none flex-1"
          />
        </div>

        {/* Image upload */}
        <div className="border border-white/10 rounded-lg p-4">
          <label className="text-sm font-medium text-white/60 block mb-2">Hero Image (optional)</label>
          {form.image_url && (
            <div className="mb-3">
              <img src={form.image_url} alt="Hero" className="h-32 object-cover rounded-lg border border-white/10" />
              <button onClick={() => setForm({ ...form, image_url: '' })} className="text-xs text-red-400 mt-2 hover:text-red-300">Remove image</button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={e => e.target.files[0] && uploadImage(e.target.files[0])}
            className="text-sm text-white/50"
          />
          {uploading && <p className="text-xs text-orange-300 mt-1">Uploading...</p>}
        </div>

        <textarea
          placeholder="Short excerpt (shows on blog listing)"
          value={form.excerpt}
          onChange={e => setForm({ ...form, excerpt: e.target.value })}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:border-orange-500/50 focus:outline-none"
        />

        <div className="bg-white rounded-lg [&_.ql-editor]:min-h-[400px] [&_.ql-editor]:text-gray-900 [&_.ql-toolbar]:border-gray-300 [&_.ql-container]:border-gray-300">
          <style>{`.ql-editor h2 { margin-top: 1.5rem; margin-bottom: 0.75rem; font-size: 1.25rem; font-weight: 700; } .ql-editor p { margin-bottom: 1rem; line-height: 1.7; }`}</style>
          <ReactQuill
            theme="snow"
            value={form.content}
            onChange={val => setForm({ ...form, content: val })}
            placeholder="Start writing your post..."
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['blockquote', 'link', 'image'],
                ['clean']
              ]
            }}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 border border-white/20 rounded-lg text-sm text-white/60 hover:text-white hover:border-white/40 transition">Cancel</button>
          <button onClick={save} disabled={saving || !form.title} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg font-medium transition disabled:opacity-50">
            {saving ? 'Saving...' : isNew ? 'Create Draft' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Admin
