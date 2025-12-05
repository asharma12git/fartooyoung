// ============================================================================
// LIST SUBSCRIPTIONS HANDLER - Retrieves customer subscription information
// ============================================================================
// This Lambda function fetches all subscriptions (active and canceled) 
// for a customer by email address from Stripe

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
// MAIN LAMBDA HANDLER - Entry point for listing subscriptions
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
          'Access-Control-Allow-Origin': '*',             // Allow all origins
          'Access-Control-Allow-Methods': 'GET, OPTIONS', // Allowed HTTP methods (GET for listing)
          'Access-Control-Allow-Headers': 'Content-Type, Authorization' // Allowed headers
        },
        body: ''
      }
    }

    // ========================================================================
    // STEP 2: EXTRACT AND VALIDATE QUERY PARAMETERS
    // ========================================================================
    const { customer_email } = event.queryStringParameters || {}

    // Validate required customer email parameter
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
      limit: 10               // Get up to 10 customers (in case of duplicates)
    })

    console.log(`Found ${customers.data.length} customers for email ${customer_email}`)
    console.log('Customers:', JSON.stringify(customers.data.map(c => ({id: c.id, email: c.email, created: c.created})), null, 2))

    // If no customer found, return empty subscriptions list
    if (customers.data.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ subscriptions: [] })
      }
    }

    // Check subscriptions for ALL customers with this email
    let allActiveSubscriptions = []
    let allInactiveSubscriptions = []

    for (const customer of customers.data) {
      console.log(`Checking subscriptions for customer ${customer.id}`)
      
      // Get customer's active subscriptions
      const activeSubscriptions = await stripe.subscriptions.list({
        customer: customer.id,  // Stripe customer ID
        status: 'active',       // Only active subscriptions
        limit: 100              // Fetch up to 100 subscriptions (default is 10)
      })

      // Get customer's canceled subscriptions
      const inactiveSubscriptions = await stripe.subscriptions.list({
        customer: customer.id,  // Stripe customer ID
        status: 'canceled',     // Only canceled subscriptions
        limit: 100              // Fetch up to 100 subscriptions (default is 10)
      })

      console.log(`Customer ${customer.id}: ${activeSubscriptions.data.length} active, ${inactiveSubscriptions.data.length} inactive`)
      
      allActiveSubscriptions = allActiveSubscriptions.concat(activeSubscriptions.data)
      allInactiveSubscriptions = allInactiveSubscriptions.concat(inactiveSubscriptions.data)
    }

    // ========================================================================
    // STEP 5: FORMAT SUBSCRIPTION DATA FOR FRONTEND
    // ========================================================================
    // Helper function to format subscription data consistently
    const formatSubscription = (sub) => ({
      id: sub.id,                                           // Subscription ID
      status: sub.status,                                   // active, canceled, etc.
      amount: sub.items.data[0].price.unit_amount / 100,    // Convert cents to dollars
      currency: sub.items.data[0].price.currency,           // Currency (USD)
      interval: sub.items.data[0].price.recurring.interval, // monthly, yearly, etc.
      created: sub.created,                                 // Creation timestamp
      current_period_end: sub.current_period_end,           // When current billing period ends
      cancel_at_period_end: sub.cancel_at_period_end,       // Will cancel at period end?
      canceled_at: sub.canceled_at                          // When it was canceled (if applicable)
    })

    // Format both active and inactive subscriptions
    const formattedActiveSubscriptions = allActiveSubscriptions.map(formatSubscription)
    const formattedInactiveSubscriptions = allInactiveSubscriptions.map(formatSubscription)

    console.log(`Total: ${formattedActiveSubscriptions.length} active, ${formattedInactiveSubscriptions.length} inactive subscriptions`)

    // ========================================================================
    // STEP 6: RETURN FORMATTED SUBSCRIPTION DATA
    // ========================================================================
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        active_subscriptions: formattedActiveSubscriptions,     // Currently active subscriptions
        inactive_subscriptions: formattedInactiveSubscriptions  // Canceled/past subscriptions
      })
    }

  } catch (error) {
    // ========================================================================
    // ERROR HANDLER - Catch any unexpected errors
    // ========================================================================
    console.error('List subscriptions error:', error)
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    }
  }
}
