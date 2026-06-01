# Plan 6: Blog System (AI-Generated + Newsletter)

## Status: 📋 Ready to Execute
## Priority: HIGH — directly drives SEO traffic + Google Ad Grants landing pages
## Estimated Cost: ~$1.30/month
## Estimated Effort: 6-8 hours
## Dependencies: None

---

## Overview

Complete blog system: public pages, AI content generation, newsletter distribution. Drives organic traffic, provides landing pages for Google Ad Grants, and gives AI search engines citable content.

---

## What We're Building

1. **Frontend:** `/blog` listing page + `/blog/:slug` individual post page
2. **Backend:** DynamoDB table for posts + API endpoints
3. **AI Generation:** AWS Bedrock (Claude) generates weekly drafts
4. **Newsletter:** SES emails subscribers when posts publish
5. **SEO:** Each post pre-rendered, has meta tags, FAQ schema, internal links

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
│  HUMAN REVIEW: Owner reviews draft (admin page or DynamoDB)  │
│  → Edits if needed                                           │
│  → Flips status to "published"                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  AUTO: Post appears on /blog                                 │
│  → Newsletter Lambda sends to subscribers                    │
│  → CloudFront cache invalidated                              │
│  → Pre-rendered HTML updated on next deploy                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Blog Frontend (2 hours)

**New files:**
- `src/pages/Blog.jsx` — grid of published posts (title, excerpt, date, image)
- `src/pages/BlogPost.jsx` — full post view with author bio, FAQ section
- Route: `/blog` and `/blog/:slug` in `App.jsx`
- SEO component on each page (dynamic title/description per post)
- Add `/blog` to sitemap.xml and prerender script

**Design:**
- Same dark theme as rest of site
- Card grid layout for listing
- Author section: "By Avinash Sharma, Founder" with photo
- Internal links to What We Do, Donate, Partners within posts
- FAQ section at bottom of each post (for Google featured snippets + GEO)

### Step 2: Blog Backend (2 hours)

**DynamoDB table:** `fartooyoung-{env}-blog-posts`
- PK: `post_id` (UUID)
- Fields: `title`, `slug`, `excerpt`, `content`, `author`, `status` (draft/published), `published_at`, `keywords`, `word_count`, `faq` (array), `created_at`

**Lambda functions:**
- `get-blog-posts.js` — GET /blog/posts (public, returns published only)
- `get-blog-post.js` — GET /blog/posts/:slug (public, single post)
- `publish-blog-post.js` — POST /blog/posts/:id/publish (admin only)

**Add to `template.yaml`** — new functions + DynamoDB table

### Step 3: AI Content Generation (2 hours)

**Lambda:** `blog-generator.js`
- Runtime: Node.js 18, timeout: 5 min, memory: 1024 MB
- Calls AWS Bedrock (Claude 3.5 Sonnet)
- Generates 1500-2000 word post targeting a keyword from the cluster list
- Saves as "draft" in DynamoDB

**Prompt engineering (critical for Google compliance):**
- Write as "Avinash Sharma, Founder of Far Too Young"
- Include first-person experience references
- Cite real statistics with sources
- Include 2-3 internal links to site pages
- Generate FAQ section (3-5 questions)
- Target specific keyword from content cluster
- Structure with clear H2/H3 headings

**Content clusters (organized by pillar):**

| Pillar | Cluster Keywords |
|--------|-----------------|
| Child Marriage | statistics by country, causes, effects on girls, laws by state, how to prevent |
| Gender-Based Violence | types, prevention, support resources, global statistics |
| Girls Education | developing countries, scholarships, impact on child marriage |
| Advocacy | how to help, volunteer, donate, policy changes |

**EventBridge rule:** Trigger every Monday 10am UTC

### Step 4: Newsletter System (1-2 hours)

**DynamoDB table:** `fartooyoung-{env}-newsletter`
- PK: `email`
- Fields: `name`, `status` (pending/active/unsubscribed), `subscribed_at`

**Lambda functions:**
- `newsletter-subscribe.js` — POST /newsletter/subscribe (double opt-in)
- `newsletter-unsubscribe.js` — POST /newsletter/unsubscribe
- `newsletter-sender.js` — triggered when post published, sends via SES

**Frontend:** Subscribe form in Footer + Blog page sidebar

### Step 5: Admin Review (1 hour)

Simple admin page or use DynamoDB console:
- View drafts
- Edit content
- Click "Publish"
- Could be a simple `/admin/blog` page (only visible to admin role)

---

## Google Compliance (E-E-A-T)

To avoid "scaled content abuse" penalties:

| Requirement | How We Handle It |
|-------------|-----------------|
| Human oversight | Draft → review → publish workflow |
| Author attribution | "By Avinash Sharma, Founder" on every post |
| Experience signals | First-person references to fieldwork in Nepal/Bangladesh |
| Expertise | Real statistics with cited sources |
| Trustworthiness | Nonprofit org, consistent with site mission |
| Not mass-produced | 4 posts/month max, each reviewed |

---

## GEO Optimization (AI Search Engines)

Each post structured for ChatGPT/Perplexity citation:
- Clear factual statements in first paragraph
- Statistics with sources
- FAQ section with structured data (JSON-LD)
- Quotable one-liners
- Consistent entity references ("Far Too Young, a US-based nonprofit...")

---

## Cost Breakdown

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| AWS Bedrock (Claude 3.5 Sonnet) | 4 posts/month | $1.20 |
| SES (Newsletter) | 1,000 emails/month | $0.10 |
| Lambda | ~12 invocations | $0.00 (free tier) |
| DynamoDB | ~10K operations | $0.00 (free tier) |
| EventBridge | 4 events/month | $0.00 (free tier) |
| **Total** | | **$1.30/month** |

---

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

---

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

---

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
