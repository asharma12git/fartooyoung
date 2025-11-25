# Stripe Integration Flow Documentation

## Overview
Complete step-by-step documentation of how the Far Too Young donation system works with Stripe Checkout integration.

## Architecture Flow

### **Step 0: User Triggers Donation Modal** 🖱️

**Files:** `Header.jsx`, `App.jsx`

**What happens:**
- User clicks "Donate" button anywhere on the site
- App state changes to show donation modal overlay

**Code Flow:**
```javascript
// Header.jsx - Donate button
<button onClick={() => onDonateClick()}>Donate</button>

// App.jsx - Handle click
const handleDonateClick = (amount = null) => {
  setDonationAmount(amount)      // Store amount if provided
  setShowDonation(true)          // Show modal
}

// App.jsx - Conditional rendering
{showDonation && (
  <DonationModal 
    onClose={handleDonationClose} 
    user={user} 
    initialAmount={donationAmount} 
  />
)}
```

**Summary:** User interaction triggers modal display through React state management.

---

### **Step 1: User Fills Donation Form** 🎁

**File:** `DonationModal.jsx`

**What happens:**
- Modal displays with amount selection and donor info fields
- Auto-fills user data if logged in
- User selects amount and confirms details

**Code Flow:**
```javascript
// State management for form data
const [amount, setAmount] = useState(initialAmount || 100)
const [donorInfo, setDonorInfo] = useState({
  firstName: '', lastName: '', email: ''
})

// Auto-fill logged-in user data
useEffect(() => {
  if (user) {
    setDonorInfo({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || ''
    })
  }
}, [user])
```

**Summary:** Form collects donation amount and donor information, with smart auto-fill for authenticated users.

---

### **Step 2: Create Stripe Checkout Session** 💳

**Files:** `CheckoutButton.jsx`, `create-checkout-session.js`

**What happens:**
- Frontend sends donation data to AWS Lambda
- Lambda creates Stripe checkout session
- Returns secure checkout URL to frontend

**Frontend Code:**
```javascript
// CheckoutButton.jsx - Send to backend
const handleCheckout = async () => {
  const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
    method: 'POST',
    body: JSON.stringify({
      amount: amount,           // Dollar amount
      donor_info: donorInfo,    // Name, email
      donation_type: 'one-time'
    })
  })
}
```

**Backend Code:**
```javascript
// create-checkout-session.js - AWS Lambda
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'payment',
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: 'Donation to Far Too Young' },
      unit_amount: Math.round(amount * 100) // Convert to cents
    },
    quantity: 1
  }],
  customer_email: donor_info.email,
  metadata: {
    donor_name: `${donor_info.firstName} ${donor_info.lastName}`,
    donor_email: donor_info.email,
    donation_type: 'one-time'
  },
  success_url: `${origin}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}?payment=cancelled`
})
```

**Summary:** Frontend communicates with AWS Lambda which creates secure Stripe checkout session with donation details.

---

### **Step 3: Redirect to Stripe Checkout** 🏦

**File:** `CheckoutButton.jsx`

**What happens:**
- User clicks "Secure Checkout" button
- Browser redirects to Stripe's hosted payment page
- User leaves Far Too Young website temporarily

**Code Flow:**
```javascript
// Redirect to Stripe's secure page
window.location.href = data.checkout_url
```

**Summary:** Browser navigation to Stripe's PCI-compliant payment environment.

---

### **Step 4: Payment Processing at Stripe** 💰

**Platform:** Stripe's hosted checkout page

**What happens:**
- User enters credit card information on Stripe's secure page
- Stripe validates and processes payment
- Stripe redirects user back to Far Too Young website
- User sees success or failure message

**Summary:** Payment processing handled entirely by Stripe's secure infrastructure.

---

### **Step 5: Webhook Notification** 📞

**File:** `webhook.js`

**What happens:**
- Stripe automatically calls webhook when payment completes
- Webhook verifies Stripe signature for security
- Creates donation record in DynamoDB database

**Code Flow:**
```javascript
// webhook.js - AWS Lambda
exports.handler = async (event) => {
  // Verify webhook signature
  const sig = event.headers['stripe-signature']
  const stripeEvent = stripe.webhooks.constructEvent(
    event.body, sig, process.env.STRIPE_WEBHOOK_SECRET
  )

  // Handle successful payment
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object
    
    // Create donation record
    const donation = {
      id: `checkout_${session.id}`,
      donationId: `checkout_${session.id}`,
      amount: session.amount_total / 100, // Convert cents to dollars
      type: 'one-time',
      paymentMethod: 'stripe-checkout',
      email: session.customer_email,
      name: session.metadata?.donor_name || 'Anonymous',
      status: 'completed',
      stripeSessionId: session.id,
      timestamp: new Date().toISOString()
    }
    
    // Save to DynamoDB
    await dynamodb.put({
      TableName: DONATIONS_TABLE,
      Item: donation
    }).promise()
  }
}
```

**Summary:** Automated webhook saves successful donations to database with complete transaction details.

---

### **Step 6: Dashboard Display** ✅

**File:** `DonorDashboard.jsx`

**What happens:**
- User visits dashboard page
- Frontend fetches donations from database via API
- New donation appears in donation history

**Code Flow:**
```javascript
// Fetch user's donations
const fetchDonations = async () => {
  const response = await fetch(`${API_BASE_URL}/donations`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  const data = await response.json()
  setDonations(data.donations || [])
}
```

**Summary:** Dashboard displays real-time donation history including newly completed transactions.

---

## Technical Implementation Details

### **Environment Configuration**
- **Frontend:** localhost:4173 (Vite production build)
- **Backend:** AWS API Gateway + Lambda functions
- **Database:** DynamoDB tables for users and donations
- **Payment:** Stripe Checkout (redirect-based)

### **API Endpoints**
- `POST /stripe/create-checkout-session` - Creates Stripe checkout session
- `POST /stripe/webhook` - Handles Stripe webhook events
- `GET /donations` - Fetches user donation history

### **Security Features**
- Webhook signature verification
- JWT authentication for dashboard
- Input sanitization and validation
- CORS configuration for cross-origin requests

### **Current Status**
✅ **Working:** Steps 0-4 (complete donation and payment flow)
❌ **Pending:** Step 5 webhook configuration in Stripe dashboard
✅ **Working:** Step 6 (dashboard displays existing donations)

### **Next Steps**
1. Configure webhook endpoint in Stripe dashboard
2. Add webhook secret to AWS environment variables
3. Test complete end-to-end flow
4. Verify automatic donation recording

---

## File Structure

```
src/
├── components/
│   ├── DonationModal.jsx      # Step 1: Donation form
│   ├── CheckoutButton.jsx     # Step 2-3: Stripe integration
│   └── Header.jsx             # Step 0: Donation triggers
├── pages/
│   └── DonorDashboard.jsx     # Step 6: Display donations
└── App.jsx                    # Step 0: Modal state management

backend/
├── lambda/
│   └── stripe/
│       ├── create-checkout-session.js  # Step 2: Create session
│       └── webhook.js                  # Step 5: Handle webhooks
└── template.yaml              # AWS infrastructure
```

## Testing

### **Test Flow**
1. Click donate button → Modal opens
2. Fill form → Checkout button appears
3. Click checkout → Redirects to Stripe
4. Use test card `4242 4242 4242 4242` → Payment succeeds
5. Redirected back → Success message shown
6. Check dashboard → Donation should appear (after webhook setup)

### **Test Cards**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date and CVC

---

*Last Updated: November 25, 2025*
*Status: Production Ready - Webhook Configuration Pending*
