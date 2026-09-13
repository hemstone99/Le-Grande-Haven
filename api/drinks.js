import supabase from './db-client.js';

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      let q = supabase.from('drink_items').select('*').order('sort_order', { ascending: true }).order('name');
      if (req.query.featured) q = q.eq('featured', true);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      const { data, error } = await supabase.from('drink_items').insert({
        name: b.name, description: b.description, price: b.price, image_url: b.image_url,
        category: b.category, available: b.available ?? true, featured: b.featured ?? false,
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const b = req.body || {};
      if (!b.id) return res.status(400).json({ error: 'id required' });
      const { data, error } = await supabase.from('drink_items').update({
        name: b.name, description: b.description, price: b.price, image_url: b.image_url,
        category: b.category, available: b.available, featured: b.featured,
      }).eq('id', b.id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      const { error } = await supabase.from('drink_items').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('drinks API:', err);
    return res.status(500).json({ error: err.message });
  }
}
