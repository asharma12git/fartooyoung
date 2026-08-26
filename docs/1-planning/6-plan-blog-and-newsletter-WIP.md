# Plan 6: Blog System (Research + AI + Newsletter)

## Overview
Complete content pipeline: automated research collection from reputable sources, AI-generated blog posts grounded in real data, newsletter distribution, and social media posting (Plan 7). One pipeline feeds all channels.

**Status:** ⏳ In Progress (Steps 1-4 + Admin Panel complete)
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
- [x] Step 4: AI Content Generation (Claude writes posts using research)
- [ ] Step 5: Newsletter System

### Phase 3: Management
- [x] Step 6: Admin Panel
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
- Fields: `title`, `source`, `tier`, `url`, `full_text`, `excerpt`, `date`, `keywords`, `fetched_at`, `status` (pending/approved/rejected), `starred` (boolean)

### Article Lifecycle
- RSS fetches article → saved as `status: "pending"`
- Admin approves → `status: "approved"` → appears on public sidebar
- Admin rejects → `status: "rejected"` → hidden
- Admin stars → `starred: true` → AI prioritizes for next blog draft
- Admin can also manually add articles (select source + paste URL → Lambda validates URL, extracts title automatically)

### RSS Sources (Active)
| Tier | Source | RSS Feed |
|------|--------|----------|
| 1 | UNICEF | unicef.org/press-releases/rss.xml |
| 1 | WHO | who.int/rss-feeds/news-english.xml |
| 1 | UN News | news.un.org/feed/subscribe/en/news/topic/women/feed/rss.xml |
| 3 | Human Rights Watch | hrw.org/rss/news |
| 3 | Population Council | popcouncil.org/feed/ |

*Note: Girls Not Brides, Plan International, Save the Children removed (feeds dead/broken as of June 2026).*

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

## Step 4: AI Content Generation ✅

**Benefit:** AWS Bedrock (Claude Sonnet 4.6) reads research articles and writes focused blog posts grounded in real, current data with working hyperlinks to sources. Produces factual, SEO-optimized content without hiring writers.

**Problem:** Writing quality blog posts manually is time-consuming. Without consistent content, organic traffic growth stalls and Google Ad Grants has insufficient landing pages.

**Implementation:** Complete. `blog-generator.js` Lambda triggered by EventBridge (Monday + Friday at 11am UTC). Generates 2 posts/week automatically.

### Blog Generator Lambda: `blog-generator.js`
- Runtime: Node.js 18, timeout: 5 min, memory: 1024 MB
- Triggered by EventBridge: Monday 11am UTC + Friday 11am UTC
- Pulls **starred** articles first, then **approved** articles from DynamoDB
- Processes **one article per post** (focused topic approach)
- Skips irrelevant articles (returns `{skip:true}` if article not related to child marriage mission)
- Sends article text + writing instructions to Claude Sonnet 4.6 via Bedrock
- Auto-categorizes: AI picks from (Education, Health, Norms & Culture, Policy & Justice, Research, Climate & Crisis)
- Calculates `reading_time` (words/200) and `word_count` automatically
- Appends CTA block with donate links (`#donate-monthly`, `#donate-once`)
- No dashes rule enforced in prompt
- Author: 'Far Too Young, Inc.' (default)
- Saves output as "draft" in blog-posts table

### EventBridge Schedule
| Rule | Schedule | Purpose |
|------|----------|---------|
| Research Fetcher | Weekly (Sunday) | Fetches new RSS articles |
| Blog Generator Monday | Monday 11am UTC | Generates post from starred/approved article |
| Blog Generator Friday | Friday 11am UTC | Generates post from starred/approved article |

### Post Output Format
- HTML content (rendered with dangerouslySetInnerHTML on frontend)
- Auto-assigned category from fixed list
- reading_time and word_count calculated
- CTA block appended with donation links
- Author set to 'Far Too Young, Inc.'
- Status: 'draft' (admin reviews and publishes)

### Key Behaviors
- **One article = one post**: Focused, single-topic posts rather than roundups
- **Skips irrelevant**: If article isn't about child marriage/GBV/girls education, returns skip
- **No dashes**: Prompt explicitly forbids em-dashes and en-dashes in output
- **Auto-categorization**: AI assigns category based on content analysis
- **CTA integration**: Every post ends with donate call-to-action

