import { query, queryOne, uuid } from './db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await query('SELECT * FROM contact_messages ORDER BY created_at DESC'));
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      if (!b.name || !b.email || !b.message) return res.status(400).json({ error: 'Missing fields' });
      const id = uuid();
      await query('INSERT INTO contact_messages (id, name, email, phone, subject, message, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)',
        [id, b.name, b.email, b.phone || null, b.subject || null, b.message]);
      return res.status(201).json(await queryOne('SELECT * FROM contact_messages WHERE id = ?', [id]));
    }
    if (req.method === 'PUT') {
      const { id, is_read } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await query('UPDATE contact_messages SET is_read = ? WHERE id = ?', [Boolean(is_read), id]);
      return res.status(200).json(await queryOne('SELECT * FROM contact_messages WHERE id = ?', [id]));
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await query('DELETE FROM contact_messages WHERE id = ?', [id]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('messages API:', err);
    return res.status(500).json({ error: err.message });
  }
}
