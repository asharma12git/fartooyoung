# Blog System (AI-Generated + Newsletter)

## Overview
Complete blog system: public pages, AI content generation via AWS Bedrock, newsletter distribution via SES. Drives organic traffic, provides landing pages for Google Ad Grants, and gives AI search engines citable content.

## Prerequisites
- AWS Bedrock access (Claude 3.5 Sonnet)
- SES configured for sending
- Pre-render script (`scripts/prerender.mjs`) for blog route SEO

## Cost

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| AWS Bedrock (Claude 3.5 Sonnet) | 4 posts/month | $1.20 |
| SES (Newsletter) | 1,000 emails/month | $0.10 |
| Lambda | ~12 invocations | $0.00 |
| DynamoDB | ~10K operations | $0.00 |
| EventBridge | 4 events/month | $0.00 |
| **Total** | | **$1.30/month** |

## Checklist
- [ ] Step 1: Blog Frontend (public pages)
- [ ] Step 2: Blog Backend + Role System
- [ ] Step 3: AI Content Generation
- [ ] Step 4: Newsletter System
- [ ] Step 5: Admin Panel

---

## Step 1: Blog Frontend ⬜

**Benefit:** A public-facing blog gives us unlimited pages to rank for long-tail keywords, provides landing pages for Google Ad Grants campaigns, and gives AI search engines citable content about child marriage. Each post is a new entry point for organic traffic — compounding over time.

**Problem:** With only 4 static pages, we have extremely limited keyword coverage and no fresh content for search engines to re-crawl. No way to target long-tail searches like "child marriage statistics India 2025" or "how to help child brides."

**Implementation:**

### Blog Listing Page (`/blog`)
- Card grid layout (2 columns desktop, 1 mobile)
- Each card shows: featured image, title, excerpt (2 lines), date, reading time
- Category/topic filter tabs (e.g., "Statistics", "Stories", "Advocacy", "Education")
- Donate CTA between post rows (every 4-6 posts)
- Newsletter signup banner at bottom

### Individual Post Page (`/blog/:slug`)

| Feature | Purpose |
|---------|---------|
| Reading time estimate | Sets expectations, reduces bounce rate |
| Table of contents | Navigation for long posts, improves time-on-page |
| Scroll progress bar | Visual indicator of reading progress, keeps readers engaged |
| Author bio with photo | E-E-A-T signal for Google — "By Avinash Sharma, Founder" |
| Inline donate CTA | Appears after emotional peak — "Your $25 keeps a girl in school for 1 month" |
| Sticky donate button | Always visible as reader scrolls |
| Related posts (3) | Keeps people on site, reduces bounce |
| Social share buttons | Facebook, Twitter/X, LinkedIn, copy link |
| FAQ section at bottom | AI engines (ChatGPT/Perplexity) cite FAQ content heavily (still valuable for GEO even though Google removed FAQ rich results May 2026) |
| Newsletter signup | Captures email at end of post when engagement is highest |
| Internal links (2-3) | Links to What We Do, Donate, Partners — spreads SEO authority |
| Real fieldwork photos | Nepal/Bangladesh images from existing carousel assets |

### Design
- Dark theme matching rest of site
- Mobile-first responsive
- Story-first approach (lead with human story, not statistics)
- Impact numbers visible near CTAs

### New Files
- `src/pages/Blog.jsx` — listing page
- `src/pages/BlogPost.jsx` — individual post page
- `src/components/BlogCard.jsx` — reusable post card
- `src/components/TableOfContents.jsx` — auto-generated from headings
- `src/components/ReadingProgress.jsx` — scroll progress bar
- Routes: `/blog` and `/blog/:slug` in `App.jsx`
- SEO component on each page (dynamic title/description per post)
- Add `/blog` to `public/sitemap.xml` and `scripts/prerender.mjs`

### Effort
2-3 hours

## Step 2: Blog Backend + Role System ⬜

**Benefit:** A serverless blog backend stores posts in DynamoDB with draft/published workflow, enabling content management without a traditional CMS or database server. A role system (`admin`/`donor`) controls who can publish/edit posts vs who can only read them.

