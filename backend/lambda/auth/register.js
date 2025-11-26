// ============================================================================
// REGISTER HANDLER - Creates new user accounts
// ============================================================================
// This Lambda function handles user registration with password hashing,
// duplicate email checking, and automatic JWT token generation

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const AWS = require('aws-sdk');              // AWS SDK for DynamoDB access
const bcrypt = require('bcryptjs');          // Password hashing library
const jwt = require('jsonwebtoken');         // JWT token generation
const { randomUUID } = require('crypto');    // Node.js built-in UUID generator
const { getSecrets } = require('../utils/secrets');  // Secrets Manager utility

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
    // STEP 6: CREATE NEW USER OBJECT
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
    // STEP 7: SAVE USER TO DATABASE
    // ========================================================================
    console.log('Saving user to database...');
    // Save new user record to DynamoDB
    await dynamodb.put({
      TableName: USERS_TABLE,
      Item: newUser
    }).promise();
    
    // ========================================================================
    // STEP 8: GENERATE JWT TOKEN FOR IMMEDIATE LOGIN
    // ========================================================================
    console.log('Creating JWT token...');
    // Create JWT token so user is automatically logged in after registration
    const secrets = await getSecrets();
    const token = jwt.sign({ email, firstName, lastName }, secrets.jwt_secret, { expiresIn: '24h' });
    
    // ========================================================================
    // STEP 9: RETURN SUCCESS RESPONSE WITH TOKEN
    // ========================================================================
    console.log('Registration successful');
    return {
      statusCode: 201,  // 201 Created - new resource was successfully created
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        user: { email, firstName, lastName },  // User info (no sensitive data)
        token  // JWT token for immediate authentication
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
