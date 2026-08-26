# Far Too Young - Regression Testing Checklist

## Overview

This is the **regression test suite** for the Far Too Young project. Run after every deployment to verify nothing is broken. Can be executed via CLI (API tests) or browser (UI tests).

---

## Coverage Map

**If you changed these files → run these test sections:**

| Files Changed | Run Sections |
|--------------|--------------|
| `backend/lambda/auth/login.js` | 2 (Login), 10 (Security) |
| `backend/lambda/auth/register.js` | 3 (Registration) |
| `backend/lambda/auth/verify-email.js`, `resend-verification.js` | 4 (Email Verification) |
| `backend/lambda/auth/forgot-password.js`, `reset-password.js`, `change-password.js` | 5 (Password Management), 15 (Reset Password Page) |
| `backend/lambda/auth/update-profile.js`, `logout.js` | 6 (Profile) |
| `backend/lambda/donations/get-donations.js` | 7 (Dashboard) |
| `backend/lambda/donations/create-donation.js` | 8 (Donations One-time) |
| `backend/lambda/stripe/webhook.js` | 8, 9, 11 (Donations + Stripe + Payment Fixes) |
| `backend/lambda/stripe/create-checkout-session.js` | 8, 9 (Donations) |
| `backend/lambda/stripe/create-portal-session.js`, `list-subscriptions.js` | 9 (Monthly) |
| `backend/lambda/stripe/create-payment-intent.js` | 8, 9, 11 (Donations + Monthly Inline + Stripe) |
| `backend/template.yaml` | ALL (infrastructure change) |
| `backend/lambda/utils/cors.js` | 10 (Security - CORS) |
| `backend/lambda/admin/admin-research.js` | 14 (Admin Panel) |
| `backend/lambda/admin/upload-image.js` | 14 (Admin Panel) |
| `backend/lambda/content/get-research-articles.js` | 14 (Admin Panel), 1 (Frontend) |
| `backend/lambda/content/research-fetcher.js` | 14 (Admin Panel) |
| `src/pages/DonorDashboard.jsx` | 7 (Dashboard) |
| `src/components/CheckoutButton.jsx` | 8, 9 (Donations) — legacy, still exists for fallback |
| `src/components/StripePayment.jsx` | 8, 9 (Donations) |
| `src/components/PaymentForm.jsx` | 8, 9 (Donations) |
| `src/components/DonationModal.jsx` | 8, 9 (Donations) |
| `src/pages/*.jsx` | 1 (Frontend), 15 (Reset Password Page) |
| `src/pages/Admin.jsx` | 14 (Admin Panel) |
| `src/App.jsx` | 1 (Frontend - routing), 15 (Reset Password Page) |
| `.env.staging`, `.env.production` | ALL (environment config) |
| `deployment/*` | None (pipeline infra only) |
| `docs/*` | None |
| `index.html` | 13 (SEO) |
| `public/sitemap.xml`, `public/robots.txt`, `public/manifest.json` | 13 (SEO) |
| `src/components/SEO.jsx` | 13 (SEO) |
| `scripts/prerender.mjs` | 13 (SEO) |

---

## Quick Reference

**Staging API:** `https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod`
**Production API:** `https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/Prod`
**Test card:** `4242 4242 4242 4242` | Exp: `12/34` | CVC: `123` | ZIP: `12345`

---

## Last Run

| Date | Environment | Sections | Result | Run By |
|------|-------------|----------|--------|--------|
| 2026-05-28 | Staging | All (1-12) | ✅ All pass | CLI |

---

## 1. Frontend

| # | Test | Method | Steps/Command | Expected |
|---|------|--------|---------------|----------|
| 1.1 | Homepage loads | API | `curl -s -o /dev/null -w "%{http_code}" https://{site}` | 200 |
| 1.2 | All pages accessible | Browser | Navigate: Home, Child Marriage, Founder & Team, Partners, What We Do | Each page renders without errors |
| 1.3 | Mobile responsive | Browser | Resize to <768px or use phone | Hamburger menu, stacked layout |
| 1.4 | Dark theme consistent | Browser | Navigate all pages | No white flashes, consistent dark theme |
| 1.5 | Donation page opens | Browser | Click Donate button | Modal opens with amount selection |

---

## 2. Login

