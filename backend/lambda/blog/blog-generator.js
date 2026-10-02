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

async function generateBlogPost(article, priorTitles = [], reuseCount = 0) {
  const priorTitlesBlock = priorTitles.length > 0
    ? `\nWe have ALREADY published posts with these titles. You MUST create a completely new, different headline. Do not reuse or lightly reword any of these:\n${priorTitles.map(t => `- "${t}"`).join('\n')}\n`
    : '';

  const reuseBlock = reuseCount > 0
    ? `\nNOTE: We have already written ${reuseCount} post(s) from THIS SAME source article before. Approach it from a genuinely different angle this time (for example: if a previous post covered the data and scale, focus now on solutions, a specific country, affected girls' stories, policy, or prevention). The new post must not duplicate the earlier framing, and the title must be new.\n`
    : '';

  const prompt = `You are writing a blog post for Far Too Young, Inc., a US-based 501(c)(3) nonprofit focused EXCLUSIVELY on ending child marriage globally.

Based on this research article:
Title: "${article.title}"
Source: ${article.source} (${article.published_at?.slice(0, 10)})
URL: ${article.url}
${article.excerpt ? `Summary: ${article.excerpt}` : ''}
${priorTitlesBlock}${reuseBlock}
RELEVANCE JUDGMENT (read carefully):
Far Too Young works ONLY on ending child marriage. Decide how this article relates:
- If it DIRECTLY addresses child marriage, forced marriage, girls' education, or gender-based violence against girls, write a focused post.
- If it addresses a RELATED issue that is a well-documented driver or consequence of child marriage (girls' education, gender-based violence against girls, humanitarian crises and displacement, poverty, adolescent/reproductive health, girls' rights), write a post that HONESTLY explores that genuine connection to child marriage. Use child marriage as the lens, even if the source is broader. Do NOT fabricate statistics, do NOT overstate the link, and do NOT claim the source article is about child marriage when it is not. Ground every claim in what the article actually says or in well-established research.
- ONLY if there is no honest, meaningful connection to child marriage or girls' rights (for example: unrelated geopolitics, general press-freedom or censorship stories, topics with no real tie to girls), respond with exactly: {"skip": true}

Write a focused, concise blog post (~800-1000 words) about ONE specific topic connecting this article to child marriage or girls' rights.

Structure:
1. Hook (1 short paragraph — a striking stat, question, or story)
2. The Problem (2-3 short paragraphs — what's happening, why it matters)
3. The Evidence (2-3 short paragraphs — data and findings from the article, cite the source)
4. What Can Be Done (1-2 paragraphs — solutions, Far Too Young's work on child marriage)
5. Call to Action (1 paragraph — donate, share, learn more at fartooyoung.org)

Rules:
- Create a BRAND-NEW, unique headline that has never been used before (see the list above if provided).
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
  "title": "compelling UNIQUE title, max 70 characters",
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
    // Get all research articles
    const result = await dynamodb.scan({ TableName: RESEARCH_TABLE }).promise();
    // Only approved articles are candidates (legacy rows without a status are
    // treated as usable for backward-compat). Pending articles are never used.
    let articles = result.Items.filter(a => a.status === 'approved' || !a.status);

    // Sort by use_count ascending (never-used first), then published_at
    // descending (newest news first within the same use_count). This keeps us
    // following the latest news while guaranteeing we never run dry: once every
    // article has been used once, the generator rolls to the second pass, and
    // so on. Missing use_count is treated as 0.
    articles.sort((a, b) => {
      const ucA = a.use_count || 0;
      const ucB = b.use_count || 0;
      if (ucA !== ucB) return ucA - ucB;
      return new Date(b.published_at) - new Date(a.published_at);
    });

    // Collect existing post titles so the model never repeats a headline, even
    // when it reuses the same source article on a later pass.
    const postsResult = await dynamodb.scan({ TableName: BLOG_TABLE }).promise();
    const existingTitles = postsResult.Items.map(p => p.title).filter(Boolean);
    const existingTitlesLower = new Set(existingTitles.map(t => t.toLowerCase().trim()));
    const existingSlugs = new Set(postsResult.Items.map(p => p.slug).filter(Boolean));

    if (articles.length === 0) {
      console.log('[blog-generator] No approved articles available to generate from.');
      return { statusCode: 200, headers, body: JSON.stringify({ success: false, message: 'No approved articles available' }) };
    }

    // Walk the FULL sorted list. Skip articles the model deems unrelated. Stop
    // at the first article that yields a usable, unique post.
    let post = null;
    let selected = null;
    let skipped = 0;
    let attempted = 0;

    for (const article of articles) {
      attempted++;
      const reuseCount = article.use_count || 0;
      // Titles we have already used for THIS source (for angle rotation context)
      const result2 = await generateBlogPost(article, existingTitles, reuseCount);

      if (result2.skip) {
        skipped++;
        continue; // Model says not relevant, try next
      }

      // Enforce unique title + slug. If the model returned a duplicate despite
      // instructions, append a differentiator so routing (slug-index) stays safe.
      let candidateTitle = (result2.title || '').trim();
      let candidateSlug = slugify(candidateTitle);
      if (existingTitlesLower.has(candidateTitle.toLowerCase()) || existingSlugs.has(candidateSlug)) {
        console.log(`[blog-generator] Duplicate title/slug detected for "${candidateTitle}"; differentiating.`);
        const suffix = new Date().toISOString().slice(0, 10);
        candidateTitle = `${candidateTitle} (${suffix})`.slice(0, 70);
        candidateSlug = slugify(candidateTitle);
        // If still colliding, add a short random token.
        if (existingSlugs.has(candidateSlug)) {
          candidateSlug = `${candidateSlug}-${crypto.randomBytes(2).toString('hex')}`;
        }
      }
      result2.title = candidateTitle;
      result2._slug = candidateSlug;

      post = result2;
      selected = article;
      break;
    }

    if (!post || !selected) {
      console.log(`[blog-generator] No relevant article found. approved=${articles.length}, attempted=${attempted}, skipped=${skipped}.`);
      return { statusCode: 200, headers, body: JSON.stringify({ success: false, message: 'No relevant articles found to generate from' }) };
    }

    console.log(`[blog-generator] Selected "${selected.title}" (use_count ${selected.use_count || 0} -> ${(selected.use_count || 0) + 1}) after ${skipped} skip(s).`);

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
<a href="#donate-monthly" class="donate-link" data-type="monthly" style="color:#ea580c;font-weight:600;">→ Donate Monthly</a>, sustain our programs with a recurring gift<br/>
<a href="#donate-once" class="donate-link" data-type="once" style="color:#ea580c;font-weight:600;">→ Make a One-Time Gift</a>, every dollar protects a girl's future<br/>
<a href="https://www.fartooyoung.org/what-we-do" style="color:#ea580c;font-weight:600;">→ Learn About Our Work</a>, see how we're making an impact
</p>
</div>`;

    const slug = post._slug || slugify(post.title);
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

    // Increment use_count on the article we actually generated from (real use
    // only; skips do not count). Missing counter starts at 0.
    await dynamodb.update({
      TableName: RESEARCH_TABLE,
      Key: { article_id: selected.article_id },
      UpdateExpression: 'SET use_count = if_not_exists(use_count, :zero) + :one',
      ExpressionAttributeValues: { ':zero': 0, ':one': 1 }
    }).promise();

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
