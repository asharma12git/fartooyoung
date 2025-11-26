# Stripe Integration Flow Documentation

## Overview
Complete step-by-step documentation of how the Far Too Young donation system works with Stripe Checkout integration using the **centralized donation architecture**.

## Understanding Props (React Basics) 🎓

### **What is a Prop?**
A **prop** (short for "property") is like **passing information from a parent to a child** in React components. Think of it like **giving instructions or data to someone**.

### **Real-Life Analogy** 🏠
**Imagine you're a parent giving your child a lunch box:**

```javascript
// Parent (you) gives lunch box to Child
<Child lunchBox="sandwich and apple" money={5} />
```

- **`lunchBox`** = the food (data you're giving)
- **`money`** = allowance (more data you're giving)  
- **Child receives both** and can use them

### **In Your Far Too Young Code** 💻

#### **Example 1: App.jsx → ChildMarriage.jsx**
```javascript
// App.jsx (Parent) - Giving function to child
<ChildMarriage onDonateClick={handleDonateClick} />
//             ↑ prop name    ↑ the actual function

// ChildMarriage.jsx (Child) - Receiving the function
const ChildMarriage = ({ onDonateClick }) => {
//                      ↑ receives the prop
  return (
    <button onClick={() => onDonateClick()}>
      DONATE  {/* Uses the function parent gave */}
    </button>
  )
}
```

**Translation:** 
- **App.jsx says:** "Hey ChildMarriage, here's a function called `onDonateClick` you can use"
- **ChildMarriage says:** "Thanks! I'll use it when someone clicks my donate button"

#### **Example 2: DonationModal → CheckoutButton**
```javascript
// DonationModal (Parent) - Giving data to child
<CheckoutButton 
  amount={25}
  donorInfo={{firstName: "Sarah", email: "sarah@email.com"}}
/>

// CheckoutButton (Child) - Receiving the data
const CheckoutButton = ({ amount, donorInfo }) => {
  // Now I can use amount (25) and donorInfo (Sarah's details)
  console.log(`Processing $${amount} donation for ${donorInfo.firstName}`)
}
```

**Translation:**
- **DonationModal says:** "Hey CheckoutButton, here's $25 and Sarah's info"
- **CheckoutButton says:** "Got it! I'll process Sarah's $25 donation"

### **Key Rules** 📋

#### **1. Props Flow DOWN Only**
```javascript
Parent → Child ✅
Child → Parent ❌ (can't directly send props up)
```

#### **2. Props are READ-ONLY**
```javascript
// Child CANNOT change props
const Child = ({ amount }) => {
  amount = 50  // ❌ This won't work!
  return <div>{amount}</div>
}
```

#### **3. To Send Data UP, Use Functions**
```javascript
// Parent gives child a function
<Child onButtonClick={handleClick} />

// Child calls the function (sends message up)
const Child = ({ onButtonClick }) => {
  return <button onClick={() => onButtonClick("Hello!")}>Click</button>
}
```

### **In Your Donation Flow** 🔄
**Props are like a relay race:**

1. **App.jsx** gives `onDonateClick` function to **ChildMarriage** (prop down)
2. **ChildMarriage** calls `onDonateClick()` (message up)
3. **App.jsx** gives user data to **DonationModal** (prop down)
4. **DonationModal** gives amount/info to **CheckoutButton** (prop down)

**Props = The way React components share information!** 🎯

---## Real-Life User Journey Walkthrough 🚶‍♂️

### **Scenario: User Donates $25 from Homepage**

Let's follow Sarah, a visitor who wants to donate $25 after reading about child marriage on the homepage.

### **🔗 Code Communication Flow Overview**

Before diving into the step-by-step journey, here's how the code components communicate:

```
App.jsx (Parent)
    ↓ passes onDonateClick prop
ChildMarriage.jsx (Child)
    ↓ calls onDonateClick()
App.jsx (Parent)
    ↓ updates state & renders
DonationModal.jsx (Child)
    ↓ user fills form & clicks checkout
CheckoutButton.jsx (Child)
    ↓ makes API call
AWS Lambda (Backend)
    ↓ creates Stripe session
Stripe (External)
```

---

#### **🏠 Step 1: User Visits Homepage**
**Location:** `https://fartooyoung.org/`  
**File:** `/src/pages/ChildMarriage.jsx`  
**What Sarah sees:** Homepage with hero image and content about child marriage

**Code Communication:** 📡 App.jsx renders ChildMarriage component and passes `onDonateClick` function as prop

```javascript
// App.jsx - Parent component passes function down
<Route path="/" element={<ChildMarriage onDonateClick={handleDonateClick} />} />
```

---

#### **👆 Step 2: User Clicks Donate Button**
**Location:** Homepage hero section  
**File:** `/src/pages/ChildMarriage.jsx` - Line ~340  
**Code Sarah clicks:**
```javascript
<button
  onClick={() => onDonateClick()}  // This function comes from App.jsx
  className="group/btn relative inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600..."
>
  <span>DONATE</span>
</button>
```

**Code Summary:** 📝 Button element with click handler that calls `onDonateClick()` function passed down as prop from parent App.jsx component.

**Code Communication:** 📡 ChildMarriage.jsx calls the `onDonateClick()` function it received as prop, which triggers execution back in App.jsx

```javascript
// ChildMarriage.jsx receives function from App.jsx
const ChildMarriage = ({ onDonateClick }) => {
  // When button clicked, calls function that lives in App.jsx
  onClick={() => onDonateClick()}  // Function call goes UP to parent
}
```

---

#### **⚡ Step 3: App.jsx Handles the Click**
**File:** `/src/App.jsx` - Line ~70  
**Code that executes:**
```javascript
const handleDonateClick = (amount = null) => {
  setDonationAmount(amount)      // Sets to null (no specific amount)
  setShowDonation(true)          // Shows the modal
}
```

**Code Summary:** 📝 React function that updates two state variables: stores the donation amount (null in this case) and sets modal visibility to true.

**Code Communication:** 📡 App.jsx receives function call from ChildMarriage.jsx, updates its own state, which triggers React re-render and conditionally shows DonationModal

```javascript
// App.jsx - State change triggers re-render
const [showDonation, setShowDonation] = useState(false)  // Was false
// After button click:
setShowDonation(true)  // Now true, triggers modal to appear
```

---

#### **📱 Step 4: Modal Appears**
**File:** `/src/App.jsx` - Line ~130  
**Code that renders:**
```javascript
{showDonation && (
  <DonationModal 
    onClose={handleDonationClose} 
    user={user}                    // Current user (null if not logged in)
    initialAmount={donationAmount} // null in this case
  />
)}
```

**Code Summary:** 📝 Conditional JSX rendering that displays DonationModal component only when `showDonation` state is true, passing user data and amount as props.

**Code Communication:** 📡 App.jsx passes data DOWN to DonationModal as props: user info, initial amount, and close handler function

```javascript
// App.jsx passes data to DonationModal
user={user}                    // Passes current user object
initialAmount={donationAmount} // Passes amount (null)
onClose={handleDonationClose}  // Passes close function
```

---

#### **📝 Step 5: User Fills Donation Form**
**File:** `/src/components/DonationModal.jsx` - Lines 20-50  
**What Sarah does:**
1. **Selects amount:** Clicks "$25" or enters custom amount
2. **Fills info:** Enters name "Sarah Johnson" and email "sarah@email.com"
3. **Reviews:** Sees total amount and transaction coverage option

**Code managing this:**
```javascript
const [amount, setAmount] = useState(initialAmount || 100)  // Sarah sets to 25
const [donorInfo, setDonorInfo] = useState({
  firstName: '',    // Sarah enters "Sarah"
  lastName: '',     // Sarah enters "Johnson"  
  email: ''         // Sarah enters "sarah@email.com"
})
```

**Code Summary:** 📝 React state hooks that manage form data - amount as number and donorInfo as object with user's personal details, updated through controlled input fields.

**Code Communication:** 📡 DonationModal receives props from App.jsx and manages its own internal state for form data

```javascript
// DonationModal receives props from App.jsx
const DonationModal = ({ user, initialAmount, onClose }) => {
  // Uses received data to initialize state
  const [amount, setAmount] = useState(initialAmount || 100)
  // Auto-fills user info if provided
  useEffect(() => {
    if (user) {
      setDonorInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      })
    }
  }, [user])
}
```

---

#### **💳 Step 6: User Clicks "Secure Checkout"**
**File:** `/src/components/CheckoutButton.jsx` - Line ~25  
**Code Sarah clicks:**
```javascript
<button
  onClick={handleCheckout}  // This function starts Stripe process
  className="w-full backdrop-blur-sm text-white..."
>
  Donate $25 - Secure Checkout
</button>
```

**Code Summary:** 📝 Button element that triggers `handleCheckout` async function when clicked, initiating the Stripe payment process.

**Code Communication:** 📡 DonationModal passes donation data DOWN to CheckoutButton as props

```javascript
// DonationModal passes data to CheckoutButton
<CheckoutButton 
  amount={amount}           // Passes $25
  donorInfo={donorInfo}     // Passes Sarah's info
  onError={setError}        // Passes error handler
  loading={loading}         // Passes loading state
  setLoading={setLoading}   // Passes loading setter
/>
```

---

#### **🌐 Step 7: Frontend Calls AWS Backend**
**File:** `/src/components/CheckoutButton.jsx` - Lines 15-30  
**Code that executes:**
```javascript
const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 25,                           // Sarah's amount
    donor_info: {
      firstName: "Sarah",
      lastName: "Johnson", 
      email: "sarah@email.com"
    },
    donation_type: 'one-time'
  })
})
```

**Code Summary:** 📝 Async HTTP POST request using fetch API that sends donation data as JSON to AWS Lambda endpoint, converting JavaScript object to JSON string.

**Code Communication:** 📡 CheckoutButton sends HTTP request ACROSS THE INTERNET to AWS Lambda with donation data

```javascript
// CheckoutButton sends data to AWS
const API_BASE_URL = 'https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod'
// Data travels from browser → Internet → AWS Lambda
fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
  body: JSON.stringify({
    amount: amount,        // From DonationModal
    donor_info: donorInfo, // From DonationModal
  })
})
```

---

#### **☁️ Step 8: AWS Lambda Creates Stripe Session**
**File:** `/backend/lambda/stripe/create-checkout-session.js` - Lines 35-70  
**Code that executes:**
```javascript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'payment',
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: 'Donation to Far Too Young' },
      unit_amount: 2500  // $25.00 in cents
    },
    quantity: 1
  }],
  customer_email: 'sarah@email.com',
  metadata: {
    donor_name: 'Sarah Johnson',
    donor_email: 'sarah@email.com'
  },
  success_url: 'https://fartooyoung.org?payment=success',
  cancel_url: 'https://fartooyoung.org?payment=cancelled'
})
```

**Code Summary:** 📝 Stripe SDK method call that creates a checkout session object with payment details, converting dollars to cents, and setting up success/cancel redirect URLs.

**Code Communication:** 📡 AWS Lambda receives HTTP request from frontend, extracts data, and makes API call to Stripe's servers

```javascript
// AWS Lambda receives and processes request
exports.handler = async (event) => {
  // Extract data from frontend request
  const { amount, donor_info, donation_type } = JSON.parse(event.body)
  
  // Send data to Stripe API
  const session = await stripe.checkout.sessions.create({
    unit_amount: Math.round(amount * 100), // Convert $25 to 2500 cents
    customer_email: donor_info.email,      // Use Sarah's email
  })
  
  // Send response back to frontend
  return {
    statusCode: 200,
    body: JSON.stringify({ checkout_url: session.url })
  }
}
```

---

#### **🔄 Step 9: User Redirected to Stripe**
**File:** `/src/components/CheckoutButton.jsx` - Line 45  
**Code that executes:**
```javascript
window.location.href = data.checkout_url  // Stripe's secure URL
```

**Code Summary:** 📝 Browser navigation command that changes the current page URL to Stripe's checkout URL, causing a full page redirect.

**Code Communication:** 📡 AWS Lambda sends response BACK to CheckoutButton with Stripe URL, CheckoutButton redirects browser

```javascript
// CheckoutButton receives response from AWS
const data = await response.json()  // Gets { checkout_url: "https://checkout.stripe.com/..." }

// Redirects browser to Stripe
window.location.href = data.checkout_url  // Browser leaves your website
```

---

#### **👆 Step 2: User Clicks Donate Button**
**Location:** Homepage hero section  
**File:** `/src/pages/ChildMarriage.jsx` - Line ~340  
**Code Sarah clicks:**
```javascript
<button
  onClick={() => onDonateClick()}  // This function comes from App.jsx
  className="group/btn relative inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600..."
>
  <span>DONATE</span>
</button>
```

**What happens:** Button calls `onDonateClick()` function passed down from App.jsx

---

#### **⚡ Step 3: App.jsx Handles the Click**
**File:** `/src/App.jsx` - Line ~70  
**Code that executes:**
```javascript
const handleDonateClick = (amount = null) => {
  setDonationAmount(amount)      // Sets to null (no specific amount)
  setShowDonation(true)          // Shows the modal
}
```

**What happens:** App.jsx changes state to show donation modal

---

#### **📱 Step 4: Modal Appears**
**File:** `/src/App.jsx` - Line ~130  
**Code that renders:**
```javascript
{showDonation && (
  <DonationModal 
    onClose={handleDonationClose} 
    user={user}                    // Current user (null if not logged in)
    initialAmount={donationAmount} // null in this case
  />
)}
```

**What Sarah sees:** Donation modal overlay appears on top of homepage

---

#### **📝 Step 5: User Fills Donation Form**
**File:** `/src/components/DonationModal.jsx` - Lines 20-50  
**What Sarah does:**
1. **Selects amount:** Clicks "$25" or enters custom amount
2. **Fills info:** Enters name "Sarah Johnson" and email "sarah@email.com"
3. **Reviews:** Sees total amount and transaction coverage option

**Code managing this:**
```javascript
const [amount, setAmount] = useState(initialAmount || 100)  // Sarah sets to 25
const [donorInfo, setDonorInfo] = useState({
  firstName: '',    // Sarah enters "Sarah"
  lastName: '',     // Sarah enters "Johnson"  
  email: ''         // Sarah enters "sarah@email.com"
})
```

---

#### **💳 Step 6: User Clicks "Secure Checkout"**
**File:** `/src/components/CheckoutButton.jsx` - Line ~25  
**Code Sarah clicks:**
```javascript
<button
  onClick={handleCheckout}  // This function starts Stripe process
  className="w-full backdrop-blur-sm text-white..."
>
  Donate $25 - Secure Checkout
</button>
```

**What happens:** `handleCheckout()` function executes

---

#### **🌐 Step 7: Frontend Calls AWS Backend**
**File:** `/src/components/CheckoutButton.jsx` - Lines 15-30  
**Code that executes:**
```javascript
const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 25,                           // Sarah's amount
    donor_info: {
      firstName: "Sarah",
      lastName: "Johnson", 
      email: "sarah@email.com"
    },
    donation_type: 'one-time'
  })
})
```

**What happens:** Frontend sends Sarah's donation details to AWS Lambda

---

#### **☁️ Step 8: AWS Lambda Creates Stripe Session**
**File:** `/backend/lambda/stripe/create-checkout-session.js` - Lines 35-70  
**Code that executes:**
```javascript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'payment',
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: 'Donation to Far Too Young' },
      unit_amount: 2500  // $25.00 in cents
    },
    quantity: 1
  }],
  customer_email: 'sarah@email.com',
  metadata: {
    donor_name: 'Sarah Johnson',
    donor_email: 'sarah@email.com'
  },
  success_url: 'https://fartooyoung.org?payment=success',
  cancel_url: 'https://fartooyoung.org?payment=cancelled'
})
```

**What happens:** AWS asks Stripe to create a secure checkout page for Sarah's $25 donation

---

#### **🔄 Step 9: User Redirected to Stripe**
**File:** `/src/components/CheckoutButton.jsx` - Line 45  
**Code that executes:**
```javascript
window.location.href = data.checkout_url  // Stripe's secure URL
```

**What Sarah experiences:** Browser redirects to `https://checkout.stripe.com/pay/cs_...`  
**What Sarah sees:** Stripe's secure payment page with her donation details pre-filled

---

#### **💰 Step 10: User Pays on Stripe**
**Platform:** Stripe's secure servers  
**What Sarah does:**
1. **Enters card:** `4242 4242 4242 4242` (test card)
2. **Enters expiry:** `12/25`
3. **Enters CVC:** `123`
4. **Clicks Pay:** Stripe processes the $25 payment

**What happens:** Stripe charges Sarah's card and processes payment

---

#### **✅ Step 11: Stripe Calls Webhook (Future)**
**File:** `/backend/lambda/stripe/webhook.js` - Lines 25-45  
**Code that will execute (after webhook setup):**
```javascript
if (stripeEvent.type === 'checkout.session.completed') {
  const donation = {
    id: 'checkout_cs_...',
    amount: 25.00,
    email: 'sarah@email.com',
    name: 'Sarah Johnson',
    status: 'completed',
    timestamp: '2025-11-25T16:00:00Z'
  }
  
  // Save to DynamoDB
  await dynamodb.put({
    TableName: DONATIONS_TABLE,
    Item: donation
  }).promise()
}
```

**What happens:** Stripe automatically tells AWS "Sarah's $25 donation succeeded!" and AWS saves it to database

---

#### **🏠 Step 12: User Returns to Website**
**What Sarah experiences:** Stripe redirects back to `https://fartooyoung.org?payment=success`  
**What Sarah sees:** Homepage with success message

---

#### **📊 Step 13: User Checks Dashboard (Future)**
**File:** `/src/pages/DonorDashboard.jsx`  
**What Sarah can do:** Visit dashboard and see her $25 donation listed in donation history

---

## **Summary: Complete Journey**
1. **Homepage** (`ChildMarriage.jsx`) → **Donate button click**
2. **App.jsx** → **Modal state change**  
3. **DonationModal.jsx** → **Form filling**
4. **CheckoutButton.jsx** → **AWS API call**
5. **AWS Lambda** → **Stripe session creation**
6. **Stripe** → **Payment processing**
7. **Webhook** → **Database recording** (pending setup)
8. **Dashboard** → **Donation display**

**Result:** Sarah successfully donated $25 through a seamless, secure flow that started with a simple button click on the homepage! 🎉

---

### **Step 0: User Triggers Donation Modal** 🖱️

**Files:** `App.jsx` + All page components

**What happens:**
- User clicks ANY donate button on ANY page across the website
- All buttons use the same centralized handler from App.jsx
- Single modal instance appears with consistent behavior

**Centralized Code Flow:**
```javascript
// App.jsx - Central donation handler (SINGLE SOURCE OF TRUTH)
const handleDonateClick = (amount = null) => {
  setDonationAmount(amount)      // Store amount if provided
  setShowDonation(true)          // Show modal
}

// App.jsx - Pass handler to ALL pages
<Routes>
  <Route path="/" element={<ChildMarriage onDonateClick={handleDonateClick} />} />
  <Route path="/founder-team" element={<FounderTeam onDonateClick={handleDonateClick} />} />
  <Route path="/partners" element={<Partners onDonateClick={handleDonateClick} />} />
  <Route path="/what-we-do" element={<WhatWeDo onDonateClick={handleDonateClick} />} />
  <Route path="/dashboard" element={<DonorDashboard onDonateClick={handleDonateClick} />} />
</Routes>

// All page components - Use centralized handler
const PageComponent = ({ onDonateClick }) => {
  return (
    <button onClick={() => onDonateClick()}>DONATE</button>  // Same everywhere
  )
}

// App.jsx - Single modal for entire website
{showDonation && (
  <DonationModal 
    onClose={handleDonationClose} 
    user={user} 
    initialAmount={donationAmount} 
  />
)}
```

**Summary:** Centralized architecture ensures ALL ~10 donate buttons across the website trigger the same modal with identical behavior and consistent user experience.

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

### **Centralized Architecture Benefits**
- **Single Modal Instance:** One DonationModal for entire website (better performance)
- **Consistent User Experience:** Same behavior across all ~10 donate buttons
- **Unified User Context:** Login state preserved across all pages
- **Streamlined Stripe Integration:** All donations flow through same code path
- **Easier Maintenance:** Single place to update donation logic
- **Better Analytics:** Unified tracking of donation sources

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
✅ **Working:** Steps 0-4 (complete donation and payment flow from ANY page)
❌ **Pending:** Step 5 webhook configuration in Stripe dashboard
✅ **Working:** Step 6 (dashboard displays existing donations)
✅ **Centralized:** All donation buttons use same modal and flow

### **Next Steps**
1. Configure webhook endpoint in Stripe dashboard
2. Add webhook secret to AWS environment variables
3. Test complete end-to-end flow from multiple pages
4. Verify automatic donation recording from any donation source

---

## Centralized File Structure

```
src/
├── App.jsx                    # CENTRALIZED: Modal state management + routing
├── components/
│   ├── DonationModal.jsx      # Step 1: Donation form (SINGLE INSTANCE)
│   ├── CheckoutButton.jsx     # Step 2-3: Stripe integration
│   └── Header.jsx             # Step 0: Global donation trigger
├── pages/
│   ├── ChildMarriage.jsx      # Step 0: Uses centralized onDonateClick
│   ├── FounderTeam.jsx        # Step 0: Uses centralized onDonateClick
│   ├── Partners.jsx           # Step 0: Uses centralized onDonateClick
│   ├── WhatWeDo.jsx           # Step 0: Uses centralized onDonateClick (3 buttons)
│   └── DonorDashboard.jsx     # Step 0 + 6: Uses centralized + displays results
└── .env.staging               # Environment configuration

backend/
├── lambda/
│   └── stripe/
│       ├── create-checkout-session.js  # Step 2: Create session
│       └── webhook.js                  # Step 5: Handle webhooks
└── template.yaml              # AWS infrastructure
```

## Centralized Testing

### **Multi-Page Test Flow**
1. **Test from Home page** → Click donate → Modal opens
2. **Test from Founder page** → Click donate → Same modal opens
3. **Test from Partners page** → Click donate → Same modal opens  
4. **Test from What We Do page** → Click any of 3 donate buttons → Same modal opens
5. **Test from Dashboard** → Click any donate button → Same modal opens
6. **Test from Header** → Click global donate → Same modal opens

### **Expected Centralized Results**
- **Identical modal behavior** across all pages
- **Consistent user auto-fill** if logged in
- **Same Stripe checkout flow** regardless of source page
- **Unified success/failure handling** 
- **Single webhook destination** for all donations

### **Test Cards**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date and CVC

---

*Last Updated: November 25, 2025*
*Status: Centralized Architecture Complete - Webhook Configuration Pending*
*Architecture: Single Modal System Across All Pages*
