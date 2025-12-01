// ============================================================================
// REGISTER HANDLER - Creates new user accounts with email verification
// ============================================================================
// This Lambda function handles user registration with password hashing,
// duplicate email checking, and email verification

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const AWS = require('aws-sdk');              // AWS SDK for DynamoDB access
const bcrypt = require('bcryptjs');          // Password hashing library
const { randomUUID } = require('crypto');    // Node.js built-in UUID generator
const { getSecrets } = require('../utils/secrets');  // Secrets Manager utility
const { generateVerificationToken, sendVerificationEmail } = require('../../utils/emailService');
const { checkRateLimit, recordAttempt, getClientIP } = require('../../utils/rateLimiter');

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================
// Configure DynamoDB client with optional local endpoint for testing
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,  // Local DynamoDB for testing
  region: 'us-east-1'                                   // AWS region
});

// Environment variables for database
const USERS_TABLE = process.env.USERS_TABLE || 'fartooyoung-users';   // Users table name

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for user registration
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
    // STEP 2: LOG REGISTRATION ATTEMPT (Debug Information)
    // ========================================================================
    console.log('Register function started');
    console.log('Environment variables:', {
      DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT,
      SECRETS_MANAGER_ARN: process.env.SECRETS_MANAGER_ARN
    });
    console.log('DynamoDB config:', {
      endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
      region: 'us-east-1'
    });
    console.log('Event body:', event.body);
    
    // ========================================================================
    // STEP 3: PARSE AND VALIDATE REGISTRATION DATA
    // ========================================================================
    const { email: rawEmail, password, firstName, lastName } = JSON.parse(event.body);
    const email = rawEmail.toLowerCase().trim();  // Normalize email format
    console.log('Parsed input:', { email, firstName, lastName });
    
    // ========================================================================
    // STEP 3.5: CHECK RATE LIMITING
    // ========================================================================
    const clientIP = getClientIP(event);
    const rateLimitKey = `register:${clientIP}:${email}`;
    
    const rateCheck = await checkRateLimit(rateLimitKey, 5, 3600000); // 5 attempts per hour
    if (!rateCheck.allowed) {
      const minutes = Math.ceil(rateCheck.remainingTime / 60);
      return {
        statusCode: 429,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false, 
          message: `Too many registration attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`
        })
      };
    }
    
    // ========================================================================
    // STEP 4: CHECK FOR EXISTING USER
    // ========================================================================
    // Check if user already exists to prevent duplicate accounts
    console.log('Checking if user exists...');
    const existingUser = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { email }  // Email is the primary key in users table
    }).promise();
    
    console.log('Existing user check result:', existingUser);
    
    // Return error if user already exists
    if (existingUser.Item) {
      await recordAttempt(rateLimitKey, 3600000); // Record failed attempt
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'User already exists' })
      };
    }
    
    // ========================================================================
    // STEP 5: HASH PASSWORD FOR SECURITY
    // ========================================================================
    // Hash password using bcrypt for secure storage
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 4); // Reduced from 10 to 4 for local testing
    
    // ========================================================================
    // STEP 6: GENERATE EMAIL VERIFICATION TOKEN
    // ========================================================================
    console.log('Generating verification token...');
    const verificationToken = generateVerificationToken();
    const verificationExpires = Date.now() + 3600000; // 1 hour from now
    
    // ========================================================================
    // STEP 7: CREATE NEW USER OBJECT
    // ========================================================================
    // Create new user object (matches database-design.md schema)
    console.log('Creating user object...');
    const newUser = {
      // Required fields for registration
      email,                                    // Primary key - user's email
      firstName,                               // User's first name
      lastName,                                // User's last name
      hashedPassword,                          // Securely hashed password
      userId: randomUUID(),                    // Unique user identifier
      createdAt: new Date().toISOString(),     // Account creation timestamp
      lastLogin: new Date().toISOString(),     // Last login timestamp
      
      // User role and verification fields
      role: 'donor',                           // Default role for new users
      email_verified: false,                   // Email not verified yet
      verification_token: verificationToken,   // Token for email verification
      verification_expires: verificationExpires, // Token expiration time
      
      // Future-ready fields (start as defaults for extensibility)
      shippingAddress: null,                   // For future e-commerce features
      billingAddress: null,                    // For future billing features
      preferences: {},                         // User preferences object
      loyaltyPoints: 0,                        // Loyalty program points
      isAuthor: false,                         // Author status flag
      authorProfile: null,                     // Author profile data
      publishedBooks: []                       // List of published books
    };
    
    // ========================================================================
    // STEP 8: SAVE USER TO DATABASE
    // ========================================================================
    console.log('Saving user to database...');
    // Save new user record to DynamoDB
    await dynamodb.put({
      TableName: USERS_TABLE,
      Item: newUser
    }).promise();
    
    // ========================================================================
    // STEP 9: SEND VERIFICATION EMAIL
    // ========================================================================
    console.log('Sending verification email...');
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }
    
    // ========================================================================
    // STEP 10: RETURN SUCCESS RESPONSE
    // ========================================================================
    console.log('Registration successful');
    await recordAttempt(rateLimitKey, 3600000); // Record successful attempt
    return {
      statusCode: 201,  // 201 Created - new resource was successfully created
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        user: { email, firstName, lastName }  // User info (no sensitive data)
      })
    };
    
  } catch (error) {
    // ========================================================================
    // ERROR HANDLER - Catch any unexpected errors
    // ========================================================================
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
