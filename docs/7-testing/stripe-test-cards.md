# Stripe Testing Guide - Test Cards & Routing Numbers

## 🔐 Test Mode vs Live Mode

- **Test Mode**: Uses test API keys (starts with `pk_test_` and `sk_test_`)
- **Live Mode**: Uses live API keys (starts with `pk_live_` and `sk_live_`)
- **Current Staging**: Uses test mode
- **Current Production**: Uses live mode (real money!)

---

## 💳 Test Card Numbers

### ✅ Successful Payments

| Card Number | Brand | Description |
|-------------|-------|-------------|
| `4242 4242 4242 4242` | Visa | Standard success |
| `4000 0566 5566 5556` | Visa (debit) | Debit card success |
| `5555 5555 5555 4444` | Mastercard | Standard success |
| `2223 0031 2200 3222` | Mastercard (2-series) | New Mastercard range |
| `3782 822463 10005` | American Express | Amex success |
| `6011 1111 1111 1117` | Discover | Discover success |
| `3056 9300 0902 0004` | Diners Club | Diners success |
| `6200 0000 0000 0005` | UnionPay | UnionPay success |

### ❌ Declined Cards

| Card Number | Error Type | Description |
|-------------|------------|-------------|
| `4000 0000 0000 0002` | Generic decline | Card declined |
| `4000 0000 0000 9995` | Insufficient funds | Not enough money |
| `4000 0000 0000 9987` | Lost card | Card reported lost |
| `4000 0000 0000 9979` | Stolen card | Card reported stolen |
| `4000 0000 0000 0069` | Expired card | Card has expired |
| `4000 0000 0000 0127` | Incorrect CVC | Wrong security code |
| `4000 0000 0000 0119` | Processing error | Generic processing error |

### 🔐 3D Secure / SCA Testing

| Card Number | Behavior | Description |
|-------------|----------|-------------|
| `4000 0027 6000 3184` | 3DS required | Requires authentication |
| `4000 0025 0000 3155` | 3DS required | Authentication required |
| `4000 0000 0000 3220` | 3DS optional | Authentication available |
| `4000 0082 6000 0000` | 3DS not supported | No authentication |

### 🔄 Subscription-Specific Cards

| Card Number | Behavior | Description |
|-------------|----------|-------------|
| `4000 0000 0000 0341` | Charge succeeds, dispute later | Simulates dispute |
| `4000 0000 0000 3063` | Always fails | Every charge fails |
| `4000 0000 0000 0077` | Charge succeeds, refund fails | Can't be refunded |

---

## 🏦 Test Bank Account Numbers (ACH Direct Debit)

### ✅ Successful Accounts

| Routing Number | Account Number | Description |
|----------------|----------------|-------------|
| `110000000` | `000123456789` | Success |
| `110000000` | `000111111116` | Success (instant verification) |

### ❌ Failed Accounts

| Routing Number | Account Number | Error Type |
|----------------|----------------|------------|
| `110000000` | `000111111113` | Account closed |
| `110000000` | `000222222227` | No account |
| `110000000` | `000333333335` | Insufficient funds |

---

## 📝 Test Card Details (Use with any test card)

- **Expiration Date**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP Code**: Any 5 digits (e.g., `12345`)
- **Cardholder Name**: Any name

---

## 🧪 Testing Scenarios

### 1. One-Time Donation (Success)
```
Card: 4242 4242 4242 4242
Exp: 12/34
CVC: 123
ZIP: 12345
Amount: $25
Expected: ✅ Payment succeeds, webhook fires, donation recorded
```

### 2. Monthly Subscription (Success)
```
Card: 4242 4242 4242 4242
Exp: 12/34
CVC: 123
ZIP: 12345
Amount: $10/month
Expected: ✅ Subscription created, first payment succeeds
```

### 3. Declined Payment
```
Card: 4000 0000 0000 0002
Exp: 12/34
CVC: 123
ZIP: 12345
Amount: $25
Expected: ❌ "Your card was declined"
```

### 4. Insufficient Funds
```
Card: 4000 0000 0000 9995
Exp: 12/34
CVC: 123
ZIP: 12345
Amount: $100
Expected: ❌ "Your card has insufficient funds"
```

### 5. 3D Secure Authentication
```
Card: 4000 0027 6000 3184
Exp: 12/34
CVC: 123
ZIP: 12345
Amount: $50
Expected: 🔐 Authentication modal appears, complete to proceed
```

---

## 🎯 Testing Webhooks

### Events to Test

1. **payment_intent.succeeded**
   - Use: `4242 4242 4242 4242`
   - Triggers: One-time donation completion

2. **checkout.session.completed**
   - Use: `4242 4242 4242 4242`
   - Triggers: After successful Checkout

3. **customer.subscription.created**
   - Use: `4242 4242 4242 4242` with recurring
   - Triggers: New subscription started

4. **customer.subscription.deleted**
   - Cancel subscription in dashboard
   - Triggers: Subscription cancellation

5. **invoice.payment_succeeded**
   - Use: `4242 4242 4242 4242` with recurring
   - Triggers: Monthly subscription renewal

6. **invoice.payment_failed**
   - Use: `4000 0000 0000 0341` for subscription
   - Triggers: Failed renewal payment

---

## 🔍 Stripe Dashboard Testing

### View Test Data
1. Go to: https://dashboard.stripe.com/test/payments
2. Toggle: **Test mode** (top right)
3. View: Payments, Customers, Subscriptions

### Trigger Test Webhooks
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Select your webhook endpoint
3. Click: **Send test webhook**
4. Choose event type

### Test Subscription Lifecycle
1. Create subscription with `4242 4242 4242 4242`
2. View in: https://dashboard.stripe.com/test/subscriptions
3. Cancel subscription
4. Verify webhook fires

---

## 🚨 Important Notes

### ⚠️ Never Use Test Cards in Production
- Test cards only work with test API keys
- Production uses real cards and real money
- Always verify which mode you're in

### ⚠️ Staging vs Production
- **Staging** (`staging.fartooyoung.org`): Test mode only
- **Production** (`app.fartooyoung.org`): Live mode (real money!)

### ⚠️ Webhook Testing
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/webhook`
- Staging webhooks: Configured in Stripe test mode
- Production webhooks: Configured in Stripe live mode

---

## 📚 Additional Resources

- **Stripe Testing Docs**: https://stripe.com/docs/testing
- **Webhook Testing**: https://stripe.com/docs/webhooks/test
- **3D Secure Testing**: https://stripe.com/docs/testing#regulatory-cards
- **Stripe CLI**: https://stripe.com/docs/stripe-cli

---

## 🎓 Quick Reference

**Most Common Test Card**: `4242 4242 4242 4242`  
**Most Common Decline**: `4000 0000 0000 0002`  
**Test 3D Secure**: `4000 0027 6000 3184`  
**Test Routing**: `110000000`  
**Test Account**: `000123456789`

**Remember**: Any future expiration date, any 3-digit CVC, any ZIP code!
