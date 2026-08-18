const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const https = require('https');
const { getAllowedOrigin } = require('../utils/cors');
const { getSecrets } = require('../utils/secrets');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: 'us-east-1'
});
const BLOG_TABLE = process.env.BLOG_TABLE;
const INDEXNOW_KEY = '8e03c8f815294be0ad691a4a71419c9d';
const SITE_URL = process.env.FRONTEND_URL || 'https://www.fartooyoung.org';

function pingIndexNow(url) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      host: 'www.fartooyoung.org',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: [url]
    });
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length }
    }, (res) => {
      console.log(`IndexNow response: ${res.statusCode}`);
      resolve(res.statusCode);
    });
    req.on('error', (err) => { console.error('IndexNow error:', err.message); resolve(null); });
    req.write(payload);
    req.end();
  });
}

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
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event), 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }, body: '' };
  }

  try {
    const user = await verifyAdmin(event);
    if (!user) {
      return { statusCode: 403, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) }, body: JSON.stringify({ success: false, message: 'Admin access required' }) };
    }

    const post_id = event.pathParameters.id;

    // Get the post slug for URL
    const post = await dynamodb.get({ TableName: BLOG_TABLE, Key: { post_id } }).promise();
    const slug = post.Item?.slug;

    await dynamodb.update({
      TableName: BLOG_TABLE,
      Key: { post_id },
      UpdateExpression: 'SET #s = :status, published_at = :now',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':status': 'published', ':now': new Date().toISOString() }
    }).promise();

    // Ping IndexNow (non-blocking, don't fail if it errors)
    if (slug) {
      await pingIndexNow(`${SITE_URL}/blog/${slug}`);
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
      body: JSON.stringify({ success: true, message: 'Post published' })
    };
  } catch (error) {
    console.error('Error publishing blog post:', error);
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) }, body: JSON.stringify({ success: false, message: 'Server error' }) };
  }
};
