# Plan 3: SEO & Web Visibility

## Status: 📋 Ready to Execute
## Priority: HIGH — site is currently invisible to Google
## Estimated Cost: $0/month (all free tools)
## Estimated Effort: Phase 1 = 2-3 hours, Phase 2 = 3-4 hours, Phase 3 = future

---

## The Problem

Right now, Google sees this when it crawls fartooyoung.org:

```html
<html>
  <body>
    <div id="root"></div>  <!-- EMPTY. No content. -->
  </body>
</html>
```

The site is a React SPA (client-side rendered). Google's crawler fetches the HTML, sees nothing, and moves on. The site is effectively **invisible to search engines**.

This is the #1 SEO problem for React SPAs in 2025-2026. Companies like Airbnb, LinkedIn, and Netflix all solved this by moving to server-side rendering or pre-rendering. We'll use pre-rendering (simpler, no framework migration needed).

---

## What Top Companies Do (Research Summary)

| Company | Approach | Why |
|---------|----------|-----|
| Netflix, Uber | Next.js SSR | Millions of pages, dynamic content |
| Airbnb | Hybrid SSR + CSR | Listings need indexing, app needs speed |
| LinkedIn | Pre-render critical routes | Profiles/articles indexed, dashboard CSR |
| Smaller sites | Pre-rendering at build time | Simple, no infra change, works with Vite |

**For Far Too Young:** Pre-rendering at build time is the right approach. We have 5 public pages — no need for a full framework migration.

---

## What's New in 2025-2026: GEO (Generative Engine Optimization)

Traditional SEO = rank in Google's blue links.
**GEO** = get cited by AI search engines (ChatGPT, Perplexity, Google AI Overviews, Claude).

AI referral traffic grew **527% between Jan-May 2025**. When someone asks ChatGPT "how can I help end child marriage?", we want Far Too Young cited in the answer.

**How to win at GEO:**
- Structured data (JSON-LD) — AI models read schema markup
- Clear, factual, citable content — AI prefers authoritative sources
- Entity optimization — be recognized as a nonprofit entity
- Wikipedia/Wikidata presence — AI models heavily reference these

We'll build GEO into our structured data and content strategy.

---

## Phase 1: Get Indexed & Tracked (This Session — 2-3 hours)

Everything here is **zero cost** and makes the site visible to Google immediately.

### 1.1 Pre-rendering (Static HTML for Google)

**Tool:** `vite-react-ssg` or `react-snap-vite`

Generates real HTML at build time for each public route. Google sees actual content instead of an empty div.

**Routes to pre-render:**
- `/` (Home / Child Marriage)
- `/founder-team`
- `/partners`
- `/what-we-do`
- `/payment-success` (optional)

**What changes:** Build step outputs HTML files with content baked in. CloudFront serves these. Users still get the SPA experience after hydration.

### 1.2 Meta Tags + Open Graph (Per-Page)

**Tool:** `react-helmet-async`

Each page gets:
- Unique `<title>` — e.g., "End Child Marriage | Far Too Young"
- `<meta name="description">` — appears in Google search results
- Open Graph tags — controls how links look on Facebook/LinkedIn/Twitter
- Twitter Card tags — rich previews when shared

**Example:**
```jsx
<Helmet>
  <title>End Child Marriage Globally | Far Too Young</title>
  <meta name="description" content="Join the movement to end child marriage. Far Too Young works globally to protect children's rights through education, advocacy, and community programs." />
  <meta property="og:title" content="End Child Marriage | Far Too Young" />
  <meta property="og:image" content="https://www.fartooyoung.org/og-image.jpg" />
</Helmet>
```

### 1.3 Sitemap + Robots.txt

**`public/sitemap.xml`** — tells Google every page that exists:
```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.fartooyoung.org/</loc></url>
  <url><loc>https://www.fartooyoung.org/founder-team</loc></url>
  <url><loc>https://www.fartooyoung.org/partners</loc></url>
  <url><loc>https://www.fartooyoung.org/what-we-do</loc></url>
</urlset>
```

**`public/robots.txt`** — tells crawlers what to index:
```
User-agent: *
Allow: /
Sitemap: https://www.fartooyoung.org/sitemap.xml
```

### 1.4 Google Search Console

- Verify domain ownership (DNS TXT record in Route 53)
- Submit sitemap
- Monitor indexing status, search queries, click-through rates
- **Free.** This is how you see what Google thinks of your site.

### 1.5 Analytics: GA4 + Microsoft Clarity

**Google Analytics 4** — one script tag:
- Visitor count, traffic sources, page views, time on site
- Geographic data, device types
- Conversion tracking (donation button clicks)
- Free forever under 10M events/month

**Microsoft Clarity** — one script tag:
- Heatmaps (where people click)
- Scroll maps (how far they scroll)
- Session recordings (watch exactly what users do)
- Free, unlimited recordings
- No data limits

