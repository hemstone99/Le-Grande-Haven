import { query, queryOne } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    // Arrivals/departures follow the hotel's calendar day, not UTC
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
    const [roomsData, bookingsData, reservationsData, messages, food, drinks] = await Promise.all([
      query('SELECT id, available, name, price_per_night FROM rooms'),
      query(`SELECT b.*, r.name AS room_name FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
              ORDER BY b.created_at DESC LIMIT 50`),
      query('SELECT * FROM restaurant_reservations ORDER BY created_at DESC LIMIT 50'),
      queryOne('SELECT COUNT(*) AS n FROM contact_messages'),
      queryOne('SELECT COUNT(*) AS n FROM food_items'),
      queryOne('SELECT COUNT(*) AS n FROM drink_items'),
    ]);

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

    return res.status(200).json({
      totalRooms: roomsData.length,
      availableRooms: roomsData.filter(r => r.available && !occupiedRoomIds.has(r.id)).length,
      occupiedRooms: occupiedRoomIds.size,
      todayArrivals: arrivals,
      todayDepartures: departures,
      pendingBookings: pending,
      reservations: reservationsData.length,
      messages: messages.n,
      foodCount: food.n,
      drinkCount: drinks.n,
      revenue,
      recentBookings: bookingsData.slice(0, 8),
      recentReservations: reservationsData.slice(0, 8),
    });
  } catch (err) {
    console.error('stats API:', err);
    return res.status(500).json({ error: err.message });
  }
}
