# Stripe Webhook Setup

## Overview
Step-by-step guide to create and configure Stripe webhooks for the Far Too Young donation system. Covers both test and production environments.

**Status:** ✅ Complete  
**Prerequisites:** Stripe account with test mode access, AWS backend deployed with webhook endpoint

## Checklist
- [x] Step 1: Access Stripe Dashboard
- [x] Step 2: Configure Webhook Destination
- [x] Step 3: Select Events
- [x] Step 4: Get Webhook Secret
- [x] Step 5: Update AWS Configuration
- [x] Step 6: Get Stripe API Keys
- [x] Step 7: Final Deployment

---

## Step 1: Access Stripe Dashboard

1. Go to: https://dashboard.stripe.com
2. Check top-left corner — should show "Test mode"
3. Navigate to: https://dashboard.stripe.com/test/webhooks
4. Click "Add destination" (top right)

## Step 2: Configure Webhook Destination

- **Destination type:** Webhook endpoint
- **Destination name:** `Far Too Young - Staging`
- **Endpoint URL:** `https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/stripe/webhook`
- **Description:** `Staging environment webhook for testing donations - checkout.session.completed events`

## Step 3: Select Events

- Account type: "Your account"
- Event: `checkout.session.completed` (only this one)
- Click "Add events" → "Create destination"

## Step 4: Get Webhook Secret

1. Click on newly created webhook destination
2. Find "Signing secret" section
3. Copy the secret (starts with `whsec_...`)
4. Example: `whsec_dB1Knj88LqQq5P6D7UTVrNj9bbMzizCL`

## Step 5: Update AWS Configuration

Update `/backend/samconfig.toml`:
```toml
"StripeWebhookSecret=whsec_dB1Knj88LqQq5P6D7UTVrNj9bbMzizCL"
```

Redeploy:
```bash
cd backend
sam build && sam deploy --config-env staging
```

## Step 6: Get Stripe API Keys

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy both keys

**Backend (samconfig.toml):**
```toml
"StripeSecretKey=sk_test_your_actual_secret_key_here"
```

**Frontend (.env.staging):**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

## Step 7: Final Deployment

```bash
cd backend
sam build && sam deploy --config-env staging
cd ..
npm run build && npm run preview
```

**Test:** Use card `4242 4242 4242 4242` → donation should appear in dashboard.

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
