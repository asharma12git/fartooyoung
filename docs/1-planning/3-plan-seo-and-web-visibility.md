# SEO & Web Visibility

## Overview
Make the site visible to Google (pre-rendering), rank higher (structured data, Core Web Vitals), and build competitive edge (Google Ad Grants, GEO, backlinks). Site was invisible to search engines as a client-rendered React SPA.

## Prerequisites
- React app deployed on S3 + CloudFront
- Google Workspace admin account for Far Too Young
- 501(c)(3) status (for Google Ad Grants)

## Cost
$0/month (all free tools)

## Checklist

### Phase 1: Technical SEO
- [x] Step 1: Pre-rendering (Static HTML for Google)
- [x] Step 2: Meta Tags + Open Graph (Per-Page)
- [x] Step 3: Sitemap + Robots.txt
- [x] Step 4: Google Search Console
- [x] Step 5: Analytics (GA4 + Microsoft Clarity)

### Phase 2: Rich Results & Performance
- [x] Step 6: Structured Data (JSON-LD)
- [x] Step 7: Core Web Vitals Optimization
- [x] Step 8: Canonical URLs
- [x] Step 9: PWA Manifest

### Phase 3: Growth & Authority
- [ ] Step 10: Google Ad Grants ($10K/month free ads)
- [ ] Step 11: Content / Blog System
- [ ] Step 12: GEO — AI Search Optimization
- [ ] Step 13: Backlinks & Authority Building
- [ ] Step 14: IndexNow Protocol

---

## Step 1: Pre-rendering (Static HTML for Google) ✅

**Benefit:** Pre-rendering is a technique that generates static HTML files at build time using a headless browser (Puppeteer). Search engines can then read real content instead of an empty `<div>`. This makes our React SPA fully indexable by Google.

**Problem:** Google sees `<div id="root"></div>` — empty. Our site was completely invisible to search engines.

**Implementation:** Puppeteer script (`scripts/prerender.mjs`) runs after `vite build`. Generates static HTML for 4 routes: `/`, `/founder-team`, `/partners`, `/what-we-do`. Build command: `vite build && node scripts/prerender.mjs`. Pipeline buildspec installs `chromium-browser` for CI. Each HTML file is 38-57KB of real content. CloudFront serves these. Users still get SPA experience after hydration.

## Step 2: Meta Tags + Open Graph (Per-Page) ✅

**Benefit:** Meta tags tell search engines and social platforms what each page is about. Open Graph tags control how links appear when shared on Facebook, Twitter, Slack, etc. (title, description, image preview).

**Problem:** Without per-page meta tags, all pages show the same generic title/description in search results and social shares.

**Implementation:** `react-helmet-async` (v2.0.5) with shared `src/components/SEO.jsx` component. Each page imports `<SEO title="..." description="..." path="..." />`. Outputs: `<title>`, `<meta description>`, `<link canonical>`, OG tags, Twitter Card tags. OG image points to `/og-image.jpg`.

## Step 3: Sitemap + Robots.txt ✅

**Benefit:** A sitemap is an XML file that lists all pages on your site, helping search engines discover and crawl them efficiently. Robots.txt tells crawlers which pages to index and which to skip.

**Problem:** Without a sitemap, Google may miss pages or crawl them slowly. Without robots.txt, private pages (dashboard, payment) could appear in search results.

