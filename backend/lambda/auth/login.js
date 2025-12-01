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
const { checkRateLimit, recordAttempt, getClientIP } = require('../../utils/rateLimiter');

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
    // STEP 2.5: CHECK RATE LIMITING
    // ========================================================================
    const clientIP = getClientIP(event);
    const rateLimitKey = `login:${clientIP}:${email}`;
    
    const rateCheck = await checkRateLimit(rateLimitKey, 5, 900000); // 5 attempts per 15 minutes
    if (!rateCheck.allowed) {
      const minutes = Math.ceil(rateCheck.remainingTime / 60);
      return {
        statusCode: 429,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false, 
          message: `Too many login attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`
        })
      };
    }
    
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
      await recordAttempt(rateLimitKey, 900000); // Record failed attempt
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Invalid credentials' })
      };
    }
    
    // ========================================================================
    // STEP 4: CHECK EMAIL VERIFICATION STATUS
    // ========================================================================
    // Check if email is verified (backward compatibility: undefined = verified)
    if (user.email_verified === false) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false, 
          message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
          needsVerification: true
        })
      };
    }
    
    // ========================================================================
    // STEP 5: CHECK ACCOUNT LOCK STATUS
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
    // STEP 6: VERIFY PASSWORD
    // ========================================================================
    // Compare provided password with stored hashed password
    const passwordValid = await bcrypt.compare(password, user.hashedPassword);
    
    if (!passwordValid) {
      // ======================================================================
      // STEP 6A: HANDLE FAILED LOGIN ATTEMPT
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
      
      await recordAttempt(rateLimitKey, 900000); // Record failed attempt
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message })
      };
    }
    
    // ========================================================================
    // STEP 7: SUCCESSFUL LOGIN - CLEAR FAILED ATTEMPTS
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
    // STEP 8: GENERATE JWT TOKEN
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
    // STEP 9: RETURN SUCCESS RESPONSE WITH TOKEN
    // ========================================================================
    await recordAttempt(rateLimitKey, 900000); // Record successful attempt
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
