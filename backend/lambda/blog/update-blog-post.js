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
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event), 'Access-Control-Allow-Methods': 'PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }, body: '' };
  }

  try {
    const user = await verifyAdmin(event);
    if (!user) {
      return { statusCode: 403, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) }, body: JSON.stringify({ success: false, message: 'Admin access required' }) };
    }

    const post_id = event.pathParameters.id;
    const body = JSON.parse(event.body);
    const { title, content, excerpt, category, keywords, faq } = body;

    const updateParts = [];
    const values = {};
    const names = {};

    if (title) { updateParts.push('#t = :title'); values[':title'] = title; names['#t'] = 'title'; }
    if (content) {
      updateParts.push('#c = :content, word_count = :wc, reading_time = :rt');
      values[':content'] = content;
      values[':wc'] = content.split(/\s+/).length;
      values[':rt'] = Math.ceil(content.split(/\s+/).length / 200);
      names['#c'] = 'content';
    }
    if (excerpt) { updateParts.push('excerpt = :excerpt'); values[':excerpt'] = excerpt; }
    if (category) { updateParts.push('category = :category'); values[':category'] = category; }
    if (keywords) { updateParts.push('keywords = :keywords'); values[':keywords'] = keywords; }
    if (faq) { updateParts.push('faq = :faq'); values[':faq'] = faq; }

    if (updateParts.length === 0) {
      return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) }, body: JSON.stringify({ success: false, message: 'No fields to update' }) };
    }

    await dynamodb.update({
      TableName: BLOG_TABLE,
      Key: { post_id },
      UpdateExpression: 'SET ' + updateParts.join(', '),
      ExpressionAttributeValues: values,
      ...(Object.keys(names).length > 0 && { ExpressionAttributeNames: names })
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) },
      body: JSON.stringify({ success: true, message: 'Post updated' })
    };
  } catch (error) {
    console.error('Error updating blog post:', error);
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event) }, body: JSON.stringify({ success: false, message: 'Server error' }) };
  }
};
