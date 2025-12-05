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

// Get table names from environment variables
const DONATIONS_TABLE = process.env.DONATIONS_TABLE
const USERS_TABLE = process.env.USERS_TABLE

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for creating checkout sessions
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
    // STEP 3: GET OR CREATE STRIPE CUSTOMER
    // ========================================================================
    let stripeCustomerId = null
    
    // Check if user exists in DynamoDB and has a Stripe customer ID
    try {
      const userResult = await dynamodb.get({
        TableName: USERS_TABLE,
        Key: { email: donor_info.email.toLowerCase().trim() }
      }).promise()
      
      if (userResult.Item && userResult.Item.stripeCustomerId) {
        stripeCustomerId = userResult.Item.stripeCustomerId
        console.log('Found existing Stripe customer:', stripeCustomerId)
      }
    } catch (err) {
      console.log('User not found in DB, will create new Stripe customer')
    }
    
    // If no existing customer, search Stripe by email
    if (!stripeCustomerId) {
      const existingCustomers = await stripe.customers.list({
        email: donor_info.email,
        limit: 1
      })
      
      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id
        console.log('Found existing Stripe customer by email:', stripeCustomerId)
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: donor_info.email,
          name: `${donor_info.firstName} ${donor_info.lastName}`,
          metadata: {
            organization: 'Far Too Young'
          }
        })
        stripeCustomerId = customer.id
        console.log('Created new Stripe customer:', stripeCustomerId)
      }
      
      // Store Stripe customer ID in DynamoDB if user exists
      try {
        await dynamodb.update({
          TableName: USERS_TABLE,
          Key: { email: donor_info.email.toLowerCase().trim() },
          UpdateExpression: 'SET stripeCustomerId = :customerId',
          ExpressionAttributeValues: {
            ':customerId': stripeCustomerId
          }
        }).promise()
        console.log('Saved Stripe customer ID to DynamoDB')
      } catch (err) {
        console.log('Could not save customer ID to DB (user may not exist):', err.message)
      }
    }

    // ========================================================================
    // STEP 4: BUILD STRIPE CHECKOUT SESSION CONFIGURATION
    // ========================================================================
    // Create checkout session configuration object
    const sessionConfig = {
      payment_method_types: ['card', 'us_bank_account'],  // Accept cards, ACH bank transfers, Apple Pay, Google Pay
      line_items: [
        {
          price_data: {
            currency: 'usd',                              // US Dollars
            product_data: {
              name: '\n\nHelp Protect Children and Girls\n\n',          // Title with spacing
              description: '\n\nHelp our organization by donating today!\n\nWe will be grateful. 100% of your donation is tax deductible.\n\n', // Description with spacing
              images: ['https://your-domain.com/donation-image.jpg'], // Optional product image
            },
            unit_amount: Math.round(amount * 100),        // Convert dollars to cents (Stripe requirement)
          },
          quantity: 1,                                    // Always 1 for donations
        },
      ],
      customer: stripeCustomerId,                         // Use existing or new customer ID
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
    // STEP 5: CONFIGURE FOR ONE-TIME OR RECURRING DONATIONS
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
    // STEP 6: CREATE STRIPE CHECKOUT SESSION
    // ========================================================================
    // Call Stripe API to create the checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig)

    // ========================================================================
    // STEP 7: RETURN CHECKOUT URL TO FRONTEND
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
