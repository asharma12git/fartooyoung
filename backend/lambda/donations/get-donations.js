const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

// Configure DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
    region: 'us-east-1'
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

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

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, message: 'Authentication required' })
            };
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
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
            TableName: 'fartooyoung-donations',
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
