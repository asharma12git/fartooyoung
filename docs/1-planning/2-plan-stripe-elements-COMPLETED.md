# Stripe Elements - Embedded Payment Form

## Overview
Replaced Stripe Hosted Checkout (redirect to Stripe's page) with embedded Stripe Payment Element inside the donation modal. Users never leave the site. Supports Card, Apple Pay, Google Pay, ACH — all styled to match the dark theme.

**Status:** ✅ Complete (deployed to production May 29, 2026)  
**Effort:** 4-6 hours

## Prerequisites
- Stripe account with API keys configured
- Existing `/stripe/create-payment-intent` backend endpoint
- Stripe webhook handling `payment_intent.succeeded`

## Checklist
- [x] Step 1: Install Stripe React packages
- [x] Step 2: Replace CheckoutButton with PaymentElement
- [x] Step 3: Wrap DonationModal with Stripe Elements provider
- [x] Step 4: Test all payment methods
- [x] Step 5: Deploy to production

---

## Step 1: Install Stripe React packages

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## Step 2: Replace CheckoutButton with PaymentElement

Replace redirect-based `CheckoutButton.jsx` with embedded `PaymentElement` that renders inside the donation modal.

## Step 3: Wrap DonationModal with Stripe Elements provider

```jsx
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <PaymentElement />
  <button>Donate ${amount}</button>
</Elements>
```

Flow: User clicks Donate → Modal opens → Fills info → Payment form appears IN modal → Pays → Success shown in modal.

## Step 4: Test all payment methods

- All card types (Visa, Amex, Mastercard)
- Apple Pay on mobile Safari
- Google Pay on Android/Chrome
- Declined cards
- Webhook still writes correct 14-field format

## Step 5: Deploy to production

Files changed: `CheckoutButton.jsx`, `DonationModal.jsx`, `create-payment-intent.js` (minor updates), `package.json`.

---

*Created: May 28, 2026*
