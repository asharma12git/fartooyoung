const { getAllowedOrigin } = require("../utils/cors");
// ============================================================================
// CREATE DONATION HANDLER - Manually creates donation records
// ============================================================================
// This Lambda function handles direct donation creation (not via Stripe webhooks)
// Used for testing or alternative payment methods

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
const AWS = require('aws-sdk');        // AWS SDK for DynamoDB access
const { v4: uuidv4 } = require('uuid'); // UUID generator for unique donation IDs

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================
// Configure DynamoDB client with optional local endpoint for testing
const dynamodb = new AWS.DynamoDB.DocumentClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined,  // Local DynamoDB for testing
    region: 'us-east-1'                                   // AWS region
});

// Get donations table name from environment variables
const DONATIONS_TABLE = process.env.DONATIONS_TABLE || 'fartooyoung-donations';

// ============================================================================
// MAIN LAMBDA HANDLER - Entry point for donation creation
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
                'Access-Control-Allow-Origin': getAllowedOrigin(event),           
                'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allowed HTTP methods
                'Access-Control-Allow-Headers': 'Content-Type, Authorization' // Allowed headers
            },
            body: ''
        };
    }

    try {
        // ====================================================================
        // STEP 2: PARSE AND VALIDATE REQUEST DATA
        // ====================================================================
        const { amount, type, paymentMethod, email: rawEmail, name } = JSON.parse(event.body);
        
        // Normalize email to lowercase for consistency
        const email = rawEmail ? rawEmail.toLowerCase().trim() : null;

        // Basic validation - ensure required fields are present
        if (!amount || !paymentMethod) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
                body: JSON.stringify({ success: false, message: 'Missing required fields' })
            };
        }

        // ====================================================================
        // STEP 3: CREATE DONATION RECORD
        // ====================================================================
        const donationId = uuidv4();                    // Generate unique ID
        const timestamp = new Date().toISOString();     // Current timestamp

        // Build donation object for database storage (14-field format)
        const donation = {
            id: donationId,
            email,
            name,
            amount,
            type: type || 'one-time',
            status: 'completed',
            paymentMethod,
            cardBrand: null,
            cardLast4: null,
            wallet: null,
            stripeInvoiceId: null,
            stripeSubscriptionId: null,
            stripeSessionId: null,
            createdAt: timestamp,
        };

        // ====================================================================
        // STEP 4: SAVE TO DATABASE
        // ====================================================================
        // Save donation record to DynamoDB
        await dynamodb.put({
            TableName: DONATIONS_TABLE,
            Item: donation
        }).promise();

        // ====================================================================
        // STEP 5: RETURN SUCCESS RESPONSE
        // ====================================================================
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
            body: JSON.stringify({
                success: true,
                message: 'Donation recorded successfully',
                donation  // Return the created donation record
            })
        };

    } catch (error) {
        // ====================================================================
        // ERROR HANDLER - Catch any unexpected errors
        // ====================================================================
        console.error('Error creating donation:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
            body: JSON.stringify({ success: false, message: 'Server error processing donation' })
        };
    }
};
