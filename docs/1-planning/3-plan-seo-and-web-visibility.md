# SEO & Web Visibility

## Overview
Make the site visible to Google (pre-rendering), rank higher (structured data, Core Web Vitals), and build competitive edge (Google Ad Grants, GEO, backlinks). Site was invisible to search engines as a client-rendered React SPA.

**Status:** ✅ Phase 1 + Phase 2 COMPLETE | Phase 3 TODO  
**Priority:** HIGH  
**Cost:** $0/month (all free tools)  
**Effort:** Phase 1 = 2-3 hours, Phase 2 = 3-4 hours, Phase 3 = ongoing

## Prerequisites
- React app deployed on S3 + CloudFront
- Google Workspace admin account for Far Too Young
- 501(c)(3) status (for Google Ad Grants)

## Checklist
- [x] Step 1: Pre-rendering (Static HTML for Google)
- [x] Step 2: Meta Tags + Open Graph (Per-Page)
- [x] Step 3: Sitemap + Robots.txt
- [x] Step 4: Google Search Console
- [x] Step 5: Analytics (GA4 + Microsoft Clarity)
- [x] Step 6: Structured Data (JSON-LD)
- [x] Step 7: Core Web Vitals Optimization
- [x] Step 8: Canonical URLs
- [x] Step 9: PWA Manifest
- [ ] Step 10: Google Ad Grants ($10K/month free ads)
- [ ] Step 11: Content / Blog System
- [ ] Step 12: GEO — AI Search Optimization
- [ ] Step 13: Backlinks & Authority Building
- [ ] Step 14: IndexNow Protocol

---

## Step 1: Pre-rendering (Static HTML for Google) ✅

**Implementation:** Puppeteer script (`scripts/prerender.mjs`) runs after `vite build`. Generates static HTML for 4 routes: `/`, `/founder-team`, `/partners`, `/what-we-do`. Build command: `vite build && node scripts/prerender.mjs`. Pipeline buildspec installs `chromium-browser` for CI. Each HTML file is 38-57KB of real content.

**The Problem:** Google sees `<div id="root"></div>` — empty. Pre-rendering outputs real HTML at build time. CloudFront serves these. Users still get SPA experience after hydration.

## Step 2: Meta Tags + Open Graph (Per-Page) ✅

**Implementation:** `react-helmet-async` (v2.0.5) with shared `src/components/SEO.jsx` component. Each page imports `<SEO title="..." description="..." path="..." />`. Outputs: `<title>`, `<meta description>`, `<link canonical>`, OG tags, Twitter Card tags. OG image points to `/og-image.jpg`.

## Step 3: Sitemap + Robots.txt ✅

**Implementation:** `public/sitemap.xml` lists 4 public URLs with priority weights. `public/robots.txt` allows all crawlers, blocks `/dashboard`, `/verify-email`, `/payment-success`, `/subscription-return`.

## Step 4: Google Search Console ✅

