# Donor Retention & Tracking

## Overview
Privacy-compliant visitor tracking, A/B testing of donation prompts, and automated donor retention emails to increase conversion rates and lifetime donor value.

## Prerequisites
- GA4 + Clarity deployed (Plan 3) for basic analytics
- SES configured for transactional emails
- Stripe webhook handling donations

## Cost

| Service | Monthly Cost |
|---------|--------------|
| Lambda | $0.00 (free tier) |
| DynamoDB | $0.00 (free tier) |
| API Gateway | $0.00 (free tier) |
| EventBridge | $0.00 (free tier) |
| SES | $0.00 (free tier — <1000 emails) |
| **Total** | **$0.00/month** |

## Checklist
- [ ] Step 1: Cookie Consent + Visitor Tracking
- [ ] Step 2: A/B Testing Donation Prompts
- [ ] Step 3: Donor Retention Emails

---

## Step 1: Cookie Consent + Visitor Tracking ⬜

**Benefit:** Cookie consent is a legal requirement (GDPR/CCPA) that asks users for permission before tracking their behavior. Visitor tracking collects anonymous engagement data (page views, time spent, scroll depth, visit count) to understand how users interact with the site — beyond what GA4/Clarity provide, specifically for donor-specific behavior scoring.

**Problem:** Without custom tracking, we can't build engagement scores to determine the optimal moment to show donation prompts, or personalize the experience based on visit history.

**Implementation:**

New AWS Resources:
- DynamoDB table: `user-behavior` (TTL for auto-cleanup after 90 days)
- Lambda: `user-tracking` — process events, calculate engagement scores
- API Gateway: `POST /track` — receive tracking events from frontend

Cookie Consent Banner:
- Show on first visit, store preference in localStorage
- Allow/deny tracking choice
- GDPR/CCPA compliant language

Tracking Script (frontend):
```javascript
if (localStorage.getItem('tracking-consent') === 'true') {
  // Generate anonymous ID (UUID, no PII)
  // Track: page views, time spent, scroll depth, visit count
  // Send to POST /track endpoint
}
```

Effort: 4 hours

## Step 2: A/B Testing Donation Prompts ⬜

**Benefit:** A/B testing shows different versions of donation prompts to different visitors and measures which version converts better. It removes guesswork from messaging and amount suggestions by using real data.

**Problem:** Without A/B testing, we're guessing which messages and suggested amounts work best. Small improvements in conversion rate compound significantly over time.

**Implementation:**

New AWS Resources:
- DynamoDB table: `ab-test-results` — variant assignments and conversion data
- Lambda: `donation-optimizer` — return optimal prompt based on user behavior
- API Gateway: `GET /donation-prompt` — return personalized prompt

Variant Assignment:
- Assign visitor to variant on first visit (stored in localStorage)
- 50/50 split between variants

A/B Test Examples:
- Messages: A: "Help 1 girl escape child marriage" vs B: "Join 500 donors fighting child marriage"
- Amounts: A: $5, $10, $25 vs B: $10, $25, $50

Show prompt only to engaged visitors (3+ visits OR 5+ min on site). Don't show if already donated.

Metrics: Prompt impression rate, CTR per variant, donation completion rate, average amount per variant.

Effort: 3 hours

## Step 3: Donor Retention Emails ⬜

**Benefit:** Donor retention emails are automated, scheduled messages sent to past donors to maintain engagement and encourage repeat giving. Studies show retaining existing donors is 5-10x cheaper than acquiring new ones.

**Problem:** Without retention emails, one-time donors forget about us. No re-engagement means we lose donors who might have given again.

**Implementation:**

New AWS Resources:
- Lambda: `donor-retention` — send retention emails on schedule
- EventBridge rules:
  - `monthly-impact-report` — 1st of month, send to recurring donors
  - `donor-anniversary-check` — daily, check for milestones
  - `re-engagement-check` — weekly, find lapsed donors (90+ days)

Email Types:
- **Thank you (immediate):** Triggered by Stripe webhook. "Your $25 helps keep 1 girl in school for a month"
- **Monthly impact report:** Personalized email with cumulative impact to recurring donors
- **Anniversary:** Milestone emails (1 month, 6 months, 1 year)
- **Re-engagement:** "We miss you" email with impact update for 90+ day inactive donors

Effort: 3 hours

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
│  - A/B tests different messages and amounts                 │
│  - Shows prompt at optimal time (3+ visits, 5+ min)         │
│  - Tracks conversion by variant                            │
└────────────────────┬────────────────────────────────────────┘
                     │ (after donation)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         DONOR RETENTION (EventBridge + Lambda)               │
│  - Immediate: Thank you email                               │
│  - Monthly: Impact report to recurring donors               │
│  - Yearly: Anniversary email                                │
│  - 90 days inactive: Re-engagement campaign                 │
└─────────────────────────────────────────────────────────────┘
```

## Privacy Compliance

- **GDPR:** Cookie consent required before tracking, right to deletion
- **CCPA:** Opt-out mechanism, no sale of data
- **No PII collected:** Anonymous UUIDs only
- **Auto-deletion:** TTL on tracking data (90 days)
- **Transparency:** Privacy policy page explaining what's tracked

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Donation conversion rate | ~1% | 2-3% |
| Average donation amount | ~$5 | $6-8 |
| Donor retention (monthly) | Unknown | 60%+ |
| Re-engagement success | N/A | 10-15% |

---

*Created: May 26, 2026*
