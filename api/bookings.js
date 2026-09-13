import supabase from './db-client.js';

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const overlaps = (bookings, checkIn, checkOut) => {
  const ci = new Date(checkIn).getTime();
  const co = new Date(checkOut).getTime();
  return bookings.some(b => {
    if (['cancelled', 'checked_out'].includes(b.status)) return false;
    const bi = new Date(b.check_in).getTime();
    const bo = new Date(b.check_out).getTime();
    return bi < co && bo > ci;
  });
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('bookings').select('*, rooms(name, price_per_night)').order('created_at', { ascending: false });
      if (error) throw error;
      const rows = (data || []).map(b => ({ ...b, room_name: b.rooms?.name, room_price: b.rooms?.price_per_night, rooms: undefined }));
      return res.status(200).json(rows);
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      if (!b.room_id || !b.guest_name || !b.phone || !b.check_in || !b.check_out) return res.status(400).json({ error: 'Room, guest name, phone, check-in and check-out are required' });
      // Check overlap — surface the real DB error instead of silently ignoring it
      const { data: existing, error: overlapErr } = await supabase.from('bookings').select('*').eq('room_id', b.room_id);
      if (overlapErr) throw overlapErr;
      if (overlaps(existing || [], b.check_in, b.check_out)) return res.status(409).json({ error: 'Room already booked for those dates' });
      const { data, error } = await supabase.from('bookings').insert({
        room_id: b.room_id, guest_name: b.guest_name, phone: b.phone, email: b.email || null,
        check_in: b.check_in, check_out: b.check_out, guests: b.guests || 1,
        special_requests: b.special_requests || null, status: 'pending',
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, status } = req.body || {};
      if (!id || !status) return res.status(400).json({ error: 'id and status required' });
      const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('bookings API:', err);
    let msg = err.message || 'Booking failed';
    if (/permission denied/i.test(msg)) {
      msg = 'Database permission denied. Run supabase-schema.sql on your Supabase project (it includes the required GRANTs and RLS policies).';
    }
    return res.status(500).json({ error: msg });
  }
}
