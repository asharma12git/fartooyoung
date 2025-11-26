// ============================================================================
// CREATE CHECKOUT SESSION HANDLER - Creates Stripe payment sessions
// ============================================================================
// This Lambda function creates Stripe checkout sessions for both one-time
// donations and recurring monthly subscriptions

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const AWS = require('aws-sdk')      // AWS SDK for DynamoDB access
const Stripe = require('stripe')    // Stripe SDK for payment processing
const { getSecrets } = require('../utils/secrets')  // Secrets Manager utility

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================
// Stripe client will be initialized after retrieving secrets
let stripe;

// Initialize DynamoDB client - creates connection to database
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined  // Local endpoint for testing, AWS default for production
})

// Get donations table name from environment variables
const DONATIONS_TABLE = process.env.DONATIONS_TABLE

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for creating checkout sessions
// ============================================================================
exports.handler = async (event) => {
  try {
    // Initialize Stripe with secrets from Secrets Manager
    if (!stripe) {
      const secrets = await getSecrets();
      stripe = Stripe(secrets.stripe_secret_key);
    }

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

    // ========================================================================
    // STEP 2: PARSE AND VALIDATE REQUEST DATA
    // ========================================================================
    const { amount, donor_info, donation_type } = JSON.parse(event.body)

    console.log('Creating checkout session with:', { amount, donation_type, donor_info })

    // Validate required fields are present
    if (!amount || !donor_info) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Missing required fields: amount, donor_info' 
        })
      }
    }

    // ========================================================================
    // STEP 3: BUILD STRIPE CHECKOUT SESSION CONFIGURATION
    // ========================================================================
    // Create checkout session configuration object
    const sessionConfig = {
      payment_method_types: ['card'],  // Accept credit/debit cards
      line_items: [
        {
          price_data: {
            currency: 'usd',                              // US Dollars
            product_data: {
              name: 'Donation to Far Too Young',          // Product name shown to customer
              description: 'Help protect children and girls from child marriage', // Product description
              images: ['https://your-domain.com/donation-image.jpg'], // Optional product image
            },
            unit_amount: Math.round(amount * 100),        // Convert dollars to cents (Stripe requirement)
          },
          quantity: 1,                                    // Always 1 for donations
        },
      ],
      customer_email: donor_info.email,                   // Pre-fill customer email
      metadata: {
        // Custom data that will be included in webhook events
        donor_name: `${donor_info.firstName} ${donor_info.lastName}`,
        donor_email: donor_info.email,
        donation_type: donation_type || 'one-time',
        organization: 'Far Too Young'
      },
      // Redirect URLs after payment completion or cancellation
      success_url: `${event.headers.origin || 'http://localhost:4173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin || 'http://localhost:4173'}?payment=cancelled`,
    }

    // ========================================================================
    // STEP 4: CONFIGURE FOR ONE-TIME OR RECURRING DONATIONS
    // ========================================================================
    // Add recurring configuration for monthly donations
    if (donation_type === 'monthly') {
      sessionConfig.mode = 'subscription'               // Subscription mode for recurring payments
      sessionConfig.line_items[0].price_data.recurring = {
        interval: 'month'                               // Bill monthly
      }
    } else {
      sessionConfig.mode = 'payment'                    // One-time payment mode
    }

    // ========================================================================
    // STEP 5: CREATE STRIPE CHECKOUT SESSION
    // ========================================================================
    // Call Stripe API to create the checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig)

    // ========================================================================
    // STEP 6: RETURN CHECKOUT URL TO FRONTEND
    // ========================================================================
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        checkout_url: session.url,  // URL to redirect user to Stripe checkout
        session_id: session.id      // Session ID for tracking
      })
    }

  } catch (error) {
    // ========================================================================
    // ERROR HANDLER - Catch any unexpected errors
    // ========================================================================
    console.error('Stripe checkout error:', error)
    
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: error.message || 'Checkout session creation failed' 
      })
    }
  }
}
