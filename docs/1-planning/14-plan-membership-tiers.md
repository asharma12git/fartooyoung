# Plan 14: Membership Tiers & Subscriber Value

## Overview
A tiered membership model that rewards recurring donors with exclusive access, impact visibility, and deeper engagement. Turns one-time donors into long-term supporters by providing ongoing value.

**Status:** 📋 Planned
**Priority:** HIGH
**Cost:** $0/month (uses existing Stripe + Lambda + DynamoDB)
**Effort:** 10-12 hours
**Dependencies:** Plan 6 (blog system), existing Stripe subscriptions

## Prerequisites
- Stripe subscriptions already working (done)
- Blog system live (done)
- Newsletter system (Plan 6 Step 5 — build first or alongside)
- User authentication with JWT (done)

## Cost

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| DynamoDB | Tier field on user records | $0 (free tier) |
| Lambda | Tier check on gated content | $0 (free tier) |
| SES | Impact report emails | $0.10 (100 emails) |
| Stripe | Already processing subscriptions | $0 |
| **Total** | | **$0/month** |

## Tiers

Industry best practice: 4-6 tiers, mission-themed names, concrete impact per tier, recurring amounts 30-50% lower than one-time equivalents. Pre-select the mid tier as default.

| Tier | Monthly | Name | Impact Statement | Benefits |
|------|---------|------|-----------------|----------|
| **Entry** | $5/month | **Friend** | "Provides school supplies for one girl for a month" | Newsletter, blog access |
| **Core** | $15/month | **Guardian** | "Keeps one girl in school for a month" | Early access content, impact reports |
| **Mid** ⭐ | $25/month | **Protector** | "Funds vocational training for a young bride" | All above + supporters page, exclusive briefs |
| **Upper** | $50/month | **Champion** | "Supports a full community awareness program" | All above + vote on topics, badge |
| **Major** | $100/month | **Changemaker** | "Prevents one child marriage through direct intervention" | All above + quarterly calls, fieldwork updates |

⭐ = pre-selected default (mid tier encourages higher giving via anchoring)

**Naming rationale:** Names progress from passive support (Friend) to active impact (Changemaker). Each connects to Far Too Young's mission — protecting girls from child marriage. Donors identify as "I'm a Guardian" rather than "I give $15."

**Key stats (industry data):**
- Average recurring donor stays engaged **7.5-8 years** (vs 1.5 years for one-time)
- Lifetime value of recurring donor: **$7,288** (vs $3,607 one-time)
- Low-barrier entry ($5/month) captures donors who won't commit to $50 one-time
- 50 Protectors × $25/month = $15,000/year from just one tier

## Checklist

### Phase 1: Foundation
- [ ] Step 1: Tier system (database + Stripe products)
- [ ] Step 2: Membership signup page
- [ ] Step 3: Dashboard tier display + benefits

### Phase 2: Value Delivery
- [ ] Step 4: Early access content (24-48hr window)
- [ ] Step 5: Monthly impact report email
- [ ] Step 6: Supporters page (public recognition)

### Phase 3: Premium Features
- [ ] Step 7: Exclusive research briefs
- [ ] Step 8: Community features (vote on topics, badge)
- [ ] Step 9: Champion-only content (fieldwork updates, calls)

---

## Step 1: Tier System ⬜

**Benefit:** A `tier` field on user accounts enables gating content and features based on membership level. Stripe handles billing, DynamoDB stores the tier, JWT includes it for frontend checks.

**Problem:** Currently all users are equal — no way to differentiate free visitors from paying supporters. No incentive structure for recurring donations beyond goodwill.

**Implementation:**
- Add `tier` field to Users table: `free` (default), `supporter`, `champion`
- Create Stripe Products + Prices for each tier ($5, $10, $25, $50 options)
- Webhook updates `tier` on user record when subscription starts/cancels
- JWT includes `tier` field (like `role` does for admin)
- Frontend checks `user.tier` to show/hide gated content

**Effort:** 2 hours

## Step 2: Membership Signup Page ⬜

**Benefit:** A dedicated page showing tier benefits side-by-side, with clear CTAs to subscribe. Converts blog readers into paying members.

**Problem:** Without a clear membership page, users only see a generic "Donate" button with no sense of ongoing value or benefits.

**Implementation:**
- New route: `/membership` or `/support-us`
- Three-column tier comparison (Free / Supporter / Champion)
- Benefit checkmarks per tier
- "Join" button → Stripe Checkout (subscription mode)
- Accessible from nav, blog CTAs, and post-donation upsell

**Effort:** 2 hours

