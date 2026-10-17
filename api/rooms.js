import { query, queryOne, transaction, setClause, parseJson, uuid } from './db.js';

const roomFields = (b) => ({
  slug: b.slug, name: b.name, room_type: b.room_type,
  short_description: b.short_description, description: b.description,
  guests: b.guests, bed_config: b.bed_config,
  price_per_night: b.price_per_night,
  amenities: JSON.stringify(b.amenities || []),
  available: b.available, featured: b.featured,
});

const toRoom = (r) => ({ ...r, amenities: parseJson(r.amenities, []) });

// If the room is taken tonight, the first night it's free again (following
// back-to-back bookings); otherwise null. `booked` is sorted by check-in.
function bookedUntil(booked, today) {
  let until = null;
  for (const b of booked) {
    if (b.from <= (until ?? today) && b.to > (until ?? today)) until = b.to;
  }
  return until;
}

async function replaceImages(tx, roomId, images) {
  await tx.query('DELETE FROM room_images WHERE room_id = ?', [roomId]);
  for (const [i, im] of images.entries()) {
    await tx.query('INSERT INTO room_images (id, room_id, url, sort_order) VALUES (?, ?, ?, ?)', [uuid(), roomId, im.url, i]);
  }
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
      const [rooms, images, bookings] = await Promise.all([
        query('SELECT * FROM rooms ORDER BY sort_order ASC'),
        query('SELECT room_id, url, sort_order FROM room_images ORDER BY sort_order ASC'),
        // Same statuses the booking POST treats as blocking. Dates only — no guest details.
        query(`SELECT room_id, DATE_FORMAT(check_in, '%Y-%m-%d') AS \`from\`, DATE_FORMAT(check_out, '%Y-%m-%d') AS \`to\`
                 FROM bookings
                WHERE status NOT IN ('cancelled', 'checked_out') AND check_out > ?
                ORDER BY check_in ASC`, [today]),
      ]);
      const rows = rooms.map(r => {
        const booked = bookings.filter(b => b.room_id === r.id).map(({ from, to }) => ({ from, to }));
        return {
          ...toRoom(r),
          images: images.filter(im => im.room_id === r.id).map(({ url, sort_order }) => ({ url, sort_order })),
          booked,
          booked_until: bookedUntil(booked, today),
        };
      });
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { images, ...b } = req.body || {};
      const id = uuid();
      const fields = { id, ...roomFields(b), available: b.available ?? true, featured: b.featured ?? false, sort_order: b.sort_order ?? 0 };
      await transaction(async (tx) => {
        const { sql, params } = setClause(fields);
        await tx.query(`INSERT INTO rooms SET ${sql}`, params);
        if (Array.isArray(images) && images.length) await replaceImages(tx, id, images);
      });
      return res.status(201).json(toRoom(await queryOne('SELECT * FROM rooms WHERE id = ?', [id])));
    }

    if (req.method === 'PUT') {
      const { id, images, ...b } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await transaction(async (tx) => {
        const { sql, params } = setClause(roomFields(b));
        await tx.query(`UPDATE rooms SET ${sql} WHERE id = ?`, [...params, id]);
        if (Array.isArray(images)) await replaceImages(tx, id, images);
      });
      const room = await queryOne('SELECT * FROM rooms WHERE id = ?', [id]);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      return res.status(200).json(toRoom(room));
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await query('DELETE FROM rooms WHERE id = ?', [id]); // room_images cascade
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('rooms API:', err);
    return res.status(500).json({ error: err.message });
  }
}
