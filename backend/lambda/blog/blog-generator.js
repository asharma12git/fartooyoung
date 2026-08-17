const AWS = require('aws-sdk');
const crypto = require('crypto');
const { getAllowedOrigin } = require('../utils/cors');
const { getSecrets } = require('../utils/secrets');
const jwt = require('jsonwebtoken');

const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const bedrock = new AWS.BedrockRuntime({ region: 'us-east-1' });
const s3 = new AWS.S3();

const RESEARCH_TABLE = process.env.RESEARCH_TABLE;
const BLOG_TABLE = process.env.BLOG_TABLE;
const S3_BUCKET = process.env.S3_BUCKET;

const CATEGORIES = ['Education', 'Health', 'Norms & Culture', 'Policy & Justice', 'Research', 'Climate & Crisis'];

async function verifyAdmin(event) {
  const token = event.headers?.Authorization?.replace('Bearer ', '');
  if (!token) return null;
  const secrets = await getSecrets();
  const decoded = jwt.verify(token, secrets.JWT_SECRET);
  if (decoded.role !== 'admin') return null;
  return decoded;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 80);
}

function pickCategory(title, excerpt) {
  const text = `${title} ${excerpt}`.toLowerCase();
  if (text.includes('education') || text.includes('school') || text.includes('scholarship')) return 'Education';
  if (text.includes('health') || text.includes('pregnan') || text.includes('maternal') || text.includes('hiv')) return 'Health';
  if (text.includes('climate') || text.includes('flood') || text.includes('disaster')) return 'Climate & Crisis';
  if (text.includes('policy') || text.includes('law') || text.includes('legislation') || text.includes('justice')) return 'Policy & Justice';
  if (text.includes('norms') || text.includes('culture') || text.includes('gender') || text.includes('communit')) return 'Norms & Culture';
  return 'Research';
}

async function generateBlogPost(article) {
  const prompt = `You are writing a blog post for Far Too Young, Inc., a US-based 501(c)(3) nonprofit focused EXCLUSIVELY on ending child marriage globally.

Based on this research article:
Title: "${article.title}"
Source: ${article.source} (${article.published_at?.slice(0, 10)})
URL: ${article.url}
${article.excerpt ? `Summary: ${article.excerpt}` : ''}

IMPORTANT: If this article is NOT about child marriage, forced marriage, girls' education, or gender-based violence against girls — respond with exactly: {"skip": true}

Write a focused, concise blog post (~800-1000 words) about ONE specific topic from this article related to child marriage or girls' rights.

Structure:
1. Hook (1 short paragraph — a striking stat, question, or story)
2. The Problem (2-3 short paragraphs — what's happening, why it matters)
3. The Evidence (2-3 short paragraphs — data and findings from the article, cite the source)
4. What Can Be Done (1-2 paragraphs — solutions, Far Too Young's work on child marriage)
5. Call to Action (1 paragraph — donate, share, learn more at fartooyoung.org)

Rules:
- Keep paragraphs SHORT (2-4 sentences max)
- Use clear H2 headings for each section
- Cite the source with a hyperlink
- Be concise and direct — no filler
- Tone: authoritative, compassionate, urgent
- Do NOT mix multiple unrelated topics
- ONLY discuss child marriage, forced marriage, or girls' rights
- Far Too Young ONLY works on ending child marriage — do not claim we work on other causes
- Do NOT use em dashes (—) or en dashes (–). Use commas, periods, or rewrite the sentence instead.
- Write naturally like a human journalist. Avoid repetitive sentence structures.
- Vary sentence length. Mix short punchy sentences with longer ones.

Provide as JSON:
{
  "title": "compelling title, max 70 characters",
  "excerpt": "2 sentences for blog listing",
  "content": "HTML with <h2>, <p>, <strong>, <a href> tags only",
  "category": "one of: Education, Health, Norms & Culture, Policy & Justice, Research, Climate & Crisis",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Return ONLY valid JSON.`;

  const response = await bedrock.invokeModel({
    modelId: 'us.anthropic.claude-sonnet-4-6',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })
  }).promise();

  const result = JSON.parse(response.body.toString());
  const text = result.content[0].text;
  
  // Parse JSON from response (handle potential markdown wrapping)
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
}

