// ============================================================================
// GET DONATIONS HANDLER - Retrieves user's donation history
// ============================================================================
// This Lambda function fetches all donations for an authenticated user
// Requires JWT token authentication to access user-specific donation data

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const AWS = require('aws-sdk');  // AWS SDK for DynamoDB access
const jwt = require('jsonwebtoken'); // JWT library for token verification
const { getSecrets } = require('../utils/secrets');  // Secrets Manager utility

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================
// Configure DynamoDB client with optional local endpoint for testing
const dynamodb = new AWS.DynamoDB.DocumentClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined,  // Local DynamoDB for testing
    region: 'us-east-1'                                   // AWS region
});

// Environment variables for database
const DONATIONS_TABLE = process.env.DONATIONS_TABLE || 'fartooyoung-donations'; // Table name

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for fetching donations
// ============================================================================
exports.handler = async (event) => {
    // ========================================================================
    // STEP 1: HANDLE CORS PREFLIGHT REQUESTS
    // ========================================================================
    // Handle CORS preflight (OPTIONS) requests from browsers
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',              // Allow all origins
                'Access-Control-Allow-Methods': 'GET, OPTIONS',  // Allowed HTTP methods
                'Access-Control-Allow-Headers': 'Content-Type, Authorization' // Allowed headers
            },
            body: ''
        };
    }

    try {
        // ====================================================================
        // STEP 2: EXTRACT AND VALIDATE JWT TOKEN
        // ====================================================================
        // Verify JWT token from Authorization header
        const authHeader = event.headers?.Authorization || event.headers?.authorization;

        console.log('Auth header:', authHeader ? 'Present' : 'Missing');
        console.log('Headers:', JSON.stringify(event.headers));

        // Check if Authorization header exists and has Bearer format
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Authentication failed: No valid auth header');
            return {
                statusCode: 401,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, message: 'Authentication required' })
            };
        }

        // ====================================================================
        // STEP 3: VERIFY JWT TOKEN
        // ====================================================================
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('Token extracted, length:', token.length);

        let decoded;
        try {
            // Verify token signature and decode payload
            const secrets = await getSecrets();
            decoded = jwt.verify(token, secrets.JWT_SECRET);
            console.log('Token verified successfully for:', decoded.email);
        } catch (err) {
            console.log('Token verification failed:', err.message);
            return {
                statusCode: 401,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, message: 'Invalid or expired token' })
            };
        }

        // ====================================================================
        // STEP 4: QUERY USER'S DONATIONS
        // ====================================================================
        // Extract email from verified token
        const userEmail = decoded.email;

        // Scan donations table for this user's donations
        // Note: In production, you'd want to use a GSI (Global Secondary Index) on email for better performance
        const result = await dynamodb.scan({
            TableName: DONATIONS_TABLE,
            FilterExpression: 'email = :email',  // Filter by user's email
            ExpressionAttributeValues: {
                ':email': userEmail              // User's email from JWT token
            }
        }).promise();

        // ====================================================================
        // STEP 5: SORT AND FORMAT RESULTS
        // ====================================================================
        // Sort by createdAt (most recent first)
        const donations = result.Items.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        // ====================================================================
        // STEP 6: RETURN SUCCESS RESPONSE WITH DONATIONS
        // ====================================================================
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                donations  // Array of user's donations, sorted by date
            })
        };

    } catch (error) {
        // ====================================================================
        // ERROR HANDLER - Catch any unexpected errors
        // ====================================================================
        console.error('Error fetching donations:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, message: 'Server error fetching donations' })
        };
    }
};
