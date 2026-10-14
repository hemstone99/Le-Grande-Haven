/**
 * Le Grande Haven — Express server (API + built frontend)
 *
 * Mounts every handler in `api/*.js` as an Express route, backed by MySQL.
 * Runs under cPanel's "Setup Node.js App" (Phusion Passenger) in production
 * and with `npm run server` locally.
 *
 * Routes exposed (🔒 = admin session required):
 *   GET  /health                     – liveness + database probe
 *   ANY  /api/auth/:action           → api/auth.js     (login, logout, me, password)
 *   ANY  /api/rooms                  → api/rooms.js        GET public, 🔒 writes
 *   ANY  /api/food                   → api/food.js         GET public, 🔒 writes
 *   ANY  /api/drinks                 → api/drinks.js       GET public, 🔒 writes
 *   ANY  /api/gallery                → api/gallery.js      GET public, 🔒 writes
 *   ANY  /api/bookings               → api/bookings.js     POST public, 🔒 rest
 *   ANY  /api/reservations           → api/reservations.js POST public, 🔒 rest
 *   ANY  /api/messages               → api/messages.js     POST public, 🔒 rest
 *   ANY  /api/staff                  → api/staff.js        🔒
 *   ANY  /api/stats                  → api/stats.js        🔒
 *   ANY  /api/upload                 → api/upload.js       🔒
 *   GET  /uploads/*                  – admin-uploaded images
 *
 * Also serves the built frontend from `dist/` (SPA fallback to index.html).
 *
 * Usage:
 *   npm run build      # build the React app
 *   npm run server     # start the server (default port 3000)
 */

import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Load .env into process.env when present (cPanel sets real env vars instead)
try {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '.env')
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
    console.log('[server] Loaded .env')
  }
} catch (e) {
  console.warn('[server] Could not read .env:', e.message)
}

// Imported after .env is loaded so the DB pool sees the credentials
const { initDatabase, query } = await import('./api/db.js')
const { default: authHandler, requireAdmin, ensureAdminUser } = await import('./api/auth.js')
const { UPLOAD_DIR } = await import('./api/upload.js')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = Number(process.env.PORT) || 3000

// ─── Middleware ─────────────────────────────────────────────────────────────
app.set('trust proxy', 1) // behind LiteSpeed/Passenger: real client IP + https detection
app.disable('x-powered-by')
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})
app.use(express.json({ limit: '12mb' })) // base64 image uploads up to 8 MB
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/')) console.log(`[${new Date().toISOString()}] ${req.method.padEnd(6)} ${req.originalUrl}`)
  next()
})

// ─── Health check ───────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await query('SELECT 1')
    res.json({ ok: true, service: 'le-grande-haven', database: 'up', time: new Date().toISOString() })
  } catch (err) {
    res.status(503).json({ ok: false, service: 'le-grande-haven', database: 'down', error: err.code || err.message })
  }
})

// ─── API routes ─────────────────────────────────────────────────────────────
const wrap = (handler) => async (req, res) => {
  try {
    await handler(req, res)
  } catch (err) {
    console.error('[api handler error]', err)
    if (!res.headersSent) res.status(500).json({ error: err.message || 'Internal server error' })
  }
}

// Methods listed in `publicMethods` are open to site visitors; every other
// method on the route requires an admin session.
const mount = async (route, file, publicMethods = []) => {
  const mod = await import(pathToFileURL(path.join(__dirname, 'api', file)).href)
  const guard = (req, res, next) => (publicMethods.includes(req.method) ? next() : requireAdmin(req, res, next))
  app.all(route, guard, wrap(mod.default))
}

app.all('/api/auth/:action', wrap(authHandler))
await mount('/api/rooms',        'rooms.js',        ['GET'])
await mount('/api/food',         'food.js',         ['GET'])
await mount('/api/drinks',       'drinks.js',       ['GET'])
await mount('/api/gallery',      'gallery.js',      ['GET'])
await mount('/api/bookings',     'bookings.js',     ['POST'])
await mount('/api/reservations', 'reservations.js', ['POST'])
await mount('/api/messages',     'messages.js',     ['POST'])
await mount('/api/staff',        'staff.js')
await mount('/api/stats',        'stats.js')
await mount('/api/upload',       'upload.js')

// ─── 404 for unmatched /api routes  (must come BEFORE SPA fallback) ────────
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
})

// ─── Uploaded images ────────────────────────────────────────────────────────
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', fallthrough: false }))

// ─── Static frontend (production build) ─────────────────────────────────────
const distDir = path.join(__dirname, 'dist')
if (fs.existsSync(distDir)) {
  // Vite's hashed bundles never change — cache them for a year
  app.use('/assets', express.static(path.join(distDir, 'assets'), { maxAge: '1y', immutable: true }))
  // redirect: false — /food, /drinks and /rooms are both pages and image folders;
  // without it express answers the page URL with a 301 to "/food/"
  app.use(express.static(distDir, { maxAge: '7d', index: false, redirect: false }))
  // SPA fallback — anything else returns index.html so client-side routing works
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(path.join(distDir, 'index.html'))
  })
  console.log(`[server] Serving static frontend from ${distDir}`)
} else {
  console.log('[server] No dist/ directory found — API-only mode. Run `npm run build` first to serve the frontend.')
}

// ─── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  if (err.status === 404 || err.statusCode === 404) return res.status(404).end()
  console.error('[server error]', err)
  if (!res.headersSent) res.status(err.status || 500).json({ error: err.expose ? err.message : 'Internal server error' })
})

// ─── Boot ───────────────────────────────────────────────────────────────────
try {
  await initDatabase()
  await ensureAdminUser()
  console.log('[server] Database ready')
} catch (err) {
  // Keep serving the site so /health can report the problem
  console.error('[server] Database initialisation failed:', err.message)
}

app.listen(PORT, () => {
  console.log(`[server] Le Grande Haven running on port ${PORT}`)
})
