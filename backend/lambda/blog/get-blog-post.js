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
    const slug = event.pathParameters.slug;

    const result = await dynamodb.query({
      TableName: BLOG_TABLE,
      IndexName: 'slug-index',
      KeyConditionExpression: 'slug = :slug',
      ExpressionAttributeValues: { ':slug': slug }
    }).promise();

    const post = result.Items[0];
    if (!post) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
        body: JSON.stringify({ success: false, message: 'Post not found' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
      body: JSON.stringify({ success: true, post })
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
      body: JSON.stringify({ success: false, message: 'Server error' })
    };
  }
};
