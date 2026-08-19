const { getAllowedOrigin } = require("../utils/cors");
// ============================================================================
// CREATE PAYMENT INTENT HANDLER - Creates Stripe payment intents
// ============================================================================
// This Lambda function creates Stripe payment intents for direct payment processing
// Alternative to checkout sessions for custom payment forms

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const Stripe = require('stripe')    // Stripe SDK for payment processing
const { getSecrets } = require('../utils/secrets')  // Secrets Manager utility

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================
// Stripe client will be initialized after retrieving secrets
let stripe;

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for creating payment intents
// ============================================================================
exports.handler = async (event) => {
  try {
    // Initialize Stripe with secrets from Secrets Manager
    if (!stripe) {
      const secrets = await getSecrets();
      stripe = Stripe(secrets.STRIPE_SECRET_KEY);
    }

    // ==========================================================================
    // STEP 1: HANDLE CORS PREFLIGHT REQUESTS
    // ==========================================================================
    // Handle CORS preflight (OPTIONS) requests from browsers
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': getAllowedOrigin(event),              
          'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allowed HTTP methods
          'Access-Control-Allow-Headers': 'Content-Type, Authorization' // Allowed headers
        },
        body: ''
      }
    }

    // ========================================================================
    // STEP 2: PARSE AND VALIDATE REQUEST DATA
    // ========================================================================
    const { amount, donor_info, donation_type } = JSON.parse(event.body)

    // Validate required fields are present
    if (!amount || !donor_info) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    // ========================================================================
    // STEP 3: CREATE STRIPE PAYMENT INTENT
    // ========================================================================
    // For monthly: create/find customer and set up for future charges
    let customer = null
    if (donation_type === 'monthly') {
      // Find or create customer for subscription
      const existingCustomers = await stripe.customers.list({ email: donor_info.email, limit: 1 })
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: donor_info.email,
          name: `${donor_info.firstName} ${donor_info.lastName}`,
          metadata: { organization: 'Far Too Young' }
        })
      }
    }

    // Create payment intent for direct payment processing
    const paymentIntentConfig = {
      amount: Math.round(amount * 100),                   // Convert dollars to cents (Stripe requirement)
      currency: 'usd',                                    // US Dollars
      description: donation_type === 'monthly' ? 'Far Too Young - Monthly Donation' : 'Far Too Young - One-time Donation',
      payment_method_types: ['card', 'us_bank_account'],  // Card (Apple Pay, Google Pay) + Bank (ACH)
      metadata: {
        // Custom data attached to the payment intent
        donor_name: `${donor_info.firstName} ${donor_info.lastName}`,
        donor_email: donor_info.email,
        donation_type: donation_type || 'one-time'        // Default to one-time donation
      }
    }

    // For monthly: attach customer and save payment method for future use
    if (donation_type === 'monthly' && customer) {
      paymentIntentConfig.customer = customer.id
      paymentIntentConfig.setup_future_usage = 'off_session'  // Saves card for recurring charges
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig)

    // ========================================================================
    // STEP 4: RETURN CLIENT SECRET FOR FRONTEND
    // ========================================================================
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
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
      headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
      body: JSON.stringify({ error: error.message })
    }
  }
}
