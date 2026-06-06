const AWS = require('aws-sdk');
const https = require('https');
const http = require('http');
const { parseString } = require('xml2js');
const crypto = require('crypto');
const { getAllowedOrigin } = require('../utils/cors');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: 'us-east-1'
});
const RESEARCH_TABLE = process.env.RESEARCH_TABLE;

// RSS sources with keywords filter
const RSS_SOURCES = [
  // Tier 1 - UN Agencies
  { name: 'UNICEF', tier: 1, url: 'https://www.unicef.org/press-releases/rss.xml' },
  { name: 'WHO', tier: 1, url: 'https://www.who.int/rss-feeds/news-english.xml' },
  { name: 'UN News', tier: 1, url: 'https://news.un.org/feed/subscribe/en/news/topic/women/feed/rss.xml' },
  // Tier 3 - NGOs
  { name: 'Human Rights Watch', tier: 3, url: 'https://www.hrw.org/rss/news' },
  { name: 'Population Council', tier: 3, url: 'https://www.popcouncil.org/feed/' },
];

const KEYWORDS = ['child marriage', 'child bride', 'forced marriage', 'early marriage', 'gender-based violence', 'gbv', 'girls education', 'adolescent girls', 'underage marriage'];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 10000, headers: { 'User-Agent': 'FarTooYoung-Research-Bot/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function parseRSS(xml) {
  return new Promise((resolve, reject) => {
    parseString(xml, { trim: true, strict: false, normalizeTags: true }, (err, result) => {
      if (err) return reject(err);
      const items = [];
      // Handle RSS 2.0
      const channel = result?.rss?.channel?.[0] || result?.RSS?.CHANNEL?.[0];
      if (channel?.item || channel?.ITEM) {
        for (const item of (channel.item || channel.ITEM)) {
          items.push({
            title: (item.title?.[0] || item.TITLE?.[0] || '').toString(),
            link: (item.link?.[0] || item.LINK?.[0] || '').toString(),
            description: (item.description?.[0] || item.DESCRIPTION?.[0] || '').toString(),
            date: (item.pubdate?.[0] || item.PUBDATE?.[0] || item['dc:date']?.[0] || '').toString(),
          });
        }
      }
      // Handle Atom
      const feed = result?.feed || result?.FEED;
      if (feed?.entry || feed?.ENTRY) {
        for (const entry of (feed.entry || feed.ENTRY)) {
          items.push({
            title: (entry.title?.[0]?._ || entry.title?.[0] || '').toString(),
            link: (entry.link?.[0]?.$ ?.href || entry.link?.[0] || '').toString(),
            description: (entry.summary?.[0]?._ || entry.summary?.[0] || entry.content?.[0]?._ || '').toString(),
            date: (entry.published?.[0] || entry.updated?.[0] || '').toString(),
          });
        }
      }
      resolve(items);
    });
  });
}

function matchesKeywords(text) {
  const lower = text.toLowerCase();
  return KEYWORDS.some(kw => lower.includes(kw));
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': getAllowedOrigin(event), 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }, body: '' };
  }

  const results = { fetched: 0, new: 0, skipped: 0, errors: [] };

  for (const source of RSS_SOURCES) {
    try {
      const xml = await fetchUrl(source.url);
      const items = await parseRSS(xml);

      for (const item of items) {
        const searchText = `${item.title} ${item.description}`;
        if (!matchesKeywords(searchText)) continue;

        results.fetched++;

        // Check if URL already exists
        const existing = await dynamodb.scan({
          TableName: RESEARCH_TABLE,
          FilterExpression: '#u = :url',
          ExpressionAttributeNames: { '#u': 'url' },
          ExpressionAttributeValues: { ':url': item.link },
          Limit: 1
        }).promise();

        if (existing.Items.length > 0) {
          results.skipped++;
          continue;
        }

        // Save new article
        await dynamodb.put({
          TableName: RESEARCH_TABLE,
          Item: {
            article_id: crypto.randomUUID(),
            title: item.title.substring(0, 500),
            source: source.name,
            tier: source.tier,
            url: item.link,
            excerpt: item.description.replace(/<[^>]*>/g, '').substring(0, 500),
            published_at: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
            fetched_at: new Date().toISOString(),
          }
        }).promise();

        results.new++;
      }
    } catch (err) {
      results.errors.push({ source: source.name, error: err.message });
    }
  }

  console.log('Research fetch results:', JSON.stringify(results));

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': event.headers ? getAllowedOrigin(event) : '*' },
    body: JSON.stringify({ success: true, ...results })
  };
};
