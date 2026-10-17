import mysql from 'mysql2/promise';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// MySQL connection pool — credentials come from the host environment
// (cPanel → Setup Node.js App → Environment variables, or .env locally).
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  charset: 'utf8mb4',
  timezone: 'Z',
  decimalNumbers: true,
  // Return the same JSON shapes the frontend received from Supabase:
  // TINYINT(1) → boolean, DATE → 'YYYY-MM-DD', DATETIME → ISO-8601 string.
  typeCast(field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      const v = field.string();
      return v === null ? null : v === '1';
    }
    if (field.type === 'DATE') return field.string();
    if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
      const v = field.string();
      return v === null ? null : new Date(v.replace(' ', 'T') + 'Z').toISOString();
    }
    return next();
  },
});

// Store and read every timestamp in UTC regardless of the MySQL server's zone
pool.pool.on('connection', (conn) => conn.query("SET time_zone = '+00:00'"));

export const uuid = () => crypto.randomUUID();

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

// Run several statements on one connection inside a transaction.
export async function transaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn({ query: async (sql, params = []) => (await conn.query(sql, params))[0] });
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Build "SET a = ?, b = ?" from an object, skipping undefined values so a
// partial PUT leaves untouched columns alone.
export function setClause(fields) {
  const cols = Object.keys(fields).filter(k => fields[k] !== undefined);
  return { sql: cols.map(c => `\`${c}\` = ?`).join(', '), params: cols.map(c => fields[c]) };
}

// Columns stored as JSON text (MariaDB keeps JSON as LONGTEXT).
export function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

