const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined
});

const USERS_TABLE = process.env.USERS_TABLE;

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
    const { token, newPassword } = JSON.parse(event.body);
    
    // Find user by reset token
    const result = await dynamodb.scan({
      TableName: USERS_TABLE,
      FilterExpression: 'resetToken = :token',
      ExpressionAttributeValues: {
        ':token': token
      }
    }).promise();
    
    if (result.Items.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Invalid or expired reset token' })
      };
    }
    
    const user = result.Items[0];
    
    // Check if token is expired
    if (new Date() > new Date(user.resetExpires)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Reset token has expired' })
      };
    }
    
    // Hash new password (use fewer rounds for local development)
    const saltRounds = process.env.DYNAMODB_ENDPOINT ? 4 : 10; // Local: 4, Production: 10
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password and remove reset token
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { email: user.email },
      UpdateExpression: 'SET hashedPassword = :password REMOVE resetToken, resetExpires',
      ExpressionAttributeValues: {
        ':password': hashedPassword
      }
    }).promise();
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'Password updated successfully' })
    };
    
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
