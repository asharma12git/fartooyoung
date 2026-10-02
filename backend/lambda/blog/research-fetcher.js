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
  { name: 'UNFPA', tier: 1, url: 'https://www.unfpa.org/rss.xml' },
  { name: 'WHO', tier: 1, url: 'https://www.who.int/rss-feeds/news-english.xml' },
  { name: 'UN News', tier: 1, url: 'https://news.un.org/feed/subscribe/en/news/topic/women/feed/rss.xml' },
  // Tier 3 - NGOs
  { name: 'Human Rights Watch', tier: 3, url: 'https://www.hrw.org/rss/news' },
  // Removed 2026-10: UNICEF feed (https://www.unicef.org/press-releases/rss.xml)
  // returns 404 (UNICEF no longer publishes a public RSS feed), and the
  // Population Council feed (https://www.popcouncil.org/feed/) returns 0 items.
  // Both were silently contributing nothing. UNICEF/Save the Children/Plan
  // content can be recovered via the ReliefWeb API path below once enabled.
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

// POST a JSON body and return the parsed JSON response (used by ReliefWeb API).
function postJson(url, bodyObj) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(bodyObj);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      timeout: 15000,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), 'User-Agent': 'FarTooYoung-Research-Bot/1.0' }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ statusCode: res.statusCode, json: JSON.parse(body) }); }
        catch (e) { reject(new Error(`Bad JSON from ${url}: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(data);
    req.end();
  });
}

// Save a new article if its URL is not already in the table. Returns one of
// 'new' | 'skipped'. Keeps RSS and ReliefWeb ingestion consistent.
async function saveArticle({ title, source, tier, url, excerpt, published_at }) {
  const existing = await dynamodb.scan({
    TableName: RESEARCH_TABLE,
    FilterExpression: '#u = :url',
    ExpressionAttributeNames: { '#u': 'url' },
    ExpressionAttributeValues: { ':url': url }
  }).promise();
  if (existing.Items.length > 0) return 'skipped';

  await dynamodb.put({
    TableName: RESEARCH_TABLE,
    Item: {
      article_id: crypto.randomUUID(),
      title: (title || '').substring(0, 500),
      source,
      tier,
      url,
      excerpt: (excerpt || '').replace(/<[^>]*>/g, '').substring(0, 500),
      published_at: published_at ? new Date(published_at).toISOString() : new Date().toISOString(),
      fetched_at: new Date().toISOString(),
    }
  }).promise();
  return 'new';
}

// ReliefWeb API v2 ingestion. DORMANT until RELIEFWEB_APPNAME is set in the
// environment (approved appname from https://apidoc.reliefweb.int). ReliefWeb is
// a UN OCHA service (CC-BY 4.0) that aggregates vetted humanitarian reporting
// from UNICEF, UNFPA, Save the Children, Plan, IRC and others, recovering
// sources whose own RSS feeds are dead. When unset, this is skipped entirely.
async function fetchReliefWeb(results) {
  const appname = process.env.RELIEFWEB_APPNAME;
  if (!appname) {
    console.log('[research-fetcher] ReliefWeb skipped: RELIEFWEB_APPNAME not set (dormant).');
    return;
  }
  try {
    const url = `https://api.reliefweb.int/v2/reports?appname=${encodeURIComponent(appname)}`;
    const query = {
      query: { value: '"child marriage" OR "child bride" OR "forced marriage" OR "early marriage"', fields: ['title', 'body'] },
      preset: 'latest',
      limit: 25,
      fields: { include: ['title', 'source.shortname', 'date.created', 'url_alias', 'url'] }
    };
    const { statusCode, json } = await postJson(url, query);
    if (statusCode !== 200 || !json || !Array.isArray(json.data)) {
      results.errors.push({ source: 'ReliefWeb', error: `HTTP ${statusCode}: ${json && json.error ? JSON.stringify(json.error) : 'unexpected response'}` });
      console.log(`[research-fetcher] ReliefWeb error: HTTP ${statusCode}`);
      return;
    }
    let rwNew = 0;
    for (const r of json.data) {
      const f = r.fields || {};
      const link = f.url_alias || f.url || (r.href || '');
      if (!link) continue;
      const title = f.title || '';
      // ReliefWeb query already restricts to child-marriage terms, but keep the
      // keyword guard for consistency with the RSS path.
      if (!matchesKeywords(title)) continue;
      const srcName = (f.source && f.source[0] && f.source[0].shortname) ? `ReliefWeb/${f.source[0].shortname}` : 'ReliefWeb';
      const status = await saveArticle({
        title, source: srcName, tier: 1, url: link,
        excerpt: '', published_at: f.date && f.date.created ? f.date.created : null
      });
      results.fetched++;
      if (status === 'new') { results.new++; rwNew++; } else { results.skipped++; }
    }
    console.log(`[research-fetcher] ReliefWeb: ${json.data.length} reports scanned, ${rwNew} new.`);
  } catch (err) {
    results.errors.push({ source: 'ReliefWeb', error: err.message });
    console.log(`[research-fetcher] ReliefWeb exception: ${err.message}`);
  }
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

      if (!items || items.length === 0) {
        console.log(`[research-fetcher] ${source.name}: feed returned 0 items (possibly dead or empty).`);
      }

      for (const item of items) {
        const searchText = `${item.title} ${item.description}`;
        if (!matchesKeywords(searchText)) continue;

        results.fetched++;
        const status = await saveArticle({
          title: item.title,
          source: source.name,
          tier: source.tier,
          url: item.link,
          excerpt: item.description,
          published_at: item.date || null
        });
        if (status === 'new') results.new++; else results.skipped++;
      }
    } catch (err) {
      results.errors.push({ source: source.name, error: err.message });
      console.log(`[research-fetcher] ${source.name}: fetch failed (${err.message}).`);
    }
  }

  // ReliefWeb API path (dormant unless RELIEFWEB_APPNAME is configured).
  await fetchReliefWeb(results);

  console.log('Research fetch results:', JSON.stringify(results));

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': event.headers ? getAllowedOrigin(event) : '*' },
    body: JSON.stringify({ success: true, ...results })
  };
};
