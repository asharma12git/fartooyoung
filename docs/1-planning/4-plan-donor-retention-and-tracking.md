# Donation Optimization Plan

## Overview
Privacy-compliant visitor tracking, A/B testing of donation prompts, and automated donor retention emails to increase conversion rates and lifetime donor value.

**Status:** 📋 Planned  
**Dependencies:** None (works with existing site)  
**Estimated Cost:** $0.00-0.40/month  
**Estimated Effort:** 8-10 hours

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│         VISITOR ARRIVES AT WEBSITE                            │
│         Cookie consent banner shown                          │
└────────────────────┬────────────────────────────────────────┘
                     │ (if consent given)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         VISITOR TRACKING (JavaScript + Lambda)               │
│  - Page views, time spent, scroll depth                     │
│  - Visit count, traffic source                              │
│  - Anonymous user ID (no PII)                               │
│  - Saves to DynamoDB (user-behavior table)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         DONATION OPTIMIZER (Lambda)                           │
│  - Analyzes engagement (visits, time on site)               │
│  - A/B tests different messages:                            │
│    A: "Help 1 girl escape child marriage"                   │
│    B: "Join 500 donors fighting child marriage"             │
│  - A/B tests donation amounts:                              │
│    A: $5, $10, $25                                          │
│    B: $10, $25, $50                                         │
│  - Shows prompt at optimal time (3+ visits, 5+ min)         │
│  - Tracks conversion by variant                            │
└────────────────────┬────────────────────────────────────────┘
                     │ (after donation)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         DONOR RETENTION (EventBridge + Lambda)               │
│  - Immediate: Thank you email                               │
│  - Monthly: Impact report to recurring donors               │
│  - Yearly: Anniversary email ("1 year of support!")        │
│  - 90 days inactive: Re-engagement campaign                 │
└─────────────────────────────────────────────────────────────┘
```

---

## New AWS Resources

**DynamoDB Tables:**
- `user-behavior` — Anonymous visitor tracking (TTL for auto-cleanup)
- `ab-test-results` — Variant assignments and conversion data

**Lambda Functions:**
- `user-tracking` — Process tracking events, calculate engagement scores
- `donation-optimizer` — Return optimal prompt based on user behavior
- `donor-retention` — Send retention emails on schedule

**API Gateway Endpoints:**
- `POST /track` — Receive tracking events from frontend
- `GET /donation-prompt` — Return personalized prompt for visitor

**EventBridge Rules:**
- `monthly-impact-report` — 1st of month, send to recurring donors
- `donor-anniversary-check` — Daily, check for milestones
- `re-engagement-check` — Weekly, find lapsed donors (90+ days)

**Frontend Components:**
- Cookie consent banner (GDPR/CCPA compliant)
- Tracking script (only fires with consent)
- Smart donation prompt (modal/banner)

---

## Implementation Steps

### Phase 1: Visitor Tracking (4 hours)

**Cookie Consent Banner:**
- Show on first visit, store preference in localStorage
- Allow/deny tracking choice
- GDPR/CCPA compliant language

**Tracking Script (frontend):**
```javascript
// Only track if consent given
if (localStorage.getItem('tracking-consent') === 'true') {
  // Generate anonymous ID (UUID, no PII)
  // Track: page views, time spent, scroll depth, visit count
  // Send to POST /track endpoint
}
```

**Backend:**
- `user-behavior` DynamoDB table with TTL (auto-delete after 90 days)
- `user-tracking` Lambda processes events, calculates engagement score

### Phase 2: A/B Testing (3 hours)

**Variant Assignment:**
- Assign visitor to variant on first visit (stored in localStorage)
- 50/50 split between variants

**Donation Prompt Logic:**
- Show only to engaged visitors (3+ visits OR 5+ min on site)
- Don't show if already donated (check localStorage or auth state)
- Track impressions and conversions per variant

**Metrics to Track:**
- Prompt impression rate
- Click-through rate per variant
- Donation completion rate per variant
- Average donation amount per variant

### Phase 3: Donor Retention (3 hours)

**Thank You Email (immediate):**
- Triggered by Stripe webhook (already exists)
- Add personalized impact message: "Your $25 helps keep 1 girl in school for a month"

**Monthly Impact Report:**
- EventBridge triggers 1st of month
- Query recurring donors from donations table
- Send personalized email with cumulative impact

**Anniversary Email:**
- Daily EventBridge check
- Query users by `createdAt` date
- Send milestone emails (1 month, 6 months, 1 year)

**Re-engagement:**
- Weekly check for donors inactive 90+ days
- Send "We miss you" email with impact update

---

## Cost

| Service | Monthly Cost |
|---------|--------------|
| Lambda | $0.00 (free tier) |
| DynamoDB | $0.00 (free tier) |
| API Gateway | $0.00 (free tier) |
| EventBridge | $0.00 (free tier) |
| SES (retention emails) | $0.00 (free tier — <1000 emails) |

**Total:** $0.00/month (all within free tier)

---

## Privacy Compliance

- **GDPR:** Cookie consent required before tracking, right to deletion
- **CCPA:** Opt-out mechanism, no sale of data
- **No PII collected:** Anonymous UUIDs only, no names/emails in tracking
- **Auto-deletion:** TTL on tracking data (90 days)
- **Transparency:** Privacy policy page explaining what's tracked

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Donation conversion rate | ~1% | 2-3% |
| Average donation amount | ~$5 | $6-8 |
| Donor retention (monthly) | Unknown | 60%+ |
| Re-engagement success | N/A | 10-15% |

---

*Created: May 26, 2026 — Split from content marketing system plan*
