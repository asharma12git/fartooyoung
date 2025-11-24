const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

// Configure DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
    region: 'us-east-1'
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const DONATIONS_TABLE = process.env.DONATIONS_TABLE || 'fartooyoung-donations';

exports.handler = async (event) => {
    // Handle CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: ''
        };
    }

    try {
        // Verify JWT token
        const authHeader = event.headers?.Authorization || event.headers?.authorization;

        console.log('Auth header:', authHeader ? 'Present' : 'Missing');
        console.log('Headers:', JSON.stringify(event.headers));

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Authentication failed: No valid auth header');
            return {
                statusCode: 401,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, message: 'Authentication required' })
            };
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('Token extracted, length:', token.length);

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
            console.log('Token verified successfully for:', decoded.email);
        } catch (err) {
            console.log('Token verification failed:', err.message);
            return {
                statusCode: 401,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, message: 'Invalid or expired token' })
            };
        }

        // Extract email from verified token
        const userEmail = decoded.email;

        // Scan donations table for this user's donations
        // Note: In production, you'd want to use a GSI (Global Secondary Index) on email for better performance
        const result = await dynamodb.scan({
            TableName: DONATIONS_TABLE,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': userEmail
            }
        }).promise();

        // Sort by createdAt (most recent first)
        const donations = result.Items.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                donations
            })
        };

    } catch (error) {
        console.error('Error fetching donations:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, message: 'Server error fetching donations' })
        };
    }
};
