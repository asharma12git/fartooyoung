const AWS = require('aws-sdk')
const jwt = require('jsonwebtoken')

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

    const { firstName, lastName, phone } = JSON.parse(event.body)

    // Basic validation
    if (!firstName || firstName.trim().length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'First name must be at least 2 characters' })
      }
    }

    if (!lastName || lastName.trim().length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Last name must be at least 2 characters' })
      }
    }

    // Phone validation (optional field)
    if (phone && phone.trim() && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone.trim())) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Please enter a valid phone number' })
      }
    }

    // Update user profile
    const updateParams = {
      TableName: USERS_TABLE,
      Key: { email: decoded.email },
      UpdateExpression: 'SET firstName = :firstName, lastName = :lastName, #n = :name',
      ExpressionAttributeNames: {
        '#n': 'name'
      },
      ExpressionAttributeValues: {
        ':firstName': firstName.trim(),
        ':lastName': lastName.trim(),
        ':name': `${firstName.trim()} ${lastName.trim()}`
      },
      ReturnValues: 'ALL_NEW'
    }

    // Add phone if provided
    if (phone && phone.trim()) {
      updateParams.UpdateExpression += ', phone = :phone'
      updateParams.ExpressionAttributeValues[':phone'] = phone.trim()
    }

    const result = await dynamodb.update(updateParams).promise()

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Profile updated successfully',
        user: {
          email: result.Attributes.email,
          name: result.Attributes.name,
          firstName: result.Attributes.firstName,
          lastName: result.Attributes.lastName,
          phone: result.Attributes.phone || ''
        }
      })
    }

  } catch (error) {
    console.error('Update profile error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Internal server error' })
    }
  }
}
