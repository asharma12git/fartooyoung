const AWS = require('aws-sdk')
const Stripe = require('stripe')

// Initialize Stripe with secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

// Initialize DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined
})

const DONATIONS_TABLE = process.env.DONATIONS_TABLE

exports.handler = async (event) => {
  try {
    const sig = event.headers['stripe-signature']
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

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

    console.log('Received Stripe webhook:', stripeEvent.type)

    // Handle checkout session completed
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object

      console.log('Checkout session completed:', session.id)

      // Create donation record
      const donationId = `checkout_${session.id}`
      
      const donation = {
        id: donationId,
        donationId: donationId,
        amount: session.amount_total / 100, // Convert from cents to dollars
        type: 'one-time', // We'll add subscription support later
        paymentMethod: 'stripe-checkout',
        email: session.customer_email || session.metadata?.donor_email,
        name: session.metadata?.donor_name || 'Anonymous',
        status: 'completed',
        stripeSessionId: session.id,
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString()
      }

      // Save to DynamoDB
      await dynamodb.put({
        TableName: DONATIONS_TABLE,
        Item: donation
      }).promise()

      console.log('Donation saved to database:', donationId)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    }

  } catch (error) {
    console.error('Webhook error:', error)
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Webhook processing failed' 
      })
    }
  }
}
