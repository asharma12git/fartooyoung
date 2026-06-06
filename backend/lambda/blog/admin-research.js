const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const { getAllowedOrigin } = require('../utils/cors');
const { getSecrets } = require('../utils/secrets');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 10000, headers: { 'User-Agent': 'FarTooYoung-Admin/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        return fetchUrl(loc).then(resolve).catch(reject);
      }
      if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}`));
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: 'us-east-1'
});
const RESEARCH_TABLE = process.env.RESEARCH_TABLE;
const TIERS_TABLE = process.env.TIERS_TABLE;

async function verifyAdmin(event) {
  const token = event.headers.Authorization?.replace('Bearer ', '');
  if (!token) return null;
  const secrets = await getSecrets();
  const decoded = jwt.verify(token, secrets.JWT_SECRET);
  if (decoded.role !== 'admin') return null;
  return decoded;
}

exports.handler = async (event) => {
  const origin = getAllowedOrigin(event);
  const headers = { 'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json' };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { ...headers, 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }, body: '' };
  }

  try {
    const user = await verifyAdmin(event);
    if (!user) {
      return { statusCode: 403, headers, body: JSON.stringify({ message: 'Admin access required' }) };
    }

    const method = event.httpMethod;
    const id = event.pathParameters?.id;
    const path = event.resource || '';

    // GET /admin/tiers - fetch tier descriptions
    if (method === 'GET' && path.includes('/tiers')) {
      const result = await dynamodb.scan({ TableName: TIERS_TABLE }).promise();
      const tiers = result.Items.sort((a, b) => a.tier_id - b.tier_id);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, tiers }) };
    }

    // GET - all articles (no status filter, for admin view)
    if (method === 'GET' && !id) {
      const result = await dynamodb.scan({ TableName: RESEARCH_TABLE }).promise();
      const articles = result.Items.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, articles }) };
    }

    // POST - manually add article
    // POST - manually add article (validates URL + extracts title)
    if (method === 'POST') {
      const body = JSON.parse(event.body);
      if (!body.source || !body.url) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'source and url required' }) };
      }

      // Fetch URL and extract title
      let title = body.title || '';
      try {
        const pageContent = await fetchUrl(body.url);
        const titleMatch = pageContent.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) title = titleMatch[1].trim();
        if (!title) title = `${body.source} Article`;
      } catch (err) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: `Could not reach URL: ${err.message}` }) };
      }

      // Check for duplicates
      const existing = await dynamodb.scan({
        TableName: RESEARCH_TABLE,
        FilterExpression: '#u = :url',
        ExpressionAttributeNames: { '#u': 'url' },
        ExpressionAttributeValues: { ':url': body.url }
      }).promise();
      if (existing.Items.length > 0) {
        return { statusCode: 409, headers, body: JSON.stringify({ message: 'This URL already exists in the database' }) };
      }

      const item = {
        article_id: crypto.randomUUID(),
        title,
        source: body.source,
        url: body.url,
        tier: body.tier || 4,
        published_at: body.published_at || new Date().toISOString(),
        fetched_at: new Date().toISOString(),
        status: 'approved',
        starred: false
      };
      await dynamodb.put({ TableName: RESEARCH_TABLE, Item: item }).promise();
      return { statusCode: 201, headers, body: JSON.stringify({ success: true, article: item }) };
    }

    // PUT - update status/starred
    if (method === 'PUT' && id) {
      const body = JSON.parse(event.body);
      const updates = [];
      const names = {};
      const values = {};

      if (body.status !== undefined) {
        updates.push('#s = :s');
        names['#s'] = 'status';
        values[':s'] = body.status;
      }
      if (body.starred !== undefined) {
        updates.push('#st = :st');
        names['#st'] = 'starred';
        values[':st'] = body.starred;
      }

      if (updates.length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Nothing to update' }) };
      }

      await dynamodb.update({
        TableName: RESEARCH_TABLE,
        Key: { article_id: id },
        UpdateExpression: 'SET ' + updates.join(', '),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values
      }).promise();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // DELETE
    if (method === 'DELETE' && id) {
      await dynamodb.delete({ TableName: RESEARCH_TABLE, Key: { article_id: id } }).promise();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Not found' }) };
  } catch (error) {
    console.error('Admin research error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Server error' }) };
  }
};
