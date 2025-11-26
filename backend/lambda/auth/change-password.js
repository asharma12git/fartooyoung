// ============================================================================
// CHANGE PASSWORD HANDLER - Updates password for authenticated users
// ============================================================================
// This Lambda function allows authenticated users to change their password
// by verifying their current password and updating to a new one

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const AWS = require('aws-sdk')       // AWS SDK for DynamoDB access
const jwt = require('jsonwebtoken')  // JWT token verification
const bcrypt = require('bcryptjs')   // Password hashing
const { getSecrets } = require('../utils/secrets')  // Secrets Manager utility and comparison

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================
// Configure DynamoDB client with Docker-specific endpoint for SAM Local
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1',
  ...(process.env.AWS_SAM_LOCAL && {
    endpoint: 'http://host.docker.internal:8000'  // Docker endpoint for SAM Local
  })
})

// Environment variables for authentication and database
const USERS_TABLE = process.env.USERS_TABLE

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for password change requests
// ============================================================================
exports.handler = async (event) => {
  // ==========================================================================
  // STEP 1: DEFINE CORS HEADERS
  // ==========================================================================
  // Standard CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',                    // Allow all origins
    'Access-Control-Allow-Headers': 'Content-Type,Authorization', // Allowed headers
    'Access-Control-Allow-Methods': 'POST,OPTIONS',       // Allowed HTTP methods
    'Content-Type': 'application/json'                    // Response content type
  }

  // Handle CORS preflight (OPTIONS) requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    // Get secrets from AWS Secrets Manager
    const secrets = await getSecrets();

    // ========================================================================
    // STEP 2: VERIFY JWT TOKEN AUTHENTICATION
    // ========================================================================
    // Extract and validate JWT token from Authorization header
    const authHeader = event.headers.Authorization || event.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: 'No valid token provided' })
      }
    }

    const token = authHeader.substring(7)  // Remove 'Bearer ' prefix
    let decoded
    try {
      // Verify token signature and decode payload
      decoded = jwt.verify(token, secrets.jwt_secret)
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: 'Invalid token' })
      }
    }

    // ========================================================================
    // STEP 3: PARSE AND VALIDATE REQUEST DATA
    // ========================================================================
    const { currentPassword, newPassword } = JSON.parse(event.body)

    // Validation - ensure both passwords are provided
    if (!currentPassword || !newPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Current and new passwords are required' })
      }
    }

    // Validation - ensure new password meets minimum length requirement
    if (newPassword.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'New password must be at least 8 characters' })
      }
    }

    // ========================================================================
    // STEP 4: RETRIEVE USER FROM DATABASE
    // ========================================================================
    // Get user record to verify current password
    const user = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { email: decoded.email }  // Email from JWT token
    }).promise()

    // Check if user exists
    if (!user.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, message: 'User not found' })
      }
    }

    // ========================================================================
    // STEP 5: VERIFY CURRENT PASSWORD
    // ========================================================================
    // Compare provided current password with stored hashed password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.Item.hashedPassword)
    if (!isCurrentPasswordValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Current password is incorrect' })
      }
    }

    // ========================================================================
    // STEP 6: HASH NEW PASSWORD
    // ========================================================================
    // Hash new password with bcrypt (fewer rounds for staging/local to prevent timeouts)
    const saltRounds = process.env.DYNAMODB_ENDPOINT ? 4 : 6  // Local: 4 rounds, Staging/Production: 6 rounds
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // ========================================================================
    // STEP 7: UPDATE PASSWORD IN DATABASE
    // ========================================================================
    // Update user's password in DynamoDB
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { email: decoded.email },                       // Primary key (email)
      UpdateExpression: 'SET hashedPassword = :newPassword', // Update password field
      ExpressionAttributeValues: {
        ':newPassword': newHashedPassword                  // New hashed password
      }
    }).promise()

    // ========================================================================
    // STEP 8: RETURN SUCCESS RESPONSE
    // ========================================================================
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Password changed successfully'
      })
    }

  } catch (error) {
    // ========================================================================
    // ERROR HANDLER - Catch any unexpected errors
    // ========================================================================
    console.error('Change password error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Internal server error' })
    }
  }
}
