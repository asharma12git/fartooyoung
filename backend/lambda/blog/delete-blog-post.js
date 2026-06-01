const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { getAllowedOrigin } = require('../utils/cors');
const { getSecrets } = require('../utils/secrets');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: 'us-east-1'
});
const BLOG_TABLE = process.env.BLOG_TABLE;

async function verifyAdmin(event) {
  const token = event.headers.Authorization?.replace('Bearer ', '');
  if (!token) return null;
  const secrets = await getSecrets();
  const decoded = jwt.verify(token, secrets.JWT_SECRET);
  if (decoded.role !== 'admin') return null;
  return decoded;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event), 'Access-Control-Allow-Methods': 'DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }, body: '' };
  }

  try {
    const user = await verifyAdmin(event);
    if (!user) {
      return { statusCode: 403, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) }, body: JSON.stringify({ success: false, message: 'Admin access required' }) };
    }

    const post_id = event.pathParameters.id;

    await dynamodb.delete({ TableName: BLOG_TABLE, Key: { post_id } }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
      body: JSON.stringify({ success: true, message: 'Post deleted' })
    };
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) }, body: JSON.stringify({ success: false, message: 'Server error' }) };
  }
};
