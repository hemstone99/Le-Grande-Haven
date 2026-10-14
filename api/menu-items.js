import { query, queryOne, setClause, uuid } from './db.js';

// Shared CRUD handler for the food_items and drink_items tables.
export default function menuItemsHandler(table, label) {
  return async function handler(req, res) {
    try {
      if (req.method === 'GET') {
        const where = req.query.featured ? 'WHERE featured = 1' : '';
        return res.status(200).json(await query(`SELECT * FROM ${table} ${where} ORDER BY sort_order ASC, name ASC`));
      }
      if (req.method === 'POST' || req.method === 'PUT') {
        const b = req.body || {};
        const fields = {
          name: b.name, description: b.description, price: b.price, image_url: b.image_url,
          category: b.category, available: b.available, featured: b.featured,
        };
        if (req.method === 'POST') {
          const id = uuid();
          const { sql, params } = setClause({ id, ...fields, available: b.available ?? true, featured: b.featured ?? false });
          await query(`INSERT INTO ${table} SET ${sql}`, params);
          return res.status(201).json(await queryOne(`SELECT * FROM ${table} WHERE id = ?`, [id]));
        }
        if (!b.id) return res.status(400).json({ error: 'id required' });
        const { sql, params } = setClause(fields);
        await query(`UPDATE ${table} SET ${sql} WHERE id = ?`, [...params, b.id]);
        return res.status(200).json(await queryOne(`SELECT * FROM ${table} WHERE id = ?`, [b.id]));
      }
      if (req.method === 'DELETE') {
        const { id } = req.body || {};
        if (!id) return res.status(400).json({ error: 'id required' });
        await query(`DELETE FROM ${table} WHERE id = ?`, [id]);
        return res.status(200).json({ ok: true });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
      console.error(`${label} API:`, err);
      return res.status(500).json({ error: err.message });
    }
  };
}
