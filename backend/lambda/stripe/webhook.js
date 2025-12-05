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

// Get table name from environment variables
const DONATIONS_TABLE = process.env.DONATIONS_TABLE

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for AWS Lambda
// ============================================================================
exports.handler = async (event) => {
  try {
    // Initialize Stripe with secrets from Secrets Manager
    if (!stripe) {
      const secrets = await getSecrets();
      stripe = Stripe(secrets.STRIPE_SECRET_KEY);
    }

    // ========================================================================
    // STEP 1: EXTRACT WEBHOOK SIGNATURE
    // ========================================================================
    // API Gateway may transform header names to lowercase
    const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature']
    const secrets = await getSecrets();
    const endpointSecret = secrets.STRIPE_WEBHOOK_SECRET

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

      // Skip checkout events for subscriptions - let invoice.payment_succeeded handle them
      if (session.mode === 'subscription') {
        console.log('Skipping checkout event for subscription - will be handled by invoice event')
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({ received: true, skipped: 'subscription checkout event' })
        }
      }

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
    // STEP 7: HANDLE SUBSCRIPTION CANCELLATION
    // ========================================================================
    // Handle subscription cancellation/deletion
    if (stripeEvent.type === 'customer.subscription.deleted') {
      const subscription = stripeEvent.data.object
      console.log('Subscription cancelled:', subscription.id)

      // Create cancellation record
      const cancellationId = `cancel_${subscription.id}_${Date.now()}`
      
      const cancellationRecord = {
        id: cancellationId,
        donationId: cancellationId,
        amount: 0,
        type: 'subscription_cancelled',
        paymentMethod: 'stripe-subscription',
        email: subscription.customer_email || 'unknown',
        name: subscription.customer_name || 'Subscriber',
        status: 'cancelled',
        stripeSubscriptionId: subscription.id,
        cancelledAt: new Date(subscription.canceled_at * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString()
      }

      // Save cancellation record to DynamoDB
      await dynamodb.put({
        TableName: DONATIONS_TABLE,
        Item: cancellationRecord
      }).promise()

      console.log('Subscription cancellation saved to database:', cancellationId)
    }

    // ========================================================================
    // STEP 8: HANDLE SUBSCRIPTION UPDATES
    // ========================================================================
    // Handle subscription status changes (paused, resumed, etc.)
    if (stripeEvent.type === 'customer.subscription.updated') {
      const subscription = stripeEvent.data.object
      const previousAttributes = stripeEvent.data.previous_attributes
      
      console.log('Subscription updated:', subscription.id)
      console.log('Status:', subscription.status)
      console.log('Cancel at period end:', subscription.cancel_at_period_end)
      console.log('Previous attributes:', JSON.stringify(previousAttributes))

      // Track when user schedules a cancellation (cancel_at_period_end changes to true)
      if (previousAttributes && 
          previousAttributes.cancel_at_period_end === false && 
          subscription.cancel_at_period_end === true) {
        
        const scheduleId = `cancel_scheduled_${subscription.id}_${Date.now()}`
        
        const scheduleRecord = {
          id: scheduleId,
          donationId: scheduleId,
          amount: 0,
          type: 'subscription_cancel_scheduled',
          paymentMethod: 'stripe-subscription',
          email: subscription.customer_email || 'unknown',
          name: subscription.customer_name || 'Subscriber',
          status: 'pending_cancellation',
          stripeSubscriptionId: subscription.id,
          cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
          scheduledAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          processedAt: new Date().toISOString()
        }

        // Save scheduled cancellation record to DynamoDB
        await dynamodb.put({
          TableName: DONATIONS_TABLE,
          Item: scheduleRecord
        }).promise()

        console.log('Scheduled cancellation saved to database:', scheduleId)
      }

      // Track significant status changes
      if (previousAttributes && previousAttributes.status) {
        const updateId = `update_${subscription.id}_${Date.now()}`
        
        const updateRecord = {
          id: updateId,
          donationId: updateId,
          amount: 0,
          type: 'subscription_updated',
          paymentMethod: 'stripe-subscription',
          email: subscription.customer_email || 'unknown',
          name: subscription.customer_name || 'Subscriber',
          status: subscription.status,
          previousStatus: previousAttributes.status,
          stripeSubscriptionId: subscription.id,
          createdAt: new Date().toISOString(),
          processedAt: new Date().toISOString()
        }

        // Save update record to DynamoDB
        await dynamodb.put({
          TableName: DONATIONS_TABLE,
          Item: updateRecord
        }).promise()

        console.log('Subscription update saved to database:', updateId)
      }
    }

    // ========================================================================
    // STEP 9: RETURN SUCCESS RESPONSE TO STRIPE
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
