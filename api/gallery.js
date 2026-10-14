import { query, queryOne, uuid } from './db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await query('SELECT * FROM gallery ORDER BY sort_order ASC'));
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      if (!b.url) return res.status(400).json({ error: 'url required' });
      const id = uuid();
      await query('INSERT INTO gallery (id, url, caption, category, sort_order) VALUES (?, ?, ?, ?, ?)',
        [id, b.url, b.caption || null, b.category || 'general', b.sort_order || 0]);
      return res.status(201).json(await queryOne('SELECT * FROM gallery WHERE id = ?', [id]));
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await query('DELETE FROM gallery WHERE id = ?', [id]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('gallery API:', err);
    return res.status(500).json({ error: err.message });
  }
}
