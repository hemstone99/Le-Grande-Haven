import { query, queryOne, setClause, uuid } from './db.js';

const COLUMNS = ['full_name', 'role', 'phone', 'email', 'national_id', 'photo_url', 'shift', 'salary', 'hire_date', 'active', 'notes'];

// Whitelist columns and store empty form inputs as NULL (MySQL rejects '' for DATE/DECIMAL).
const staffFields = (b) => Object.fromEntries(COLUMNS.filter(c => c in b).map(c => [c, b[c] === '' ? null : b[c]]));

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await query('SELECT * FROM staff ORDER BY created_at DESC'));
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      if (!b.full_name || !b.role) return res.status(400).json({ error: 'full_name and role are required' });
      const id = uuid();
      const { sql, params } = setClause({ id, ...staffFields(b), active: b.active ?? true });
      await query(`INSERT INTO staff SET ${sql}`, params);
      return res.status(201).json(await queryOne('SELECT * FROM staff WHERE id = ?', [id]));
    }
    if (req.method === 'PUT') {
      const b = req.body || {};
      if (!b.id) return res.status(400).json({ error: 'id required' });
      const fields = staffFields(b);
      if (Object.keys(fields).length) {
        const { sql, params } = setClause(fields);
        await query(`UPDATE staff SET ${sql} WHERE id = ?`, [...params, b.id]);
      }
      return res.status(200).json(await queryOne('SELECT * FROM staff WHERE id = ?', [b.id]));
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await query('DELETE FROM staff WHERE id = ?', [id]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('staff API:', err);
    return res.status(500).json({ error: err.message });
  }
}
