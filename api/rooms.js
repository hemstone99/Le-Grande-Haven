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
      const { data, error } = await supabase.from('rooms').select('*, images:room_images(url, sort_order)').order('sort_order', { ascending: true });
      if (error) throw error;
      const rows = (data || []).map(r => ({
        ...r,
        images: (r.images || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
      }));
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      const { images, ...roomFields } = b;
      const { data: room, error } = await supabase.from('rooms').insert({
        slug: roomFields.slug, name: roomFields.name, room_type: roomFields.room_type,
        short_description: roomFields.short_description, description: roomFields.description,
        guests: roomFields.guests, bed_config: roomFields.bed_config,
        price_per_night: roomFields.price_per_night, amenities: roomFields.amenities || [],
        available: roomFields.available ?? true, featured: roomFields.featured ?? false,
        sort_order: roomFields.sort_order ?? 0,
      }).select().single();
      if (error) throw error;
      if (Array.isArray(images) && images.length) {
        const rows = images.map((im, i) => ({ room_id: room.id, url: im.url, sort_order: i }));
        const { error: imageError } = await supabase.from('room_images').insert(rows);
        if (imageError) throw imageError;
      }
      return res.status(201).json(room);
    }

    if (req.method === 'PUT') {
      const b = req.body || {};
      const { id, images, ...fields } = b;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data: room, error } = await supabase.from('rooms').update({
        slug: fields.slug, name: fields.name, room_type: fields.room_type,
        short_description: fields.short_description, description: fields.description,
        guests: fields.guests, bed_config: fields.bed_config,
        price_per_night: fields.price_per_night, amenities: fields.amenities || [],
        available: fields.available, featured: fields.featured,
      }).eq('id', id).select().single();
      if (error) throw error;
      if (Array.isArray(images)) {
        const { error: deleteImageError } = await supabase.from('room_images').delete().eq('room_id', id);
        if (deleteImageError) throw deleteImageError;
        if (images.length) {
          const rows = images.map((im, i) => ({ room_id: id, url: im.url, sort_order: i }));
          const { error: imageError } = await supabase.from('room_images').insert(rows);
          if (imageError) throw imageError;
        }
      }
      return res.status(200).json(room);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await supabase.from('room_images').delete().eq('room_id', id);
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('rooms API:', err);
    return res.status(500).json({ error: err.message });
  }
}
