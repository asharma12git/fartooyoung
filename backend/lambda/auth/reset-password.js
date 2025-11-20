const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined
});

exports.handler = async (event) => {
  try {
    const { token, newPassword } = JSON.parse(event.body);
    
    // Find user by reset token
    const result = await dynamodb.scan({
      TableName: 'fartooyoung-users',
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
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and remove reset token
    await dynamodb.update({
      TableName: 'fartooyoung-users',
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
