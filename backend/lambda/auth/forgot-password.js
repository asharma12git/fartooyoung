const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined
});

const ses = new AWS.SES({ region: 'us-east-1' });

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);
    
    // Check if user exists
    const result = await dynamodb.get({
      TableName: 'fartooyoung-users',
      Key: { email }
    }).promise();
    
    if (!result.Item) {
      // Don't reveal if email exists or not (security)
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, message: 'Reset email sent if account exists' })
      };
    }
    
    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
    
    // Save reset token to database
    await dynamodb.update({
      TableName: 'fartooyoung-users',
      Key: { email },
      UpdateExpression: 'SET resetToken = :token, resetExpires = :expires',
      ExpressionAttributeValues: {
        ':token': resetToken,
        ':expires': resetExpires
      }
    }).promise();
    
    // Send email (local development will log, AWS will send real email)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    if (process.env.NODE_ENV === 'production') {
      // Send real email in production
      await ses.sendEmail({
        Source: 'noreply@fartooyoung.org',
        Destination: { ToAddresses: [email] },
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
      // Log for local development
      console.log('Password reset email would be sent to:', email);
      console.log('Reset URL:', resetUrl);
    }
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'Reset email sent if account exists' })
    };
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
