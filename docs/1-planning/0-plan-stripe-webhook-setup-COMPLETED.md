# Stripe Webhook Setup

## Overview
Create and configure Stripe webhooks for the Far Too Young donation system. Covers both test and production environments.

## Prerequisites
- Stripe account with test mode access
- AWS backend deployed with webhook endpoint

## Cost
$0/month (Stripe webhooks are free)

## Checklist
- [x] Step 1: Access Stripe Dashboard
- [x] Step 2: Configure Webhook Destination
- [x] Step 3: Select Events
- [x] Step 4: Get Webhook Secret
- [x] Step 5: Update AWS Configuration
- [x] Step 6: Get Stripe API Keys
- [x] Step 7: Final Deployment

---

## Step 1: Access Stripe Dashboard ✅

**Benefit:** Stripe is a payment processing platform that handles credit card transactions securely. The dashboard is where all webhook configuration happens.

**Problem:** Without accessing the correct dashboard mode (test vs live), webhook events won't match the environment.

**Implementation:**
1. Go to: https://dashboard.stripe.com
2. Check top-left corner — should show "Test mode"
3. Navigate to: https://dashboard.stripe.com/test/webhooks
4. Click "Add destination" (top right)

## Step 2: Configure Webhook Destination ✅

**Benefit:** A webhook destination tells Stripe where to send event notifications when payments happen. Without it, our backend never learns about completed donations.

**Problem:** No connection between Stripe payment events and our Lambda backend — donations would succeed on Stripe but never appear in our system.

**Implementation:**
- Destination type: Webhook endpoint
- Destination name: `Far Too Young - Staging`
- Endpoint URL: `https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/stripe/webhook`
- Description: `Staging environment webhook for testing donations - checkout.session.completed events`

## Step 3: Select Events ✅

**Benefit:** Stripe can send dozens of event types. Selecting only what we need reduces noise and processing cost.

**Problem:** Subscribing to all events would trigger our Lambda unnecessarily and complicate error handling.

**Implementation:**
- Account type: "Your account"
- Event: `checkout.session.completed` (only this one)
- Click "Add events" → "Create destination"

## Step 4: Get Webhook Secret ✅

**Benefit:** The webhook signing secret (`whsec_...`) lets our backend verify that incoming requests actually came from Stripe, not an attacker.

**Problem:** Without signature verification, anyone could send fake webhook payloads to our endpoint and create fraudulent donation records.

**Implementation:**
1. Click on newly created webhook destination
2. Find "Signing secret" section
3. Copy the secret (starts with `whsec_...`)
4. Example: `whsec_dB1Knj88LqQq5P6D7UTVrNj9bbMzizCL`

## Step 5: Update AWS Configuration ✅

**Benefit:** SAM config stores environment-specific secrets that Lambda functions read at runtime.

**Problem:** Lambda can't verify Stripe signatures without the webhook secret being available as an environment variable.

**Implementation:**
Update `/backend/samconfig.toml`:
```toml
"StripeWebhookSecret=whsec_dB1Knj88LqQq5P6D7UTVrNj9bbMzizCL"
```

Redeploy:
```bash
cd backend
sam build && sam deploy --config-env staging
```

## Step 6: Get Stripe API Keys ✅

**Benefit:** API keys authenticate our app with Stripe. The secret key (backend) processes payments; the publishable key (frontend) initializes Stripe.js securely.

**Problem:** Without correct keys, payment creation fails and the donation flow breaks entirely.

**Implementation:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy both keys

Backend (`samconfig.toml`):
```toml
"StripeSecretKey=sk_test_your_actual_secret_key_here"
```

Frontend (`.env.staging`):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

## Step 7: Final Deployment ✅

**Benefit:** Deploying both frontend and backend ensures the full payment flow works end-to-end.

**Problem:** Partial deploys (only backend or only frontend) can cause key mismatches or missing endpoints.

**Implementation:**
```bash
cd backend
sam build && sam deploy --config-env staging
cd ..
npm run build && npm run preview
```

Test: Use card `4242 4242 4242 4242` → donation should appear in dashboard.

---

## Troubleshooting

- **"Invalid API Key":** Check sk_test key in samconfig.toml, redeploy
- **"Webhook signature verification failed":** Check whsec_ secret, ensure test mode
- **Webhook not receiving:** Verify endpoint URL, check Stripe webhook logs
- **Donation not appearing:** Check CloudWatch logs for Lambda errors

## Future Enhancements

Additional events to add: `checkout.session.expired`, `invoice.payment_succeeded`, `customer.subscription.created`, `payment_intent.payment_failed`

For production: create separate webhook in live mode with live keys (sk_live_, pk_live_).

---

*Last Updated: November 25, 2025*
