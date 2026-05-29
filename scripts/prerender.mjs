import puppeteer from 'puppeteer'
import { createServer } from 'http'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '../dist')

const routes = ['/', '/founder-team', '/partners', '/what-we-do']

// Simple static file server for the built dist
function startServer() {
  const server = createServer((req, res) => {
    let filePath = resolve(distDir, req.url === '/' ? 'index.html' : req.url.slice(1))
    try {
      const content = readFileSync(filePath)
      const ext = filePath.split('.').pop()
      const types = { html: 'text/html', js: 'application/javascript', css: 'text/css', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml', woff2: 'font/woff2' }
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' })
      res.end(content)
    } catch {
      // SPA fallback — serve index.html for all routes
      const html = readFileSync(resolve(distDir, 'index.html'))
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
    }
  })
  return new Promise(r => server.listen(4567, () => r(server)))
}

async function prerender() {
  console.log('🔄 Pre-rendering public routes...')
  const server = await startServer()
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })

  for (const route of routes) {
    const page = await browser.newPage()
    await page.goto(`http://localhost:4567${route}`, { waitUntil: 'networkidle0', timeout: 15000 })

    // Wait a bit for React to render
    await page.waitForSelector('#root > *', { timeout: 5000 })

    const html = await page.content()

    // Write to dist/route/index.html
    const outDir = route === '/' ? distDir : resolve(distDir, route.slice(1))
    mkdirSync(outDir, { recursive: true })
    writeFileSync(resolve(outDir, 'index.html'), html)
    console.log(`  ✅ ${route}`)

    await page.close()
  }

  await browser.close()
  server.close()
  console.log('✅ Pre-rendering complete!')
}

prerender().catch(err => {
  console.error('❌ Pre-rendering failed:', err)
  process.exit(1)
})
