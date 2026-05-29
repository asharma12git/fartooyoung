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
| `backend/lambda/auth/forgot-password.js`, `reset-password.js`, `change-password.js` | 5 (Password Management) |
| `backend/lambda/auth/update-profile.js`, `logout.js` | 6 (Profile) |
| `backend/lambda/donations/get-donations.js` | 7 (Dashboard) |
| `backend/lambda/donations/create-donation.js` | 8 (Donations One-time) |
| `backend/lambda/stripe/webhook.js` | 8, 9, 11 (Donations + Stripe) |
| `backend/lambda/stripe/create-checkout-session.js` | 8, 9 (Donations) |
| `backend/lambda/stripe/create-portal-session.js`, `list-subscriptions.js` | 9 (Monthly) |
| `backend/lambda/stripe/create-payment-intent.js` | 8 (Donations) |
| `backend/template.yaml` | ALL (infrastructure change) |
| `backend/lambda/utils/cors.js` | 10 (Security - CORS) |
| `src/pages/DonorDashboard.jsx` | 7 (Dashboard) |
| `src/components/CheckoutButton.jsx` | 8, 9 (Donations) — legacy, still exists for fallback |
| `src/components/StripePayment.jsx` | 8, 9 (Donations) |
| `src/components/PaymentForm.jsx` | 8, 9 (Donations) |
| `src/components/DonationModal.jsx` | 8, 9 (Donations) |
| `src/pages/*.jsx` | 1 (Frontend) |
| `src/App.jsx` | 1 (Frontend - routing) |
| `.env.staging`, `.env.production` | ALL (environment config) |
| `deployment/*` | None (pipeline infra only) |
| `docs/*` | None |

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
| 9.1 | Create subscription checkout | API | `curl -X POST {api}/stripe/create-checkout-session -d '{"amount":25,"donation_type":"monthly","donor_info":{...}}'` | `checkout_url` returned (subscription mode) |
| 9.2 | List subscriptions | API | `curl -X GET {api}/stripe/list-subscriptions -H "Authorization: Bearer {token}"` | `subscriptions` array returned |
| 9.3 | Create portal session | API | `curl -X POST {api}/stripe/create-portal-session -H "Authorization: Bearer {token}"` | `portal_url` returned |
| 9.4 | Cancel subscription | Browser | Go to portal, cancel | Status changes to cancelled |
| 9.5 | Recurring payment recorded | API | After billing cycle, check donations | New record with same stripeSubscriptionId |

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

*Last updated: 2026-05-28*
