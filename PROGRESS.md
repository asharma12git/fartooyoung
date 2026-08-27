# Far Too Young - Development Progress Log

---

## 📊 MASTER SUMMARY - PROJECT STATUS

**Current Phase:** Phase 45 - EIN Correction + Email Bug Fixes  
**Last Updated:** August 27, 2026, 4:00 PM EST  
**Status:** ✅ Production LIVE | ✅ Live Payments Active | ✅ HTTPS Secured | ✅ CI/CD V2 Automated | ✅ SEO Phase 1+2 Complete | ✅ AI Blog Generator Active | ✅ Blog Deployed to Prod | ✅ Payment Fixes Deployed | ✅ Password Reset Flow Complete | ✅ Email System Complete

### **What's Working (Production Ready)**

✅ **Live Production System**
- **Website**: https://www.fartooyoung.org (LIVE and operational)
- **API**: https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com (28 Lambda functions)
- **Database**: 6 DynamoDB tables (users, donations, rate-limits, blog-posts, research-articles, tiers)
- **CDN**: CloudFront distribution E2PHSH4ED2AIN5 (global distribution)
- **SSL**: Valid certificates for www.fartooyoung.org and fartooyoung.org
- **Real Payments**: Live Stripe integration processing actual donations

✅ **Authentication System**
- User registration with email verification (SES operational)
- Login with JWT tokens (24-hour expiration)
- Password reset flow with email notifications
- Email verification required for new accounts
- Welcome email after verification (emotional copy, mission sections, Donate CTA)
- Rate limiting protection (5 attempts/hour register, 5 attempts/15min login)
- Multi-layer security with IP tracking
- 60s cooldown on forgot password button

✅ **Email System (Transactional)**
- Donation receipt emails (100 founder messages, 15 greetings, branded HTML, monthly upsell)
- Welcome email (fires after verification, What We Do/What Your Dollar Does/Stories That Matter)
- Subscription cancelled email (this year + lifetime impact, 20 founder messages, re-subscribe CTA)
- Environment-aware ([TEST] prefix for staging)
- Email assets in public/assets/ (persist through pipeline deploys)

✅ **Security (Production-Grade)**
- Backend rate limiting (IP + email tracking with DynamoDB TTL)
- Honeypot bot detection and protection
- Input sanitization & validation on all endpoints
- AWS Secrets Manager integration (JWT, Stripe keys)
- Protection against automated attacks
- HTTPS enforcement across all endpoints

✅ **Donation System (Live Payments)**
- Stripe Elements inline payment form (card, Apple Pay, Google Pay, bank)
- One-time donations ($25, $50, $100, custom amounts with decimal support)
- Monthly subscriptions created via webhook after first inline payment
- billing_cycle_anchor set 30 days out (no double-charge on first month)
- Duplicate subscription prevention (checks existing before creating)
- PaymentIntent deduplication (useRef guard, single PI per modal session)
- Transaction descriptions: 'Far Too Young - One-time/Monthly Donation'
- Subscription management portal (cancel, update)
- Webhook processing: payment_intent.succeeded, payment_intent.processing, invoice events
- Bank account payment support (ACH) with pending state
- Payment method display (cards, bank accounts, digital wallets)
- Apple Pay/Google Pay: email+name captured from billing_details
- Anonymous donation support
- Auto-close modal on success (3s delay, triggers dashboard refresh)

✅ **User Dashboard**
- Complete donation history with date filtering
- Active/ending/cancelled subscription management
- Profile settings (name, email updates)
- Password change functionality
- Responsive design (mobile + desktop optimized)
- Payment method icons (Visa, Mastercard, bank, Google Pay, Apple Pay)
- Real-time subscription status updates
- Freeze pane top bar (Sign Out + Admin Panel frozen, content scrolls)
- Refresh button on Donation History (refreshes donations + subscriptions)
- Donation cards: green border (monthly), orange border (one-time)
- Impact Journey: swipeable cards on mobile (scroll-snap)
- Impact Goals: dynamic year title, $50/month highlight, green checkmarks
- Impact calculator with animated slider
- Press animation (active:scale-95) on all buttons site-wide

✅ **Infrastructure (AWS Serverless)**
- **Backend**: 28 Lambda functions + API Gateway (production + staging)
- **Database**: DynamoDB with auto-scaling and TTL
- **Email**: AWS SES (verified domain, operational)
- **Frontend**: React + Vite deployed to S3 + CloudFront
- **Version Control**: Git with staging/main branch workflow
- **SSL**: Wildcard certificate `*.fartooyoung.org` + root domain
- **Monitoring**: CloudWatch logs and metrics

✅ **CI/CD Pipeline (Automated)**
- AWS CodePipeline for zero-downtime deployments
- Separate CodeBuild projects for frontend and backend
- GitHub webhook integration (auto-deploys on push to main)
- Automated frontend build and S3 deployment with cache invalidation
- Automated backend SAM deployment with Lambda updates
- IAM roles with least-privilege permissions
- Staging environment for safe testing

✅ **Documentation (Comprehensive)**
- Complete system architecture documentation
- Database design with current and future schemas
- Frontend design with production component mapping
- AWS CLI testing commands for all endpoints
- Deployment architecture guide with step-by-step instructions
- Development progress log with detailed history

### **What's Next - PRIORITIZED ROADMAP**

| Priority | Plan | Effort | Status |
|----------|------|--------|--------|
| 1 | Deployment Optimization (security + pipeline split) | 5-6 hrs | ✅ Done |
| 2 | Stripe Elements - Embedded Payment Form | 4-6 hrs | ✅ Done |
| 3 | SEO Implementation (meta tags, sitemap, structured data) | 3-4 hrs | ✅ Phase 1+2 Done |
| 4 | Donor Retention & Tracking (A/B testing, analytics) | 8-10 hrs | 📋 Ready |
| 5 | Mobile App (PWA) | 2-3 hrs | ✅ Manifest Done |
| 6 | AI Blog System (Bedrock + newsletter) | 8-10 hrs | ⏳ Steps 1-4 + Admin Panel Done |
| 7 | Social Media Automation (Twitter/Facebook) | 3-4 hrs | 📋 Depends on #6 |
| 8 | Dashboard Restructure (admin + blog UI) | 8-10 hrs | 📋 Depends on #6 |
| 9 | E-commerce (merchandise shop) | 20+ hrs | 📋 Future |
| 10 | AWS SDK v3 Migration | 2-3 hrs | 📋 Backlog |
| 11 | Frontend Lint Cleanup | 1-2 hrs | 📋 Backlog |
| 12 | Image Migration to S3/CDN | 2-3 hrs | 📋 Future |

> Full details for each plan in `docs/1-planning/` (numbered by priority).

