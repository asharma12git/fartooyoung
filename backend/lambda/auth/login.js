// ============================================================================
// LOGIN HANDLER - Authenticates users and generates JWT tokens
// ============================================================================
// This Lambda function handles user login with password verification,
// account locking after failed attempts, and JWT token generation

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const AWS = require('aws-sdk');      // AWS SDK for DynamoDB access
const bcrypt = require('bcryptjs');  // Password hashing and comparison
const jwt = require('jsonwebtoken'); // JWT token generation and verification
const { getSecrets } = require('../utils/secrets');  // Secrets Manager utility

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================
// Configure DynamoDB - works locally and in AWS
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,  // Local DynamoDB for testing
  region: 'us-east-1'                                   // AWS region
});

// Environment variables for database
const USERS_TABLE = process.env.USERS_TABLE || 'fartooyoung-users';   // Users table name

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for user login
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
    // STEP 2: PARSE AND VALIDATE LOGIN CREDENTIALS
    // ========================================================================
    const { email: rawEmail, password } = JSON.parse(event.body)
    const email = rawEmail.toLowerCase().trim();  // Normalize email format
    
    // ========================================================================
    // STEP 3: RETRIEVE USER FROM DATABASE
    // ========================================================================
    // Get user record from DynamoDB using email as primary key
    const result = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { email }  // Email is the primary key in users table
    }).promise();
    
    const user = result.Item;
    
    // Check if user exists
    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Invalid credentials' })
      };
    }
    
    // ========================================================================
    // STEP 4: CHECK ACCOUNT LOCK STATUS
    // ========================================================================
    // Check if account is locked due to failed login attempts
    const now = new Date();
    if (user.lockedUntil && new Date(user.lockedUntil) > now) {
      const lockTimeRemaining = Math.ceil((new Date(user.lockedUntil) - now) / (1000 * 60)); // minutes
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false, 
          message: `Account locked for ${lockTimeRemaining} more minutes due to failed login attempts. Use 'Forgot Password' for immediate access.`
        })
      };
    }
    
    // ========================================================================
    // STEP 5: VERIFY PASSWORD
    // ========================================================================
    // Compare provided password with stored hashed password
    const passwordValid = await bcrypt.compare(password, user.hashedPassword);
    
    if (!passwordValid) {
      // ======================================================================
      // STEP 5A: HANDLE FAILED LOGIN ATTEMPT
      // ======================================================================
      // Increment failed attempts counter
      const failedAttempts = (user.failedAttempts || 0) + 1;
      const lockUntil = failedAttempts >= 3 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null; // 15 minutes
      
      // Update failed attempts and lock status in database
      await dynamodb.update({
        TableName: USERS_TABLE,
        Key: { email },
        UpdateExpression: lockUntil 
          ? 'SET failedAttempts = :attempts, lockedUntil = :lockUntil'  // Lock account after 3 attempts
          : 'SET failedAttempts = :attempts',                           // Just increment counter
        ExpressionAttributeValues: lockUntil
          ? { ':attempts': failedAttempts, ':lockUntil': lockUntil }
          : { ':attempts': failedAttempts }
      }).promise();
      
      // Generate appropriate error message
      const attemptsLeft = 3 - failedAttempts;
      const message = failedAttempts >= 3 
        ? 'Account locked for 15 minutes due to too many failed attempts. Use "Forgot Password" for immediate access.'
        : `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`;
      
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message })
      };
    }
    
    // ========================================================================
    // STEP 6: SUCCESSFUL LOGIN - CLEAR FAILED ATTEMPTS
    // ========================================================================
    // Successful login - clear failed attempts and lock status
    if (user.failedAttempts || user.lockedUntil) {
      await dynamodb.update({
        TableName: USERS_TABLE,
        Key: { email },
        UpdateExpression: 'REMOVE failedAttempts, lockedUntil'  // Clear security flags
      }).promise();
    }
    
    // ========================================================================
    // STEP 7: GENERATE JWT TOKEN
    // ========================================================================
    // Create JWT token with user information for frontend authentication
    const secrets = await getSecrets();
    const tokenPayload = { 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name // Keep for backward compatibility
    };
    const token = jwt.sign(tokenPayload, secrets.jwt_secret, { expiresIn: '24h' });
    
    // ========================================================================
    // STEP 8: RETURN SUCCESS RESPONSE WITH TOKEN
    // ========================================================================
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        user: { 
          email: user.email, 
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name // Keep for backward compatibility
        },
        token  // JWT token for authenticated requests
      })
    };
    
  } catch (error) {
    // ========================================================================
    // ERROR HANDLER - Catch any unexpected errors
    // ========================================================================
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
