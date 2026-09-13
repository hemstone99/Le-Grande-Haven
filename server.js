/**
 * Le Grande Haven — Express API server
 *
 * A thin router that mounts every serverless handler in `api/*.js`
 * as a real Express route. Runs identically to the Vercel deployment
 * (same handlers, same request/response shape) but can be hosted on
 * Render, Railway, Fly, a plain VPS, or run locally with `npm run server`.
 *
 * Routes exposed:
 *   GET  /health                     – liveness probe
 *   ANY  /api/rooms                  → api/rooms.js
 *   ANY  /api/room-images            → api/rooms.js  (alias)
 *   ANY  /api/bookings               → api/bookings.js
 *   ANY  /api/reservations           → api/reservations.js
 *   ANY  /api/food                   → api/food.js
 *   ANY  /api/drinks                 → api/drinks.js
 *   ANY  /api/gallery                → api/gallery.js
 *   ANY  /api/messages               → api/messages.js
 *   ANY  /api/staff                  → api/staff.js
 *   ANY  /api/stats                  → api/stats.js
 *   ANY  /api/upload                 → api/upload.js
 *   ANY  /api/db-wake                → api/db-wake.js
 *
 * Also serves the built frontend from `dist/` (SPA fallback to index.html).
 *
 * Usage:
 *   npm run build      # build the React app
 *   npm run server     # start the API server (default port 3000)
 *   # or
 *   PORT=8080 node server.js
 */

import express from 'express'
import cors from 'cors'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Load .env into process.env when running locally (no-op in production)
try {
  const envPath = path.join(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n#]*)"?\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
    console.log('[server] Loaded .env')
  }
} catch (e) {
  console.warn('[server] Could not read .env:', e.message)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = Number(process.env.PORT) || 3000

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  maxAge: 86400,
}))
// Handle preflight for every route
app.options('*', cors())
app.use(express.json({ limit: '10mb' })) // matches api/upload.js sizeLimit
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use((req, _res, next) => {
  const t = new Date().toISOString()
  console.log(`[${t}] ${req.method.padEnd(6)} ${req.originalUrl}`)
  next()
})

// ─── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  const configured = Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)
  )
  res.status(configured ? 200 : 503).json({ ok: configured, service: 'le-grande-haven-api', databaseConfigured: configured, time: new Date().toISOString() })
})

// ─── API routes ─────────────────────────────────────────────────────────────
// Wrap each Vercel-style default handler so it works as Express middleware.
// Vercel handlers accept (req, res); req.body is already parsed JSON — Express
// gives us the same via express.json(). We just forward them.
const wrap = (handler) => async (req, res) => {
  try {
    // Vercel handlers set CORS themselves and inspect req.method — this is
    // exactly what Express provides, so no shimming required.
    await handler(req, res)
  } catch (err) {
    console.error('[api handler error]', err)
    if (!res.headersSent) res.status(500).json({ error: err.message || 'Internal server error' })
  }
}

const mount = async (route, file) => {
  const abs = path.join(__dirname, 'api', file)
  if (!fs.existsSync(abs)) {
    console.warn(`[server] Skipping ${route} — ${file} not found`)
    return
  }
  const mod = await import(pathToFileURL(abs).href)
  const handler = mod.default
  if (typeof handler !== 'function') {
    console.warn(`[server] Skipping ${route} — ${file} has no default export`)
    return
  }
  app.all(route, wrap(handler))
  console.log(`[server] ${route.padEnd(20)} → api/${file}`)
}

// ─── Wire every serverless handler up as a route ────────────────────────────
await mount('/api/rooms',        'rooms.js')
await mount('/api/bookings',     'bookings.js')
await mount('/api/reservations', 'reservations.js')
await mount('/api/food',         'food.js')
await mount('/api/drinks',       'drinks.js')
await mount('/api/gallery',      'gallery.js')
await mount('/api/messages',     'messages.js')
await mount('/api/staff',        'staff.js')
await mount('/api/stats',        'stats.js')
await mount('/api/upload',       'upload.js')
await mount('/api/db-wake',      'db-wake.js')

// ─── 404 for unmatched /api routes  (must come BEFORE SPA fallback) ────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
})

// ─── Static frontend (production build) ─────────────────────────────────────
const distDir = path.join(__dirname, 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: '1h', index: false }))
  // SPA fallback — anything else returns index.html so client-side routing works
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
  console.log(`[server] Serving static frontend from ${distDir}`)
} else {
  console.log('[server] No dist/ directory found — API-only mode. Run `npm run build` first to serve the frontend.')
}

// ─── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[server error]', err)
  if (!res.headersSent) res.status(500).json({ error: err.message || 'Internal server error' })
})

// ─── Boot ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('')
  console.log('════════════════════════════════════════════════════════════')
  console.log(`  Le Grande Haven API server running on http://localhost:${PORT}`)
  console.log('  Health check: /health')
  console.log('  Try:          /api/rooms   /api/food   /api/drinks')
  console.log('════════════════════════════════════════════════════════════')
})
