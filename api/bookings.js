import { query, queryOne, transaction, uuid } from './db.js';

const STATUSES = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await query(
        `SELECT b.*, r.name AS room_name, r.price_per_night AS room_price
           FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
          ORDER BY b.created_at DESC`);
      return res.status(200).json(rows);
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      if (!b.room_id || !b.guest_name || !b.phone || !b.check_in || !b.check_out) return res.status(400).json({ error: 'Room, guest name, phone, check-in and check-out are required' });
      if (!(new Date(b.check_out) > new Date(b.check_in))) return res.status(400).json({ error: 'Check-out must be after check-in' });
      const room = await queryOne('SELECT name, guests FROM rooms WHERE id = ?', [b.room_id]);
      if (!room) return res.status(400).json({ error: 'Room not found' });
      if ((b.guests || 1) > room.guests) {
        return res.status(400).json({ error: `${room.name} sleeps ${room.guests} guest${room.guests === 1 ? '' : 's'} — please book another room for the rest of your group` });
      }
      const id = uuid();
      const conflict = await transaction(async (tx) => {
        // Lock the room's bookings so two simultaneous requests can't double-book it
        const clash = await tx.query(
          `SELECT id FROM bookings
            WHERE room_id = ? AND status NOT IN ('cancelled', 'checked_out')
              AND check_in < ? AND check_out > ?
            FOR UPDATE`, [b.room_id, b.check_out, b.check_in]);
        if (clash.length) return true;
        await tx.query(
          `INSERT INTO bookings (id, room_id, guest_name, phone, email, check_in, check_out, guests, special_requests, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [id, b.room_id, b.guest_name, b.phone, b.email || null, b.check_in, b.check_out, b.guests || 1, b.special_requests || null]);
        return false;
      });
      if (conflict) return res.status(409).json({ error: 'Room already booked for those dates' });
      return res.status(201).json(await queryOne('SELECT * FROM bookings WHERE id = ?', [id]));
    }
    if (req.method === 'PUT') {
      const { id, status } = req.body || {};
      if (!id || !status) return res.status(400).json({ error: 'id and status required' });
      if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
      await query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
      return res.status(200).json(await queryOne('SELECT * FROM bookings WHERE id = ?', [id]));
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await query('DELETE FROM bookings WHERE id = ?', [id]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('bookings API:', err);
    return res.status(500).json({ error: err.message || 'Booking failed' });
  }
}