| # | Test | Method | Command | Expected |
|---|------|--------|---------|----------|
| 2.1 | Valid login | API | `curl -X POST {api}/auth/login -d '{"email":"user@email.com","password":"correct"}'` | `success: true`, token returned |
| 2.2 | Wrong password | API | `curl -X POST {api}/auth/login -d '{"email":"user@email.com","password":"wrong"}'` | "Invalid credentials. X attempts remaining." |
| 2.3 | Non-existent email | API | `curl -X POST {api}/auth/login -d '{"email":"nobody@fake.com","password":"x"}'` | "Invalid credentials" (no info leak) |
| 2.4 | Empty email | API | `curl -X POST {api}/auth/login -d '{"email":"","password":"x"}'` | "Email and password are required." |
| 2.5 | Empty password | API | `curl -X POST {api}/auth/login -d '{"email":"x@x.com","password":""}'` | "Email and password are required." |
| 2.6 | No body | API | `curl -X POST {api}/auth/login -d '{}'` | "Email and password are required." |
| 2.7 | Rate limited (5 failures) | API | Send 5 wrong passwords in a row | "Too many login attempts. Try again in X minutes." |

---

## 3. Registration

| # | Test | Method | Command | Expected |
|---|------|--------|---------|----------|
| 3.1 | Valid registration | API | `curl -X POST {api}/auth/register -d '{"email":"new@test.com","password":"Strong1!","firstName":"Test","lastName":"User"}'` | `success: true`, verification email sent |
| 3.2 | Password too short | API | password: `"abc"` | "Password must be at least 8 characters long." |
| 3.3 | No special char | API | password: `"Password123"` | "Must include uppercase, lowercase, number, and special character." |
| 3.4 | No uppercase | API | password: `"password1!"` | Same as 3.3 |
| 3.5 | No number | API | password: `"Password!"` | Same as 3.3 |
| 3.6 | No lowercase | API | password: `"PASSWORD1!"` | Same as 3.3 |
| 3.7 | Invalid email format | API | email: `"notanemail"` | "Please enter a valid email address." |
| 3.8 | Email with spaces | API | email: `" bad @x.com "` | "Please enter a valid email address." |
| 3.9 | Missing email | API | omit email field | "All fields are required: email, password, first name, and last name." |
| 3.10 | Missing password | API | omit password field | Same as 3.9 |
| 3.11 | Missing name | API | omit firstName/lastName | Same as 3.9 |
| 3.12 | XSS in name | API | firstName: `"<script>alert(1)</script>"` | Tags stripped, stored as "alert(1)" |
| 3.13 | Duplicate email | API | Use existing email | "User already exists" |
| 3.14 | Empty body | API | `curl -X POST {api}/auth/register -d '{}'` | Same as 3.9 |
| 3.15 | Rate limited (5 attempts) | API | Register 5+ times same IP | "Too many registration attempts." |

> ⚠️ Test 3.1 creates a user. Clean up after: `aws dynamodb delete-item --table-name {table} --key '{"email":{"S":"new@test.com"}}'`

---

## 4. Email Verification

| # | Test | Method | Command | Expected |
|---|------|--------|---------|----------|
| 4.1 | Verify with valid token | API | `curl -X POST {api}/auth/verify-email -d '{"token":"valid_token"}'` | "Email verified successfully" |
| 4.2 | Verify with invalid token | API | `curl -X POST {api}/auth/verify-email -d '{"token":"invalid"}'` | Error: invalid/expired token |
| 4.3 | Resend verification | API | `curl -X POST {api}/auth/resend-verification -d '{"email":"user@email.com"}'` | "Verification email sent" |
| 4.4 | Login before verification | API | Register new user, try login without verifying | Login fails (email not verified) |

---

## 5. Password Management

