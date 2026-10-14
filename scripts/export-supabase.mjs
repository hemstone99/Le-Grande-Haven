// One-off migration: export every table from the old Supabase project into
// db/seed.json and download images hosted in Supabase Storage into uploads/.
// The server imports db/seed.json into MySQL on first boot (empty database).
//
// Usage: node scripts/export-supabase.mjs
// Needs SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');

const TABLES = ['rooms', 'room_images', 'food_items', 'drink_items', 'gallery', 'staff',
  'bookings', 'restaurant_reservations', 'contact_messages'];
const IMAGE_COLUMNS = ['url', 'image_url', 'photo_url'];
const STORAGE_URL = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/[^/]+\/(.+)$/;

const uploadsDir = path.join(root, 'uploads');
const seed = {};
let downloaded = 0;

async function localiseImage(remote) {
  const m = remote.match(STORAGE_URL);
  if (!m) return remote;
  const rel = decodeURIComponent(m[1]).split('/').map(s => s.replace(/[^a-z0-9._-]+/gi, '-')).join('/');
  const dest = path.join(uploadsDir, rel);
  if (!fs.existsSync(dest)) {
    const res = await fetch(remote);
    if (!res.ok) { console.warn(`  ! could not download ${remote} (${res.status}) — keeping remote URL`); return remote; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    downloaded++;
  }
  return `/uploads/${rel}`;
}

for (const table of TABLES) {
  const res = await fetch(`${url}/rest/v1/${table}?select=*`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) { console.warn(`${table}: skipped (${res.status})`); seed[table] = []; continue; }
  const rows = await res.json();
  for (const row of rows) {
    for (const col of IMAGE_COLUMNS) if (typeof row[col] === 'string') row[col] = await localiseImage(row[col]);
  }
  seed[table] = rows;
  console.log(`${table}: ${rows.length} rows`);
}

fs.mkdirSync(path.join(root, 'db'), { recursive: true });
fs.writeFileSync(path.join(root, 'db', 'seed.json'), JSON.stringify(seed, null, 1));
console.log(`\nWrote db/seed.json; downloaded ${downloaded} images into uploads/`);
