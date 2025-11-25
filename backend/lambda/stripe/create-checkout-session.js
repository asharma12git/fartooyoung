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
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    }
  }

  try {
    const { amount, donor_info, donation_type } = JSON.parse(event.body)

    console.log('Creating checkout session with:', { amount, donation_type, donor_info })

    // Validate required fields
    if (!amount || !donor_info) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Missing required fields: amount, donor_info' 
        })
      }
    }

    // Create checkout session
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation to Far Too Young',
              description: 'Help protect children and girls from child marriage',
              images: ['https://your-domain.com/donation-image.jpg'], // Optional
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      customer_email: donor_info.email,
      metadata: {
        donor_name: `${donor_info.firstName} ${donor_info.lastName}`,
        donor_email: donor_info.email,
        donation_type: donation_type || 'one-time',
        organization: 'Far Too Young'
      },
      success_url: `${event.headers.origin || 'http://localhost:4173'}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin || 'http://localhost:4173'}?payment=cancelled`,
    }

    // Add recurring configuration for monthly donations
    if (donation_type === 'monthly') {
      sessionConfig.mode = 'subscription'
      sessionConfig.line_items[0].price_data.recurring = {
        interval: 'month'
      }
    } else {
      sessionConfig.mode = 'payment'
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        checkout_url: session.url,
        session_id: session.id
      })
    }

  } catch (error) {
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
