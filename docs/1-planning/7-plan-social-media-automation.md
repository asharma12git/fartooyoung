# Social Media Automation

## Overview
Automated posting to Twitter and Facebook when new blog content is published. Distributes blog posts to increase reach and drive traffic back to the website.

**Status:** 📋 Planned  
**Cost:** $0.40/month (Secrets Manager only)  
**Effort:** 3-4 hours  
**Dependencies:** Plan 6 — Blog System (blog posts must exist first)

## Prerequisites
- Blog system deployed (Plan 6)
- Twitter API v2 access (developer.twitter.com)
- Facebook Graph API access (developers.facebook.com)

## Checklist
- [ ] Step 1: Get API Credentials
- [ ] Step 2: Create Lambda Layer
- [ ] Step 3: Create Lambda Function
- [ ] Step 4: Connect to Blog Pipeline
- [ ] Step 5: Test and Monitor

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│         BLOG POST PUBLISHED (EventBridge trigger)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         SOCIAL MEDIA POSTER (Lambda)                         │
│  1. Reads blog post from DynamoDB                           │
│  2. Formats content per platform                            │
│  3. Posts to Twitter (title + link + hashtags)              │
│  4. Posts to Facebook page (excerpt + link + image)         │
│  5. Logs results to CloudWatch                              │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Get API Credentials (30 min)

- Twitter: Apply at developer.twitter.com for API v2 access
- Facebook: Create app at developers.facebook.com, get Page Access Token
- Store both in AWS Secrets Manager (`social-media-credentials`)

## Step 2: Create Lambda Layer (30 min)

```bash
pip install tweepy facebook-sdk -t python/
zip -r social-media-layer.zip python/
aws lambda publish-layer-version \
  --layer-name social-media-libs \
  --zip-file fileb://social-media-layer.zip \
  --compatible-runtimes python3.11
```

## Step 3: Create Lambda Function (2 hours)

Lambda: `social-media-poster`
- Read blog post from DynamoDB `blog-posts` table
- Format for each platform:
  - **Twitter:** `{title} — {link} #EndChildMarriage #FarTooYoung` (280 chars)
  - **Facebook:** `{excerpt}\n\nRead more: {link}` with cover image
- Handle rate limits and errors gracefully
- Log success/failure to CloudWatch

## Step 4: Connect to Blog Pipeline (30 min)

EventBridge rule: trigger `social-media-poster` after `blog-generator` succeeds. Or add as final step in blog-generator Lambda.

## Step 5: Test and Monitor (30 min)

- Test with a draft post (don't publish publicly)
- Verify posts appear correctly on both platforms
- Set up CloudWatch alarm for posting failures

---

## Platforms

| Platform | Post Format | API | Status |
|----------|-------------|-----|--------|
| Twitter/X | Title + link + hashtags (280 chars) | Twitter API v2 | Planned |
| Facebook | Excerpt + link + cover image | Graph API | Planned |
| Reddit | ⚠️ SKIP — manual only (communities ban self-promotion) | — | Not automated |
| LinkedIn | Future consideration | — | Not planned |

## Content Strategy

**Posting Schedule:** 2 posts per platform per week (aligned with blog schedule). Best times: Tuesday-Thursday, 10am-2pm EST.

**Hashtags (Twitter):** `#EndChildMarriage` `#FarTooYoung` `#ChildProtection` `#GirlsRights` `#SDG5` `#Education`

**Tone:** Informative, not sensational. Data-driven with calls to action. Link back to website.

## Cost

| Service | Monthly Cost |
|---------|--------------|
| Lambda | $0.00 (free tier — 8 invocations/month) |
| Secrets Manager | $0.40 (1 secret) |
| EventBridge | $0.00 (free tier) |
| **Total** | **$0.40/month** |

---

*Created: May 26, 2026*
