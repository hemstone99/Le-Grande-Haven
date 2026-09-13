import supabase from './db-client.js';

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [rooms, bookings, reservations, messages, food, drinks] = await Promise.all([
      supabase.from('rooms').select('id, available, name, price_per_night'),
      supabase.from('bookings').select('*, rooms(name)').order('created_at', { ascending: false }).limit(50),
      supabase.from('restaurant_reservations').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
      supabase.from('food_items').select('id', { count: 'exact', head: true }),
      supabase.from('drink_items').select('id', { count: 'exact', head: true }),
    ]);

    const roomsData = rooms.data || [];
    const bookingsData = bookings.data || [];
    const reservationsData = reservations.data || [];

    const occupiedRoomIds = new Set(bookingsData.filter(b => b.status === 'checked_in' || (b.status === 'confirmed' && b.check_in <= today && b.check_out > today)).map(b => b.room_id));

    const arrivals = bookingsData.filter(b => b.check_in === today && ['confirmed', 'pending'].includes(b.status)).length;
    const departures = bookingsData.filter(b => b.check_out === today && ['checked_in', 'confirmed'].includes(b.status)).length;
    const pending = bookingsData.filter(b => b.status === 'pending').length;

    // Revenue: sum for confirmed/checked bookings using room price * nights
    const revenue = bookingsData.filter(b => ['confirmed', 'checked_in', 'checked_out'].includes(b.status)).reduce((sum, b) => {
      const nights = Math.max(1, Math.round((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000));
      const room = roomsData.find(r => r.id === b.room_id);
      return sum + (room ? Number(room.price_per_night) * nights : 0);
    }, 0);

    const recent = bookingsData.slice(0, 8).map(b => ({ ...b, room_name: b.rooms?.name, rooms: undefined }));

    return res.status(200).json({
      totalRooms: roomsData.length,
      availableRooms: roomsData.filter(r => r.available && !occupiedRoomIds.has(r.id)).length,
      occupiedRooms: occupiedRoomIds.size,
      todayArrivals: arrivals,
      todayDepartures: departures,
      pendingBookings: pending,
      reservations: reservationsData.length,
      messages: messages.count ?? 0,
      foodCount: food.count ?? 0,
      drinkCount: drinks.count ?? 0,
      revenue,
      recentBookings: recent,
      recentReservations: reservationsData.slice(0, 8),
    });
  } catch (err) {
    console.error('stats API:', err);
    return res.status(500).json({ error: err.message });
  }
}
