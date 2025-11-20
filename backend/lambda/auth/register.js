const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

exports.handler = async (event) => {
  try {
    const { email, password, name } = JSON.parse(event.body);
    
    // Check if user already exists
    const existingUser = await dynamodb.get({
      TableName: 'fartooyoung-users',
      Key: { email }
    }).promise();
    
    if (existingUser.Item) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'User already exists' })
      };
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      email,
      name,
      hashedPassword,
      userId: uuidv4(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Save to database
    await dynamodb.put({
      TableName: 'fartooyoung-users',
      Item: newUser
    }).promise();
    
    // Create JWT token
    const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '24h' });
    
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
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
