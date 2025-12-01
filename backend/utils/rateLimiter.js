const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT })
})
const docClient = DynamoDBDocumentClient.from(client)

const RATE_LIMIT_TABLE = process.env.RATE_LIMIT_TABLE || 'fartooyoung-staging-rate-limits'

/**
 * Check if request should be rate limited
 * @param {string} key - Unique identifier (IP address or email)
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<{allowed: boolean, remainingTime: number}>}
 */
async function checkRateLimit(key, maxAttempts = 5, windowMs = 3600000) { // 1 hour default
  const now = Date.now()
  const windowStart = now - windowMs
  
  try {
    // Get existing rate limit record
    const result = await docClient.send(new GetCommand({
      TableName: RATE_LIMIT_TABLE,
      Key: { limitKey: key }
    }))
    
    if (!result.Item) {
      // No record exists, allow request
      return { allowed: true, remainingTime: 0 }
    }
    
    const { attempts, expiresAt } = result.Item
    
    // Check if record has expired
    if (expiresAt < now) {
      // Expired, delete old record and allow
      await docClient.send(new DeleteCommand({
        TableName: RATE_LIMIT_TABLE,
        Key: { limitKey: key }
      }))
      return { allowed: true, remainingTime: 0 }
    }
    
    // Filter attempts within the time window
    const recentAttempts = attempts.filter(timestamp => timestamp > windowStart)
    
    if (recentAttempts.length >= maxAttempts) {
      // Rate limit exceeded
      const oldestAttempt = Math.min(...recentAttempts)
      const remainingTime = Math.ceil((oldestAttempt + windowMs - now) / 1000) // seconds
      return { allowed: false, remainingTime }
    }
    
    return { allowed: true, remainingTime: 0 }
    
  } catch (error) {
    console.error('Rate limit check error:', error)
    // On error, allow request (fail open)
    return { allowed: true, remainingTime: 0 }
  }
}

/**
 * Record an attempt for rate limiting
 * @param {string} key - Unique identifier (IP address or email)
 * @param {number} windowMs - Time window in milliseconds
 */
async function recordAttempt(key, windowMs = 3600000) {
  const now = Date.now()
  const expiresAt = now + windowMs
  
  try {
    // Get existing record
    const result = await docClient.send(new GetCommand({
      TableName: RATE_LIMIT_TABLE,
      Key: { limitKey: key }
    }))
    
    let attempts = [now]
    
    if (result.Item) {
      // Add to existing attempts
      const windowStart = now - windowMs
      const recentAttempts = result.Item.attempts.filter(timestamp => timestamp > windowStart)
      attempts = [...recentAttempts, now]
    }
    
    // Store updated record
    await docClient.send(new PutCommand({
      TableName: RATE_LIMIT_TABLE,
      Item: {
        limitKey: key,
        attempts,
        expiresAt,
        ttl: Math.floor(expiresAt / 1000) // DynamoDB TTL (seconds)
      }
    }))
    
  } catch (error) {
    console.error('Record attempt error:', error)
    // Continue even if recording fails
  }
}

/**
 * Get client IP address from Lambda event
 * @param {object} event - Lambda event object
 * @returns {string} IP address
 */
function getClientIP(event) {
  // Check various headers for real IP
  const headers = event.headers || {}
  return headers['x-forwarded-for']?.split(',')[0].trim() ||
         headers['x-real-ip'] ||
         event.requestContext?.identity?.sourceIp ||
         'unknown'
}

module.exports = {
  checkRateLimit,
  recordAttempt,
  getClientIP
}
