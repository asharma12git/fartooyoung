const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto'); // Use Node.js built-in instead of uuid package

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: 'us-east-1'
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  try {
    console.log('Register function started');
    console.log('Environment variables:', {
      DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT,
      JWT_SECRET: process.env.JWT_SECRET
    });
    console.log('DynamoDB config:', {
      endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
      region: 'us-east-1'
    });
    console.log('Event body:', event.body);
    
    const { email: rawEmail, password, name } = JSON.parse(event.body);
    const email = rawEmail.toLowerCase().trim();
    console.log('Parsed input:', { email, name });
    
    // Check if user already exists
    console.log('Checking if user exists...');
    const existingUser = await dynamodb.get({
      TableName: 'fartooyoung-users',
      Key: { email }
    }).promise();
    
    console.log('Existing user check result:', existingUser);
    
    if (existingUser.Item) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'User already exists' })
      };
    }
    
    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 4); // Reduced from 10 to 4 for local testing
    
    // Create new user (matches database-design.md)
    console.log('Creating user object...');
    const newUser = {
      email,
      name,
      hashedPassword,
      userId: randomUUID(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      
      // Future-ready fields (start as defaults)
      shippingAddress: null,
      billingAddress: null,
      preferences: {},
      loyaltyPoints: 0,
      isAuthor: false,
      authorProfile: null,
      publishedBooks: []
    };
    
    console.log('Saving user to database...');
    // Save to database
    await dynamodb.put({
      TableName: 'fartooyoung-users',
      Item: newUser
    }).promise();
    
    console.log('Creating JWT token...');
    // Create JWT token
    const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('Registration successful');
    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        user: { email, name },
        token
      })
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