| # | Test | Method | Command | Expected |
|---|------|--------|---------|----------|
| 5.1 | Forgot password (valid email) | API | `curl -X POST {api}/auth/forgot-password -d '{"email":"user@email.com"}'` | "Reset email sent" (or similar) |
| 5.2 | Forgot password (non-existent) | API | `curl -X POST {api}/auth/forgot-password -d '{"email":"nobody@x.com"}'` | Generic success (no info leak) |
| 5.3 | Reset password (valid token) | API | `curl -X POST {api}/auth/reset-password -d '{"token":"valid","password":"NewPass1!"}'` | "Password reset successfully" |
| 5.4 | Reset password (invalid token) | API | `curl -X POST {api}/auth/reset-password -d '{"token":"invalid","password":"NewPass1!"}'` | Error: invalid/expired token |
| 5.5 | Change password (authenticated) | API | `curl -X POST {api}/auth/change-password -H "Authorization: Bearer {token}" -d '{"currentPassword":"old","newPassword":"New1!"}'` | "Password changed successfully" |
| 5.6 | Change password (wrong current) | API | Same but wrong currentPassword | Error: incorrect current password |

---

## 6. Profile & Session

| # | Test | Method | Command | Expected |
|---|------|--------|---------|----------|
| 6.1 | Update profile | API | `curl -X POST {api}/auth/update-profile -H "Authorization: Bearer {token}" -d '{"firstName":"New","lastName":"Name"}'` | "Profile updated" |
| 6.2 | Update profile (no auth) | API | Same without Authorization header | 401 "Authentication required" |
| 6.3 | Logout | API | `curl -X POST {api}/auth/logout -H "Authorization: Bearer {token}"` | "Logged out successfully" |
| 6.4 | Access after logout | Browser | Log out, try accessing /dashboard | Redirected to login |

---

## 7. Donor Dashboard

| # | Test | Method | Command | Expected |
|---|------|--------|---------|----------|
| 7.1 | Get donations (authenticated) | API | `curl -X GET {api}/donations -H "Authorization: Bearer {token}"` | `success: true`, donations array |
| 7.2 | Donations sorted by date | API | Check response order | Most recent first |
| 7.3 | Card brand displayed | API | Check `cardBrand` field | "visa", "amex", "mastercard", etc. |
| 7.4 | Card last4 displayed | API | Check `cardLast4` field | 4-digit string |
| 7.5 | Wallet type captured | API | Check `wallet` field | "apple_pay", "google_pay", or null |
| 7.6 | Amount in dollars | API | Check `amount` field | Number (not cents) |
| 7.7 | No auth → rejected | API | `curl -X GET {api}/donations` (no header) | 401 "Authentication required" |
| 7.8 | Invalid token → rejected | API | `curl -X GET {api}/donations -H "Authorization: Bearer invalid"` | "Invalid or expired token" |
| 7.9 | Dashboard UI displays correctly | Browser | Log in, check Donation History | Shows "Brand ••••Last4", amounts, dates |
| 7.10 | Wallet badge shows | Browser | Check Apple Pay/Google Pay donations | Badge visible |

---

## 8. Donations (One-Time)

| # | Test | Method | Command | Expected |
|---|------|--------|---------|----------|
| 8.1 | Create payment intent ($5) | API | `curl -X POST {api}/stripe/create-payment-intent -d '{"amount":5,"donor_info":{...},"donation_type":"one-time"}'` | `client_secret` returned |
| 8.2 | Create payment intent ($500) | API | Same with amount: 500 | `client_secret` returned |
| 8.3 | Missing donor info | API | Omit donor_info | Error: "Missing required fields" |
| 8.4 | Complete card payment | Browser | Enter test card 4242..., click Donate | Success overlay shows, payment in DB |
| 8.5 | Apple Pay button shows | Browser | Open on iPhone Safari (HTTPS only) | Apple Pay option visible |
| 8.6 | Google Pay button shows | Browser | Open on Chrome desktop (HTTPS only) | Google Pay option visible |
| 8.7 | Bank account option | Browser | Click US Bank Account tab | Bank form appears |
| 8.8 | Declined card | Browser | Use 4000 0000 0000 0002 | Error message shown, no DB record |
| 8.9 | Webhook writes new format | API | After payment, check DynamoDB | Record with `pi_` prefix, 14 fields |

---

## 9. Donations (Monthly Subscription)

