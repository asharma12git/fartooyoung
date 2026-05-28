# Plan 2: Stripe Elements - Embedded Payment Form

## Priority: High
## Status: Ready
## Estimated Effort: 4-6 hours

---

## Why

- Current Stripe Checkout (hosted page) looks disconnected from the site
- Redirecting users away breaks the donation flow experience
- Embedded form matches the dark theme and feels native
- Apple Pay / Google Pay buttons appear directly in the modal
- Better mobile experience (no redirect)

---

## Options Considered

| Option | What It Is | Look & Feel | Redirect? | Customization |
|--------|-----------|-------------|-----------|---------------|
| A | Stripe Hosted Checkout | Stripe's page (white, Stripe branding) | ❌ Yes — leaves your site | Minimal (logo, colors) |
| B | **Stripe Payment Element** | **Your design — dark theme, your fonts, your buttons** | **✅ No — stays on your site** | **Full control** |
| C | Stripe Embedded Checkout | Stripe's form in an iframe on your page | No redirect but still looks like Stripe | Limited (can't change inside iframe) |

### ✅ We are going with Option B — Stripe Payment Element

- Fully native look — users never know Stripe is involved
- Dark theme, custom fonts, custom buttons
- Apple Pay / Google Pay buttons appear directly in your modal
- Card input styled to match your site
- No redirect, no iframe, no foreign-looking form

## Target Flow

```
User clicks Donate → Modal opens → Fills info → Payment form appears IN modal → Pays → Success shown in modal
```

---

## Implementation

### Frontend Changes

1. Install Stripe.js: `npm install @stripe/stripe-js @stripe/react-stripe-js`
2. Replace `CheckoutButton.jsx` with embedded `PaymentElement`
3. Add Stripe publishable key to `.env.production` (already there as `VITE_STRIPE_PUBLISHABLE_KEY`)
4. Payment form renders inside `DonationModal.jsx`

### Backend Changes

1. Use existing `/stripe/create-payment-intent` endpoint (already exists)
2. Returns `client_secret` to frontend
3. Frontend confirms payment using `client_secret`
4. Webhook still handles `payment_intent.succeeded` event

### Key Components

```jsx
// Embedded payment form in donation modal
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <PaymentElement />  // Card, Apple Pay, Google Pay — all in one
  <button>Donate ${amount}</button>
</Elements>
```

---

## What You Get

- Card input field (styled to match your theme)
- Apple Pay button (appears automatically on supported devices)
- Google Pay button (appears automatically on supported devices)
- Bank account (ACH) option
- All inside your modal — no redirect
- Full control over look and feel

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/CheckoutButton.jsx` | Replace with PaymentElement |
| `src/components/DonationModal.jsx` | Add Stripe Elements wrapper |
| `backend/lambda/stripe/create-payment-intent.js` | Already exists — may need minor updates |
| `package.json` | Add `@stripe/stripe-js`, `@stripe/react-stripe-js` |

---

## Testing

- Test with all card types (Visa, Amex, Mastercard)
- Test Apple Pay on mobile Safari
- Test Google Pay on Android/Chrome
- Test declined cards
- Verify webhook still writes correct 14-field format

---

*Created: May 28, 2026*
