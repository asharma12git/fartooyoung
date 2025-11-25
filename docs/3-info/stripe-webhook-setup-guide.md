# Stripe Webhook Setup Guide

## Overview
Step-by-step guide to create and configure Stripe webhooks for the Far Too Young donation system.

## Prerequisites
- Stripe account with test mode access
- AWS backend deployed with webhook endpoint

---

## Step 1: Access Stripe Dashboard

### **Ensure Test Mode**
1. **Go to:** https://dashboard.stripe.com
2. **Check top-left corner** - should show "Test mode" 
3. **If in Live mode:** Click the toggle to switch to "Test mode"

### **Navigate to Webhooks**
1. **Go to:** https://dashboard.stripe.com/test/webhooks
2. **Click:** "Add destination" (top right)

---

## Step 2: Configure Webhook Destination

### **Select Destination Type**
- **Choose:** "Webhook endpoint" (not EventBridge)

### **Fill Configuration Fields**

**Destination name:**
```
Far Too Young - Staging
```

**Endpoint URL:**
```
https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/stripe/webhook
```

**Description:**
```
Staging environment webhook for testing donations - checkout.session.completed events
```

---

## Step 3: Select Events

### **Account Type**
- **Select:** "Your account"

### **Event Selection**
- **Find and check:** `checkout.session.completed`
- **Search tip:** Use Ctrl+F (Cmd+F on Mac) to find "checkout.session.completed"
- **Only select this one event** for now

### **Complete Setup**
- **Click:** "Add events" or "Continue"
- **Click:** "Create destination" or "Save"

---

## Step 4: Get Webhook Secret

### **After Creation**
1. **Click** on your newly created webhook destination
2. **Find:** "Signing secret" section
3. **Copy** the secret (starts with `whsec_...`)
4. **Save** this secret - you'll need it for AWS configuration

### **Example Secret Format**
```
whsec_dB1Knj88LqQq5P6D7UTVrNj9bbMzizCL
```

---

## Step 5: Update AWS Configuration

### **Update samconfig.toml**
Replace the placeholder in `/backend/samconfig.toml`:

**Before:**
```toml
"StripeWebhookSecret=YOUR_STAGING_WEBHOOK_SECRET"
```

**After:**
```toml
"StripeWebhookSecret=whsec_dB1Knj88LqQq5P6D7UTVrNj9bbMzizCL"
```

### **Redeploy Backend**
```bash
cd backend
sam build && sam deploy --config-env staging
```

---

## Step 6: Get Stripe API Keys

### **Access API Keys**
1. **Go to:** https://dashboard.stripe.com/test/apikeys
2. **Copy both keys:**
   - **Secret key** (starts with `sk_test_...`)
   - **Publishable key** (starts with `pk_test_...`)

### **Update Configuration Files**

**Backend (samconfig.toml):**
```toml
"StripeSecretKey=sk_test_your_actual_secret_key_here"
```

**Frontend (.env.staging):**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

---

## Step 7: Final Deployment

### **Deploy Backend with Real Keys**
```bash
cd backend
sam build && sam deploy --config-env staging
```

### **Test Frontend with Real Keys**
```bash
cd ..
npm run build
npm run preview
```

---

## Testing the Webhook

### **Test Donation Flow**
1. **Go to:** http://localhost:4173
2. **Click** any donate button
3. **Fill form** with test data
4. **Use test card:** `4242 4242 4242 4242`
5. **Complete payment** on Stripe
6. **Check dashboard** - donation should appear automatically

### **Expected Results**
- ✅ Payment succeeds on Stripe
- ✅ Webhook receives event (check Stripe webhook logs)
- ✅ Donation appears in user dashboard
- ✅ No errors in browser console

---

## Troubleshooting

### **Common Issues**

**"Invalid API Key" Error:**
- Check that Stripe secret key is updated in samconfig.toml
- Ensure you're using test keys (sk_test_...) in test mode
- Redeploy backend after updating keys

**"Webhook signature verification failed":**
- Check webhook secret is correct in samconfig.toml
- Ensure webhook was created in test mode
- Verify endpoint URL is exactly correct

**Webhook not receiving events:**
- Check webhook is in test mode
- Verify endpoint URL matches deployed API Gateway
- Check Stripe webhook logs for delivery attempts

**Donation not appearing in dashboard:**
- Check webhook logs in Stripe dashboard
- Verify checkout.session.completed event is selected
- Check AWS CloudWatch logs for Lambda errors

### **Verification Steps**

**Check Webhook Status:**
1. Go to Stripe webhook dashboard
2. Click on your webhook
3. Check "Recent deliveries" for successful calls

**Check AWS Logs:**
1. Go to AWS CloudWatch
2. Find StripeWebhookFunction logs
3. Look for successful webhook processing

---

## Security Notes

### **Webhook Security**
- Webhook secret provides cryptographic verification
- Only Stripe can generate valid signatures
- Invalid requests are automatically rejected
- Never share webhook secrets publicly

### **API Key Security**
- Use test keys for development/staging
- Use live keys only for production
- Never commit keys to version control
- Rotate keys if compromised

---

## Future Enhancements

### **Additional Events**
When ready, you can add more events:
- `checkout.session.expired` - Handle abandoned checkouts
- `invoice.payment_succeeded` - Monthly subscription payments
- `customer.subscription.created` - New subscriptions
- `payment_intent.payment_failed` - Handle failed payments

### **Production Setup**
For production deployment:
1. Create separate webhook in live mode
2. Use live Stripe keys (sk_live_..., pk_live_...)
3. Update production samconfig.toml
4. Deploy to production environment

---

*Last Updated: November 25, 2025*
*Status: Test Mode Configuration*