| # | Test | Method | Command | Expected |
|---|------|--------|---------|----------|
| 9.1 | Create monthly payment intent (inline) | API | `curl -X POST {api}/stripe/create-payment-intent -d '{"amount":25,"donation_type":"monthly","donor_info":{...}}'` | `client_secret` returned (same flow as one-time) |
| 9.2 | List subscriptions | API | `curl -X GET {api}/stripe/list-subscriptions -H "Authorization: Bearer {token}"` | `subscriptions` array returned |
| 9.3 | Create portal session | API | `curl -X POST {api}/stripe/create-portal-session -H "Authorization: Bearer {token}"` | `portal_url` returned |
| 9.4 | Cancel subscription | Browser | Go to portal, cancel | Status changes to cancelled |
| 9.5 | Recurring payment recorded | API | After billing cycle, check donations | New record with same stripeSubscriptionId |
| 9.6 | Subscription created after first monthly payment | Stripe | Complete monthly donation → check Stripe | Subscription object created with billing_cycle_anchor 30 days out |
| 9.7 | No double-charge on first month | Stripe | Complete monthly → check billing_cycle_anchor | Anchor = current_period_end (30 days from payment) |
| 9.8 | Duplicate subscription prevention | Stripe | Complete same monthly donation twice | Only one subscription exists (second is blocked) |
| 9.9 | Monthly upsell popup | Browser | Open donation modal | Monthly upsell popup appears, 'Yes Monthly' sets type to monthly |
| 9.10 | Transaction description (monthly) | Stripe | Complete monthly donation → check Stripe dashboard | Description: 'Far Too Young - Monthly Donation' |
| 9.11 | Transaction description (one-time) | Stripe | Complete one-time donation → check Stripe dashboard | Description: 'Far Too Young - One-time Donation' |

---

## 10. Authentication & Security

| # | Test | Method | Command | Expected |
|---|------|--------|---------|----------|
| 10.1 | Invalid token rejected | API | `Authorization: Bearer invalidtoken` | "Invalid or expired token" |
| 10.2 | No token rejected | API | No Authorization header on protected endpoint | 401 |
| 10.3 | CORS preflight (www) | API | `curl -I -X OPTIONS {api}/auth/login -H "Origin: https://www.fartooyoung.org"` | `access-control-allow-origin: *` |
| 10.4 | CORS preflight (non-www) | API | `curl -I -X OPTIONS {api}/auth/login -H "Origin: https://fartooyoung.org"` | `access-control-allow-origin: *` |
| 10.5 | CORS actual response | API | `curl -X POST {api}/auth/login -H "Origin: https://www.fartooyoung.org" ...` | `access-control-allow-origin: https://www.fartooyoung.org` |
| 10.6 | Login rate limit | API | 5 wrong passwords → 6th attempt | Blocked: "Too many login attempts" |
| 10.7 | Register rate limit | API | 5 registrations → 6th attempt | Blocked: "Too many registration attempts" |
| 10.8 | No email info leak | API | Login with non-existent email | "Invalid credentials" (not "user not found") |
| 10.9 | SQL/NoSQL injection | API | email: `"admin\" OR 1=1 --"` | "Invalid credentials" (no crash) |

---

## 11. Stripe Integration

| # | Test | Method | Command | Expected |
|---|------|--------|---------|----------|
| 11.1 | Webhook endpoint responds | API | `curl -X POST {api}/stripe/webhook` (no sig) | 400 "No stripe-signature header" |
| 11.2 | Payment method details captured | API | After payment, check DB record | cardBrand, cardLast4, wallet populated |
| 11.3 | Subscription created event | Stripe | Create subscription → check DB | Record with type "monthly" |
| 11.4 | Subscription cancelled event | Stripe | Cancel subscription → check DB | Record with type "subscription_cancelled" |
| 11.5 | Invoice payment succeeded | Stripe | Wait for renewal → check DB | New record with stripeInvoiceId |
| 11.6 | payment_intent.processing event | Stripe | Pay with bank account → check DB | Record with status "pending" |
| 11.7 | No double pi_ prefix | API | After payment, check donation ID in DB | ID starts with `pi_` (not `pi_pi_`) |
| 11.8 | Apple Pay captures email+name | Stripe | Complete Apple Pay donation → check DB | name and email populated (not 'unknown') |
| 11.9 | Google Pay captures email+name | Stripe | Complete Google Pay donation → check DB | name and email populated (not 'unknown') |
| 11.10 | PaymentIntent not duplicated | Browser | Open modal, wait, check network tab | Only ONE /create-payment-intent call per modal open |
| 11.11 | Decimal amount accepted | Browser | Enter $12.50 in custom amount (step=0.01) | Payment processes for $12.50 |
| 11.12 | Auto-close modal on success | Browser | Complete a donation | Modal closes after ~3 seconds, dashboard refreshes |