**Implementation:** Submitted `sitemap.xml` via Google Search Console. Property: `www.fartooyoung.org`. Verified via DNS TXT record in Route 53. Dashboard: [search.google.com/search-console](https://search.google.com/search-console).

## Step 5: Analytics (GA4 + Microsoft Clarity) ✅

**GA4:** Measurement ID `G-XJN5PR545G`, Stream ID `6380801517`. Visitor count, traffic sources, page views, geographic data, device types, conversion tracking. Free forever.

**Microsoft Clarity:** Project ID `wytghx7ix4`. Heatmaps, scroll maps, session recordings, dead click detection, rage click detection. Free forever, unlimited recordings, 30-day retention.

Both are `<script>` tags in `index.html`.

## Step 6: Structured Data (JSON-LD) ✅

**Implementation:** `<script type="application/ld+json">` in `index.html` body. Schema: `NonprofitOrganization` with `DonateAction`. Includes org name, URL, description, Atlanta GA address. Enables rich results in Google, AI citation eligibility, Knowledge Panel eligibility.

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

## Step 7: Core Web Vitals Optimization ✅

**Implementation:** Added `<link rel="preconnect">` for `fonts.googleapis.com`, `fonts.gstatic.com`, and `js.stripe.com` in `index.html`. Eliminates DNS/TLS latency, improves LCP.

## Step 8: Canonical URLs ✅

**Implementation:** `<link rel="canonical" href="...">` per page via `SEO.jsx` component. Prevents duplicate content penalties from www vs non-www or trailing slashes.

## Step 9: PWA Manifest ✅

**Implementation:** `public/manifest.json` with app name, icons (192px + 512px), dark theme color (`#0a0a0a`), standalone display mode. Linked via `<link rel="manifest">` in `index.html`. Site installable on phones.

## Step 10: Google Ad Grants ($10K/month free ads)

**Status:** ⏳ Applied May 29, 2026 — awaiting verification (2-14 business days via Goodstack)  
**Contact:** `avinashsharma.np@gmail.com` / approval to `admin@fartooyoung.org`

Google gives eligible 501(c)(3) nonprofits **$10,000/month in free Google Ads** ($120,000/year).

**Requirements to maintain:**
- 5% click-through rate across all campaigns
- Log in at least once per month
- At least 2 ads per ad group, 2 ad groups per campaign
- Sitelink extensions required
- Track at least 1 meaningful conversion per month
- No single-word keywords (except brand name)
- No overly generic keywords

**Keywords to target:**
- "End child marriage" → Home page
- "Child marriage statistics" → What We Do page
- "Donate to prevent child marriage" → Donation flow
- "Child marriage nonprofit" → Founder & Team page
- "How to stop child marriage" → Blog posts (once blog exists)

## Step 11: Content / Blog System

See Plan 6 (AI Blog System) for full implementation. Fresh content targets long-tail keywords, gives AI engines citable content, builds backlinks, and supports Google Ad Grants landing pages.

## Step 12: GEO — AI Search Optimization

**Goal:** Get cited by AI search engines (ChatGPT, Perplexity, Google AI Overviews). AI referral traffic grew **527% between Jan-May 2025**.

**Wikidata entry created:** ✅  
- Username: `FTYoung` on wikidata.org
- Item URL: https://www.wikidata.org/wiki/Q139980067
- Contributions: https://www.wikidata.org/wiki/Special:Contributions/FTYoung

**Organization Details:**
- Legal Name: Far Too Young, Inc.
- Business Type: Domestic Nonprofit Corporation
- GA Secretary of State Control #: 21285996
- Date of Formation: November 4, 2021
- State: Georgia
- NAICS: Human Rights Organizations
- 501(c)(3): Yes

**Remaining GEO tasks:**
- Wikipedia page (requires 3-5 independent press sources — do NOT write your own)
- Consistent entity presence (Google Business Profile, Crunchbase, LinkedIn company page)
- All nonprofit directories (see Step 13)

## Step 13: Backlinks & Authority Building

### Tier 1: Nonprofit Directories (Free)

| Directory | Authority | Time |
|-----------|-----------|------|
| [GuideStar/Candid](https://www.guidestar.org) | Very High | 45 min |
| [GlobalGiving](https://www.globalgiving.org) | Very High | 30 min |
| [GreatNonprofits](https://greatnonprofits.org) | High | 15 min |
| [Charity Navigator](https://www.charitynavigator.org) | Very High | 30 min |
| [Idealist](https://www.idealist.org) | High | 20 min |
| [Network for Good](https://www.networkforgood.org) | High | 20 min |

### Tier 2: Partner & Relationship Links

- Email partners: "Can you add us to your Partners page with a link?"
- University partnerships (extremely valuable .edu links)
- Sponsor/donor pages, local business associations

### Tier 3: Earned Media & PR

- **HARO/Connectively** ([connectively.us](https://www.connectively.us)) — respond to journalist queries, 10 min/day
- Local news pitch: "Local founder launches global nonprofit to end child marriage"
- Podcast appearances (nonprofits, social justice, human rights)
- Guest articles on other nonprofit blogs
- Press releases via [PRLog](https://www.prlog.org)

### Social Profiles ✅ Done

- ✅ Instagram: https://www.instagram.com/fartooyoung_organization/
- ✅ Facebook: https://www.facebook.com/fartooyoung.org
- ✅ YouTube: https://www.youtube.com/@FarTooYoungInc

**What NOT to do:** ❌ Buy backlinks, ❌ spammy directories, ❌ comment spam, ❌ link exchange schemes

## Step 14: IndexNow Protocol

Instant indexing by Bing/Yandex when content changes. Add post-deploy step in frontend pipeline:

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

## Phase 3 Execution Order

| # | Task | Type | Effort | Impact |
|---|------|------|--------|--------|
| 1 | Social profiles link to site | Manual | 5 min | Medium |
| 2 | Wikidata entry | Manual | 30 min | High (AI visibility) |
| 3 | Nonprofit directory registrations | Manual | 2-3 hrs | Very High |
| 4 | Google Ad Grants application | Manual | 2 hrs | 🔥🔥🔥 Massive |
| 5 | HARO/Connectively sign-up | Manual | 10 min + daily | High (over time) |
| 6 | Partner link requests | Manual/Email | 1 hr | Medium |
| 7 | Local news pitch | Manual | 1 hr | High |
| 8 | Blog system | Code | 8-10 hrs | High |
| 9 | IndexNow | Code | 15 min | Low |
| 10 | Wikipedia page | Manual | Depends on press | Very High (long-term) |

## Tools Used (All Free)

| Tool | Purpose |
|------|---------|
| `react-helmet-async` | Per-page meta tags |
| Puppeteer (`scripts/prerender.mjs`) | Pre-render HTML at build time |
| Google Search Console | Monitor indexing + search performance |
| Google Analytics 4 | Visitor analytics |
| Microsoft Clarity | Heatmaps + session recordings |
| Google Ad Grants | $10K/month free ads (Phase 3) |

## References

- [SPA SEO Challenges 2025-2026](https://devtechinsights.com/spas-seo-challenges-2025/)
- [Nonprofit SEO Complete Guide 2026](https://rankpill.com/seo-for/nonprofits)
- [GEO: Generative Engine Optimization Guide](https://www.soar.sh/blog/geo-guide-2026)
- [Google Ad Grants for Nonprofits](https://bigsea.co/ideas/get-google-ad-grants-nonprofit/)
- [vite-react-ssg (Static Site Generation for Vite)](https://github.com/Daydreamer-riri/vite-react-ssg)

---

*Created: May 2026*
