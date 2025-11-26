// ============================================================================
// LOGOUT HANDLER - Handles user logout and session tracking
// ============================================================================
// This Lambda function handles user logout by updating the last logout timestamp
// Note: JWT tokens are stateless, so actual logout happens on the frontend

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const AWS = require('aws-sdk');      // AWS SDK for DynamoDB access
const jwt = require('jsonwebtoken'); // JWT token verification

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================
// Configure DynamoDB client with optional local endpoint for testing
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined  // Local DynamoDB for testing
});

// Environment variables for authentication and database
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';        // JWT signing secret
const USERS_TABLE = process.env.USERS_TABLE || 'fartooyoung-users';   // Users table name

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for user logout
// ============================================================================
exports.handler = async (event) => {
  try {
    // ========================================================================
    // STEP 1: EXTRACT JWT TOKEN FROM AUTHORIZATION HEADER
    // ========================================================================
    // Get token from Authorization header (case-insensitive)
    const authHeader = event.headers.Authorization || event.headers.authorization;
    
    // Check if Authorization header exists
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'No token provided' })
      };
    }
    
    // Remove 'Bearer ' prefix from token
    const token = authHeader.replace('Bearer ', '');
    
    // ========================================================================
    // STEP 2: VERIFY JWT TOKEN
    // ========================================================================
    // Verify token signature and decode payload
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ========================================================================
    // STEP 3: UPDATE LOGOUT TIMESTAMP (Optional Tracking)
    // ========================================================================
    // Update user's last logout time for analytics/security tracking
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { email: decoded.email },                    // Primary key (email from JWT)
      UpdateExpression: 'SET lastLogout = :now',        // Set logout timestamp
      ExpressionAttributeValues: {
        ':now': new Date().toISOString()                // Current timestamp in ISO format
      }
    }).promise();
    
    // ========================================================================
    // STEP 4: RETURN SUCCESS RESPONSE
    // ========================================================================
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'Logged out successfully' })
    };
    
  } catch (error) {
    // ========================================================================
    // ERROR HANDLER - Always Return Success for Logout
    // ========================================================================
    // Invalid token is still considered a successful logout
    // This prevents errors when tokens are already expired or invalid
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'Logged out successfully' })
    };
  }
};