---

## 12. Responsive / UI

| # | Test | Method | Steps | Expected |
|---|------|--------|-------|----------|
| 12.1 | Desktop layout | Browser | Open site full width | Full navigation, proper spacing |
| 12.2 | Mobile layout | Browser | Resize <768px or use phone | Hamburger menu, stacked content |
| 12.3 | Tablet layout | Browser | Resize 768-1024px | Grid adjusts |
| 12.4 | Dark theme | Browser | Navigate all pages | Consistent, no white flashes |
| 12.5 | Donation modal mobile | Browser | Open donate on mobile | Modal fits screen, scrollable |
| 12.6 | Dashboard mobile | Browser | View dashboard on mobile | Tables/cards stack properly |

---

## Post-Deployment Smoke Test (5 min)

Run these minimum after every deploy:

| # | Test | Command | Expected |
|---|------|---------|----------|
| S1 | Site loads | `curl -s -o /dev/null -w "%{http_code}" https://{site}` | 200 |
| S2 | Login works | `curl -X POST {api}/auth/login -d '{"email":"...","password":"..."}'` | Token returned |
| S3 | Dashboard data | `curl -X GET {api}/donations -H "Authorization: Bearer {token}"` | Donations array |
| S4 | Checkout works | `curl -X POST {api}/stripe/create-checkout-session -d '...'` | checkout_url |
| S5 | Validation works | `curl -X POST {api}/auth/register -d '{"email":"x","password":"abc",...}'` | Rejected with error |

---

## 14. Admin Panel

