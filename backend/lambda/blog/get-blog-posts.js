const AWS = require('aws-sdk');
const { getAllowedOrigin } = require('../utils/cors');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: 'us-east-1'
});
const BLOG_TABLE = process.env.BLOG_TABLE;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event), 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }

  try {
    const showAll = event.queryStringParameters?.all === 'true';
    
    let result;
    if (showAll) {
      result = await dynamodb.scan({ TableName: BLOG_TABLE }).promise();
    } else {
      result = await dynamodb.scan({
        TableName: BLOG_TABLE,
        FilterExpression: '#s = :published',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':published': 'published' }
      }).promise();
    }

    const posts = result.Items
      .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))
      .map(({ content, ...rest }) => rest); // Exclude full content from listing

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
      body: JSON.stringify({ success: true, posts })
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
