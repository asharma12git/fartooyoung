# Plan 6: Blog System (Research + AI + Newsletter)

## Overview
Complete content pipeline: automated research collection from reputable sources, AI-generated blog posts grounded in real data, newsletter distribution, and social media posting (Plan 7). One pipeline feeds all channels.

**Status:** ⏳ In Progress (Steps 1-3 complete)
**Priority:** HIGH — directly drives SEO traffic + Google Ad Grants landing pages
**Cost:** ~$3-5/month
**Effort:** 10-12 hours total
**Dependencies:** None

## Prerequisites
- AWS Bedrock access (Claude 3.5 Sonnet) — enable in us-east-1
- SES configured for sending
- Pre-render script (`scripts/prerender.mjs`) for blog route SEO
- Research sources defined (see `docs/4-resources/1-research-sources.md`)

## Cost

| Service | What it does | Monthly Cost |
|---------|-------------|--------------|
| Lambda (Research) | Fetches articles from RSS feeds weekly | $0.00 (free tier) |
| Lambda (Blog Generator) | Calls Bedrock to write posts | $0.00 (free tier) |
| Bedrock Claude (input) | Reads ~5-10 full articles per post × 4 posts | $2-4 |
| Bedrock Claude (output) | Writes 4 × 1500-word posts | $1.20 |
| SES (Newsletter) | 1,000 emails/month | $0.10 |
| DynamoDB | Articles + posts + subscribers | $0.00 (free tier) |
| EventBridge | Weekly triggers | $0.00 (free tier) |
| **Total** | | **~$3-5/month** |

## Checklist

### Phase 1: Foundation (Done)
- [x] Step 1: Blog Frontend (public pages)
- [x] Step 2: Blog Backend + Role System

### Phase 2: Content Pipeline
- [x] Step 3: Research Pipeline (RSS feeds → DynamoDB)
- [ ] Step 4: AI Content Generation (Claude writes posts using research)
- [ ] Step 5: Newsletter System

### Phase 3: Management
- [ ] Step 6: Admin Panel
- [ ] Step 7: Comments System
- [ ] Step 8: Favorites / Bookmarks (future)

---

## Step 1: Blog Frontend ✅

**Benefit:** A public-facing blog ("Stories") gives us unlimited pages to rank for long-tail keywords, provides landing pages for Google Ad Grants campaigns, and gives AI search engines citable content.

**Problem:** With only 4 static pages, we have extremely limited keyword coverage and no fresh content for search engines to re-crawl.

**Implementation:** Complete. See `src/pages/Blog.jsx` and `src/pages/BlogPost.jsx`. Page titled "Stories" at `/blog` URL. Full-screen hero image, card grid, progress bar, author bio, donate CTA, FAQ section.

## Step 2: Blog Backend + Role System ✅

**Benefit:** Serverless blog backend with draft/published workflow. Role system controls admin access.

**Problem:** Without backend, no way to manage posts without code deploys.

**Implementation:** Complete. BlogPostsTable in DynamoDB with slug GSI. 6 Lambda endpoints (CRUD + publish). Role field added to Users table and JWT. Admin role set for `avinashsharma.np@gmail.com`. API path: `/blog/posts/slug/{slug}` for public, `/blog/posts/{id}` for admin operations.

## Step 3: Research Pipeline ✅

**Benefit:** A Lambda that automatically fetches the latest articles from reputable sources (UNICEF, WHO, Girls Not Brides, etc.) via RSS feeds. Provides real, current data for the blog sidebar AND feeds the AI generator with factual content to cite. Zero AI cost — just data fetching.

**Problem:** Without automated research, blog posts would rely on AI's training data (potentially outdated) or require manual research for every post. The blog sidebar would have no "Latest Research" section linking to authoritative sources.

**Implementation:** Complete. `research-fetcher.js` Lambda triggered weekly by EventBridge. Fetches RSS feeds from 7-tier source list, filters by child marriage keywords, deduplicates by URL, stores in ResearchArticlesTable. `get-research-articles.js` serves GET /research/articles endpoint. 43 verified articles seeded from Tier 1-7 sources. Blog sidebar and Top Research section read from live API (dynamic). Deployed to staging.

### Research Lambda: `research-fetcher.js`
- Triggered weekly by EventBridge (same day as blog generator, but runs first)
- Fetches RSS feeds from tiered sources (see `docs/4-resources/1-research-sources.md`)
- Filters articles by keywords: "child marriage", "gender-based violence", "girls education", "forced marriage"
- For each new article: fetches full text from the article URL
- Deduplication: checks if URL already exists in DynamoDB → skips if yes
- Saves to DynamoDB: title, source, tier, full_text, url, date, keywords

### DynamoDB Table: `fartooyoung-{env}-research-articles`
- PK: `article_id` (UUID)
- GSI: `url` (for deduplication)
- Fields: `title`, `source`, `tier`, `url`, `full_text`, `excerpt`, `date`, `keywords`, `fetched_at`

