# AI Blog System Plan

## Overview
Automated blog content generation using AWS Bedrock (Claude 3.5 Sonnet) with email newsletter distribution to drive organic traffic and donor engagement.

**Status:** 📋 Planned  
**Dependencies:** Blog UI from `plan-dashboard-restructure-plan.md` Phase 3  
**Estimated Cost:** $1.30/month  
**Estimated Effort:** 8-10 hours

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WEEKLY TRIGGER                            │
│              (EventBridge - Every Monday 10am UTC)           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BLOG GENERATION (Lambda)                        │
│  1. AWS Bedrock generates 2,000+ word SEO post              │
│  2. Targets child marriage keywords                         │
│  3. Saves to DynamoDB (blog-posts table)                    │
│  4. Invalidates CloudFront cache                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         EMAIL NEWSLETTER (Lambda)                            │
│  1. Reads new blog post from DynamoDB                       │
│  2. Queries newsletter subscribers                          │
│  3. Sends personalized email via SES                        │
│  4. Tracks open rates and click-throughs                    │
└─────────────────────────────────────────────────────────────┘
```

---

## New AWS Resources

**DynamoDB Tables:**
- `blog-posts` — Blog post metadata and content
- `newsletter-subscribers` — Email list with preferences

**Lambda Functions:**
- `blog-generator` — AI content creation (Claude 3.5 Sonnet)
- `newsletter-sender` — Email distribution via SES

**API Gateway Endpoints:**
- `POST /newsletter/subscribe` — Email signups
- `POST /newsletter/unsubscribe` — Opt-outs

**EventBridge Rules:**
- `weekly-blog-generation` — Every Monday 10am UTC

---

## Cost Breakdown

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| AWS Bedrock (Claude 3.5 Sonnet) | 4 posts/month (2K+ words) | $1.20 |
| SES (Newsletter) | 1,000 emails/month | $0.10 |
| Lambda | ~8 invocations | $0.00 (free tier) |
| DynamoDB | ~5K operations | $0.00 (free tier) |
| EventBridge | 4 events/month | $0.00 (free tier) |

**Total:** $1.30/month

---

## Implementation Steps

### Step 1: AWS Bedrock Setup (1 hour)
- Enable Bedrock model access (Claude 3.5 Sonnet) in us-east-1
- Create IAM role with Bedrock, DynamoDB, CloudWatch permissions
- Create `blog-posts` DynamoDB table (PK: `post_id`)

### Step 2: Blog Generator Lambda (3 hours)
- Python 3.11 runtime, 5 min timeout, 1024 MB memory
- Prompt engineering for SEO-optimized content:
  - 2,000+ words
  - Target keywords: "child marriage statistics", "prevent child marriage", "girls education"
  - Include data, stories, calls to action
- Save to DynamoDB with metadata (title, excerpt, date, status, word_count)
- Invalidate CloudFront cache for `/blog` route
- Test manually, verify quality

### Step 3: Newsletter System (3 hours)
- Create `newsletter-subscribers` table (PK: `email`)
- Newsletter signup form component (add to Footer + blog pages)
- Double opt-in: send confirmation email, activate on click
- `newsletter-sender` Lambda:
  - Query active subscribers
  - Personalize with subscriber name
  - HTML + plain text email template
  - Track opens/clicks via SES
  - Handle bounces (auto-remove)

### Step 4: Connect + Schedule (1 hour)
- EventBridge rule: trigger `blog-generator` weekly
- Chain: blog-generator success → trigger newsletter-sender
- CloudWatch dashboard for monitoring
- Alarms for generation failures

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

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Blog posts/month | 4 |
| Word count per post | 2,000+ |
| Email subscribers (3 months) | 100+ |
| Email open rate | 20-30% |
| Blog organic traffic (3 months) | 300+ visits/month |
| AWS costs | <$1.50/month |

---

## Related Plans
- `plan-dashboard-restructure-plan.md` Phase 3 — Blog UI (public pages, admin editor)
- `plan-social-media-automation.md` — Auto-post blog content to Twitter/Facebook
- `plan-seo.md` — Technical SEO foundations (meta tags, structured data)

---

*Created: January 29, 2025*  
*Updated: May 26, 2026 — Focused to blog generation + newsletter only*
