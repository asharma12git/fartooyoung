# Social Media Automation

## Overview
Automated posting to Twitter and Facebook when new blog content is published. Distributes blog posts to increase reach and drive traffic back to the website.

## Prerequisites
- Blog system deployed (Plan 6)
- Twitter API v2 access (developer.twitter.com)
- Facebook Graph API access (developers.facebook.com)

## Cost

| Service | Monthly Cost |
|---------|--------------|
| Lambda | $0.00 (free tier — 8 invocations/month) |
| Secrets Manager | $0.40 (1 secret) |
| EventBridge | $0.00 (free tier) |
| **Total** | **$0.40/month** |

## Checklist
- [ ] Step 1: Get API Credentials
- [ ] Step 2: Create Lambda Layer
- [ ] Step 3: Create Lambda Function
- [ ] Step 4: Connect to Blog Pipeline
- [ ] Step 5: Test and Monitor

---

## Step 1: Get API Credentials ⬜

**Benefit:** API credentials are authentication tokens that allow our Lambda function to post on behalf of our social media accounts programmatically, without manual login.

**Problem:** Without API credentials stored securely in AWS, we can't automate posting and would need to manually share every blog post on each platform.

**Implementation:**
- Twitter: Apply at developer.twitter.com for API v2 access
- Facebook: Create app at developers.facebook.com, get Page Access Token
- Store both in AWS Secrets Manager (`social-media-credentials`)

Effort: 30 min

## Step 2: Create Lambda Layer ⬜

**Benefit:** A Lambda Layer is a reusable package of dependencies (libraries) that multiple Lambda functions can share. It keeps function code small and deployment fast.

**Problem:** Without a layer, social media SDK dependencies would need to be bundled with the function code, increasing deployment size and cold start time.

**Implementation:**
```bash
pip install tweepy facebook-sdk -t python/
zip -r social-media-layer.zip python/
aws lambda publish-layer-version \
  --layer-name social-media-libs \
  --zip-file fileb://social-media-layer.zip \
  --compatible-runtimes python3.11
```

Effort: 30 min

## Step 3: Create Lambda Function ⬜

**Benefit:** A Lambda function that reads published blog posts and formats/posts them to each social platform automatically, ensuring consistent promotion without manual effort.

**Problem:** Without automation, blog posts go unpromoted on social media or require manual copy-paste each time — easy to forget or skip.

**Implementation:**

Lambda: `social-media-poster`
- Read blog post from DynamoDB `blog-posts` table
- Format for each platform:
  - **Twitter:** `{title} — {link} #EndChildMarriage #FarTooYoung` (280 chars)
  - **Facebook:** `{excerpt}\n\nRead more: {link}` with cover image
- Handle rate limits and errors gracefully
- Log success/failure to CloudWatch

Effort: 2 hours

## Step 4: Connect to Blog Pipeline ⬜

**Benefit:** EventBridge integration triggers social posting automatically when a blog post is published, creating a fully automated content distribution pipeline.

**Problem:** Without a trigger, someone would need to manually invoke the social media Lambda after each blog publish.

**Implementation:** EventBridge rule: trigger `social-media-poster` after `blog-generator` succeeds. Or add as final step in blog-generator Lambda.

Effort: 30 min

## Step 5: Test and Monitor ⬜

**Benefit:** Testing ensures posts appear correctly on both platforms before going live, and monitoring catches failures early.

**Problem:** Untested automation could post malformed content, duplicate posts, or silently fail without anyone noticing.

**Implementation:**
- Test with a draft post (don't publish publicly)
- Verify posts appear correctly on both platforms
- Set up CloudWatch alarm for posting failures

Effort: 30 min

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

## Platforms

| Platform | Post Format | API | Status |
|----------|-------------|-----|--------|
| Twitter/X | Title + link + hashtags (280 chars) | Twitter API v2 | Planned |
| Facebook | Excerpt + link + cover image | Graph API | Planned |
| Reddit | ⚠️ SKIP — manual only (communities ban self-promotion) | — | Not automated |
| LinkedIn | Future consideration | — | Not planned |

## Content Strategy

Posting Schedule: 2 posts per platform per week (aligned with blog schedule). Best times: Tuesday-Thursday, 10am-2pm EST.

Hashtags (Twitter): `#EndChildMarriage` `#FarTooYoung` `#ChildProtection` `#GirlsRights` `#SDG5` `#Education`

Tone: Informative, not sensational. Data-driven with calls to action. Link back to website.

---

*Created: May 26, 2026*