**Implementation:** `public/sitemap.xml` lists public URLs with priority weights. `public/robots.txt` allows all crawlers, blocks `/dashboard`, `/verify-email`, `/payment-success`, `/subscription-return`.
- Sitemap URL: https://www.fartooyoung.org/sitemap.xml
- Robots.txt URL: https://www.fartooyoung.org/robots.txt
- Submitted to Google Search Console (see Step 4)
- Manage sitemaps: [search.google.com/search-console/sitemaps](https://search.google.com/search-console/sitemaps)

## Step 4: Google Search Console ✅

**Benefit:** Google Search Console is a free tool that shows how Google sees your site — which pages are indexed, what queries bring traffic, and any crawl errors. Essential for monitoring SEO health.

**Problem:** Without Search Console, we have no visibility into indexing status or search performance.

**Implementation:**
- Dashboard: [search.google.com/search-console](https://search.google.com/search-console)
- Account: Far Too Young Google Workspace admin account
- Property: `www.fartooyoung.org`
- Sitemap URL: `https://www.fartooyoung.org/sitemap.xml`
- Sitemap status: Success
- Verified via DNS TXT record in Route 53

## Step 5: Analytics (GA4 + Microsoft Clarity) ✅

**Benefit:** Google Analytics 4 (GA4) tracks visitor count, traffic sources, page views, geographic data, device types, and conversion events. Microsoft Clarity provides heatmaps (where users click), scroll maps, session recordings, dead click detection, and rage click detection. Together they give complete visibility into user behavior.

**Problem:** Without analytics, we have zero data on who visits, what they do, or where they drop off.

**Implementation:**

Google Analytics 4:
- Dashboard: [analytics.google.com](https://analytics.google.com)
- Account: Far Too Young Inc. (Google Workspace admin account)
- Measurement ID: `G-XJN5PR545G`
- Stream ID: `6380801517`
- Stream URL: `https://fartooyoung.org`
- Free forever

Microsoft Clarity:
- Dashboard: [clarity.microsoft.com](https://clarity.microsoft.com)
- Account: Far Too Young nonprofit Microsoft account
- Project ID: `wytghx7ix4`
- Free forever, unlimited recordings, 30-day retention

Both are `<script>` tags in `index.html`.

## Step 6: Structured Data (JSON-LD) ✅

**Benefit:** Structured data is machine-readable metadata (JSON-LD format) embedded in your HTML that tells search engines exactly what your organization is, what it does, and what actions are available. Enables rich results in Google, AI citation eligibility, and Knowledge Panel eligibility.

**Problem:** Without structured data, Google treats our site as generic content with no entity recognition.

**Implementation:** `<script type="application/ld+json">` in `index.html` body. Schema: `NonprofitOrganization` with `DonateAction`. Includes org name, URL, description, Atlanta GA address.

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

**Benefit:** Core Web Vitals are Google's page speed metrics (LCP, FID, CLS) that directly affect search rankings. Preconnect hints tell the browser to start DNS/TLS handshakes early for third-party domains.

**Problem:** Without preconnect, the browser waits until it encounters a third-party resource before starting the connection, adding 100-300ms latency to LCP.

**Implementation:** Added `<link rel="preconnect">` for `fonts.googleapis.com`, `fonts.gstatic.com`, and `js.stripe.com` in `index.html`. Eliminates DNS/TLS latency, improves LCP.

## Step 8: Canonical URLs ✅

**Benefit:** A canonical URL tag tells search engines which version of a page is the "official" one, preventing duplicate content penalties from www vs non-www, trailing slashes, or query parameters.

**Problem:** Without canonicals, Google may split ranking signals across duplicate URLs, weakening our search position.

**Implementation:** `<link rel="canonical" href="...">` per page via `SEO.jsx` component.

## Step 9: PWA Manifest ✅

**Benefit:** A PWA manifest is a JSON file that makes a website installable on phones like a native app — with a home screen icon, splash screen, and standalone window (no browser chrome).

**Problem:** Without a manifest, users can't "install" the site and must always open a browser to access it.

**Implementation:** `public/manifest.json` with app name, icons (192px + 512px), dark theme color (`#0a0a0a`), standalone display mode. Linked via `<link rel="manifest">` in `index.html`. Site installable on phones.

## Step 10: Google Ad Grants ($10K/month free ads) ⬜

**Benefit:** Google Ad Grants is a program that gives eligible 501(c)(3) nonprofits $10,000/month in free Google Ads ($120,000/year). Ads appear at the top of Google search results for targeted keywords.

**Problem:** Without paid ads, we rely entirely on organic search which takes months to build. Ad Grants provides immediate visibility for high-intent keywords like "donate to prevent child marriage."

**Implementation:**
- Status: ⏳ Applied May 29, 2026 — awaiting verification (2-14 business days via Goodstack)
- Application portal: [nonprofits.google.com](https://nonprofits.google.com/)
- Verification partner: [Goodstack](https://goodstack.org) (hello@goodstack.org)
- Contact email used: `avinashsharma.np@gmail.com`
- Approval notification to: `admin@fartooyoung.org`
- Google Ads dashboard (once approved): [ads.google.com](https://ads.google.com)

Requirements to maintain:
- 5% click-through rate across all campaigns
- Log in at least once per month
- At least 2 ads per ad group, 2 ad groups per campaign
- Sitelink extensions required
- Track at least 1 meaningful conversion per month
- No single-word keywords (except brand name)
- No overly generic keywords

Keywords to target:
- "End child marriage" → Home page
- "Child marriage statistics" → What We Do page
- "Donate to prevent child marriage" → Donation flow
- "Child marriage nonprofit" → Founder & Team page
- "How to stop child marriage" → Blog posts (once blog exists)

## Step 11: Content / Blog System ⬜

**Benefit:** Fresh blog content targets long-tail keywords, gives AI engines citable content, builds backlinks, and supports Google Ad Grants landing pages.

**Problem:** Without a blog, we have only 4 static pages to rank for — severely limiting keyword coverage.

**Implementation:** See Plan 6 (AI Blog System) for full implementation.

## Step 12: GEO — AI Search Optimization ⬜

**Benefit:** GEO (Generative Engine Optimization) is the practice of making your content citable by AI search engines (ChatGPT, Perplexity, Google AI Overviews). AI referral traffic grew 527% between Jan-May 2025.

**Problem:** Without entity presence in knowledge bases (Wikidata, Wikipedia), AI engines have no structured data to cite us from.

**Implementation:**

Wikidata entry created: ✅
- Username: `FTYoung` on wikidata.org
- Item URL: https://www.wikidata.org/wiki/Q139980067
- Contributions: https://www.wikidata.org/wiki/Special:Contributions/FTYoung

Organization Details:
- Legal Name: Far Too Young, Inc.
- Business Type: Domestic Nonprofit Corporation
- GA Secretary of State Control #: 21285996
- Date of Formation: November 4, 2021
- State: Georgia
- NAICS: Human Rights Organizations
- 501(c)(3): Yes

Remaining GEO tasks:
- Wikipedia page (requires 3-5 independent press sources — do NOT write your own)
- Consistent entity presence (Google Business Profile, Crunchbase, LinkedIn company page)
- All nonprofit directories (see Step 13)

## Step 13: Backlinks & Authority Building ⬜

**Benefit:** Backlinks are links from other websites pointing to yours. Google uses them as "votes of confidence" — more high-quality backlinks = higher search rankings. Nonprofit directories provide authoritative, free backlinks.

**Problem:** Without backlinks, our domain authority stays low and we can't compete for competitive keywords regardless of content quality.

**Implementation:**

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

What NOT to do: ❌ Buy backlinks, ❌ spammy directories, ❌ comment spam, ❌ link exchange schemes

## Step 14: IndexNow Protocol ⬜

**Benefit:** IndexNow is a protocol that instantly notifies Bing/Yandex when content changes, instead of waiting for them to re-crawl. Reduces indexing time from days to minutes.

**Problem:** Without IndexNow, updated content may take days to appear in Bing search results.

**Implementation:** Add post-deploy step in frontend pipeline:

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
