// ============================================================================
// CREATE PORTAL SESSION HANDLER - Creates Stripe customer portal sessions
// ============================================================================
// This Lambda function creates Stripe billing portal sessions for customers
// to manage their subscriptions, payment methods, and billing information

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const Stripe = require('stripe')    // Stripe SDK for payment processing

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================
// Initialize Stripe with secret key - creates authenticated Stripe client
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for creating portal sessions
// ============================================================================
exports.handler = async (event) => {
  // ==========================================================================
  // STEP 1: HANDLE CORS PREFLIGHT REQUESTS
  // ==========================================================================
  // Handle CORS preflight (OPTIONS) requests from browsers
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',              // Allow all origins
        'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allowed HTTP methods
        'Access-Control-Allow-Headers': 'Content-Type, Authorization' // Allowed headers
      },
      body: ''
    }
  }

  try {
    // ========================================================================
    // STEP 2: PARSE AND VALIDATE REQUEST DATA
    // ========================================================================
    const { customer_email, return_url } = JSON.parse(event.body)

    // Validate required customer email
    if (!customer_email) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Customer email is required' })
      }
    }

    // ========================================================================
    // STEP 3: FIND STRIPE CUSTOMER BY EMAIL
    // ========================================================================
    // Search for existing Stripe customer using email address
    const customers = await stripe.customers.list({
      email: customer_email,  // Filter by email address
      limit: 1               // Only need the first match
    })

    // Check if customer exists in Stripe
    if (customers.data.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No customer found with this email' })
      }
    }

    const customer = customers.data[0]  // Get the first (and only) customer

    // ========================================================================
    // STEP 4: CREATE BILLING PORTAL SESSION
    // ========================================================================
    // Create Stripe billing portal session for customer self-service
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,                            // Stripe customer ID
      return_url: return_url || `${event.headers.origin || 'http://localhost:4173'}/subscription-return`
      // URL where customer returns after managing their subscription
    })

    // ========================================================================
    // STEP 5: RETURN PORTAL URL TO FRONTEND
    // ========================================================================
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        portal_url: portalSession.url  // URL to redirect customer to billing portal
      })
    }

  } catch (error) {
    // ========================================================================
    // ERROR HANDLER - Catch any unexpected errors
    // ========================================================================
    console.error('Portal session error:', error)
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    }
  }
}
