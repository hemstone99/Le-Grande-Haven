import crypto from 'node:crypto';
import { query, queryOne, uuid } from './db.js';

const COOKIE = 'lgh_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set (32+ characters)');
  return s;
};

// ─── Password hashing (scrypt, built into Node — no native deps) ───────────
export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function verifyPassword(password, stored) {
  const [scheme, saltB64, hashB64] = String(stored).split('$');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

// ─── Signed session token: base64url(payload).base64url(hmac) ──────────────
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  return payload.exp > Date.now() ? payload : null;
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

function setSessionCookie(req, res, value, maxAgeMs) {
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', [
    `${COOKIE}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Strict',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`, secure ? 'Secure' : '',
  ].filter(Boolean).join('; '));
}

// Returns { id, email } for a valid session, otherwise null.
export function getSessionUser(req) {
  try {
    const p = verify(readCookie(req, COOKIE));
    return p ? { id: p.sub, email: p.email } : null;
  } catch {
    return null;
  }
}

// Express middleware: 401 unless the request carries a valid admin session.
export function requireAdmin(req, res, next) {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  req.user = user;
  next();
}

// ─── Login throttling: 10 failed attempts per IP per 15 minutes ────────────
const failures = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;

function isThrottled(ip) {
  const f = failures.get(ip);
  if (!f) return false;
  if (Date.now() - f.first > WINDOW_MS) { failures.delete(ip); return false; }
  return f.count >= MAX_FAILURES;
}

function recordFailure(ip) {
  const f = failures.get(ip);
  if (!f || Date.now() - f.first > WINDOW_MS) failures.set(ip, { first: Date.now(), count: 1 });
  else f.count++;
}

// Create the first admin from ADMIN_EMAIL / ADMIN_PASSWORD if none exists.
export async function ensureAdminUser() {
  const { n } = await queryOne('SELECT COUNT(*) AS n FROM admin_users');
  if (n > 0) return;
  const email = process.env.ADMIN_EMAIL, password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn('[auth] No admin user exists — set ADMIN_EMAIL and ADMIN_PASSWORD to create one.');
    return;
  }
  await query('INSERT INTO admin_users (id, email, password_hash) VALUES (?, ?, ?)',
    [uuid(), email.trim().toLowerCase(), hashPassword(password)]);
  console.log(`[auth] Created admin user ${email}`);
}

// ─── /api/auth/:action ──────────────────────────────────────────────────────
export default async function handler(req, res) {
  const action = req.params.action;
  try {
    if (action === 'me' && req.method === 'GET') {
      // "Not signed in" is a normal answer here, not an error
      return res.status(200).json({ user: getSessionUser(req) });
    }

    if (action === 'login' && req.method === 'POST') {
      const ip = req.ip;
      if (isThrottled(ip)) return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
      const row = await queryOne('SELECT id, email, password_hash FROM admin_users WHERE email = ?', [String(email).trim().toLowerCase()]);
      if (!row || !verifyPassword(String(password), row.password_hash)) {
        recordFailure(ip);
        return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
      }
      failures.delete(ip);
      setSessionCookie(req, res, sign({ sub: row.id, email: row.email, exp: Date.now() + SESSION_TTL_MS }), SESSION_TTL_MS);
      return res.status(200).json({ user: { id: row.id, email: row.email } });
    }

    if (action === 'logout' && req.method === 'POST') {
      setSessionCookie(req, res, '', 0);
      return res.status(200).json({ ok: true });
    }

    if (action === 'password' && req.method === 'POST') {
      const user = getSessionUser(req);
      if (!user) return res.status(401).json({ error: 'Not signed in' });
      const { current, next: newPassword } = req.body || {};
      if (!newPassword || String(newPassword).length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
      const row = await queryOne('SELECT password_hash FROM admin_users WHERE id = ?', [user.id]);
      if (!row || !verifyPassword(String(current || ''), row.password_hash)) return res.status(400).json({ error: 'Current password is incorrect' });
      await query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hashPassword(String(newPassword)), user.id]);
      return res.status(200).json({ ok: true });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('auth API:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
