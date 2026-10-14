import { query, queryOne, uuid } from './db.js';

const STATUSES = ['pending', 'confirmed', 'seated', 'cancelled'];

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await query('SELECT * FROM restaurant_reservations ORDER BY created_at DESC'));
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      if (!b.name || !b.phone || !b.reservation_date || !b.reservation_time) return res.status(400).json({ error: 'Missing fields' });
      const id = uuid();
      await query(
        `INSERT INTO restaurant_reservations (id, name, phone, email, reservation_date, reservation_time, party_size, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [id, b.name, b.phone, b.email || null, b.reservation_date, b.reservation_time, b.party_size || 1, b.notes || null]);
      return res.status(201).json(await queryOne('SELECT * FROM restaurant_reservations WHERE id = ?', [id]));
    }
    if (req.method === 'PUT') {
      const { id, status } = req.body || {};
      if (!id || !STATUSES.includes(status)) return res.status(400).json({ error: 'id and a valid status are required' });
      await query('UPDATE restaurant_reservations SET status = ? WHERE id = ?', [status, id]);
      return res.status(200).json(await queryOne('SELECT * FROM restaurant_reservations WHERE id = ?', [id]));
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await query('DELETE FROM restaurant_reservations WHERE id = ?', [id]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('reservations API:', err);
    return res.status(500).json({ error: err.message });
  }
}
