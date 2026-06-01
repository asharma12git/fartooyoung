const AWS = require('aws-sdk');
const { getAllowedOrigin } = require('../utils/cors');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: 'us-east-1'
});
const RESEARCH_TABLE = process.env.RESEARCH_TABLE;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event), 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }

  try {
    const result = await dynamodb.scan({
      TableName: RESEARCH_TABLE
    }).promise();

    const articles = result.Items
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .slice(0, 20); // Return latest 20

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
      body: JSON.stringify({ success: true, articles })
    };
  } catch (error) {
    console.error('Error fetching research articles:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
