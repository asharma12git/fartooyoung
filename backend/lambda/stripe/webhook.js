const { getAllowedOrigin } = require("../utils/cors");
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
            'Access-Control-Allow-Origin': getAllowedOrigin(event),
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({ received: true, skipped: 'subscription checkout event' })
        }
      }

      // Retrieve payment method details
      let paymentMethodDetails = { type: 'unknown' }
      try {
        if (session.payment_intent) {
          // Retrieve PaymentIntent
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
          
          console.log('PaymentIntent retrieved:', paymentIntent.id)
          console.log('Latest charge:', paymentIntent.latest_charge)
          console.log('Payment method:', paymentIntent.payment_method)
          
          // Try to get details from charge first (for card payments)
          if (paymentIntent.latest_charge) {
            const chargeId = typeof paymentIntent.latest_charge === 'string' 
              ? paymentIntent.latest_charge 
              : paymentIntent.latest_charge.id
            
            const charge = await stripe.charges.retrieve(chargeId)
            if (charge.payment_method_details) {
              paymentMethodDetails = charge.payment_method_details
              console.log('Got payment details from charge:', paymentMethodDetails.type)
            }
          } 
          // For bank accounts, charge doesn't exist yet - get from payment method
          else if (paymentIntent.payment_method) {
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method)
            console.log('Retrieved payment method:', paymentMethod.type)
            
            if (paymentMethod.type === 'us_bank_account') {
              paymentMethodDetails = {
                type: 'us_bank_account',
                us_bank_account: {
                  bank_name: paymentMethod.us_bank_account.bank_name,
                  last4: paymentMethod.us_bank_account.last4,
                  account_type: paymentMethod.us_bank_account.account_type
                }
              }
            } else if (paymentMethod.type === 'card') {
              paymentMethodDetails = {
                type: 'card',
                card: {
                  brand: paymentMethod.card.brand,
                  last4: paymentMethod.card.last4
                }
              }
            }
            console.log('Got payment details from payment method:', paymentMethodDetails.type)
          }
        }
      } catch (err) {
        console.error('Error retrieving payment method:', err.message)
      }
      
      console.log('Final payment method details:', JSON.stringify(paymentMethodDetails))

      // Create unique donation ID
      const donationId = `checkout_${session.id}`

      // Extract flat payment fields
      const card = paymentMethodDetails.card
      const cardBrand = card?.brand || null
      const cardLast4 = card?.last4 || null
      const wallet = card?.wallet?.type || null
      
      // Build donation object for database storage (14-field format)
      const donation = {
        id: donationId,
        email: session.customer_email || session.metadata?.donor_email,
        name: session.metadata?.donor_name || 'Anonymous',
        amount: session.amount_total / 100,
        type: session.mode === 'subscription' ? 'monthly' : 'one-time',
        status: 'completed',
        paymentMethod: paymentMethodDetails.type || 'card',
        cardBrand,
        cardLast4,
        wallet,
        stripeInvoiceId: null,
        stripeSubscriptionId: session.mode === 'subscription' ? session.subscription : null,
        stripeSessionId: session.id,
        createdAt: new Date().toISOString(),
      }

      // Save donation to DynamoDB
      await dynamodb.put({
        TableName: DONATIONS_TABLE,
        Item: donation
      }).promise()

      console.log('Donation saved to database:', donationId, 'Type:', donation.type)
    }

    // ========================================================================
    // STEP 4B: HANDLE PAYMENT INTENT SUCCEEDED (Embedded Payment Element)
    // ========================================================================
    if (stripeEvent.type === 'payment_intent.succeeded') {
      const paymentIntent = stripeEvent.data.object

      // Skip if this came from a checkout session (already handled above)
      if (paymentIntent.metadata?.source === 'checkout_session') {
        console.log('Skipping payment_intent from checkout session')
      } else {
        console.log('Payment intent succeeded:', paymentIntent.id)

        // Retrieve payment method details from charge
        let paymentMethodDetails = { type: 'unknown' }
        try {
          if (paymentIntent.latest_charge) {
            const chargeId = typeof paymentIntent.latest_charge === 'string'
              ? paymentIntent.latest_charge
              : paymentIntent.latest_charge.id
            const charge = await stripe.charges.retrieve(chargeId)
            paymentMethodDetails = charge.payment_method_details || { type: 'unknown' }
          }
        } catch (err) {
          console.error('Error retrieving payment method:', err.message)
        }

        const card = paymentMethodDetails.card
        const cardBrand = card?.brand || null
        const cardLast4 = card?.last4 || null
        const wallet = card?.wallet?.type || null

        const donation = {
          id: `pi_${paymentIntent.id}`,
          email: paymentIntent.metadata?.donor_email || paymentIntent.receipt_email || 'unknown',
          name: paymentIntent.metadata?.donor_name || 'Anonymous',
          amount: paymentIntent.amount / 100,
          type: paymentIntent.metadata?.donation_type || 'one-time',
          status: 'completed',
          paymentMethod: paymentMethodDetails.type || 'card',
          cardBrand,
          cardLast4,
          wallet,
          stripeInvoiceId: null,
          stripeSubscriptionId: null,
          stripeSessionId: null,
          createdAt: new Date().toISOString(),
        }

        await dynamodb.put({
          TableName: DONATIONS_TABLE,
          Item: donation
        }).promise()

        console.log('Payment intent donation saved:', donation.id)
      }
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

        // Retrieve payment method details from charge
        let paymentMethodDetails = { type: 'unknown' }
        try {
          if (invoice.charge) {
            const charge = await stripe.charges.retrieve(invoice.charge)
            paymentMethodDetails = charge.payment_method_details
          }
        } catch (err) {
          console.error('Error retrieving payment method:', err.message)
        }

        // Create donation record for recurring payment
        const donationId = `invoice_${invoice.id}`

        // Extract flat payment fields
        const card = paymentMethodDetails.card
        const cardBrand = card?.brand || null
        const cardLast4 = card?.last4 || null
        const wallet = card?.wallet?.type || null
        
        // Build donation object for monthly payment (14-field format)
        const donation = {
          id: donationId,
          email: invoice.customer_email,
          name: invoice.customer_name || 'Subscriber',
          amount: invoice.amount_paid / 100,
          type: 'monthly',
          status: 'completed',
          paymentMethod: paymentMethodDetails.type || 'card',
          cardBrand,
          cardLast4,
          wallet,
          stripeInvoiceId: invoice.id,
          stripeSubscriptionId: invoice.subscription,
          stripeSessionId: null,
          createdAt: new Date().toISOString(),
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
        email: subscription.customer_email || 'unknown',
        name: subscription.customer_name || 'Subscriber',
        amount: 0,
        type: 'subscription_cancelled',
        status: 'cancelled',
        paymentMethod: 'stripe-subscription',
        cardBrand: null,
        cardLast4: null,
        wallet: null,
        stripeInvoiceId: null,
        stripeSubscriptionId: subscription.id,
        stripeSessionId: null,
        createdAt: new Date().toISOString(),
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
          email: subscription.customer_email || 'unknown',
          name: subscription.customer_name || 'Subscriber',
          amount: 0,
          type: 'subscription_cancel_scheduled',
          status: 'pending_cancellation',
          paymentMethod: 'stripe-subscription',
          cardBrand: null,
          cardLast4: null,
          wallet: null,
          stripeInvoiceId: null,
          stripeSubscriptionId: subscription.id,
          stripeSessionId: null,
          createdAt: new Date().toISOString(),
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
          email: subscription.customer_email || 'unknown',
          name: subscription.customer_name || 'Subscriber',
          amount: 0,
          type: 'subscription_updated',
          status: subscription.status,
          paymentMethod: 'stripe-subscription',
          cardBrand: null,
          cardLast4: null,
          wallet: null,
          stripeInvoiceId: null,
          stripeSubscriptionId: subscription.id,
          stripeSessionId: null,
          createdAt: new Date().toISOString(),
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
