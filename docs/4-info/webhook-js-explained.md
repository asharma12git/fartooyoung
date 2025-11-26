# Webhook.js Code Explanation
*For Python Developers Learning JavaScript/Node.js*

## Overview
This document breaks down the Stripe webhook handler code block by block, explaining JavaScript concepts for developers coming from a Python background.

---

## Block 1: Imports and Dependencies
```javascript
const AWS = require('aws-sdk')
const Stripe = require('stripe')
```
**Summary:** Similar to Python's `import` statements. `require()` loads external libraries. `const` creates immutable variables (like Python's constants). AWS SDK provides DynamoDB access, Stripe SDK handles webhook verification.

**Python Equivalent:**
```python
import boto3
import stripe
```

---

## Block 2: Initialize Services
```javascript
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined
})

const DONATIONS_TABLE = process.env.DONATIONS_TABLE
```
**Summary:** Creates service instances using environment variables (like Python's `os.environ`). `Stripe()` is a constructor function that returns a configured Stripe client. `new AWS.DynamoDB.DocumentClient()` creates a DynamoDB client with optional local endpoint. `process.env` accesses environment variables.

**Python Equivalent:**
```python
import os
stripe.api_key = os.environ['STRIPE_SECRET_KEY']
dynamodb = boto3.resource('dynamodb', endpoint_url=os.environ.get('DYNAMODB_ENDPOINT'))
DONATIONS_TABLE = os.environ['DONATIONS_TABLE']
```

---

## Block 3: Function Declaration
```javascript
exports.handler = async (event) => {
```
**Summary:** Lambda entry point (like Python's `def lambda_handler(event, context)`). `exports.handler` makes this function available to AWS Lambda. `async` enables await syntax (like Python's `async def`). `event` contains HTTP request data from API Gateway.

**Python Equivalent:**
```python
async def lambda_handler(event, context):
```

---

## Block 4: Extract Headers
```javascript
const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature']
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
```
**Summary:** Extracts Stripe's cryptographic signature from HTTP headers. Uses `||` (logical OR) for fallback since API Gateway might change header casing. Similar to Python's `event['headers'].get('stripe-signature')` with a fallback. The signature proves the request came from Stripe.

**Python Equivalent:**
```python
sig = event['headers'].get('stripe-signature') or event['headers'].get('Stripe-Signature')
endpoint_secret = os.environ['STRIPE_WEBHOOK_SECRET']
```

---

## Block 5: Signature Validation Guard
```javascript
if (!sig) {
  console.error('No stripe-signature header found')
  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'No stripe-signature header value was provided.' })
  }
}
```
**Summary:** Early return pattern (like Python's guard clauses). `!sig` checks if signature is falsy (null, undefined, empty string). Returns HTTP 400 error response if no signature found. `JSON.stringify()` converts object to JSON string (like Python's `json.dumps()`).

**Python Equivalent:**
```python
if not sig:
    print('No stripe-signature header found')
    return {
        'statusCode': 400,
        'body': json.dumps({'error': 'No stripe-signature header value was provided.'})
    }
```

---

## Block 6: Webhook Verification
```javascript
let stripeEvent
try {
  stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret)
} catch (err) {
  console.error('Webhook signature verification failed:', err.message)
  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'Webhook signature verification failed' })
  }
}
```
**Summary:** Try-catch block (like Python's try-except). `constructEvent()` cryptographically verifies the webhook using HMAC signature. If verification fails, returns 400 error. `let` declares a mutable variable (unlike `const`). This prevents webhook spoofing attacks.

**Python Equivalent:**
```python
try:
    stripe_event = stripe.Webhook.construct_event(event['body'], sig, endpoint_secret)
except Exception as err:
    print(f'Webhook signature verification failed: {err}')
    return {
        'statusCode': 400,
        'body': json.dumps({'error': 'Webhook signature verification failed'})
    }
```

---

## Block 7: Event Type Check
```javascript
if (stripeEvent.type === 'checkout.session.completed') {
  const session = stripeEvent.data.object
```
**Summary:** Conditional processing based on event type (like Python's `if event['type'] == 'checkout.session.completed'`). Stripe sends many event types, we only care about completed checkouts. `stripeEvent.data.object` contains the actual checkout session data.

**Python Equivalent:**
```python
if stripe_event['type'] == 'checkout.session.completed':
    session = stripe_event['data']['object']
```

---

## Block 8: Data Extraction and Transformation
```javascript
const donationId = `checkout_${session.id}`

const donation = {
  id: donationId,
  donationId: donationId,
  amount: session.amount_total / 100, // Convert from cents to dollars
  type: session.mode === 'subscription' ? 'monthly' : 'one-time',
  paymentMethod: 'stripe-checkout',
  email: session.customer_email || session.metadata?.donor_email,
  name: session.metadata?.donor_name || 'Anonymous',
  status: 'completed',
  stripeSessionId: session.id,
  createdAt: new Date().toISOString(),
  processedAt: new Date().toISOString()
}
```
**Summary:** Creates donation object for database storage. Template literals (`checkout_${session.id}`) are like Python f-strings. Ternary operator `condition ? value1 : value2` is like Python's `value1 if condition else value2`. Optional chaining `?.` safely accesses nested properties (prevents errors if undefined). `||` provides fallback values. Stripe amounts are in cents, so divide by 100.

**Python Equivalent:**
```python
donation_id = f"checkout_{session['id']}"

donation = {
    'id': donation_id,
    'donationId': donation_id,
    'amount': session['amount_total'] / 100,  # Convert from cents to dollars
    'type': 'monthly' if session['mode'] == 'subscription' else 'one-time',
    'paymentMethod': 'stripe-checkout',
    'email': session.get('customer_email') or session.get('metadata', {}).get('donor_email'),
    'name': session.get('metadata', {}).get('donor_name') or 'Anonymous',
    'status': 'completed',
    'stripeSessionId': session['id'],
    'createdAt': datetime.utcnow().isoformat(),
    'processedAt': datetime.utcnow().isoformat()
}
```

---

## Block 9: Conditional Subscription Handling
```javascript
if (session.mode === 'subscription' && session.subscription) {
  donation.stripeSubscriptionId = session.subscription
  console.log('Added subscription ID:', session.subscription)
}
```
**Summary:** Adds subscription ID for recurring donations. Uses logical AND `&&` to check both conditions (like Python's `and`). Modifies the existing `donation` object by adding a new property. JavaScript objects are mutable even when declared with `const`.

**Python Equivalent:**
```python
if session['mode'] == 'subscription' and session.get('subscription'):
    donation['stripeSubscriptionId'] = session['subscription']
    print(f"Added subscription ID: {session['subscription']}")
```

---

## Block 10: Database Write
```javascript
await dynamodb.put({
  TableName: DONATIONS_TABLE,
  Item: donation
}).promise()
```
**Summary:** Asynchronous database write (like Python's `await dynamodb.put_item()`). `await` pauses execution until promise resolves. `.promise()` converts AWS SDK callback to promise. `put()` creates or replaces item in DynamoDB table. Similar to Python's `table.put_item(Item=donation)`.

**Python Equivalent:**
```python
table = dynamodb.Table(DONATIONS_TABLE)
await table.put_item(Item=donation)
```

---

## Block 11: Recurring Payment Handler
```javascript
if (stripeEvent.type === 'invoice.payment_succeeded') {
  const invoice = stripeEvent.data.object
  
  if (invoice.subscription) {
    // Similar donation creation logic for recurring payments
  }
}
```
**Summary:** Handles monthly subscription renewals. Nested conditionals ensure we only process subscription invoices (not one-time invoice payments). Creates separate donation records for each monthly payment. Similar structure to checkout handler but uses invoice data instead of session data.

**Python Equivalent:**
```python
if stripe_event['type'] == 'invoice.payment_succeeded':
    invoice = stripe_event['data']['object']
    
    if invoice.get('subscription'):
        # Similar donation creation logic for recurring payments
```

---

## Block 12: Success Response
```javascript
return {
  statusCode: 200,
  body: JSON.stringify({ received: true })
}
```
**Summary:** Returns HTTP 200 success response to Stripe. Object literal syntax creates response object (like Python dict). Stripe expects 2xx status code to mark webhook as successfully processed. If this isn't returned, Stripe will retry the webhook.

**Python Equivalent:**
```python
return {
    'statusCode': 200,
    'body': json.dumps({'received': True})
}
```

---

## Block 13: Error Handler
```javascript
} catch (error) {
  console.error('Webhook error:', error)
  
  return {
    statusCode: 500,
    body: JSON.stringify({ 
      error: error.message || 'Webhook processing failed' 
    })
  }
}
```
**Summary:** Global error handler for unexpected errors (like Python's outer except block). Returns HTTP 500 for server errors. `error.message` extracts error description. This prevents Lambda from crashing and gives Stripe a proper error response.

**Python Equivalent:**
```python
except Exception as error:
    print(f'Webhook error: {error}')
    
    return {
        'statusCode': 500,
        'body': json.dumps({
            'error': str(error) or 'Webhook processing failed'
        })
    }
```

---

## Key JavaScript vs Python Differences

### Variable Declarations
- **JavaScript:** `const` (immutable), `let` (mutable), `var` (avoid)
- **Python:** Just assign variables directly

### Async/Await
- **JavaScript:** `async function`, `await promise`
- **Python:** `async def`, `await coroutine`

### Object Access
- **JavaScript:** `obj.property` or `obj['property']`, optional chaining `obj?.property`
- **Python:** `obj['property']` or `obj.get('property')`

### Logical Operators
- **JavaScript:** `&&` (and), `||` (or), `!` (not)
- **Python:** `and`, `or`, `not`

### String Formatting
- **JavaScript:** Template literals `` `Hello ${name}` ``
- **Python:** f-strings `f"Hello {name}"`

### Error Handling
- **JavaScript:** `try/catch`
- **Python:** `try/except`

---

## Flow Summary
The overall flow: **Verify → Extract → Transform → Store → Respond**

1. **Verify:** Check webhook signature to ensure it's from Stripe
2. **Extract:** Get event type and data from webhook payload
3. **Transform:** Convert Stripe data into our donation format
4. **Store:** Save donation record to DynamoDB
5. **Respond:** Send success/error response back to Stripe

This is the same pattern you'd use in Python, just with JavaScript syntax and AWS-specific APIs.

---

*Last Updated: November 26, 2025*
*For: Python developers learning JavaScript/Node.js*
