const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configure DynamoDB - works locally and in AWS
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: 'us-east-1'
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const USERS_TABLE = process.env.USERS_TABLE || 'fartooyoung-users';

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
    const { email: rawEmail, password } = JSON.parse(event.body)
    const email = rawEmail.toLowerCase().trim();
    
    // Get user from database
    const result = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { email }
    }).promise();
    
    const user = result.Item;
    
    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Invalid credentials' })
      };
    }
    
    // Check if account is locked
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
    
    // Check password
    const passwordValid = await bcrypt.compare(password, user.hashedPassword);
    
    if (!passwordValid) {
      // Increment failed attempts
      const failedAttempts = (user.failedAttempts || 0) + 1;
      const lockUntil = failedAttempts >= 3 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null; // 15 minutes
      
      // Update failed attempts and lock status
      await dynamodb.update({
        TableName: USERS_TABLE,
        Key: { email },
        UpdateExpression: lockUntil 
          ? 'SET failedAttempts = :attempts, lockedUntil = :lockUntil'
          : 'SET failedAttempts = :attempts',
        ExpressionAttributeValues: lockUntil
          ? { ':attempts': failedAttempts, ':lockUntil': lockUntil }
          : { ':attempts': failedAttempts }
      }).promise();
      
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
    
    // Successful login - clear failed attempts and lock
    if (user.failedAttempts || user.lockedUntil) {
      await dynamodb.update({
        TableName: USERS_TABLE,
        Key: { email },
        UpdateExpression: 'REMOVE failedAttempts, lockedUntil'
      }).promise();
    }
    
    // Create JWT token
    const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        user: { email: user.email, name: user.name },
        token
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