Both are `<script>` tags in `index.html`. No backend changes.

---

## Phase 2: Rank Higher (Next Session — 3-4 hours)

### 2.1 Structured Data (JSON-LD)

Tells Google AND AI engines exactly what this site is:

```json
{
  "@context": "https://schema.org",
  "@type": "NonprofitOrganization",
  "name": "Far Too Young",
  "url": "https://www.fartooyoung.org",
  "description": "Nonprofit organization working to end child marriage globally",
  "sameAs": ["https://www.instagram.com/fartooyoung/"],
  "potentialAction": {
    "@type": "DonateAction",
    "target": "https://www.fartooyoung.org/"
  }
}
```

This enables:
- Rich results in Google (nonprofit badge, donate button)
- AI citation in ChatGPT/Perplexity answers
- Knowledge panel eligibility

### 2.2 Core Web Vitals Optimization

Google's page speed ranking factors:
- **LCP** (Largest Contentful Paint) — preload hero images, font-display: swap
- **CLS** (Cumulative Layout Shift) — set explicit image dimensions
- **INP** (Interaction to Next Paint) — minimize JS blocking

Quick wins:
- Add `<link rel="preload">` for the Google Font
- Add `width`/`height` to images
- Lazy load below-fold images
- Preconnect to Stripe/Google domains

### 2.3 Canonical URLs

Add to every page:
```html
<link rel="canonical" href="https://www.fartooyoung.org/founder-team" />
```

Prevents Google from treating `www` and non-`www`, or trailing slashes, as duplicate pages.

### 2.4 PWA Manifest

Makes the site installable on phones:
```json
{
  "name": "Far Too Young",
  "short_name": "FTY",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0a0a0a",
  "background_color": "#0a0a0a"
}
```

Google rewards mobile-friendly installable sites in mobile search rankings.

---

## Phase 3: Competitive Edge (Future Sessions)

### 3.1 Google Ad Grants — $10,000/month FREE Advertising

**This is the single biggest opportunity for Far Too Young.**

Google gives eligible 501(c)(3) nonprofits **$10,000/month in free Google Ads** ($120,000/year). When someone searches "donate to end child marriage" or "child marriage charity", your ad appears at the top of Google — for free.

**Requirements:**
- Must be a registered 501(c)(3) — ✅ (assuming FTY has this)
- Must have a website with substantial content
- Must maintain 5% click-through rate
- Must track meaningful conversions