**Problem:** Without a backend, blog content would need to be hardcoded in React components — no way to add posts without code deploys. Without roles, any logged-in user could potentially access admin features.

**Implementation:**

### Role System (add to existing Users table)
- Add `role` field to Users table: `"admin"` or `"donor"` (default: `"donor"`)
- Manually set your account (`avinashsharma.np@gmail.com`) to `role: "admin"` in DynamoDB
- Login Lambda includes `role` in the JWT token
- New middleware: `checkAdmin(token)` — returns 403 if not admin
- Frontend stores role in user state, conditionally shows admin features

### Blog DynamoDB Table: `fartooyoung-{env}-blog-posts`
- PK: `post_id` (UUID)
- Fields: `title`, `slug`, `excerpt`, `content`, `author`, `status` (draft/published), `published_at`, `keywords`, `word_count`, `category`, `faq` (array), `featured_image`, `reading_time`, `created_at`

### Lambda Functions
- `get-blog-posts.js` — GET /blog/posts (public, returns published only)
- `get-blog-post.js` — GET /blog/posts/:slug (public, single post)
- `create-blog-post.js` — POST /blog/posts (admin only, creates draft)
- `update-blog-post.js` — PUT /blog/posts/:id (admin only, edit draft)
- `publish-blog-post.js` — POST /blog/posts/:id/publish (admin only)
- `delete-blog-post.js` — DELETE /blog/posts/:id (admin only)

### API Routes
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/blog/posts` | Public | List published posts |
| GET | `/blog/posts/:slug` | Public | Get single post |
| POST | `/blog/posts` | Admin | Create draft |
| PUT | `/blog/posts/:id` | Admin | Edit post |
| POST | `/blog/posts/:id/publish` | Admin | Publish draft |
| DELETE | `/blog/posts/:id` | Admin | Delete post |

### Add to `template.yaml`
- New DynamoDB table resource
- New Lambda functions (6)
- New API Gateway routes
- `BLOG_TABLE` environment variable added to Globals

### Effort
2-3 hours

## Step 3: AI Content Generation ⬜

**Benefit:** AWS Bedrock is a managed AI service that provides access to foundation models (like Claude). Using it to generate blog drafts produces SEO-optimized, factual content at scale without hiring writers — while maintaining human oversight via the draft→review→publish workflow.

**Problem:** Writing 4 quality blog posts per month manually is time-consuming. Without consistent content, organic traffic growth stalls and Google Ad Grants has insufficient landing pages.

**Implementation:**

Lambda: `blog-generator.js`
- Runtime: Node.js 18, timeout: 5 min, memory: 1024 MB
- Calls AWS Bedrock (Claude 3.5 Sonnet)
- Generates 1500-2000 word post targeting a keyword from cluster list
- Saves as "draft" in DynamoDB
- EventBridge rule: Trigger every Monday 10am UTC

Prompt engineering (critical for Google E-E-A-T compliance):
- Write as "Avinash Sharma, Founder of Far Too Young"
- Include first-person experience references
- Cite real statistics with sources
- Include 2-3 internal links to site pages
- Generate FAQ section (3-5 questions)
- Target specific keyword from content cluster
- Structure with clear H2/H3 headings

Content clusters:

| Pillar | Keywords |
|--------|----------|
| Child Marriage | statistics by country, causes, effects on girls, laws by state, how to prevent |
| Gender-Based Violence | types, prevention, support resources, global statistics |
| Girls Education | developing countries, scholarships, impact on child marriage |
| Advocacy | how to help, volunteer, donate, policy changes |

Effort: 2 hours

## Step 4: Newsletter System ⬜

**Benefit:** A newsletter is an email distribution system that sends updates to subscribers when new content is published. It drives repeat traffic, builds community, and keeps donors engaged between donations.

**Problem:** Without a newsletter, published blog posts rely entirely on search traffic for discovery. Existing supporters have no way to stay informed unless they manually revisit the site.

**Implementation:**

DynamoDB table: `fartooyoung-{env}-newsletter`
- PK: `email`
- Fields: `name`, `status` (pending/active/unsubscribed), `subscribed_at`

Lambda functions:
- `newsletter-subscribe.js` — POST /newsletter/subscribe (double opt-in)
- `newsletter-unsubscribe.js` — POST /newsletter/unsubscribe
- `newsletter-sender.js` — triggered when post published, sends via SES

Frontend: Subscribe form in Footer + Blog page sidebar.

Effort: 1-2 hours

## Step 5: Admin Panel ⬜

**Benefit:** A dedicated admin page (`/admin`) gives the site owner a clean interface to manage blog posts — view drafts, edit content, publish, and delete — without touching the database directly. Separate from the donor dashboard to keep concerns clean.

**Problem:** Without an admin UI, managing blog posts requires logging into the AWS DynamoDB console — not user-friendly and error-prone. Also no way to delegate content management to team members in the future.

**Implementation:**

### Route: `/admin` (admin role only)
- Protected route: redirects to `/dashboard` if `user.role !== 'admin'`
- Header shows "Admin Panel" link only for admin users

### Admin Blog Management UI
- List all posts (drafts + published) with status badges
- "New Post" button → form with title, content (markdown or rich text), excerpt, category, keywords
- "Edit" button → same form pre-filled
- "Publish" / "Unpublish" toggle
- "Delete" with confirmation
- Preview before publishing

### Admin Panel Tabs (future-proof for Plan 8)
- **Blog** — manage posts (this step)
- **Donations** — view all donations (Plan 8, future)
- **Users** — manage users (Plan 8, future)
- **Settings** — site config (Plan 8, future)

### User Experience Flow
```
Admin logs in → sees "Admin Panel" link in header
  → /admin shows blog management
  → Clicks "New Post" or reviews AI-generated drafts
  → Edits if needed → clicks "Publish"
  → Post appears on /blog immediately

