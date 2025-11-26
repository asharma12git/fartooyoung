const Stripe = require('stripe')

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    }
  }

  try {
    const { customer_email } = event.queryStringParameters || {}

    if (!customer_email) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Customer email is required' })
      }
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: customer_email,
      limit: 1
    })

    if (customers.data.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ subscriptions: [] })
      }
    }

    const customer = customers.data[0]

    // Get customer's subscriptions (all statuses)
    const activeSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active'
    })

    const inactiveSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'canceled'
    })

    const formatSubscription = (sub) => ({
      id: sub.id,
      status: sub.status,
      amount: sub.items.data[0].price.unit_amount / 100,
      currency: sub.items.data[0].price.currency,
      interval: sub.items.data[0].price.recurring.interval,
      created: sub.created,
      current_period_end: sub.current_period_end,
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at
    })

    const formattedActiveSubscriptions = activeSubscriptions.data.map(formatSubscription)
    const formattedInactiveSubscriptions = inactiveSubscriptions.data.map(formatSubscription)

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        active_subscriptions: formattedActiveSubscriptions,
        inactive_subscriptions: formattedInactiveSubscriptions
      })
    }

  } catch (error) {
    console.error('List subscriptions error:', error)
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    }
  }
}