### RSS Sources to Fetch
| Tier | Source | RSS Feed |
|------|--------|----------|
| 1 | UNICEF | unicef.org/rss |
| 1 | UNFPA | unfpa.org/rss |
| 1 | WHO | who.int/feeds |
| 1 | World Bank | worldbank.org/rss |
| 3 | Girls Not Brides | girlsnotbrides.org/rss |
| 3 | Human Rights Watch | hrw.org/rss |
| 3 | Save the Children | savethechildren.org/rss |

### Blog Sidebar Display
- Blog listing page shows "Latest Research" panel
- Displays articles ordered by date (newest first)
- Each item: title (hyperlinked to source), organization name, date
- Grouped by tier or shown as flat list

### Key Behaviors
- **No new articles this week?** → Nothing changes, existing articles remain
- **Duplicate URL?** → Skipped automatically
- **Old articles?** → Stay in database, move down the list. Still available for AI context.
- **Article relevant for months?** → Stays visible until newer articles push it down

### Effort
2-3 hours

## Step 4: AI Content Generation ⬜

**Benefit:** AWS Bedrock (Claude) reads the full text of this week's research articles and writes a 1500-word blog post grounded in real, current data with working hyperlinks to sources. Produces factual, SEO-optimized content without hiring writers.

**Problem:** Writing 4 quality blog posts per month manually is time-consuming. Without consistent content, organic traffic growth stalls and Google Ad Grants has insufficient landing pages.

**Implementation:**

### Blog Generator Lambda: `blog-generator.js`
- Runtime: Node.js 18, timeout: 5 min, memory: 1024 MB
- Triggered by EventBridge every Monday (AFTER research-fetcher completes)
- Pulls latest research articles from DynamoDB (last 2-4 weeks)
- Picks a keyword from content cluster list
- Sends to Claude: full article texts + writing instructions
- Saves output as "draft" in blog-posts table

### Prompt Structure
```
Context: Here are recent articles about [keyword topic]:
[Article 1 - full text + URL]
[Article 2 - full text + URL]
[Article 3 - full text + URL]

Instructions:
- Write a 1500-word blog post about [keyword]
- Write as "Avinash Sharma, Founder of Far Too Young"
- Include first-person references to fieldwork in Nepal/Bangladesh
- Cite specific statistics from the articles above with hyperlinks
- Include 2-3 internal links to fartooyoung.org pages
- Generate 3-5 FAQ questions at the end
- Structure with clear H2/H3 headings
- Tone: authoritative but accessible
```

### Content Clusters

| Pillar | Keywords |
|--------|----------|
| Child Marriage | statistics by country, causes, effects on girls, laws by state, how to prevent |
| Gender-Based Violence | types, prevention, support resources, global statistics |
| Girls Education | developing countries, scholarships, impact on child marriage |
| Advocacy | how to help, volunteer, donate, policy changes |

### Google E-E-A-T Compliance

| Requirement | How We Handle It |
|-------------|-----------------|
| Human oversight | Draft → review → publish workflow |
| Author attribution | "By Avinash Sharma, Founder" on every post |
| Experience signals | First-person references to fieldwork |
| Expertise | Real statistics from Tier 1-3 sources with citations |
| Trustworthiness | Nonprofit org, verifiable sources, working hyperlinks |
| Not mass-produced | 4 posts/month max, each reviewed |

### Effort
2-3 hours

## Step 5: Newsletter System ⬜

**Benefit:** An email distribution system that notifies subscribers when new content is published. Drives repeat traffic, builds community, and keeps donors engaged between donations.

**Problem:** Without a newsletter, published blog posts rely entirely on search traffic for discovery. Existing supporters have no way to stay informed unless they manually revisit the site.

**Implementation:**

### DynamoDB Table: `fartooyoung-{env}-newsletter`
- PK: `email`
- Fields: `name`, `status` (pending/active/unsubscribed), `subscribed_at`

### Lambda Functions
- `newsletter-subscribe.js` — POST /newsletter/subscribe (double opt-in)
- `newsletter-unsubscribe.js` — POST /newsletter/unsubscribe
- `newsletter-sender.js` — triggered when post published, sends via SES

### Email Template
- Professional HTML email (dark theme matching site)
- Logo, post title, excerpt, featured image, "Read Full Article" CTA
- Social links in footer, unsubscribe link (required by law)

### Frontend
- Subscribe form in Footer + Blog page sidebar
- Double opt-in: confirmation email → click to activate

### Effort
2 hours

## Step 6: Admin Panel ⬜

**Benefit:** A dedicated admin page (`/admin`) for managing blog posts — view drafts, edit, publish, delete — without touching DynamoDB directly.

**Problem:** Without admin UI, managing posts requires AWS console access. Can't delegate to team members.

**Implementation:**

### Route: `/admin` (admin role only)
- Protected route: redirects to `/dashboard` if not admin
- "Admin Panel" link in header (only visible to admins)