## Step 3: Dashboard Tier Display ⬜

**Benefit:** Members see their tier, benefits, and renewal date in their dashboard. Reinforces value and reduces churn.

**Problem:** Without visibility into their membership, supporters don't feel recognized and may forget why they're paying.

**Implementation:**
- Donor dashboard shows: current tier badge, next billing date, benefits list
- Upgrade/downgrade buttons
- "Your Impact" section showing what their tier funds

**Effort:** 1.5 hours

## Step 4: Early Access Content ⬜

**Benefit:** Supporter+ members see new blog posts 24-48 hours before the public. Creates exclusivity and a reason to subscribe.

**Problem:** Without gated content, there's no tangible difference between free visitors and paying members.

**Implementation:**
- Add `early_access_until` field to blog posts (set to published_at + 48 hours)
- Public API filters out posts still in early access window
- Supporter/Champion tier users bypass the filter
- Small "Early Access" badge on posts during the window

**Effort:** 1.5 hours

## Step 5: Monthly Impact Report ⬜

**Benefit:** A personalized email showing supporters what their money accomplished that month. The #1 retention tool for recurring donors.

**Problem:** Without impact visibility, donors feel disconnected and cancel ("Where does my money go?").

**Implementation:**
- Monthly Lambda (1st of month) sends HTML email via SES
- Content: donation total, programs funded, girls helped, new research published
- Personalized: "Your $10 this month helped fund X"
- Only sent to Supporter+ tier

**Effort:** 2 hours

## Step 6: Supporters Page ⬜

**Benefit:** Public page recognizing all active members (with consent). Social proof encourages others to join.

**Problem:** No public recognition for supporters beyond a receipt email.

**Implementation:**
- Route: `/supporters`
- Lists first name + tier badge of active members (opt-in)
- "Join X supporters" CTA
- Updated automatically from DynamoDB

**Effort:** 1 hour

## Step 7: Exclusive Research Briefs ⬜

**Benefit:** Deeper analysis content only available to members. Provides intellectual value beyond what's on the public blog.

**Problem:** Public blog posts are general — dedicated supporters want more depth and data.

**Implementation:**
- Blog posts can be tagged `tier_required: supporter` or `tier_required: champion`
- Frontend shows teaser + "Unlock with Supporter membership" CTA
- AI can generate these as longer, more data-heavy versions of regular posts

**Effort:** 1.5 hours

## Step 8: Community Features ⬜

**Benefit:** Members vote on next blog topics, earn badges, feel ownership in the mission.

**Problem:** Without participation, membership feels transactional rather than communal.

**Implementation:**
- "Vote on next topic" — monthly poll for Supporter+ (simple DynamoDB + UI)
- Profile badges displayed on comments (future) and supporters page
- Champion badge = gold, Supporter = silver

**Effort:** 2 hours

## Step 9: Champion-Only Content ⬜

**Benefit:** Highest-tier members get exclusive fieldwork updates, quarterly video calls, and behind-the-scenes content.

**Problem:** Champions pay the most but get the same experience as free users without this differentiation.

**Implementation:**
- Quarterly Zoom invite (manual, calendar link in dashboard)
- "Fieldwork Updates" — short posts from Nepal/Bangladesh (tagged champion-only)
- Direct message channel (future — could be email group or Slack)

**Effort:** 1 hour (mostly manual process, minimal code)

---

## Revenue Model

Based on industry benchmarks for small nonprofits (avg gift $30-$75):

| Scenario | Monthly | Annual |
|----------|---------|--------|
| 20 Friends × $5 | $100 | $1,200 |
| 30 Guardians × $15 | $450 | $5,400 |
| 15 Protectors × $25 | $375 | $4,500 |
| 5 Champions × $50 | $250 | $3,000 |
| 2 Changemakers × $100 | $200 | $2,400 |
| **Year 1 conservative** | **$1,375** | **$16,500** |

| Growth (Year 2-3) | Monthly | Annual |
|----------|---------|--------|
| 50 Friends × $5 | $250 | $3,000 |
| 80 Guardians × $15 | $1,200 | $14,400 |
| 40 Protectors × $25 | $1,000 | $12,000 |
| 15 Champions × $50 | $750 | $9,000 |
| 5 Changemakers × $100 | $500 | $6,000 |
| **Growth target** | **$3,700** | **$44,400** |

**Key insight:** At average 7.5 year retention, 72 recurring donors acquired in Year 1 = ~$120,000 in lifetime value.

Combined with one-time donations and Google Ad Grants traffic, this creates a sustainable funding model.

---

*Created: August 17, 2026*