### **Session Left Off At**
- Phase 45: EIN Correction + Email Bug Fixes (Aug 27) — DEPLOYED TO PROD + STAGING
- **CRITICAL: EIN corrected** in email templates — was placeholder `93-3769961` (AI-invented, wrong), corrected to actual `87-3583633` in all 3 email tax footers (donation receipt, welcome, subscription cancelled)
- **verify-email fix**: syntax error from v2→v3 SES migration (leftover `.promise()`), converted to `@aws-sdk/client-ses`
- **Global Lambda timeout**: set to 15s in template.yaml Globals (individual 30/60/120s preserved for long-running functions)
- **Honeypot fix**: only check on registration, not login (browser autofill was triggering false "Suspicious activity" on login)
- **Internal admin notifications**: admin@fartooyoung.org gets emails on new donation, new member, subscription cancellation
- Cleared test users (Ashutosh, Ravi) from prod for clean re-registration; Ravi re-registered successfully

- Phase 44: Email System + Auth Fixes + UX Polish — DEPLOYED TO STAGING
- **Donation Receipt Email**: 100 founder messages, 15 greetings, dynamic impact, branded HTML, monthly upsell, environment-aware
- **Welcome Email**: fires after verification, emotional copy, What We Do/What Your Dollar Does/Stories That Matter, Donate CTA
- **Subscription Cancelled Email**: fires on customer.subscription.deleted, this year + lifetime impact, 20 founder messages, re-subscribe CTA
- **Email assets**: permanently stored in `public/assets/` (survives pipeline deploys)
- **Auth fixes**: Lambda timeouts 3s→10s, password reset field name fix, eye toggle, 60s cooldown on forgot password
- **UX**: Auto-open donation modal from URL params, dashboard redirect to /?login=true, page transition (black bg, Framer Motion reverted)
- **SES permissions**: added to StripeWebhookFunction, VerifyEmailFunction, ResetPasswordFunction
- **Lambda Count**: 28 (unchanged)
- **EventBridge Rules**: 3 (unchanged)
- Frontend + Backend deployed to staging ✅
- Next: Production deployment, Newsletter System (Step 5), Google Ad Grants activation follow-up

---

## 📅 PROGRESS BY DAY

### **August 27, 2026 - EIN Correction + Email Bug Fixes**

**CRITICAL FIX — Incorrect EIN in email receipts:**
- The donation receipt, welcome, and subscription-cancelled email templates contained EIN `93-3769961` — an AI-generated placeholder that was never a real number (mistake: should have asked for the real EIN or used a clear `[EIN]` marker instead of inventing one)
- Corrected to the actual registered EIN `87-3583633` (verified against IRS/Charity Navigator public record for Far Too Young Inc., Peachtree Corners GA)
- Location: `backend/lambda/utils/email-templates.js` — tax footer line of all 3 email templates
- Deployed to both prod and staging
- Docs (ORGANIZATION.md, Plan 3) already had the correct EIN — only the email code was wrong

**Email bug fixes:**
- **verify-email.js**: had a syntax error (leftover `}).promise();` from v2→v3 SES migration) causing "Missing catch or finally after try" — Lambda failed to load. Fixed by fully migrating to `@aws-sdk/client-ses`
- **Global Lambda timeout**: added `Timeout: 15` to template.yaml Globals section (individual 30/60/120s timeouts preserved for blog-generator, research-fetcher, etc.). Root cause of repeated verify/login CORS errors was 3s default timeout + cold start + SES sends
- **Honeypot false positive**: login was triggering "Suspicious activity detected" because browser autofill/password managers filled the hidden `website_url` honeypot field. Fixed to only check honeypot on registration, not login
- **Internal admin notifications**: added plain-text notifications to admin@fartooyoung.org for new donations (💰), new members (👤), and subscription cancellations (⚠️)

**User management:**
- Cleared test accounts (ashutosh.sharma@, ravi.baral@) from prod users table for clean re-registration — donations preserved (separate table, keyed by email)
- Ravi re-registered and verified successfully on prod

---

### **August 26, 2026 - Email System + Password Reset Fix + Auth Timeouts + UX Polish**

**Session Duration:** ~6 hours

#### **Phase 43: Password Reset System Overhaul** ✅

**CRITICAL BUG FIX**:
1. Password reset emails not sending — `forgot-password.js` had a `NODE_ENV` check that failed in Lambda (NODE_ENV is undefined). Replaced with `FRONTEND_URL` environment variable check to construct reset link.

**NEW FEATURES**:
2. Reset Password page created (`src/pages/ResetPassword.jsx`) — reads token from URL query params, validates token, submits new password to backend
3. Password reset confirmation email sent after successful password reset (notifies user their password was changed)
4. Route added: `/reset-password` in `App.jsx`

**UX IMPROVEMENTS**:
5. Eye toggle on reset password fields (show/hide password visibility)
6. 'Send Reset Link' button text (was 'Send Reset Token'), removed 'Already have a token?' link from forgot password form
7. Success message persists after sending reset link (was disappearing after 3s timeout)

