// ============================================================================
// STRIPE WEBHOOK HANDLER - Processes Stripe payment events
// ============================================================================
// This Lambda function receives webhook events from Stripe when payments occur
// and saves donation records to DynamoDB for the Far Too Young donation system

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const AWS = require('aws-sdk')      // AWS SDK for DynamoDB access
const Stripe = require('stripe')    // Stripe SDK for webhook verification

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================
// Initialize Stripe with secret key - creates authenticated Stripe client
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

// Initialize DynamoDB client - creates connection to database
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined  // Local endpoint for testing, AWS default for production
})

// Get table name from environment variables
const DONATIONS_TABLE = process.env.DONATIONS_TABLE

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for AWS Lambda
// ============================================================================
exports.handler = async (event) => {
  try {
    // ========================================================================
    // STEP 1: EXTRACT WEBHOOK SIGNATURE
    // ========================================================================
    // API Gateway may transform header names to lowercase
    const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature']
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

    console.log('Headers received:', JSON.stringify(event.headers))
    console.log('Stripe signature:', sig)

    // ========================================================================
    // STEP 2: VALIDATE SIGNATURE EXISTS
    // ========================================================================
    if (!sig) {
      console.error('No stripe-signature header found')
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No stripe-signature header value was provided.' })
      }
    }

    // ========================================================================
    // STEP 3: VERIFY WEBHOOK AUTHENTICITY
    // ========================================================================
    let stripeEvent
    try {
      // Cryptographically verify this webhook came from Stripe
      stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Webhook signature verification failed' })
      }
    }

    console.log('Received Stripe webhook:', stripeEvent.type)

    // ========================================================================
    // STEP 4: HANDLE CHECKOUT SESSION COMPLETED (Initial Donations)
    // ========================================================================
    // Handle checkout session completed (both one-time and subscription setup)
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object

      console.log('Checkout session completed:', session.id)
      console.log('Session mode:', session.mode)
      console.log('Session subscription:', session.subscription)
      console.log('Session metadata:', JSON.stringify(session.metadata))

      // Create unique donation ID
      const donationId = `checkout_${session.id}`
      
      // Build donation object for database storage
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

      // Add subscription info if it's a subscription
      if (session.mode === 'subscription' && session.subscription) {
        donation.stripeSubscriptionId = session.subscription
        console.log('Added subscription ID:', session.subscription)
      }

      // Save donation to DynamoDB
      await dynamodb.put({
        TableName: DONATIONS_TABLE,
        Item: donation
      }).promise()

      console.log('Donation saved to database:', donationId, 'Type:', donation.type)
    }

    // ========================================================================
    // STEP 5: HANDLE RECURRING SUBSCRIPTION PAYMENTS
    // ========================================================================
    // Handle recurring subscription payments
    if (stripeEvent.type === 'invoice.payment_succeeded') {
      const invoice = stripeEvent.data.object

      // Only process subscription invoices (not one-time payments)
      if (invoice.subscription) {
        console.log('Subscription payment succeeded:', invoice.id)

        // Create donation record for recurring payment
        const donationId = `invoice_${invoice.id}`
        
        // Build donation object for monthly payment
        const donation = {
          id: donationId,
          donationId: donationId,
          amount: invoice.amount_paid / 100, // Convert from cents to dollars
          type: 'monthly',
          paymentMethod: 'stripe-subscription',
          email: invoice.customer_email,
          name: invoice.customer_name || 'Subscriber',
          status: 'completed',
          stripeInvoiceId: invoice.id,
          stripeSubscriptionId: invoice.subscription,
          createdAt: new Date().toISOString(),
          processedAt: new Date().toISOString()
        }

        // Save recurring donation to DynamoDB
        await dynamodb.put({
          TableName: DONATIONS_TABLE,
          Item: donation
        }).promise()

        console.log('Recurring donation saved to database:', donationId)
      }
    }

    // ========================================================================
    // STEP 6: HANDLE SUBSCRIPTION CREATION (Optional)
    // ========================================================================
    // Handle subscription creation
    if (stripeEvent.type === 'customer.subscription.created') {
      const subscription = stripeEvent.data.object
      console.log('Subscription created:', subscription.id)
      // Could add additional logic here if needed
    }

    // ========================================================================
    // STEP 7: RETURN SUCCESS RESPONSE TO STRIPE
    // ========================================================================
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    }

  } catch (error) {
    // ========================================================================
    // ERROR HANDLER - Catch any unexpected errors
    // ========================================================================
    console.error('Webhook error:', error)
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Webhook processing failed' 
      })
    }
  }
}
