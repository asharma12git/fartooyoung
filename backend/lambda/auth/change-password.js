const AWS = require('aws-sdk')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1',
  ...(process.env.AWS_SAM_LOCAL && {
    endpoint: 'http://host.docker.internal:8000'
  })
})

const USERS_TABLE = process.env.USERS_TABLE
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    // Verify JWT token
    const authHeader = event.headers.Authorization || event.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: 'No valid token provided' })
      }
    }

    const token = authHeader.substring(7)
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: 'Invalid token' })
      }
    }

    const { currentPassword, newPassword } = JSON.parse(event.body)

    // Validation
    if (!currentPassword || !newPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Current and new passwords are required' })
      }
    }

    if (newPassword.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'New password must be at least 8 characters' })
      }
    }

    // Get user to verify current password
    const user = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { email: decoded.email }
    }).promise()

    if (!user.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, message: 'User not found' })
      }
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.Item.hashedPassword)
    if (!isCurrentPasswordValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Current password is incorrect' })
      }
    }

    // Hash new password
    const saltRounds = process.env.AWS_SAM_LOCAL ? 4 : 10
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { email: decoded.email },
      UpdateExpression: 'SET hashedPassword = :newPassword',
      ExpressionAttributeValues: {
        ':newPassword': newHashedPassword
      }
    }).promise()

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Password changed successfully'
      })
    }

  } catch (error) {
    console.error('Change password error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Internal server error' })
    }
  }
}