async function generateImage(title) {
  try {
    const prompt = `Professional editorial photograph for a nonprofit blog article about "${title}". Warm lighting, documentary style, showing hope and resilience. No text or watermarks. Suitable for a serious advocacy organization.`;

    const response = await bedrock.invokeModel({
      modelId: 'amazon.nova-canvas-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        taskType: 'TEXT_IMAGE',
        textToImageParams: {
          text: prompt,
          negativeText: 'blurry, low quality, text, watermark, logo, cartoon, anime'
        },
        imageGenerationConfig: {
          numberOfImages: 1,
          width: 1024,
          height: 576,
          cfgScale: 7.0
        }
      })
    }).promise();

    const result = JSON.parse(response.body.toString());
    const imageData = Buffer.from(result.images[0], 'base64');

    // Upload to S3
    const key = `blog/images/${crypto.randomUUID()}.png`;
    await s3.putObject({
      Bucket: S3_BUCKET,
      Key: key,
      Body: imageData,
      ContentType: 'image/png'
    }).promise();

    return `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
  } catch (err) {
    console.error('Image generation failed:', err.message);
    return ''; // Fallback: no image
  }
}

exports.handler = async (event) => {
  const origin = getAllowedOrigin(event);
  const headers = { 'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json' };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }, body: '' };
  }

  // If triggered via API, verify admin. If triggered via EventBridge, skip auth.
  if (event.httpMethod) {
    const user = await verifyAdmin(event);
    if (!user) {
      return { statusCode: 403, headers, body: JSON.stringify({ message: 'Admin access required' }) };
    }
  }

  try {
    // Get approved articles sorted by newest
    const result = await dynamodb.scan({ TableName: RESEARCH_TABLE }).promise();
    let articles = result.Items.filter(a => a.status === 'approved' || !a.status);
    articles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    // Get already-used article URLs from existing blog posts
    const postsResult = await dynamodb.scan({ TableName: BLOG_TABLE }).promise();
    const usedUrls = new Set();
    postsResult.Items.forEach(p => {
      if (p.source_articles) p.source_articles.forEach(sa => usedUrls.add(sa.url));
    });

    // Pick first unused article, skip irrelevant ones
    const unusedArticles = articles.filter(a => !usedUrls.has(a.url));
    const articlesToTry = unusedArticles.length > 0 ? unusedArticles : [articles[articles.length - 1]];

    let post = null;
    let selected = null;

    for (const article of articlesToTry.slice(0, 5)) {
      const result2 = await generateBlogPost(article);
      if (result2.skip) continue; // AI says not relevant, try next
      post = result2;
      selected = article;
      break;
    }

    if (!post || !selected) {
      return { statusCode: 200, headers, body: JSON.stringify({ success: false, message: 'No relevant articles found to generate from' }) };
    }

    // Generate hero image
    const imageUrl = await generateImage(post.title);

    // Determine category (AI picks it, fallback to keyword matching)
    const category = post.category || pickCategory(post.title, post.excerpt);

    // Save as draft
    const postId = crypto.randomUUID();
    // Fixed CTA block appended to every post
    const ctaBlock = `
<div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid #e5e7eb;">
<h2>Take Action</h2>
<p>Your support helps end child marriage. Here's how you can make a difference:</p>
<p>
<a href="#donate-monthly" class="donate-link" data-type="monthly" style="color:#ea580c;font-weight:600;">→ Donate Monthly</a> — Sustain our programs with a recurring gift<br/>
<a href="#donate-once" class="donate-link" data-type="once" style="color:#ea580c;font-weight:600;">→ Make a One-Time Gift</a> — Every dollar protects a girl's future<br/>
<a href="https://www.fartooyoung.org/what-we-do" style="color:#ea580c;font-weight:600;">→ Learn About Our Work</a> — See how we're making an impact
</p>
</div>`;

    const slug = slugify(post.title);
    // Calculate reading time (words ÷ 200)
    const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const item = {
      post_id: postId,
      slug,
      title: post.title,
      content: post.content + ctaBlock,
      excerpt: post.excerpt,
      category,
      keywords: post.keywords || [],
      author: 'Far Too Young, Inc.',
      image_url: imageUrl,
      status: 'draft',
      created_at: new Date().toISOString(),
      reading_time: readingTime,
      word_count: wordCount,
      source_articles: [{ title: selected.title, url: selected.url, source: selected.source }]
    };

    await dynamodb.put({ TableName: BLOG_TABLE, Item: item }).promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ success: true, post: { post_id: postId, title: post.title, slug, category, status: 'draft' } })
    };
  } catch (error) {
    console.error('Blog generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: error.message })
    };
  }
};
