const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const { generateVerificationToken, sendVerificationEmail } = require('../../utils/emailService')

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
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
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

    const { email } = JSON.parse(event.body || '{}')

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email is required'
        })
      }
    }

    // Get user from database
    const getParams = {
      TableName: process.env.USERS_TABLE,
      Key: {
        email: email
      }
    }

    const result = await docClient.send(new GetCommand(getParams))

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'User not found'
        })
      }
    }

    const user = result.Item

    // Check if already verified
    if (user.email_verified) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email is already verified'
        })
      }
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const verificationExpires = Date.now() + 3600000 // 1 hour from now

    // Update user with new verification token
    const updateParams = {
      TableName: process.env.USERS_TABLE,
      Key: {
        email: email
      },
      UpdateExpression: 'SET verification_token = :token, verification_expires = :expires',
      ExpressionAttributeValues: {
        ':token': verificationToken,
        ':expires': verificationExpires
      }
    }

    await docClient.send(new UpdateCommand(updateParams))

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.'
      })
    }

  } catch (error) {
    console.error('Error resending verification email:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      })
    }
  }
}
