const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const https = require('https');
const { getAllowedOrigin } = require('../utils/cors');
const { getSecrets } = require('../utils/secrets');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: 'us-east-1'
});
const s3 = new AWS.S3();
const BLOG_TABLE = process.env.BLOG_TABLE;
const S3_BUCKET = process.env.S3_BUCKET;
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

async function generateSitemap() {
  try {
    const result = await dynamodb.scan({
      TableName: BLOG_TABLE,
      FilterExpression: '#s = :published',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':published': 'published' }
    }).promise();

    const staticPages = [
      { loc: '/', priority: '1.0' },
      { loc: '/founder-team', priority: '0.8' },
      { loc: '/partners', priority: '0.8' },
      { loc: '/what-we-do', priority: '0.9' },
      { loc: '/blog', priority: '0.8' }
    ];

    const blogPages = result.Items.map(post => ({
      loc: `/blog/${post.slug}`,
      priority: '0.7',
      lastmod: post.published_at?.slice(0, 10)
    }));

    const allPages = [...staticPages, ...blogPages];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>https://www.fartooyoung.org${p.loc}</loc>
    <priority>${p.priority}</priority>${p.lastmod ? `\n    <lastmod>${p.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    await s3.putObject({
      Bucket: S3_BUCKET,
      Key: 'sitemap.xml',
      Body: xml,
      ContentType: 'application/xml'
    }).promise();

    console.log(`Sitemap updated: ${allPages.length} URLs`);
  } catch (err) {
    console.error('Sitemap generation error:', err.message);
  }
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

    // Ping IndexNow (production only, non-blocking)
    if (slug && SITE_URL.includes('www.fartooyoung.org')) {
      await pingIndexNow(`${SITE_URL}/blog/${slug}`);
    }

    // Regenerate sitemap with new post
    await generateSitemap();

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
