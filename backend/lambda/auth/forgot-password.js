// ============================================================================
// FORGOT PASSWORD HANDLER - Initiates password reset process
// ============================================================================
// This Lambda function handles password reset requests by generating reset tokens,
// sending reset emails, and clearing account locks for security

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const AWS = require('aws-sdk');              // AWS SDK for DynamoDB and SES
const { randomUUID } = require('crypto');    // Node.js built-in UUID generator for reset tokens

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================
// Configure DynamoDB client with optional local endpoint for testing
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined  // Local DynamoDB for testing
});

// Configure SES (Simple Email Service) for sending reset emails
const ses = new AWS.SES({ region: 'us-east-1' });

// Get users table name from environment variables
const USERS_TABLE = process.env.USERS_TABLE || 'fartooyoung-users';

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for password reset requests
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
    // STEP 2: PARSE AND VALIDATE EMAIL ADDRESS
    // ========================================================================
    const { email: rawEmail } = JSON.parse(event.body)
    const email = rawEmail.toLowerCase().trim();  // Normalize email format
    
    // ========================================================================
    // STEP 3: CHECK IF USER EXISTS (Security-conscious approach)
    // ========================================================================
    // Check if user exists in database
    const result = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { email }  // Email is the primary key
    }).promise();
    
    // Security: Don't reveal whether email exists or not to prevent email enumeration
    if (!result.Item) {
      // Return success even if user doesn't exist (security best practice)
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, message: 'Reset email sent if account exists' })
      };
    }
    
    // ========================================================================
    // STEP 4: GENERATE RESET TOKEN AND EXPIRATION
    // ========================================================================
    // Generate secure random reset token
    const resetToken = randomUUID();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes from now
    
    // ========================================================================
    // STEP 5: SAVE RESET TOKEN AND CLEAR ACCOUNT LOCKS
    // ========================================================================
    // Save reset token to database and clear any account lock (security feature)
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { email },
      UpdateExpression: 'SET resetToken = :token, resetExpires = :expires REMOVE failedAttempts, lockedUntil',
      ExpressionAttributeValues: {
        ':token': resetToken,      // Unique reset token
        ':expires': resetExpires   // Token expiration time
      }
    }).promise();
    
    // ========================================================================
    // STEP 6: SEND RESET EMAIL (Production vs Development)
    // ========================================================================
    // Build reset URL for the frontend
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    if (process.env.NODE_ENV === 'production') {
      // ======================================================================
      // PRODUCTION: Send real email via AWS SES
      // ======================================================================
      await ses.sendEmail({
        Source: 'noreply@fartooyoung.org',           // From email address
        Destination: { ToAddresses: [email] },       // To email address
        Message: {
          Subject: { Data: 'Password Reset - Far Too Young' },
          Body: {
            Html: {
              Data: `
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link expires in 15 minutes.</p>
              `
            }
          }
        }
      }).promise();
    } else {
      // ======================================================================
      // DEVELOPMENT: Log email details instead of sending
      // ======================================================================
      console.log('Password reset email would be sent to:', email);
      console.log('Reset URL:', resetUrl);
    }
    
    // ========================================================================
    // STEP 7: RETURN SUCCESS RESPONSE
    // ========================================================================
    // Return different responses for local vs production environments
    const isLocal = process.env.DYNAMODB_ENDPOINT && process.env.DYNAMODB_ENDPOINT.includes('localhost');
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true, 
        message: 'Reset email sent if account exists',
        ...(isLocal && { resetToken }) // Only include token in local development for testing
      })
    };
    
  } catch (error) {
    // ========================================================================
    // ERROR HANDLER - Catch any unexpected errors
    // ========================================================================
    console.error('Forgot password error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