Regular user logs in → no "Admin Panel" link visible
  → /admin route returns redirect to /dashboard
```

### Effort
2 hours

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  WEEKLY: EventBridge triggers blog-generator Lambda          │
│  → Bedrock (Claude) generates SEO-optimized draft            │
│  → Saves to DynamoDB with status: "draft"                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  HUMAN REVIEW: Owner reviews draft → flips to "published"    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  AUTO: Post appears on /blog → Newsletter sends              │
│  → CloudFront invalidated → Pre-rendered HTML updated        │
└─────────────────────────────────────────────────────────────┘
```

## Google Compliance (E-E-A-T)

| Requirement | How We Handle It |
|-------------|-----------------|
| Human oversight | Draft → review → publish workflow |
| Author attribution | "By Avinash Sharma, Founder" on every post |
| Experience signals | First-person references to fieldwork in Nepal/Bangladesh |
| Expertise | Real statistics with cited sources |
| Trustworthiness | Nonprofit org, consistent with site mission |
| Not mass-produced | 4 posts/month max, each reviewed |

## GEO Optimization (AI Search Engines)

Each post structured for ChatGPT/Perplexity citation:
- Clear factual statements in first paragraph
- Statistics with sources
- FAQ section with structured data (JSON-LD)
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
| Organic blog traffic | 300+ visits/month |
| Email subscribers | 100+ |
| Email open rate | 20-30% |
| Google Ad Grants landing pages | 8+ |
| AI citations (ChatGPT/Perplexity) | Monitoring |
| AWS costs | <$1.50/month |

## Files Created/Modified

| File | Purpose |
|------|---------|
| `src/pages/Blog.jsx` | Blog listing page |
| `src/pages/BlogPost.jsx` | Individual post page |
| `src/App.jsx` | Add /blog routes |
| `backend/lambda/blog/get-blog-posts.js` | List published posts |
| `backend/lambda/blog/get-blog-post.js` | Get single post |
| `backend/lambda/blog/blog-generator.js` | AI content generation |
| `backend/lambda/blog/publish-blog-post.js` | Publish draft |
| `backend/lambda/newsletter/subscribe.js` | Newsletter signup |
| `backend/lambda/newsletter/unsubscribe.js` | Newsletter opt-out |
| `backend/lambda/newsletter/sender.js` | Send newsletter |
| `backend/template.yaml` | New resources |
| `public/sitemap.xml` | Add /blog |
| `scripts/prerender.mjs` | Add /blog route |

---

*Last updated: June 1, 2026*
