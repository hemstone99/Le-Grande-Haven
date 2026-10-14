// Admin account maintenance — run on the server from the app root:
//   node scripts/admin-user.mjs                      list admin accounts
//   node scripts/admin-user.mjs <email> <password>   create the account or reset its password
//   node scripts/admin-user.mjs --remove <email>     delete an admin account
// In cPanel: Setup Node.js App → Run JS script → admin-user (with the arguments above).
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Load .env when present (cPanel provides real environment variables instead)
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const { initDatabase, query, queryOne, uuid, default: pool } = await import('../api/db.js');
const { hashPassword } = await import('../api/auth.js');

await initDatabase();
const [email, password] = process.argv.slice(2);

if (email === '--remove') {
  const target = String(password || '').trim().toLowerCase();
  const { affectedRows } = await query('DELETE FROM admin_users WHERE email = ?', [target]);
  console.log(affectedRows ? `Removed admin ${target}` : `No admin named ${target}`);
} else if (email) {
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters');
  const normalized = email.trim().toLowerCase();
  const existing = await queryOne('SELECT id FROM admin_users WHERE email = ?', [normalized]);
  if (existing) {
    await query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hashPassword(password), existing.id]);
    console.log(`Password reset for ${normalized}`);
  } else {
    await query('INSERT INTO admin_users (id, email, password_hash) VALUES (?, ?, ?)', [uuid(), normalized, hashPassword(password)]);
    console.log(`Created admin ${normalized}`);
  }
}

const admins = await query('SELECT email, created_at FROM admin_users ORDER BY created_at');
console.log(`Admin accounts (${admins.length}):`);
for (const a of admins) console.log(`  ${a.email}  (created ${a.created_at})`);
const { n } = await queryOne('SELECT COUNT(*) AS n FROM rooms');
console.log(`Rooms in database: ${n}`);
await pool.end();
