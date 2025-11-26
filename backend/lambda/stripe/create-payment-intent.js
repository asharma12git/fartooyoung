// ============================================================================
// CREATE PAYMENT INTENT HANDLER - Creates Stripe payment intents
// ============================================================================
// This Lambda function creates Stripe payment intents for direct payment processing
// Alternative to checkout sessions for custom payment forms

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
// MAIN LAMBDA HANDLER - Entry point for creating payment intents
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
    const { amount, donor_info, donation_type } = JSON.parse(event.body)

    // Validate required fields are present
    if (!amount || !donor_info) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    // ========================================================================
    // STEP 3: CREATE STRIPE PAYMENT INTENT
    // ========================================================================
    // Create payment intent for direct payment processing
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),                   // Convert dollars to cents (Stripe requirement)
      currency: 'usd',                                    // US Dollars
      metadata: {
        // Custom data attached to the payment intent
        donor_name: `${donor_info.firstName} ${donor_info.lastName}`,
        donor_email: donor_info.email,
        donation_type: donation_type || 'one-time'        // Default to one-time donation
      }
    })

    // ========================================================================
    // STEP 4: RETURN CLIENT SECRET FOR FRONTEND
    // ========================================================================
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        client_secret: paymentIntent.client_secret        // Secret for frontend to complete payment
      })
    }

  } catch (error) {
    // ========================================================================
    // ERROR HANDLER - Catch any unexpected errors
    // ========================================================================
    console.error('Payment intent error:', error)
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    }
  }
}
