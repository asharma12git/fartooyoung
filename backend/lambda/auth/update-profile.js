// ============================================================================
// UPDATE PROFILE HANDLER - Updates user profile information
// ============================================================================
// This Lambda function allows authenticated users to update their profile
// information including name and phone number with validation

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const AWS = require('aws-sdk')       // AWS SDK for DynamoDB access
const jwt = require('jsonwebtoken')  // JWT token verification
const { getSecrets } = require('../utils/secrets')  // Secrets Manager utility

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
// MAIN LAMBDA HANDLER - Entry point for profile update requests
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
    const { firstName, lastName, phone } = JSON.parse(event.body)

    // Validation - first name must be at least 2 characters
    if (!firstName || firstName.trim().length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'First name must be at least 2 characters' })
      }
    }

    // Validation - last name must be at least 2 characters
    if (!lastName || lastName.trim().length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Last name must be at least 2 characters' })
      }
    }

    // Phone validation (optional field) - strict validation for US/international numbers
    if (phone && phone.trim()) {
      const cleanPhone = phone.replace(/[^\d]/g, ''); // Remove all non-digits
      
      // Check length: US (10 digits) or international (7-15 digits with country code)
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'Phone number must be 7-15 digits long' })
        }
      }
      
      // Check format: must contain only digits, spaces, dashes, parentheses, and optional + prefix
      if (!/^[\+]?[\d\s\-\(\)]{7,20}$/.test(phone.trim())) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'Please enter a valid phone number format' })
        }
      }
    }

    // ========================================================================
    // STEP 4: BUILD UPDATE PARAMETERS FOR DYNAMODB
    // ========================================================================
    // Update user profile in database
    const updateParams = {
      TableName: USERS_TABLE,
      Key: { email: decoded.email },                       // Primary key (email from JWT)
      UpdateExpression: 'SET firstName = :firstName, lastName = :lastName, #n = :name',
      ExpressionAttributeNames: {
        '#n': 'name'                                       // Use alias because 'name' is a reserved word
      },
      ExpressionAttributeValues: {
        ':firstName': firstName.trim(),                    // Trimmed first name
        ':lastName': lastName.trim(),                      // Trimmed last name
        ':name': `${firstName.trim()} ${lastName.trim()}` // Full name combination
      },
      ReturnValues: 'ALL_NEW'                             // Return updated item
    }

    // ========================================================================
    // STEP 5: ADD OPTIONAL PHONE NUMBER IF PROVIDED
    // ========================================================================
    // Add phone number to update if provided
    if (phone && phone.trim()) {
      updateParams.UpdateExpression += ', phone = :phone'  // Append to update expression
      updateParams.ExpressionAttributeValues[':phone'] = phone.trim()
    }

    // ========================================================================
    // STEP 6: EXECUTE DATABASE UPDATE
    // ========================================================================
    // Execute the update operation
    const result = await dynamodb.update(updateParams).promise()

    // ========================================================================
    // STEP 7: RETURN SUCCESS RESPONSE WITH UPDATED DATA
    // ========================================================================
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Profile updated successfully',
        user: {
          email: result.Attributes.email,           // User's email
          name: result.Attributes.name,             // Full name
          firstName: result.Attributes.firstName,   // First name
          lastName: result.Attributes.lastName,     // Last name
          phone: result.Attributes.phone || ''      // Phone (empty string if not set)
        }
      })
    }

  } catch (error) {
    // ========================================================================
    // ERROR HANDLER - Catch any unexpected errors
    // ========================================================================
    console.error('Update profile error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Internal server error' })
    }
  }
}