**BUG FIXES**:
8. Reset password frontend sends `newPassword` field (was sending `password` — backend expected `newPassword`, causing silent failures)
9. Auth Lambda timeouts increased from 3s to 10s for Login, Register, ForgotPassword, and ResetPassword functions — cold starts were causing 502 Gateway Timeout errors
10. Page transition — body background set to black (#000000) to prevent white flash between route changes. Attempted Framer Motion (reverted due to modal conflicts), CSS fade transition also removed.

**KEY TECHNICAL DETAILS**:
- `forgot-password.js`: Reset link now uses `process.env.FRONTEND_URL` instead of checking `process.env.NODE_ENV` to determine base URL
- `template.yaml`: Timeout increased from 3→10 seconds on 4 auth Lambda functions
- `ResetPassword.jsx`: Token extracted from URL via `useSearchParams()`, password validation (8+ chars, uppercase, lowercase, number, special char), eye toggle with state management
- Body background: `document.body.style.backgroundColor = '#000000'` set globally, prevents white flash on SPA route transitions

**DEPLOYMENT**: Frontend + Backend deployed to staging ✅

#### **Phase 44: Email System + Auth Fixes + UX Polish** ✅

**DONATION RECEIPT EMAIL SYSTEM**:
11. Complete donation receipt email with branded HTML template
12. 100 random founder messages (rotated per email)
13. 15 greeting messages (randomized)
14. Dynamic impact ranges based on donation amount
15. Branded HTML template with logo, signature, and social icons
16. Monthly upsell section for one-time donors (encourages upgrade to monthly)
17. Environment-aware: [TEST] prefix added to subject line for staging

**WELCOME EMAIL**:
18. Welcome email fires after email verification completes
19. Emotional copy with mission-driven messaging
20. Sections: What We Do / What Your Dollar Does / Stories That Matter
21. Make a Donation CTA button

**SUBSCRIPTION CANCELLED EMAIL**:
22. Fires on Stripe `customer.subscription.deleted` webhook event
23. Shows this year + lifetime donation impact
24. 20 cancellation-specific founder messages (unique pool)
25. Re-subscribe CTA to encourage return

**EMAIL INFRASTRUCTURE**:
26. Email assets permanently stored in `public/assets/` (won't get wiped by CI/CD pipeline)
27. SES permissions added to: StripeWebhookFunction, VerifyEmailFunction, ResetPasswordFunction

**AUTH & SECURITY FIXES**:
28. Auth Lambda timeouts increased 3s→10s (Login, Register, ForgotPassword, ResetPassword) — cold starts causing 502s
29. Password reset fix: frontend was sending `password` field, backend expected `newPassword`
30. Eye toggle on reset password fields (show/hide password visibility)
31. 60-second cooldown timer on forgot password button (prevents spam clicks)

**UX IMPROVEMENTS**:
32. Auto-open donation modal from URL params (`?donate=monthly&amount=25`)
33. Dashboard redirects to `/?login=true` when user is not authenticated
34. Page transition: body background set to black, CSS fade attempted then reverted (Framer Motion broke modals)

**KEY TECHNICAL DETAILS**:
- Donation receipt uses `sendDonationReceipt()` utility with SES
- Welcome email triggered in verify-email Lambda after successful verification
- Subscription cancelled email triggered in webhook on `customer.subscription.deleted` event
- Email assets path: `public/assets/` (persists through S3 sync --delete)
- URL param handling: `useSearchParams()` reads `donate` and `amount` params, opens modal with pre-filled values
- Dashboard auth check redirects with `window.location.href = '/?login=true'` to trigger login modal

**DEPLOYMENT**: Frontend + Backend deployed to staging ✅

**Next Session Goals**:
- Deploy to production
- Step 5: Newsletter System (subscribe, double opt-in, SES distribution)
- Google Ad Grants activation follow-up

---

### **August 18-19, 2026 - Critical Payment Fixes + Dashboard Polish**

**Session Duration:** ~8 hours (Aug 18 evening - Aug 19 evening)

#### **Phase 42: Payment System Overhaul + Dashboard UI** ✅

**CRITICAL PAYMENT FIXES (12 fixes)**:
1. Monthly subscriptions now inline (same card form as one-time) — webhook creates Stripe Subscription after first payment
2. `billing_cycle_anchor` set 30 days out (no double-charge on first month)
3. Duplicate subscription prevention (checks existing active subscription before creating new one)
4. PaymentIntent created only ONCE per donation (useRef guard prevents duplicates on re-render)
5. Transaction descriptions: 'Far Too Young - One-time Donation' / 'Far Too Young - Monthly Donation'
6. Apple Pay/Google Pay: email+name captured from billing_details (was 'unknown' before)
7. Double `pi_pi_` ID prefix bug fixed (webhook was adding pi_ to already-prefixed ID)
8. Bank payments: pending state via `payment_intent.processing` webhook event
9. Stripe webhook events: added `payment_intent.processing` to both staging+prod webhook endpoints
10. Decimal amounts allowed (step=0.01 on custom input)
11. Monthly upsell popup shows on modal open, 'Yes Monthly' sets type correctly
12. Auto-close donation modal after 3 seconds on success (triggers dashboard refresh)

**DASHBOARD UI POLISH (18 changes)**:
13. Freeze pane top bar (Sign Out + Admin Panel frozen, content scrolls below)
14. X button absolute flush top-right corner
15. Refresh button (green) on Donation History — refreshes both donations + subscriptions
16. Donation cards: green border for monthly, orange border for one-time
17. Impact Journey: swipeable cards on mobile (scroll-snap), stacked
18. Impact Goals: dynamic year title with month in orange, removed redundant month subtitle
19. $50/month highlighted orange, green checkmarks for coverage list
20. Impact calculator: 'See how your gift makes a difference' + animated ▶ arrow + orange slider thumb
21. Progress bars: lighter orange (60% opacity), thinner
22. Best donation moved into year cards (removed from header)
23. Girls Supported + Best Donation numbers in green
24. Green donated amount in Impact Goals section
25. 'Transfers may take a few minutes to appear' footer note
26. Lock icon + Stripe redirect note on subscriptions
27. Subscription card padding matched to donation cards
28. Press animation (active:scale-95) on all buttons site-wide
29. Where We Work: flip button with pulse animation (replaces auto-flip)
30. Mobile: dashboard buttons don't overlap welcome, Impact Goals stacks on mobile

**OTHER**:
31. Blog auto-generation confirmed working (Mon+Fri EventBridge)
32. Google Ad Grants resubmitted via Goodstack (approved, pending Google activation)

**KEY TECHNICAL DETAILS**:
- Webhook now handles `payment_intent.processing` event (bank payments show "pending" status)
- Webhook creates Stripe Subscription object after successful first monthly payment (no redirect to Stripe Checkout)
- `billing_cycle_anchor` set to `current_period_end` (30 days from first payment) to avoid immediate double-charge
- PaymentIntent guard: `useRef` tracks whether PI has been created for current modal session
- Donation ID stored without double-prefix: checks if ID already starts with `pi_` before prepending

**DEPLOYMENT**: Frontend + Backend deployed to staging AND production ✅

**Next Session Goals**:
- Step 5: Newsletter System (subscribe, double opt-in, SES distribution)
- Google Ad Grants activation follow-up
- Monitor subscription renewals for billing_cycle_anchor correctness

---

### **August 16-17, 2026 - AI Blog Generator & Blog Page Redesign**

**Session Duration:** ~6 hours (Aug 16 evening - Aug 17 afternoon)

#### **Phase 41: AI Content Generation (Plan 6 Step 4) + Blog Redesign** ✅

**AI BLOG GENERATOR LAMBDA** (`blog-generator.js`):
- Created new Lambda: Claude Sonnet 4.6 writes blog posts from research articles
- Single article per post, focused topic approach
- Skips irrelevant articles (returns {skip:true} if article not related to mission)
- Auto-categorizes posts (AI picks from: Education, Health, Norms & Culture, Policy & Justice, Research, Climate & Crisis)
- Calculates reading_time (words/200) and word_count automatically
- Appends CTA block with donate links (#donate-monthly, #donate-once)
- No dashes rule enforced in prompt
- Author defaults to 'Far Too Young, Inc.'
- EventBridge triggers: Monday 11am UTC + Friday 11am UTC (auto-generates 2 posts/week)

**BLOG.JSX FULL REDESIGN**:
- Category tabs: desktop = underline tabs with dividers, mobile/iPad = dropdown selector
- Year dropdown + short month tabs (Jan, Feb...) replace old arrow-based navigation
- Latest Research tab (orange, always orange) with right panel on desktop (xl: breakpoint)
- Mobile/iPad: Latest Research section positioned below posts, before Top Research
- Category color placeholders (gradient boxes, short names on mobile, full on desktop)
- Posts without image_url now show colored gradient (removed placeholder images)
- Top Research: 10 articles displayed, sticky right panel
- Stay Informed: temporary message on subscribe (newsletter not yet wired)
- Responsive: xl breakpoint for side panel layout, overflow scroll for categories

**BLOGPOST.JSX UPDATES**:
- HTML content rendered with dangerouslySetInnerHTML (was previously showing raw HTML tags)
- Tiled hero image (Join the Movement text, repeated pattern, dark overlay)
- Centered author section with FTY logo + 'Share this story' + Donate Now button
- Donate links in CTA block trigger donation modal (monthly/one-time options)
- Bottom donate button fixed (was incorrectly passing event object as amount)
- Newsletter subscribe: temporary message added

**OTHER FRONTEND CHANGES**:
- Admin.jsx: React Quill rich text editor integrated, proper content loading on edit
- WhatWeDo.jsx: Counter component moved outside component (fixes infinite re-render spin)
- Partners.jsx: VISCOM logo updated
- Footer.jsx: logo size reduced for mobile/iPad

**BACKEND FIXES**:
- `research-fetcher.js`: dedup bug fixed (removed Limit:1 that was breaking dedup), removed dead feeds, added UN News RSS
- `get-research-articles.js`: starred-first sort order, status filter, limit param
- `get-blog-posts.js`: added ?all=true param (shows drafts for admin panel)
- `get-blog-post.js`: allows fetching draft posts (removed published-only filter)
- `admin-research.js`: URL validation + title extraction + duplicate check on POST
- CORS: PUT/DELETE added to AllowMethods

**DYNAMODB CLEANUP**:
- 34 duplicate research articles removed (85→51 remaining)
- 6 old test blog posts deleted, 6 new AI-generated posts created
- 2 posts moved to July 2026 for testing month tab navigation
- All posts updated: author='Far Too Young, Inc.', reading_time/word_count added, dashes removed from content

**KEY METRICS**:
- Lambda functions: 28 (added blog-generator)
- DynamoDB tables: 6 (unchanged)
- EventBridge rules: 3 (research weekly + blog Monday + blog Friday)
- Research articles: 51 (cleaned from 85)
- Blog posts: 6 AI-generated

**DEPLOYMENT**: Frontend + Backend deployed to staging

**Next Session Goals**:
- Step 5: Newsletter System (subscribe, double opt-in, SES distribution)
- Production deployment of blog generator
- Google Ad Grants follow-up

---

### **June 6, 2026 - Admin Panel & Research Management**

**Session Duration:** ~5 hours

#### **Phase 40: Admin Panel (Plan 6 Step 6)** ✅

*See previous session notes below for full details.*

---

**Session Duration:** ~2.5 hours (1:20 PM - 3:25 PM EST)

#### **Phase 35: Donations Table Cleanup, Auth Hardening & CORS Fix** ✅

**SYSTEM MAINTENANCE**:
- Upgraded all Homebrew packages (33 formulae + 2 casks)
- Fixed AWS CLI broken after brew upgrade (Python 3.14 expat linking issue — rebuilt from source)
- Installed NoSQL Workbench via brew for DynamoDB GUI access
- Configured AWS CLI credentials (were wiped during brew upgrade)
- Enabled staging DNS (created Route 53 A record for staging.fartooyoung.org → CloudFront)

**DONATIONS TABLE MIGRATION**:
- Analyzed production donations table — identified bloated `paymentMethodDetails` object, duplicate `donationId` field, redundant `processedAt`
- Designed clean 14-field format: id, email, name, amount, type, status, paymentMethod, cardBrand, cardLast4, wallet, stripeInvoiceId, stripeSubscriptionId, stripeSessionId, createdAt
- Copied production data to staging for safe testing
- Wrote migration script (`backend/scripts/migrate-donations.js`)
- Migrated staging (25 records) — verified in NoSQL Workbench
- Updated `webhook.js` (5 event handlers), `create-donation.js`, `DonorDashboard.jsx` to use new format
- Deployed to staging, verified dashboard displays correctly
- Backed up production data locally (`backup/` folder)
- Migrated production (25 records, zero errors)
- Verified new donations write in clean format (tested $5.45 desktop + $6.47 mobile Apple Pay)

**AUTH VALIDATION HARDENING**:
- Added 22 validation checks to login/registration (industry standard)
- Registration: password min 8 chars, uppercase + lowercase + number + special char required
- Registration: email format validation, required fields, XSS sanitization (HTML tag stripping)
- Login: required fields check, clear error messages instead of generic "Server error"
- Tested all edge cases via API on staging and production
- Verified rejected requests never write to database

**CORS FIX (Mobile Safari)**:
- Diagnosed mobile "Load failed" error — preflight returned `www.fartooyoung.org` but mobile users on `fartooyoung.org` (no www) were blocked
- Fixed by setting API Gateway preflight `AllowOrigin` to `*` (Lambda responses still enforce specific origins)
- Added `mode: 'cors'` to CheckoutButton fetch + better error message
- Documented proper long-term fix in deployment optimization plan (CloudFront redirect non-www → www)

**DOCUMENTATION**:
- Created `docs/4-testing/manual-testing-checklist.md` (45 test cases with How To + Method columns)
- Created `docs/1-planning/9-plan-aws-sdk-v3-migration.md` (low priority, backlog)
- Updated CORS section in deployment optimization plan with current state and proper fix path

---

### **May 26, 2026 - Frontend Content Updates & Partner Expansion**

**Session Duration:** ~2 hours (4:25 PM - 6:37 PM EST) + ~2.5 hours (6:48 PM - 9:08 PM EST)

#### **Phase 34: Frontend Content Updates & Partner Expansion** ✅

**CHILD MARRIAGE PAGE UPDATES**:
- "A Child Bride" section: Replaced both paragraphs with updated content (global framing, $175B economic cost, UNICEF data)
- "Where We Work" flip cards: All 4 countries updated with latest UNICEF statistics
  - Bangladesh: Latest prevalence data, Columbia SIPA report pillars
  - India: 53%→23% decline (UNICEF), rural/urban/wealth breakdowns
  - Nepal: 35% prevalence, disproportionately high for population size
  - USA: 17 states + D.C. banned, 300K minors married 2000-2018, 86% girls to adult men

**FOUNDER & TEAM PAGE UPDATES**:
- Ashutosh Sharma: Title changed from "VP & Chief of Operations" to "Chief of Operations", new bio, all VP references removed
- Ravi Baral: Bio condensed from 9 to 5 paragraphs, added "communication specialist" emphasis
- Soorya Baral: Bio replaced with updated content and shortened (~20% reduction)

**PARTNERS PAGE UPDATES**:
- Media Alert logo updated (30→33 years), text updated to match
- Chandni Joshi name spelling corrected throughout (was "Chadani")
- New affiliate partner added: VISCOM (Visual Communication Ltd., Bangladesh)
  - Logo added, full writeup with FTY partnership context
  - Both Media Alert and VISCOM sections reframed as broader partners (not just film project)
- Media Alert section rebalanced with FTY partnership paragraph

**WHAT WE DO PAGE UPDATES**:
- "Honoring Father Moran" section: Updated with new content emphasizing education as protection
- "Our Target" section: Updated years from 2025|2026 to 2026|2027
- Carousel: Added 15 Bangladesh/VISCOM field photos, reorganized folder structure
  - `carousel/nepal/` — 58 existing images
  - `carousel/bangladesh-viscom/` — 15 new images (5 categories)
  - Images now randomized on each page visit (Fisher-Yates shuffle)
- Vite config: Added `assetsInclude` for JPG files

**FOOTER UPDATE**:
- Replaced info@fartooyoung.org with ravi.baral@fartooyoung.org and avinash.sharma@fartooyoung.org

**INFRASTRUCTURE**:
- Route 53: Restored A record for staging.fartooyoung.org → CloudFront EYHMCS1M0XJX1
- Git: Pushed deployment optimization plan doc to staging branch
- No backend changes — all updates are frontend-only

**DEPLOYMENT TO STAGING & PRODUCTION** (6:48 PM - 7:00 PM EST):
- Verified build compiles cleanly (`npm run build -- --mode staging`)
- Committed all Phase 34 changes: `c621118`
- Pushed to `origin/staging`
- Deployed to staging S3 (`fartooyoung-frontend-staging`) + CloudFront invalidation
- Verified staging at staging.fartooyoung.org
- Merged staging → main (fast-forward)
- Pushed to `origin/main` → CI/CD pipeline triggered automatically
- Production pipeline completed successfully

**DOCUMENTATION CLEANUP** (7:00 PM - 9:00 PM EST):
- Moved `development-progress.md` from `docs/4-testing/` to `docs/` root
- Removed outdated `plan-mobile-responsiveness.md` (already implemented)
- Removed outdated `plan-ses.md` (already implemented)
- Removed empty `docs/5-writings/` folder
- Renamed `plan-ai-blog-automation-revised.md` → split into 3 focused plans
- Moved `plan-stripe-webhook.md` → `docs/4-testing/stripe-webhook-setup.md`
- Updated `plan-critical-deployment-optimization.md` with full CodeStar V2 implementation
- Fixed staging S3 bucket name in docs (`fartooyoung-staging-frontend` → `fartooyoung-frontend-staging`)
- Updated all system design docs with correct dates and missing components
- Split AI content marketing plan into: blog system, social media, donor retention
- Numbered all planning docs by priority (1-8)
- Added consistent summary/goal headers to all planning docs

**PLANNING DOCS FINAL STATE** (`docs/1-planning/`):
1. `1-plan-deployment-optimization.md` — Security + pipeline split (CodeStar V2)
2. `2-plan-seo.md` — Meta tags, sitemap, structured data
3. `3-plan-donor-retention-and-tracking.md` — A/B testing, analytics, retention emails
4. `4-plan-mobile-app.md` — PWA implementation
5. `5-plan-ai-blog-system.md` — Bedrock blog generation + newsletter
6. `6-plan-social-media-automation.md` — Auto-post to Twitter/Facebook
7. `7-plan-dashboard-restructure.md` — Admin dashboard + blog UI
8. `8-plan-ecommerce.md` — Merchandise shop

**FILES MODIFIED**:
- `src/pages/ChildMarriage.jsx` — Content updates
- `src/pages/FounderTeam.jsx` — Bio updates, title changes
- `src/pages/Partners.jsx` — New affiliate, name corrections, content rebalancing
- `src/pages/WhatWeDo.jsx` — Father Moran, carousel, targets
- `src/components/Footer.jsx` — Email update
- `vite.config.js` — assetsInclude for JPG
- `src/assets/images/pages/partners/` — New logos (Media-Alert-33.png, Viscom.png)
- `src/assets/images/pages/what-we-do/carousel/` — Restructured into nepal/ and bangladesh-viscom/

**Session Duration:** ~1 hour (8:00 PM - 9:00 PM EST)

#### **Phase 33: Documentation Synchronization** ✅

**DOCUMENTATION UPDATES COMPLETE**:
- **Database Design**: Updated to reflect current production tables
  - Added production status indicators (✅ LIVE)
  - Updated table names to match actual resources (fartooyoung-production-*)
  - Separated current production from future expansion plans
  - Added production metrics and AWS integration details

- **Frontend Design**: Updated to reflect live system architecture
  - Added production vs local development architecture diagrams
  - Updated API endpoints to production URLs
  - Added CloudFront CDN and S3 deployment details
  - Updated component status to show live implementation

- **AWS CLI Commands**: Comprehensive testing guide updated
  - Added production vs staging environment separation
  - Updated all curl examples with correct production endpoints
  - Added CloudFront distribution commands
  - Updated endpoint names to match current implementation
  - Added rate limiting and email verification testing

- **Deployment Architecture**: Already current from previous updates
  - Complete step-by-step deployment process
  - Production environment details with actual resource IDs
  - CI/CD automation documentation

**SYSTEM STATUS VERIFICATION**:
- ✅ Production website operational at https://www.fartooyoung.org
- ✅ All 17 Lambda functions responding correctly
- ✅ Live Stripe payments processing successfully
- ✅ Email verification system working via SES
- ✅ Rate limiting protecting against abuse
- ✅ CI/CD pipeline deploying automatically on git push

**DOCUMENTATION CONSISTENCY**:
- All documents now reflect December 11, 2025 production status
- Consistent production indicators (✅ LIVE) throughout
- Accurate resource IDs and URLs across all documentation
- Clear separation between current implementation and future plans

**Key Achievements**:
- ✅ Complete documentation synchronization with production system
- ✅ Comprehensive testing guides for developers
- ✅ Accurate system architecture documentation
- ✅ Clear development vs production workflows documented
- ✅ All documentation reflects live operational status

**Next Session Goals**:
- Set up comprehensive monitoring dashboards
- Implement automated backup strategies
- Plan next feature development phase
- Review system performance and optimization opportunities

---

## 📅 PROGRESS BY DAY

### **December 6, 2025 - Domain Migration & Production Refinements**

**Session Duration:** ~2 hours (10:30 PM - 12:50 AM EST)

#### **Phase 32: Primary Domain Migration & Stripe Link Fix** ✅

**DOMAIN MIGRATION COMPLETE**:
- **Old Domain**: app.fartooyoung.org (deprecated)
- **New Domains**: www.fartooyoung.org and fartooyoung.org (root)
- **SSL Certificate**: Requested new cert covering both *.fartooyoung.org AND root domain
  - Previous wildcard cert didn't cover root domain
  - New cert includes both in SubjectAlternativeNames
- **CloudFront Update**: Distribution E2PHSH4ED2AIN5 updated with:
  - New certificate
  - Alternate domain names: www.fartooyoung.org, fartooyoung.org
  - Removed app.fartooyoung.org
- **Route 53 DNS**: Updated A records for www and root to point to CloudFront
- **Backend Config**: Updated template.yaml FRONTEND_URL to www.fartooyoung.org
- **Cleanup**: Deleted old SSL certificate and app.fartooyoung.org DNS record

**STRIPE LINK PARAMETER FIX**:
- **Issue**: Attempted to disable Stripe Link via API parameter
- **Error**: `payment_method_options.link.enabled=false` not valid in API
- **Solution**: Must disable in Stripe Dashboard → Settings → Payment methods → Link
- **Action Taken**: Reverted invalid parameter from create-checkout-session.js
- **Commit**: `2df2052 Revert: Remove invalid Stripe Link parameter`
- **Deployment**: Merged to staging, production auto-deployed via CI/CD

**MOBILE UI FIX**:
- **Issue**: Input field cursor not vertically centered on mobile
- **Solution**: Added explicit height (44px) and line-height styles to DonationModal.jsx
- **Result**: Perfect cursor alignment on iOS and Android

**CI/CD PIPELINE FIX**:
- **Issue**: SAM deploy exits with error code 1 when "No changes to deploy"
- **Solution**: Updated buildspec-backend.yml to handle gracefully
- **Implementation**: Check for "No changes" message and exit 0 instead of failing
- **Result**: Pipeline no longer fails on unchanged deployments

**INFRASTRUCTURE CLEANUP**:
- **Identified**: EC2 instance i-04b79be0c8d8fa43e running old WordPress site
- **Status**: Ready for termination after monitoring period
- **Cost Savings**: ~$8.50/month when terminated
- **Security**: Eliminates WordPress vulnerability vector

**GIT WORKFLOW ISSUE**:
- **Problem**: Revert commit made directly on main instead of staging first
- **Resolution**: Merged main back to staging to maintain consistency
- **Lesson**: Always commit to staging first, then merge to main

**Key Achievements**:
- ✅ Primary domain migration complete (www + root)
- ✅ SSL certificate properly configured for all domains
- ✅ Stripe Link issue resolved (Dashboard configuration)
- ✅ Mobile input cursor alignment fixed
- ✅ CI/CD pipeline handles "no changes" gracefully
- ✅ Old infrastructure identified for cleanup
- ✅ Both staging and main branches in sync

**Technical Details**:
- CloudFront deployment time: ~10 minutes
- DNS propagation: Instant with Route 53
- Certificate validation: Automatic via DNS
- Pipeline execution: Successful deployment to production

**Next Session Goals**:
- Test staging environment thoroughly
- Disable Stripe Link in Dashboard settings
- Verify domain migration in production
- Test all payment methods
- Consider terminating old EC2 instance
- Update email templates (registration format)

---

### **December 5, 2025 - CI/CD Pipeline Implementation & Bank Payment Fix**

**Session Duration:** ~3 hours (5:00 PM - 8:33 PM EST)

#### **Phase 31: CI/CD Pipeline & Payment Method Display** ✅

**BANK ACCOUNT PAYMENT FIX**:
- **Issue**: Bank account payments showed "Unknown" with card icon
- **Root Cause**: Webhook couldn't get payment details from charge (charge doesn't exist yet for ACH)
- **Solution**: Retrieve payment method directly from PaymentIntent
- **Files Modified**:
  - `backend/lambda/stripe/webhook.js` - Added PaymentMethod retrieval
  - `src/pages/DonorDashboard.jsx` - Fixed icon rendering logic
- **Result**: Bank accounts now show proper bank icon and bank name

**CI/CD PIPELINE IMPLEMENTATION**:
- **Created Pipeline Infrastructure**:
  - `deployment/production/pipeline.yml` - CloudFormation template
  - `deployment/production/deploy-pipeline.sh` - Deployment script
  - `deployment/production/README.md` - Complete documentation
  - `buildspec-frontend.yml` - Frontend build configuration
  - `buildspec-backend.yml` - Backend build configuration

- **Pipeline Components**:
  - CodePipeline: `fartooyoung-production-pipeline`
  - CodeBuild Projects: Frontend and Backend
  - S3 Artifacts Bucket: `fartooyoung-pipeline-artifacts-{account-id}`
  - IAM Roles: CodeBuild and CodePipeline service roles
  - GitHub Integration: Webhook on main branch

- **Pipeline Stages**:
  1. **Source**: Pulls code from GitHub main branch
  2. **BuildFrontend**: Builds React app, deploys to S3, invalidates CloudFront
  3. **BuildBackend**: Builds with SAM, deploys Lambda functions

- **Deployment Workflow**:
  - Staging: Manual deployment using scripts in `deployment/staging/`
  - Production: Automated via pipeline on merge to main

**PROJECT ORGANIZATION**:
- Created `deployment/` folder structure:
  ```
  deployment/
  ├── staging/
  │   ├── deploy-frontend.sh
  │   └── deploy-backend.sh
  └── production/
      ├── pipeline.yml
      ├── deploy-pipeline.sh
      └── README.md
  ```
- Buildspec files in root (required by CodeBuild)
- GitHub token saved in `.secrets` file (git-ignored)

**TROUBLESHOOTING & FIXES**:
- Fixed buildspec file paths (moved to root for CodeBuild)
- Added IAMFullAccess to CodeBuild role for SAM deployments
- Fixed S3 bucket name in staging deploy script
- Resolved CloudFormation rollback issues

**TESTING**:
- ✅ Pipeline successfully deployed frontend to S3
- ✅ Pipeline successfully deployed backend with SAM
- ✅ CloudFront cache invalidation working
- ✅ Bank account payments displaying correctly
- ✅ All payment methods (card, bank, wallets) showing proper icons

**Technical Details**:
- GitHub Token: Stored in `.secrets` file (git-ignored)
- CloudFront Distribution: E2PHSH4ED2AIN5 (production)
- Pipeline URL: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/fartooyoung-production-pipeline/view

**Key Achievements**:
- ✅ Fully automated production deployments
- ✅ Bank account payment support complete
- ✅ Clean deployment folder structure
- ✅ Comprehensive documentation
- ✅ Staging remains manual (cost-effective)
- ✅ Production auto-deploys on git merge

**Next Session Goals**:
- Test bank account payments end-to-end in production
- Verify all payment method displays
- Set up CloudWatch monitoring and alerts
- Test complete deployment workflow
- Consider blue-green deployment strategy

---

### **December 4, 2025 - Secret Key Standardization & Deployment Workflow**

**Session Duration:** ~2 hours (9:30 PM - 11:50 PM EST)

#### **Phase 30: Secret Key Consistency Fix** ✅
- **IDENTIFIED ISSUE**: Inconsistent secret key naming between staging and production
  - Staging used lowercase: `jwt_secret`, `stripe_secret_key`
  - Production used uppercase: `JWT_SECRET`, `STRIPE_SECRET_KEY`
  - This caused login failures in production

- **STANDARDIZATION COMPLETE**: All secrets now uppercase
  - Updated 11 Lambda functions to use uppercase references
  - Auth functions: login, logout, update-profile, change-password
  - Donations: get-donations
  - Stripe: All 5 functions (checkout, payment-intent, portal, subscriptions, webhook)

- **CLEANUP**: Removed redundant `FRONTEND_URL` from Secrets Manager
  - Was stored in both Secrets Manager AND environment variables
  - Now only in environment variables (non-sensitive data)
  - Proper separation of secrets vs configuration

- **DEPLOYMENT WORKFLOW ESTABLISHED**:
  1. ✅ Commit changes to staging branch
  2. ✅ Push to GitHub (backup)
  3. ✅ Deploy to AWS staging environment
  4. ✅ Test in staging
  5. ✅ Merge staging → main branch
  6. ✅ Push main to GitHub
  7. ✅ Deploy to AWS production environment

**Technical Details:**
- Fixed `.aws-sam` cache issue by deleting and rebuilding
- Used `sam build` + `sam deploy --force-upload` for clean deployments
- Updated template.yaml with timestamp comment to force deployment
- All 17 Lambda functions updated in both environments

**Secrets Manager Structure (Final):**
```json
{
  "JWT_SECRET": "...",
  "STRIPE_SECRET_KEY": "...",
  "STRIPE_WEBHOOK_SECRET": "..."
}
```

**Key Achievements:**
- ✅ Complete consistency between staging and production
- ✅ Proper GitFlow workflow established
- ✅ Clean separation of secrets vs environment variables
- ✅ All changes version controlled in git
- ✅ Both environments deployed and operational

**Next Session Goals:**
- Thoroughly test staging environment (auth, donations, subscriptions)
- Test production environment with real payments
- Implement CI/CD pipeline for automated deployments

---

### **December 1, 2025 - Production Deployment Complete**

**Session Duration:** ~2 hours (12:00 AM - 2:00 AM EST)

#### **Phase 29: Production System Live** ✅
- **PRODUCTION DEPLOYED**: https://app.fartooyoung.org operational
- **LIVE PAYMENTS**: Real Stripe processing with live keys
- **SSL SECURED**: Wildcard certificate `*.fartooyoung.org` active
- **INFRASTRUCTURE**: Complete production stack deployed
- **DNS CONFIGURED**: Route 53 pointing to CloudFront
- **CODE COMMITTED**: All production config in git

#### **Phase 28: Production Infrastructure Setup** ✅
- Created production backend stack with SAM
- Deployed production DynamoDB tables
- Configured AWS Secrets Manager with live Stripe keys
- Set up CloudFront distribution with SSL certificate
- Configured Route 53 DNS for app.fartooyoung.org
- Built and deployed React frontend to S3/CloudFront
- Migrated staging to use wildcard certificate

**Production URLs:**
- **Live Application**: https://app.fartooyoung.org
- **Staging**: https://staging.fartooyoung.org (uses wildcard cert)

**Key Achievements:**
- **REAL MONEY PROCESSING**: Live Stripe payments operational
- **HTTPS SECURITY**: Full SSL encryption with valid certificates
- **PRODUCTION READY**: Complete infrastructure deployed
- **VERSION CONTROLLED**: All configuration committed to git
- **SCALABLE ARCHITECTURE**: AWS serverless stack operational

---

### **November 30, 2025 - Security Hardening & Documentation**

**Session Duration:** ~4 hours (4:00 PM - 8:50 PM EST)

#### **Phase 27: Backend Rate Limiting** ✅
- Created RateLimitsTable with auto-expiry (TTL)
- Implemented rate limiting utility (`backend/utils/rateLimiter.js`)
- Protected register endpoint (5 attempts/hour per IP+email)
- Protected login endpoint (5 attempts/15min per IP+email)
- Added environment variables and IAM permissions
- **Tested successfully:** Blocks after 5 attempts with clear error message
- Updated favicon to Far Too Young logo

**Test Results:**
```
Attempt 1: ✅ Success (user created)
Attempt 2-5: ❌ User already exists (attempts recorded)
Attempt 6: 🚫 RATE LIMITED - "Too many registration attempts. Please try again in 60 minutes."
```

**Database Verification:**
- Rate limits table populated correctly
- TTL auto-expiry working
- IP + email tracking functional

#### **Phase 26: Email Verification System** ✅
- Fixed Vite config for proper env variable loading (mode-specific)
- Completed email verification flow with beautiful UI
- Verification page with Sad-Girl.jpg background
- Minimal, elegant outline icons (success/error states)
- Fixed duplicate API calls with useRef
- Improved error messages for better UX
- Established git branch structure (staging/main)
- Industry-standard button text ("Continue to Login")

**Technical Fixes:**
- Vite config now reads only specified mode file (no cascading)
- Prevents `.env.local` from overriding `.env.staging`
- Works for all modes: local, staging, production

#### **Documentation Updates** ✅
- Reorganized development-progress.md with Master Summary
- Progress by Day in chronological order
- Updated architecture.md with current features
- Added future features (Books, Shop, Blog)
- Comprehensive cost breakdown for dual stacks
- Current cost: $1.80/month (staging + production)

**Key Achievements Today:**
- Complete multi-layer security stack operational
- Protection against bot attacks (reason for previous SES shutdown)
- Industry-standard rate limiting implemented
- Professional email verification UX
- Clean, organized documentation
- Ready for frontend AWS deployment

---

### **November 29, 2025 - Dashboard UI & Deployment Prep**

**Phase 25: Dashboard Refinements** ✅
- Elegant dashboard redesign with subtle styling
- Unified color palette across components
- Subscription tracking with webhook implementation
- Fixed Stripe customer deduplication issue
- Restructured dashboard (4 tabs: Dashboard, Donations, Shop, Settings)
- Bold CTA buttons with rich orange colors
- Created deployment documentation

**Key Achievements:**
- Professional, polished dashboard UI
- Complete subscription management
- Ready for staging deployment

---

### **November 26-28, 2025 - Email System & SES Recovery**

**Email Verification Implementation** ✅
- AWS SES account restored (after WordPress bot attack)
- Email service utility with SES integration
- Verification token generation (1-hour expiry)
- Professional HTML email templates
- Verification Lambda function
- Resend verification with rate limiting
- Bounce handler for production

**SES Issue Resolution** ✅
- Identified WordPress bot attack (7,612 emails, 1,143 bounces)
- Submitted remediation plan to AWS
- Migrated to secure serverless architecture
- Implemented bot protection measures

**Key Achievements:**
- Complete email verification system
- Resolved SES security issues
- Eliminated WordPress vulnerabilities

---

### **November 14-25, 2025 - Core Features Development**

**Donation System** ✅
- Stripe Checkout integration
- Monthly subscription support
- Webhook processing for payment events
- Subscription cancellation tracking
- Customer portal integration

**Dashboard & UI** ✅
- Responsive two-column layout
- Mobile optimization
- Custom scrollbar system
- Professional branding with orange gradients

**Security Infrastructure** ✅
- AWS Secrets Manager integration
- Centralized secret management
- Eliminated hardcoded credentials
- Proper IAM permissions

**Key Achievements:**
- Complete payment processing system
- Professional user dashboard
- Secure credential management

---

## 🎯 NEXT SESSION GOALS

### **OPTIONAL - CI/CD Pipeline Automation** (Enhancement)

**Step 1: Production Infrastructure** ✅ COMPLETE
- ✅ SSL certificates for fartooyoung.org (ACM)
- ✅ Production S3 bucket for frontend
- ✅ Production CloudFront distribution
- ✅ Route 53 for production domain
- ✅ Production DynamoDB tables
- ✅ Production backend stack deployed

**Step 2: Set up CodePipeline for Frontend** (30 minutes)
- Create S3 bucket for pipeline artifacts
- Create CodeBuild project for frontend build
- Configure buildspec.yml for React build
- Set up S3 sync and CloudFront invalidation
- Connect to GitHub repository (staging branch)
- Test automated deployment

**Step 3: Set up CodePipeline for Backend** (30 minutes)
- Create CodeBuild project for SAM deployment
- Configure buildspec.yml for backend
- Set up IAM roles for deployment
- Configure environment-specific parameters
- Test automated backend deployment

**Step 4: Configure Pipeline Triggers** (15 minutes)
- Set up GitHub webhook integration
- Configure branch-specific deployments
- staging branch → staging environment
- main branch → production environment

**Step 5: Add Automated Testing** (20 minutes)
- Create test stage in pipeline
- Add smoke tests for API endpoints
- Configure rollback on test failure
- Set up CloudWatch alarms

**Step 6: Documentation** (15 minutes)
- Document CI/CD architecture
- Create deployment runbook
- Update README with pipeline info

**Total Estimated Time: 2 hours 10 minutes**

---

### **Short Term (This Week)**
1. Complete CI/CD pipeline setup
2. Deploy to production environment
3. Test automated deployments
4. Monitor pipeline performance
5. Set up CloudWatch dashboards

### **Long Term (Next Month)**
1. Implement blue-green deployments
2. Add automated security scanning
3. Set up performance monitoring
4. Implement automated backups
5. Add analytics and user tracking

---

## 📋 QUICK REFERENCE

### **Current Environment**
- **Branch:** main (production) / staging (development)
- **Production:** https://www.fartooyoung.org and https://fartooyoung.org (✅ LIVE)
- **Staging:** https://staging.fartooyoung.org (🧪 TESTING)
- **Production API:** https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com (✅ LIVE)
- **Staging API:** https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com (🧪 TESTING)
- **Database:** DynamoDB (production + staging tables)
- **Email:** AWS SES (operational with verified domain)
- **Payments:** Live Stripe processing (real money)

### **Key Commands**
```bash
# Start local dev with staging API
npm run dev -- --mode staging

# Build for production
npm run build -- --mode production

# Deploy backend to production
cd backend && sam build && sam deploy --config-env production

# Deploy backend to staging
cd backend && sam build && sam deploy --config-env staging

# Check git status
git status
git branch -a

# Deploy frontend to production (manual)
npm run build -- --mode production
aws s3 sync dist/ s3://fartooyoung-frontend-production --delete
aws cloudfront create-invalidation --distribution-id E2PHSH4ED2AIN5 --paths "/*"
```

### **Important URLs**
- **🟢 LIVE PRODUCTION**: https://www.fartooyoung.org and https://fartooyoung.org ✅
- **🔵 Staging**: https://staging.fartooyoung.org 🧪
- **GitHub Repo**: https://github.com/asharma12git/fartooyoung
- **Production API**: https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com ✅
- **Staging API**: https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com 🧪
- **CloudFront Distribution**: E2PHSH4ED2AIN5

### **AWS Resources (Production)**
- Stack: fartooyoung-production
- Users Table: fartooyoung-production-users-table
- Donations Table: fartooyoung-production-donations-table
- Rate Limits Table: fartooyoung-production-rate-limits
- Secrets: fartooyoung-production-secrets-tEmB4i
- S3 Frontend: fartooyoung-frontend-production

### **AWS Resources (Staging)**
- Stack: fartooyoung-staging
- Users Table: fartooyoung-staging-users-table
- Donations Table: fartooyoung-staging-donations-table
- Rate Limits Table: fartooyoung-staging-rate-limits
- Secrets: fartooyoung-staging-secrets

---

**Last Updated:** August 26, 2026, 4:40 PM EST  
**Current Branch:** staging (email system + auth fixes + UX polish)  
**Production Status:** ✅ LIVE at https://www.fartooyoung.org  
**Payment Status:** ✅ Live Stripe processing operational (inline payments, subscriptions via webhook)  
**Documentation Status:** ✅ All docs updated and synchronized  
**Next Milestone:** Production deployment of email system + Newsletter System  
**Status:** 🎉 PRODUCTION SYSTEM OPERATIONAL - EMAIL SYSTEM COMPLETE
