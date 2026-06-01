const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { getAllowedOrigin } = require('../utils/cors');
const { getSecrets } = require('../utils/secrets');
const crypto = require('crypto');

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
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event), 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }, body: '' };
  }

  try {
    const user = await verifyAdmin(event);
    if (!user) {
      return { statusCode: 403, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) }, body: JSON.stringify({ success: false, message: 'Admin access required' }) };
    }

    const body = JSON.parse(event.body);
    const { title, content, excerpt, category, keywords, faq } = body;

    if (!title || !content) {
      return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) }, body: JSON.stringify({ success: false, message: 'Title and content are required' }) };
    }

    const post_id = crypto.randomUUID();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const word_count = content.split(/\s+/).length;
    const reading_time = Math.ceil(word_count / 200);

    const item = {
      post_id,
      slug,
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      author: `${user.firstName} ${user.lastName}`,
      status: 'draft',
      category: category || 'General',
      keywords: keywords || [],
      faq: faq || [],
      word_count,
      reading_time,
      created_at: new Date().toISOString(),
      published_at: null
    };

    await dynamodb.put({ TableName: BLOG_TABLE, Item: item }).promise();

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
      body: JSON.stringify({ success: true, post: item })
    };
  } catch (error) {
    console.error('Error creating blog post:', error);
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) }, body: JSON.stringify({ success: false, message: 'Server error' }) };
  }
};
