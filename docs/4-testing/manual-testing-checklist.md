# Manual Testing Checklist

Use this checklist after every deployment to validate core features.

> **Method column**: `API` = can be tested via curl/CLI, `Browser` = requires manual browser interaction.
>
> **Test data note**: API tests that create data (registration) should be run against **staging only**. Login and read-only tests are safe on production — they don't write new data.

---

## Login

| # | Test | How To | Expected Result | Method |
|---|------|--------|-----------------|--------|
| 1 | Valid login | Enter your email + correct password, click Login | Success, redirected to dashboard | API |
| 2 | Wrong password | Enter correct email + "WrongPass123!", click Login | "Invalid credentials. X attempts remaining." | API |
| 3 | Rate limited | Enter wrong password 5 times in a row | "Too many login attempts. Try again in X minutes." | API |
| 4 | Empty email | Leave email blank, enter any password, click Login | "Email and password are required." | API |
| 5 | Empty password | Enter email, leave password blank, click Login | "Email and password are required." | API |
| 6 | Non-existent email | Enter "nobody@fake.com" + any password | "Invalid credentials" (no info leak) | API |
| 7 | Invalid email format | Enter "notanemail" in email field | "Invalid credentials" | API |
| 8 | Email with spaces | Enter " user@gmail.com " (spaces around it) | Should trim and still work | API |

> ⚠️ Tests 2-3 trigger rate limiting. Run against staging to avoid locking out your production account.

---

## Registration

| # | Test | How To | Expected Result | Method |
|---|------|--------|-----------------|--------|
| 9 | Valid registration | Fill all fields, password like "MyPass1!" | Success, verification email sent | API |
| 10 | Duplicate email | Register with an email that already exists | "User already exists" | API |
| 11 | Short password | Enter password "abc" | "Password must be at least 8 characters long." | API |
| 12 | No special char | Enter password "Password123" | "Must include uppercase, lowercase, number, and special character." | API |
| 13 | No uppercase | Enter password "password1!" | Same as above | API |
| 14 | No number | Enter password "Password!" | Same as above | API |
| 15 | Missing email | Leave email blank, fill everything else | "All fields are required" | API |
| 16 | Missing password | Leave password blank, fill everything else | "All fields are required" | API |
| 17 | Missing name | Leave first or last name blank | "All fields are required" | API |
| 18 | Invalid email | Enter "notanemail" in email field | "Please enter a valid email address." | API |
| 19 | Email with spaces | Enter " bad @gmail.com " | "Please enter a valid email address." | API |
| 20 | XSS in name | Enter `<script>alert(1)</script>` as first name | Tags stripped, name stored as "alert(1)" | API |

> ⚠️ Tests 9, 20 create users in the database. **Run on staging only.** Delete test users after: `aws dynamodb delete-item --table-name fartooyoung-staging-users-table --key '{"email":{"S":"testuser@gmail.com"}}'`

---

## Donations (One-Time)

| # | Test | How To | Expected Result | Method |
|---|------|--------|-----------------|--------|
| 21 | Small donation | Click Donate, enter $5, select one-time, pay with 4242 4242 4242 4242 | Appears in dashboard as $5 one-time | Browser |
| 22 | Large donation | Same flow but enter $500 | Appears in dashboard as $500 one-time | Browser |
| 23 | Visa card | Pay with 4242 4242 4242 4242 | Shows "Visa ••••4242" in dashboard | Browser |
| 24 | Amex card | Pay with 3782 822463 10005 | Shows "Amex ••••0005" in dashboard | Browser |
| 25 | Wallet payment | Use Apple Pay or Google Pay on checkout page | Shows wallet badge in dashboard | Browser |
| 26 | Declined card | Pay with 4000 0000 0000 0002 | Stripe shows decline error, nothing in DB | Browser |

> ⚠️ Tests 21-25 create donation records. **Run on staging only** (uses Stripe test keys, no real money).

---

## Donations (Monthly Subscription)

