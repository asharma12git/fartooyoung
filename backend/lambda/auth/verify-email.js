const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT })
})
const docClient = DynamoDBDocumentClient.from(client)

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Content-Type': 'application/json'
  }

  try {
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'OK' })
      }
    }

    // Get verification token from query parameters
    const token = event.queryStringParameters?.token

    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Verification token is required'
        })
      }
    }

    // Find user by verification token
    // Note: DynamoDB doesn't support querying by non-key attributes efficiently
    // For production, consider using GSI or scanning (acceptable for small user base)
    const scanParams = {
      TableName: process.env.USERS_TABLE,
      FilterExpression: 'verification_token = :token',
      ExpressionAttributeValues: {
        ':token': token
      }
    }

    const scanResult = await docClient.scan(scanParams)
    
    if (!scanResult.Items || scanResult.Items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid or expired verification token'
        })
      }
    }

    const user = scanResult.Items[0]

    // Check if token has expired (1 hour = 3600000 ms)
    const tokenExpiry = user.verification_expires
    if (tokenExpiry && Date.now() > tokenExpiry) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Verification token has expired. Please request a new one.'
        })
      }
    }

    // Check if already verified
    if (user.email_verified) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Email already verified'
        })
      }
    }

    // Update user to mark email as verified and remove token
    const updateParams = {
      TableName: process.env.USERS_TABLE,
      Key: {
        email: user.email
      },
      UpdateExpression: 'SET email_verified = :verified REMOVE verification_token, verification_expires',
      ExpressionAttributeValues: {
        ':verified': true
      }
    }

    await docClient.send(new UpdateCommand(updateParams))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email verified successfully! You can now log in.'
      })
    }

  } catch (error) {
    console.error('Error verifying email:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      })
    }
  }
}
