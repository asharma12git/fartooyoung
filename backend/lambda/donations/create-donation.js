const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
    region: 'us-east-1'
});

const DONATIONS_TABLE = process.env.DONATIONS_TABLE || 'fartooyoung-donations';

exports.handler = async (event) => {
    // Handle CORS
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
        const { amount, type, paymentMethod, email: rawEmail, name } = JSON.parse(event.body);
        
        // Normalize email to lowercase for consistency
        const email = rawEmail ? rawEmail.toLowerCase().trim() : null;

        // Basic validation
        if (!amount || !paymentMethod) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, message: 'Missing required fields' })
            };
        }

        const donationId = uuidv4();
        const timestamp = new Date().toISOString();

        const donation = {
            id: donationId, // Use 'id' as primary key to match DynamoDB table schema
            donationId,
            amount,
            type: type || 'one-time',
            paymentMethod,
            email, // Optional: if user is logged in or provides email
            name,  // Optional
            status: 'completed', // In real app, this would be 'pending' until Stripe confirms
            createdAt: timestamp,
            processedAt: timestamp
        };

        // Save to DynamoDB
        await dynamodb.put({
            TableName: DONATIONS_TABLE,
            Item: donation
        }).promise();

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                message: 'Donation recorded successfully',
                donation
            })
        };

    } catch (error) {
        console.error('Error creating donation:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, message: 'Server error processing donation' })
        };
    }
};