| # | Test | How To | Expected Result | Method |
|---|------|--------|-----------------|--------|
| 27 | Create $25/mo | Click Donate, enter $25, select monthly, pay with 4242 card | Subscription created, payment in dashboard | Browser |
| 28 | Create $150/mo | Same flow but $150 | Same as above | Browser |
| 29 | Cancel subscription | Go to dashboard → Subscriptions → Cancel | Status changes to cancelled | Browser |
| 30 | Recurring payment | Wait for next billing cycle (or check Stripe dashboard) | New donation record with same subscription ID | Browser |

> ⚠️ **Run on staging only.** These create real Stripe subscriptions (test mode).

---

## Donor Dashboard

| # | Test | How To | Expected Result | Method |
|---|------|--------|-----------------|--------|
| 31 | Donation history | Log in, go to dashboard, scroll to Donation History | All donations listed, most recent first | API + Browser |
| 32 | Payment method | Look at any donation entry | Shows "Brand ••••Last4" (e.g., "Visa ••••7489") | Browser |
| 33 | Wallet badge | Look at donations made via Apple/Google Pay | Badge shows "Apple Pay" or "Google Pay" | Browser |
| 34 | Subscriptions | Check Subscriptions section | Active subs listed with amount and status | Browser |
| 35 | Stats | Check top of dashboard | Total, average, count calculated correctly | API + Browser |

---

## Authentication & Security

| # | Test | How To | Expected Result | Method |
|---|------|--------|-----------------|--------|
| 36 | No-auth dashboard access | Open /dashboard URL directly without logging in | Redirected to login page | Browser |
| 37 | Refresh persistence | Log in, then refresh the page (F5) | Stays logged in | Browser |
| 38 | Logout | Click Logout button | Token cleared, redirected to home | Browser |
| 39 | Expired token | Use an old/invalid JWT token in API call | "Invalid or expired token" | API |
| 40 | Register rate limit | Try registering 6 times in a row (same IP) | Blocked after 5: "Too many registration attempts" | API |
| 41 | Login rate limit | Try logging in 6 times with wrong password | Blocked after 5: "Too many login attempts" | API |

> ⚠️ Tests 40-41 trigger rate limits. **Run on staging** to avoid locking out production accounts.

---

## Responsive / UI

| # | Test | How To | Expected Result | Method |
|---|------|--------|-----------------|--------|
| 42 | Desktop | Open site on desktop browser (full width) | Full navigation, proper spacing | Browser |
| 43 | Mobile | Open site on phone or resize browser to < 768px | Hamburger menu, stacked content | Browser |
| 44 | Tablet | Resize browser to ~768-1024px | Responsive grid adjusts | Browser |
| 45 | Dark theme | Navigate all pages | Consistent dark theme, no white flashes | Browser |

---

## Post-Deployment Quick Smoke Test (5 min)

Run these 5 tests minimum after every deploy:

| # | Test | How To | Expected | Method |
|---|------|--------|----------|--------|
| 1 | Homepage loads | Visit www.fartooyoung.org | Page renders, no errors | Browser |
| 2 | Login works | Log in with your credentials | Dashboard loads | API + Browser |
| 3 | Dashboard data | Check Donation History section | Donations display with card info | Browser |
| 4 | Donate page | Click Donate, fill form, verify Stripe checkout opens | Checkout URL generated | API |
| 5 | Registration validation | Try registering with password "abc" | Rejected with clear error | API |

---

## Test Data Cleanup

After running API tests on staging, clean up test users:

```bash
# Delete specific test user
aws dynamodb delete-item --table-name fartooyoung-staging-users-table \
  --key '{"email":{"S":"testuser@gmail.com"}}' --region us-east-1

# Delete test donation (if created)
aws dynamodb delete-item --table-name fartooyoung-staging-donations-table \
  --key '{"id":{"S":"checkout_cs_test_XXXXX"}}' --region us-east-1

# View all staging users (to find test data)
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

*Last updated: 2026-05-27*