| # | Test | Method | Command/Steps | Expected |
|---|------|--------|---------------|----------|
| 14.1 | Get all research articles (admin) | API | `curl -X GET {api}/admin/research -H "Authorization: Bearer {admin_token}"` | Array of all articles (all statuses) |
| 14.2 | Get research articles (non-admin) | API | `curl -X GET {api}/admin/research -H "Authorization: Bearer {user_token}"` | 403 Forbidden |
| 14.3 | Get research articles (no auth) | API | `curl -X GET {api}/admin/research` | 401 Unauthorized |
| 14.4 | Get tiers | API | `curl -X GET {api}/admin/tiers -H "Authorization: Bearer {admin_token}"` | Array of 7 tier objects |
| 14.5 | Add article (valid URL) | API | `curl -X POST {api}/admin/research -H "Authorization: Bearer {admin_token}" -d '{"url":"https://example.com/article"}'` | Article created with extracted title |
| 14.6 | Add article (duplicate URL) | API | POST same URL twice | Error: duplicate article |
| 14.7 | Add article (invalid URL) | API | `curl -X POST {api}/admin/research -d '{"url":"not-a-url"}'` | Validation error |
| 14.8 | Update article status | API | `curl -X PUT {api}/admin/research/{id} -H "Authorization: Bearer {admin_token}" -d '{"status":"approved"}'` | Article updated |
| 14.9 | Star article | API | `curl -X PUT {api}/admin/research/{id} -H "Authorization: Bearer {admin_token}" -d '{"starred":true}'` | Article starred |
| 14.10 | Delete article | API | `curl -X DELETE {api}/admin/research/{id} -H "Authorization: Bearer {admin_token}"` | Article deleted |
| 14.11 | Public research (approved only) | API | `curl -X GET {api}/research/articles` | Only approved/no-status articles returned |
| 14.12 | Public research with status filter | API | `curl -X GET {api}/research/articles?status=approved` | Only approved articles |
| 14.13 | Public research with limit | API | `curl -X GET {api}/research/articles?limit=5` | Max 5 articles returned |
| 14.14 | Upload image (presigned URL) | API | `curl -X POST {api}/admin/upload-image -H "Authorization: Bearer {admin_token}" -d '{"filename":"test.jpg","contentType":"image/jpeg"}'` | Presigned S3 URL returned |
| 14.15 | Admin page access (admin user) | Browser | Log in as admin, navigate to /admin | Admin panel renders with Research Articles and Blog Posts tabs |
| 14.16 | Admin page access (non-admin) | Browser | Log in as regular user, navigate to /admin | Redirected away |
| 14.17 | Admin Panel button in dashboard | Browser | Log in as admin, check dashboard | Green "Admin Panel" button visible |
| 14.18 | CORS preflight for PUT | API | `curl -I -X OPTIONS {api}/admin/research/123 -H "Origin: https://www.fartooyoung.org" -H "Access-Control-Request-Method: PUT"` | Allow-Methods includes PUT |
| 14.19 | CORS preflight for DELETE | API | `curl -I -X OPTIONS {api}/admin/research/123 -H "Origin: https://www.fartooyoung.org" -H "Access-Control-Request-Method: DELETE"` | Allow-Methods includes DELETE |
| 14.20 | Generate blog post (admin) | API | `curl -X POST {api}/admin/generate-post -H "Authorization: Bearer {admin_token}"` | Draft post created with title, content, category |
| 14.21 | Generated post has reading_time | API | Check generated post in DB | `reading_time` field > 0 |
| 14.22 | Generated post has CTA block | API | Check generated post content | Contains `#donate-monthly` and `#donate-once` links |
| 14.23 | Generated post author | API | Check generated post | `author` = "Far Too Young, Inc." |
| 14.24 | Generated post has category | API | Check generated post | Category is one of: Education, Health, Norms & Culture, Policy & Justice, Research, Climate & Crisis |
| 14.25 | Generate post skips used articles | API | Generate twice, check source_articles | Different articles used each time |
| 14.26 | EventBridge Monday trigger active | API | `aws events describe-rule --name {monday-rule} --region us-east-1` | State: ENABLED, cron(0 11 ? * MON *) |
| 14.27 | EventBridge Friday trigger active | API | `aws events describe-rule --name {friday-rule} --region us-east-1` | State: ENABLED, cron(0 11 ? * FRI *) |
| 14.28 | Blog posts public (published only) | API | `curl {api}/blog/posts` | Only published posts returned |
| 14.29 | Blog posts admin (all statuses) | API | `curl {api}/blog/posts?all=true -H "Authorization: Bearer {admin_token}"` | Includes drafts |
| 14.30 | Blog post by slug (draft accessible) | API | `curl {api}/blog/posts/slug/{draft-slug}` | Returns draft post content |
| 14.31 | Subscribe shows temp message | Browser | Click Subscribe on blog page | "Thank you for your interest! Our newsletter is launching soon." |
| 14.32 | Donate Monthly link in CTA | Browser | Click "→ Donate Monthly" in blog post | Opens donation modal with monthly tab selected |
| 14.33 | Donate One-Time link in CTA | Browser | Click "→ Make a One-Time Gift" in blog post | Opens donation modal with one-time tab selected |
| 14.34 | Bottom Donate Now button | Browser | Click "Donate Now" at bottom of blog post | Opens donation modal at step 1 (amount selection) |

---

## 15. Reset Password Page

| # | Test | Method | Steps/Command | Expected |
|---|------|--------|---------------|----------|
| 15.1 | Page loads with valid token | Browser | Navigate to `/reset-password?token=valid_token` | Form renders with two password fields |
| 15.2 | Page shows error without token | Browser | Navigate to `/reset-password` (no token) | Error message: invalid/missing token |
| 15.3 | Password validation - too short | Browser | Enter password < 8 chars, submit | Validation error shown |
| 15.4 | Password validation - no uppercase | Browser | Enter `password1!`, submit | Validation error: must include uppercase |
| 15.5 | Password validation - no number | Browser | Enter `Password!`, submit | Validation error: must include number |
| 15.6 | Password validation - no special char | Browser | Enter `Password1`, submit | Validation error: must include special character |
| 15.7 | Passwords must match | Browser | Enter different passwords in both fields | Validation error: passwords don't match |
| 15.8 | Eye toggle shows/hides password | Browser | Click eye icon on password field | Toggles between type="password" and type="text" |
| 15.9 | Eye toggle works on confirm field | Browser | Click eye icon on confirm password field | Toggles independently from first field |
| 15.10 | Successful reset with valid token | API | `curl -X POST {api}/auth/reset-password -d '{"token":"valid","newPassword":"NewPass1!"}'` | "Password reset successfully" |
| 15.11 | Reset with expired token | API | Use token older than 1 hour | Error: token expired |
| 15.12 | Reset sends confirmation email | Browser | Complete valid reset | Confirmation email received |
| 15.13 | Frontend sends 'newPassword' field | Browser | Submit form, check Network tab | POST body contains `newPassword` (not `password`) |
| 15.14 | Forgot password - Send Reset Link button | Browser | Open forgot password form in AuthModal | Button reads "Send Reset Link" (not "Send Reset Token") |
| 15.15 | Forgot password - no 'Already have a token?' link | Browser | Open forgot password form | No "Already have a token?" link present |
| 15.16 | Success message persists | Browser | Send reset link, observe message | Success message stays visible (does not disappear after 3s) |
| 15.17 | Lambda timeout handles cold start | API | Call `/auth/reset-password` after period of inactivity | Response within 10s (no 502 timeout) |
| 15.18 | No white flash on page transition | Browser | Navigate between pages quickly | Black background persists, no white flash |

