const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getAllowedOrigin } = require('../utils/cors');
const { getSecrets } = require('../utils/secrets');

const s3 = new AWS.S3();
const BUCKET = process.env.S3_BUCKET;

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
    return { statusCode: 200, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }, body: '' };
  }

  try {
    const user = await verifyAdmin(event);
    if (!user) {
      return { statusCode: 403, headers, body: JSON.stringify({ message: 'Admin access required' }) };
    }

    const body = JSON.parse(event.body);
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'fileName and contentType required' }) };
    }

    const ext = fileName.split('.').pop();
    const key = `blog/images/${crypto.randomUUID()}.${ext}`;

    const presignedUrl = s3.getSignedUrl('putObject', {
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      Expires: 300
    });

    const publicUrl = `https://${BUCKET}.s3.amazonaws.com/${key}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, uploadUrl: presignedUrl, publicUrl, key })
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Server error' }) };
  }
};