// ─── Schema ─────────────────────────────────────────────────────────────────
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS rooms (
    id CHAR(36) PRIMARY KEY,
    slug VARCHAR(191) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    short_description TEXT,
    description TEXT,
    guests INT DEFAULT 2,
    bed_config VARCHAR(255),
    price_per_night DECIMAL(12,2) NOT NULL,
    amenities LONGTEXT,
    available TINYINT(1) DEFAULT 1,
    featured TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS room_images (
    id CHAR(36) PRIMARY KEY,
    room_id CHAR(36) NOT NULL,
    url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX (room_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS bookings (
    id CHAR(36) PRIMARY KEY,
    room_id CHAR(36) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT DEFAULT 1,
    special_requests TEXT,
    status ENUM('pending','confirmed','checked_in','checked_out','cancelled') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX (room_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS restaurant_reservations (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    reservation_date DATE NOT NULL,
    reservation_time VARCHAR(20) NOT NULL,
    party_size INT DEFAULT 2,
    notes TEXT,
    status ENUM('pending','confirmed','seated','cancelled') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS food_items (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    image_url TEXT,
    category VARCHAR(100) NOT NULL,
    available TINYINT(1) DEFAULT 1,
    featured TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS drink_items (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    image_url TEXT,
    category VARCHAR(100) NOT NULL,
    available TINYINT(1) DEFAULT 1,
    featured TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS gallery (
    id CHAR(36) PRIMARY KEY,
    url TEXT NOT NULL,
    caption TEXT,
    category VARCHAR(100) DEFAULT 'general',
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS staff (
    id CHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    national_id VARCHAR(50),
    photo_url TEXT,
    shift VARCHAR(100),
    salary DECIMAL(12,2),
    hire_date DATE,
    active TINYINT(1) DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS admin_users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS app_migrations (
    name VARCHAR(191) PRIMARY KEY,
    ran_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

// Tables in foreign-key order, for seeding from db/seed.json.
const SEED_TABLES = ['rooms', 'room_images', 'food_items', 'drink_items', 'gallery', 'staff',
  'bookings', 'restaurant_reservations', 'contact_messages'];

const toMysqlDate = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)
  ? v.replace('T', ' ').replace(/(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/, '').slice(0, 19)
  : v);

async function seedIfEmpty() {
  const seedFile = path.join(__dirname, '..', 'db', 'seed.json');
  if (!fs.existsSync(seedFile)) return;
  const { n } = await queryOne('SELECT COUNT(*) AS n FROM rooms');
  if (n > 0) return;
  const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  await transaction(async (tx) => {
    for (const table of SEED_TABLES) {
      for (const row of seed[table] || []) {
        const r = { ...row };
        if (table === 'rooms' && typeof r.amenities !== 'string') r.amenities = JSON.stringify(r.amenities || []);
        if (r.created_at) r.created_at = toMysqlDate(r.created_at);
        const cols = Object.keys(r);
        await tx.query(
          `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
          cols.map(c => r[c]),
        );
      }
      console.log(`[db] Seeded ${table}: ${(seed[table] || []).length} rows`);
    }
  });
}

// One-off data fixes for databases that were seeded before the content was
// corrected. Each runs once (recorded in app_migrations), so later edits made
// in the admin panel are never overwritten.
async function runOnce(name, fn) {
  if (await queryOne('SELECT name FROM app_migrations WHERE name = ?', [name])) return;
  await transaction(fn);
  await query('INSERT INTO app_migrations (name) VALUES (?)', [name]);
  console.log(`[db] Ran migration ${name}`);
}

// Every room has exactly one bed. Mwani and Nyasi have a single bed for one
// guest; the other eight have a queen bed for two.
const SINGLE_ROOMS = {
  mwani: {
    short_description: 'A calm, sun-lit single room for one, named for the sea grasses of the Kwale coast.',
    description: 'Mwani is a serene single room for one guest, bathed in soft coastal light. Warm timber floors, ivory linens, a single bed and a small reading nook by the window make it a favourite with solo travellers and writers. Wake to birdsong and the scent of the neighbouring frangipani tree.' },
  nyasi: {
    short_description: 'A cosy single room for one, with grass-thatched charm and an earthy palette.',
    description: 'Nyasi means grass — and this room borrows its warmth from the thatched roofs of the coast. Sized for one guest, it pairs a single bed with woven textures, cream walls and a private veranda — ideal for the solo traveller who loves slow mornings with a Kenyan coffee.' },
};
const QUEEN_ROOMS = {
  tumbawe: { description: 'Tumbawe channels the calm of an underwater world with soft blues, driftwood accents and a comfortable queen bed. Perfect for couples who want a peaceful base close to the restaurant and gardens.' },
  pweza: { description: 'Pweza is a bright and airy room for two, with a queen bed and tall windows opening to the garden. Its palette of coral and cream feels playful yet grown-up. A great choice for couples who love natural light.' },
  mkoko: {},
  ngisi: {},
  tafi: { room_type: 'Standard',
    short_description: 'Warm and roomy, with soft rugs and quick access to the garden.',
    description: 'Tafi is a roomy, relaxed space for two, with a comfortable queen bed, soft rugs, a low reading corner and quick access to the garden — an easy base for couples who like to spend their days outdoors.' },
  una: {},
  chewa: { room_type: 'Standard',
    short_description: 'A serene, comfortable room a short stroll from the pool.',
    description: 'Chewa (grouper fish) offers a comfortable queen bed, a writing desk and quick access to the pool area. A calm, practical pick for couples or business travellers.' },
  nguru: { description: 'Nguru is our most spacious accommodation — a suite with a lounge area, a comfortable queen bed, spa-inspired bathroom and a private terrace. Ideal for honeymoons, anniversaries and special occasions.' },
};
// Bed-related amenity wording left over from the old multi-bed set-up
const BED_AMENITIES = {
  'Comfortable bed': 'Comfortable queen bed', 'Comfortable beds': 'Comfortable queen bed',
  'Two comfortable beds': 'Comfortable queen bed', 'Comfortable king bed': 'Comfortable queen bed',
  'Super king bed': 'Comfortable queen bed', 'Mosquito nets': 'Mosquito net', 'Family friendly': null,
};

async function fixRoomBeds(tx) {
  const rooms = await tx.query('SELECT id, slug, amenities FROM rooms');
  for (const room of rooms) {
    let fields;
    if (SINGLE_ROOMS[room.slug]) {
      fields = { room_type: 'Single', guests: 1, bed_config: 'Single bed', ...SINGLE_ROOMS[room.slug] };
    } else if (QUEEN_ROOMS[room.slug]) {
      const list = parseJson(room.amenities, []).map(a => (a in BED_AMENITIES ? BED_AMENITIES[a] : a)).filter(Boolean);
      fields = { guests: 2, bed_config: 'Queen bed', amenities: JSON.stringify([...new Set(list)]), ...QUEEN_ROOMS[room.slug] };
    } else continue;
    const cols = Object.keys(fields);
    await tx.query(`UPDATE rooms SET ${cols.map(c => `\`${c}\` = ?`).join(', ')} WHERE id = ?`, [...cols.map(c => fields[c]), room.id]);
  }
}

// Create tables and load seed data on first boot. Safe to call repeatedly.
export async function initDatabase() {
  for (const sql of SCHEMA) await query(sql);
  await seedIfEmpty();
  await runOnce('2026-10-one-bed-per-room', fixRoomBeds);
}

export default pool;