---

## Adding New Tests

When adding a new feature:
1. Identify which section it belongs to (or create a new section)
2. Add test cases with: number, description, method, command/steps, expected result
3. Update the **Coverage Map** at the top with the new file → section mapping
4. Run the new tests on staging before merging to main

---

## Test Data Cleanup

After running tests that create data on staging:

```bash
# Delete test user
aws dynamodb delete-item --table-name fartooyoung-staging-users-table \
  --key '{"email":{"S":"testuser@email.com"}}' --region us-east-1

# Delete test donation
aws dynamodb delete-item --table-name fartooyoung-staging-donations-table \
  --key '{"id":{"S":"checkout_cs_test_XXXXX"}}' --region us-east-1

# View all staging users
aws dynamodb scan --table-name fartooyoung-staging-users-table \
  --projection-expression "email" --region us-east-1
```

---

## 13. SEO & Analytics

| # | Test | Method | How To | Expected |
|---|------|--------|--------|----------|
| 13.1 | Pre-rendered HTML has content | CLI | `curl -s https://www.fartooyoung.org/ \| grep "<title>"` | Returns unique page title, not just "Far Too Young" |
| 13.2 | Meta description present | CLI | `curl -s https://www.fartooyoung.org/ \| grep 'name="description"'` | Contains page-specific description |
| 13.3 | OG tags present | CLI | `curl -s https://www.fartooyoung.org/ \| grep 'property="og:'` | og:title, og:description, og:image exist |
| 13.4 | Canonical URL present | CLI | `curl -s https://www.fartooyoung.org/ \| grep 'rel="canonical"'` | Points to correct URL |
| 13.5 | Sitemap accessible | CLI | `curl -s -o /dev/null -w "%{http_code}" https://www.fartooyoung.org/sitemap.xml` | 200 |
| 13.6 | Robots.txt accessible | CLI | `curl -s https://www.fartooyoung.org/robots.txt` | Shows Allow/Disallow rules + Sitemap URL |
| 13.7 | Manifest accessible | CLI | `curl -s -o /dev/null -w "%{http_code}" https://www.fartooyoung.org/manifest.json` | 200 |
| 13.8 | JSON-LD structured data | CLI | `curl -s https://www.fartooyoung.org/ \| grep "NonprofitOrganization"` | Present in HTML |
| 13.9 | GA4 script loaded | Browser | Open site → DevTools → Network → filter "gtag" | Request to googletagmanager.com |
| 13.10 | Clarity script loaded | Browser | Open site → DevTools → Network → filter "clarity" | Request to clarity.ms |
| 13.11 | Each page has unique title | CLI | Curl each route, compare `<title>` tags | All 4 pages have different titles |

---

## Test Cards Reference

| Card | Brand | Result |
|------|-------|--------|
| `4242 4242 4242 4242` | Visa | Success |
| `5555 5555 5555 4444` | Mastercard | Success |
| `3782 822463 10005` | Amex | Success |
| `4000 0000 0000 0002` | Visa | Declined |
| `4000 0000 0000 9995` | Visa | Insufficient funds |
| `4000 0027 6000 3184` | Visa | 3D Secure required |

**All test cards**: Exp `12/34`, CVC `123`, ZIP `12345`

---

*Last updated: 2026-08-26*
