// ============================================================================
// RESET PASSWORD HANDLER - Completes password reset process
// ============================================================================
// This Lambda function handles the actual password reset using a valid reset token,
// validates token expiration, and updates the user's password securely

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const AWS = require('aws-sdk');      // AWS SDK for DynamoDB access
const bcrypt = require('bcryptjs');  // Password hashing library

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================
// Configure DynamoDB client with optional local endpoint for testing
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined  // Local DynamoDB for testing
});

// Get users table name from environment variables
const USERS_TABLE = process.env.USERS_TABLE;

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for password reset completion
// ============================================================================
exports.handler = async (event) => {
  // ==========================================================================
  // STEP 1: HANDLE CORS PREFLIGHT REQUESTS
  // ==========================================================================
  // Handle CORS preflight (OPTIONS) requests from browsers
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',              // Allow all origins
        'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allowed HTTP methods
        'Access-Control-Allow-Headers': 'Content-Type, Authorization' // Allowed headers
      },
      body: ''
    };
  }

  try {
    // ========================================================================
    // STEP 2: PARSE AND VALIDATE REQUEST DATA
    // ========================================================================
    const { token, newPassword } = JSON.parse(event.body);
    
    // ========================================================================
    // STEP 3: FIND USER BY RESET TOKEN
    // ========================================================================
    // Search for user with matching reset token (scan required since token is not primary key)
    const result = await dynamodb.scan({
      TableName: USERS_TABLE,
      FilterExpression: 'resetToken = :token',  // Filter by reset token
      ExpressionAttributeValues: {
        ':token': token                         // The reset token from the request
      }
    }).promise();
    
    // Check if token exists in database
    if (result.Items.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Invalid or expired reset token' })
      };
    }
    
    const user = result.Items[0];  // Get the user record
    
    // ========================================================================
    // STEP 4: VALIDATE TOKEN EXPIRATION
    // ========================================================================
    // Check if reset token has expired (15 minutes from generation)
    if (new Date() > new Date(user.resetExpires)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Reset token has expired' })
      };
    }
    
    // ========================================================================
    // STEP 5: HASH NEW PASSWORD SECURELY
    // ========================================================================
    // Hash new password with bcrypt (use fewer rounds for local development for speed)
    const saltRounds = process.env.DYNAMODB_ENDPOINT ? 4 : 10; // Local: 4 rounds, Production: 10 rounds
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // ========================================================================
    // STEP 6: UPDATE PASSWORD AND CLEAN UP RESET TOKEN
    // ========================================================================
    // Update user's password and remove reset token/expiration from database
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { email: user.email },                           // Primary key (email)
      UpdateExpression: 'SET hashedPassword = :password REMOVE resetToken, resetExpires',
      ExpressionAttributeValues: {
        ':password': hashedPassword                         // New hashed password
      }
    }).promise();
    
    // ========================================================================
    // STEP 7: RETURN SUCCESS RESPONSE
    // ========================================================================
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'Password updated successfully' })
    };
    
  } catch (error) {
    // ========================================================================
    // ERROR HANDLER - Catch any unexpected errors
    // ========================================================================
    console.error('Reset password error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