### Effort
Completed in ~3 hours

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

### Newsletter Subscription — PLANNED/next

1. **Subscribe endpoint** — `POST /newsletter/subscribe` saves email to DynamoDB
2. **Newsletter subscribers DynamoDB table** — `fartooyoung-{env}-newsletter-subscribers` (PK: email, fields: name, status, token, subscribed_at)
3. **Send newsletter Lambda** — triggered on blog publish, sends to all active subscribers via SES
4. **Unsubscribe flow** — one-click token-based unsubscribe link (no login required)
5. **Newsletter email template** — branded HTML (dark theme), article title + teaser + "Read More" link
6. **Optional:** also send for new research articles (when approved/starred)

### Effort
2 hours

## Step 6: Admin Panel ✅

**Benefit:** A dedicated admin page (`/admin`) for managing blog posts — view drafts, edit, publish, delete — without touching DynamoDB directly.

**Problem:** Without admin UI, managing posts requires AWS console access. Can't delegate to team members.

**Implementation:**

### Route: `/admin` (admin role only)
- Protected route: redirects to `/dashboard` if not admin
- "Admin Panel" link in header (only visible to admins)

### Features — Blog Posts
- List all posts (drafts + published) with status badges
- "New Post" button → form (title, content, excerpt, category, keywords)
- Rich text editor — edit wording, tone, structure before publishing
- Image upload to S3 (hero image + inline images) — posts can be with or without images
- "Edit" / "Publish" / "Unpublish" / "Delete"
- Preview before publishing

### Features — Research Articles
- List all articles with status badges (pending / approved / rejected)
- Approve / Reject buttons for pending articles
- Star / Unstar toggle (starred = AI priority) as dedicated column
- Sortable table headers (click to sort asc/desc, smart default: approved → starred → newest)
- "Add Article" form with URL validation:
  1. Admin selects Source (dropdown, auto-derives tier) and pastes URL
  2. Lambda fetches the URL, validates it's reachable and domain matches source
  3. Lambda extracts `<title>` tag from the page automatically
  4. Article saved with real title, source, tier, and current date
- Filter by status (segmented tabs: All, Pending, Approved, Starred, Rejected)

### Image Upload
- Admin selects image from computer
- Lambda uploads to S3 (`blog/images/` prefix)
- CloudFront CDN serves images globally
- URL inserted into post content or set as hero image

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
│     → Deduplicates (skip if URL exists)                      │
│     → Saves new articles as "pending" in DynamoDB            │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  ADMIN CURATES RESEARCH (in /admin):                         │
│  → Approve / Reject pending articles                         │
│  → Star favourites (AI writes about these first)             │
│  → Manually add articles (paste URL)                         │
│  → Approved articles appear on blog sidebar                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  AI GENERATES BLOG (triggered by admin or scheduled):        │
│  → Reads starred articles first, then approved               │
│  → Claude writes 1500-word post with real citations          │
│  → Saves as DRAFT in blog-posts table                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  ADMIN REVIEWS BLOG DRAFT (in /admin):                       │
│  → Edit text, title, images                                  │
│  → Upload/swap images (stored in S3, served via CloudFront)  │
│  → Preview → Publish                                         │
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
Reputable Sources (UNICEF, WHO, UN News, HRW, PopCouncil)
       ↓ (RSS feeds, weekly)
Research Lambda ($0)
       ↓
DynamoDB (research-articles table, status: "pending")
       ↓ (admin approves/stars)
Approved Articles → Blog sidebar (public)
Starred Articles → AI prioritizes these
       ↓
AI Generator (Claude via Bedrock, $3-5/mo)
       ↓
DynamoDB (blog-posts table, status: "draft")
       ↓ (admin edits text/images → publishes)
Published Blog Post
       ↓
  ├── /blog page (SEO traffic)
  ├── Newsletter (email subscribers)
  ├── Social Media — Plan 7 (Instagram, Facebook)
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

*Last updated: August 17, 2026*