### Features
- List all posts (drafts + published) with status badges
- "New Post" button → form (title, content, excerpt, category, keywords)
- "Edit" / "Publish" / "Unpublish" / "Delete"
- Preview before publishing

### Future Tabs (Plan 8)
- Donations management
- User management
- Site settings

### Effort
2 hours

## Step 7: Comments System ⬜

**Benefit:** A comments section allows readers to engage with blog posts, ask questions, and share perspectives — building community around the cause. Comment counts displayed on the blog listing (like NYT Athletic) signal engagement and encourage clicks.

**Problem:** Without comments, the blog is one-directional. No community engagement, no social proof, no way for supporters to interact with content.

**Implementation:**

### DynamoDB Table: `fartooyoung-{env}-comments`
- PK: `comment_id` (UUID)
- GSI: `post_id` (to fetch all comments for a post)
- Fields: `post_id`, `user_email`, `user_name`, `content`, `created_at`, `status` (approved/pending/hidden)

### Lambda Functions
- `get-comments.js` — GET /blog/posts/:id/comments (public, approved only)
- `create-comment.js` — POST /blog/posts/:id/comments (logged-in users)
- `delete-comment.js` — DELETE /comments/:id (admin only)

### Frontend
- Comment count icon (💬) on blog listing cards
- Comment section at bottom of BlogPost.jsx
- Login required to comment
- Admin can moderate (hide/delete) from admin panel

### Effort
3-4 hours

## Step 8: Favorites / Bookmarks ⬜ (Future — not a priority)

**Benefit:** Logged-in users can save blog posts and research articles they find valuable, creating a personal reading list accessible from their dashboard.

**Problem:** Without bookmarks, users have no way to save content for later — they must remember URLs or re-find articles manually.

**Implementation:**
- DynamoDB table: `fartooyoung-{env}-favorites` (PK: `user_email`, SK: `item_id`)
- Endpoints: `POST /favorites` (save), `DELETE /favorites/:id` (remove), `GET /favorites` (list)
- Heart/bookmark icon on blog post cards + research articles (logged-in only)
- New "Saved" tab in donor dashboard showing bookmarked items

### Effort
2 hours

---

## Full Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  WEEKLY (Monday):                                            │
│                                                              │
│  1. Research Lambda fetches RSS feeds                         │
│     → Filters for child marriage / GBV keywords              │
│     → Fetches full article text                              │
│     → Deduplicates (skip if URL exists)                      │
│     → Saves new articles to DynamoDB                         │
│     → Blog sidebar updates automatically                     │
│                                                              │
│  2. Blog Generator Lambda (after research completes)         │
│     → Reads latest research articles from DynamoDB           │
│     → Sends full text + instructions to Claude               │
│     → Claude writes 1500-word post with real citations       │
│     → Saves as DRAFT in blog-posts table                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  HUMAN REVIEW (5 min):                                       │
│  Admin opens /admin → reviews draft → clicks "Publish"       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  AUTO (triggered by publish):                                │
│  → Post appears on /blog                                     │
│  → Newsletter sends to subscribers                           │
│  → Social Media posts to Instagram/Facebook (Plan 7)         │
│  → Google indexes new page (SEO traffic)                     │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Reputable Sources (UNICEF, WHO, etc.)
       ↓ (RSS feeds)
Research Lambda ($0)
       ↓
DynamoDB (research-articles table)
       ↓ (full article text as context)
AI Generator (Claude via Bedrock, $3-5/mo)
       ↓
DynamoDB (blog-posts table, status: "draft")
       ↓ (admin publishes)
Published Blog Post
       ↓
  ├── /blog page (SEO traffic)
  ├── Newsletter (email subscribers)
  ├── Social Media — Plan 7 (Instagram, Facebook)
  ├── Blog sidebar (research links for credibility)
  └── Google Ad Grants (landing page)
```

## GEO Optimization (AI Search Engines)

Each post structured for ChatGPT/Perplexity citation:
- Clear factual statements in first paragraph
- Real statistics with cited sources (hyperlinked)
- FAQ section at bottom
- Quotable one-liners
- Consistent entity references ("Far Too Young, a US-based nonprofit...")

## SEO Keywords to Target

| Keyword | Monthly Searches | Difficulty |
|---------|-----------------|------------|
| child marriage statistics | 5,400 | Medium |
| child marriage | 22,200 | High |
| prevent child marriage | 1,300 | Low |
| child bride | 8,100 | Medium |
| girls education developing countries | 880 | Low |
| end child marriage | 720 | Low |
| child marriage in India | 3,600 | Medium |
| child marriage in Nepal | 1,200 | Low |
| effects of child marriage | 2,400 | Low |

## Success Metrics

| Metric | Target (3 months) |
|--------|-------------------|
| Blog posts published | 12 |
| Research articles indexed | 50+ |
| Organic blog traffic | 300+ visits/month |
| Email subscribers | 100+ |
| Email open rate | 20-30% |
| Google Ad Grants landing pages | 8+ |
| AWS costs | <$5/month |

---

*Last updated: June 1, 2026*