**How to apply:**
1. Register with [Google for Nonprofits](https://www.google.com/nonprofits/) (verify 501(c)(3) status)
2. Once approved, activate the Google Ad Grants product
3. Create a Google Ads account linked to the grant
4. Build campaigns targeting keywords like "end child marriage", "donate to prevent child marriage", "child marriage charity"
5. Set up conversion tracking (donation button clicks, form submissions) — required to maintain the grant

**Rules to keep the grant active:**
- Maintain 5% click-through rate (CTR) across all campaigns
- Log into the account at least once per month
- Must have at least 2 ads per ad group
- Must have at least 2 ad groups per campaign
- Must have sitelink extensions
- Must track at least 1 meaningful conversion per month
- No single-word keywords (except brand name)
- No overly generic keywords (e.g., "free", "donate")

**What to advertise:**
- "End child marriage" → Home page
- "Child marriage statistics" → What We Do page
- "Donate to prevent child marriage" → Donation flow
- "Child marriage nonprofit" → Founder & Team page
- "How to stop child marriage" → Blog posts (once blog exists)

**This alone could drive more donations than all other SEO work combined.**

---

### 3.2 Content / Blog System

Fresh content signals authority to Google. A blog with posts about child marriage statistics, success stories, and advocacy updates would:
- Target long-tail keywords ("how to prevent child marriage in India")
- Give AI engines citable content
- Build backlinks naturally
- Support Google Ad Grants (need landing pages for ads)

See Plan 6 (AI Blog System) for automated content generation.

---

### 3.3 GEO: AI Search Optimization

**What is GEO?**

Generative Engine Optimization is how you get cited by AI search engines — ChatGPT, Perplexity, Google AI Overviews, and Claude. When someone asks "what organizations fight child marriage?", we want Far Too Young in the answer.

AI referral traffic grew **527% between Jan-May 2025**. By 2026, ~10% of search-like activity happens through ChatGPT alone. This is the future of discovery.

**How AI decides what to cite:**

AI models don't "rank" pages like Google. They pull from:
1. **Wikipedia / Wikidata** — the #1 source AI models reference for entity information
2. **Structured data on your site** (JSON-LD) — machine-readable identity (done in Phase 2)
3. **Authoritative mentions** — other trusted sites mentioning you
4. **Clear, factual, quotable content** — AI prefers content it can directly quote
5. **Consistency** — same name, same description, same mission across all platforms

**Step-by-step GEO implementation:**

#### Step 1: Wikidata Entry (Do This Week — Free, 30 min)

Wikidata is the structured database behind Wikipedia. AI models read it directly. No "notability" requirement — any registered organization can have an entry.

1. Go to [wikidata.org](https://www.wikidata.org)
2. Create an account
3. Click "Create a new Item"
4. Fill in:
   - Label: "Far Too Young"
   - Description: "Nonprofit organization working to end child marriage globally"
   - Instance of: nonprofit organization (Q163740)
   - Country: United States (Q30)
   - Official website: https://www.fartooyoung.org
   - Founded by: [founder name]
   - Inception: [year founded]

This immediately makes Far Too Young a recognized "entity" that AI models can reference.

#### Step 2: Wikipedia Page (3-6 Months — Requires Press Coverage)

Wikipedia requires "notability" — meaning independent, reliable sources have written about you.

**What counts as a reliable source:**
- News articles (local or national) mentioning Far Too Young
- Academic papers or reports citing the organization
- Interviews published on established media sites
- Coverage by other nonprofits or UN agencies

**What does NOT count:**
- Your own website
- Social media posts
- Press releases you wrote yourself
- Paid advertorials

**How to get there:**
1. Pitch your story to local news outlets ("Local founder launches global nonprofit to end child marriage")
2. Get quoted in articles about child marriage (use HARO/Connectively — see backlinks section below)
3. Partner with universities doing child marriage research
4. Speak at conferences and get listed on their sites
5. Once you have 3-5 independent sources → hire a Wikipedia editor ($500-1500) or request coverage from WikiProject Nonprofits

**Do NOT write your own Wikipedia page** — it violates Wikipedia's conflict of interest policy and will get deleted.

#### Step 3: Consistent Entity Presence

Ensure Far Too Young appears identically across all platforms:
- Same name, same description, same logo everywhere
- Google Business Profile (even without a physical office — use "service area")
- Crunchbase profile (free for nonprofits)
- LinkedIn company page
- All nonprofit directories (see backlinks section below)

AI models cross-reference these sources. Consistency = trust = citations.

---

### 3.4 Backlinks & Authority Building

Backlinks (other websites linking to fartooyoung.org) are the #1 factor for Google rankings AND for AI citation authority. More high-quality links = higher trust = better visibility everywhere.

#### Tier 1: Nonprofit Directories (Do This Week — Free)

| Directory | Authority | How to Register | Time |
|-----------|-----------|-----------------|------|
| [GuideStar/Candid](https://www.guidestar.org) | Very High | Create profile, verify 501(c)(3), add financials | 45 min |
| [GlobalGiving](https://www.globalgiving.org) | Very High | Apply as a nonprofit partner | 30 min |
| [GreatNonprofits](https://greatnonprofits.org) | High | Claim your page, add description | 15 min |
| [Charity Navigator](https://www.charitynavigator.org) | Very High | Submit organization for rating | 30 min |
| [Idealist](https://www.idealist.org) | High | Create organization profile | 20 min |
| [Network for Good](https://www.networkforgood.org) | High | Register as nonprofit | 20 min |

**Why this matters:** These directories have domain authority scores of 70-90 (out of 100). One link from GuideStar is worth more than 100 links from random blogs. AI models also reference these directories when answering questions about nonprofits.

#### Tier 2: Partner & Relationship Links (Ongoing)

| Method | What to Do | Expected Result |
|--------|-----------|-----------------|
| Partner organizations | Email partners: "Can you add us to your Partners page with a link?" | 1-5 links |
| University partnerships | Reach out to universities studying child marriage — offer data/collaboration | 1-3 .edu links (extremely valuable) |
| Sponsor/donor pages | If you sponsor events or collaborate, ask for a link on their site | 1-3 links |
| Local business associations | Chamber of commerce, nonprofit coalitions | 1-2 links |

#### Tier 3: Earned Media & PR (1-3 Months)

| Method | How | Effort |
|--------|-----|--------|
| HARO / Connectively | Sign up at [connectively.us](https://www.connectively.us). Journalists post queries like "Looking for nonprofits fighting child marriage." You respond with a quote. They publish with a link to your site. | 10 min/day scanning queries |
| Local news pitch | Email local news: "Local founder launches global nonprofit to end child marriage" — human interest angle | 1 hour to write pitch |
| Podcast appearances | Search for podcasts about nonprofits, social justice, human rights. Pitch the founder as a guest. | 30 min per pitch |
| Guest articles | Write a 500-word article for another nonprofit's blog about child marriage. Include a link back. | 2-3 hrs per article |
| Press releases | Use free services like [PRLog](https://www.prlog.org) to distribute press releases about milestones | 1 hr per release |

#### Tier 4: Social Profiles (Do Today — 5 min)

Ensure every social profile links back to `https://www.fartooyoung.org`:
- Instagram bio
- LinkedIn company page
- Facebook page
- Twitter/X bio
- YouTube channel (if exists)
- TikTok (if exists)

These are "nofollow" links (don't pass SEO juice directly) but they establish entity consistency for AI models and drive referral traffic.

#### What NOT to Do
- ❌ Buy backlinks (Google penalizes this)
- ❌ Submit to spammy directories (low-quality links hurt you)
- ❌ Comment spam on blogs
- ❌ Link exchange schemes

---

### 3.5 IndexNow Protocol

Instant indexing by Bing/Yandex when content changes (Google hasn't adopted it yet but Bing has). One API call after each deploy notifies search engines of new content immediately instead of waiting for crawlers.

**Implementation:** Add a post-deploy step in the frontend pipeline that pings:
```
POST https://api.indexnow.org/indexnow
{
  "host": "www.fartooyoung.org",
  "key": "<your-key>",
  "urlList": [
    "https://www.fartooyoung.org/",
    "https://www.fartooyoung.org/founder-team",
    "https://www.fartooyoung.org/partners",
    "https://www.fartooyoung.org/what-we-do"
  ]
}
```

---

### Phase 3 Execution Order

| # | Task | Type | Effort | Impact |
|---|------|------|--------|--------|
| 1 | Social profiles link to site | Manual | 5 min | Medium |
| 2 | Wikidata entry | Manual | 30 min | High (AI visibility) |
| 3 | Nonprofit directory registrations | Manual | 2-3 hrs total | Very High |
| 4 | Google Ad Grants application | Manual | 2 hrs | 🔥🔥🔥 Massive |
| 5 | HARO/Connectively sign-up | Manual | 10 min + daily | High (over time) |
| 6 | Partner link requests | Manual/Email | 1 hr | Medium |
| 7 | Local news pitch | Manual | 1 hr | High |
| 8 | Blog system | Code | 8-10 hrs | High |
| 9 | IndexNow | Code | 15 min | Low |
| 10 | Wikipedia page | Manual | Depends on press | Very High (long-term) |

---

## Implementation Priority

| # | Item | Effort | Impact | When |
|---|------|--------|--------|------|
| 1 | Pre-rendering | 1 hr | 🔥 Critical | Phase 1 |
| 2 | Meta tags + OG | 30 min | 🔥 Critical | Phase 1 |
| 3 | Sitemap + robots.txt | 10 min | 🔥 Critical | Phase 1 |
| 4 | Google Search Console | 15 min | High | Phase 1 |
| 5 | GA4 + Clarity | 15 min | High | Phase 1 |
| 6 | Structured data (JSON-LD) | 30 min | High | Phase 2 |
| 7 | Core Web Vitals | 1 hr | Medium | Phase 2 |
| 8 | Canonical URLs | 10 min | Medium | Phase 2 |
| 9 | PWA manifest | 30 min | Medium | Phase 2 |
| 10 | Google Ad Grants | 2 hrs | 🔥🔥🔥 Massive | Phase 3 |
| 11 | Blog/content | 8-10 hrs | High | Phase 3 |
| 12 | GEO (Wikipedia, Wikidata) | 2-3 hrs | High (long-term) | Phase 3 |
| 13 | IndexNow | 15 min | Low | Phase 3 |

---

## What This Gets Us

**After Phase 1:**
- Google can actually see and index the site
- We know who visits and what they do
- Links shared on social media look professional

**After Phase 2:**
- Higher rankings for "child marriage" related searches
- Rich results in Google (nonprofit badge)
- AI engines can cite us
- Site installable on phones

**After Phase 3:**
- $10,000/month in free Google advertising
- Organic traffic from blog content
- Cited by ChatGPT/Perplexity when people ask about child marriage
- Instant indexing of new content

---

## Tools Used (All Free)

| Tool | Purpose |
|------|---------|
| `react-helmet-async` | Per-page meta tags |
| `vite-react-ssg` | Pre-render HTML at build time |
| Google Search Console | Monitor indexing + search performance |
| Google Analytics 4 | Visitor analytics |
| Microsoft Clarity | Heatmaps + session recordings |
| Google Ad Grants | $10K/month free ads (Phase 3) |

---

## References

- [SPA SEO Challenges 2025-2026](https://devtechinsights.com/spas-seo-challenges-2025/)
- [Nonprofit SEO Complete Guide 2026](https://rankpill.com/seo-for/nonprofits)
- [GEO: Generative Engine Optimization Guide](https://www.soar.sh/blog/geo-guide-2026)
- [Google Ad Grants for Nonprofits](https://bigsea.co/ideas/get-google-ad-grants-nonprofit/)
- [vite-react-ssg (Static Site Generation for Vite)](https://github.com/Daydreamer-riri/vite-react-ssg)
