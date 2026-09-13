import { useEffect, useState } from 'react'
import { Bed, CalendarCheck, CalendarX, ArrowUp, ArrowDown, Clock, MessageSquare, UtensilsCrossed, Wine, DollarSign, Users } from 'lucide-react'
import { KSH, formatDate } from '../../lib/format'

type Stats = {
  totalRooms: number; availableRooms: number; occupiedRooms: number;
  todayArrivals: number; todayDepartures: number; pendingBookings: number;
  reservations: number; messages: number; foodCount: number; drinkCount: number;
  revenue: number; recentBookings: any[]; recentReservations: any[]
}

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null)
  useEffect(() => { fetch('/api/stats').then(r => r.json()).then(setS).catch(() => {}) }, [])

  const cards = [
    { t: 'Total Rooms', v: s?.totalRooms, i: Bed, c: 'bg-forest text-cream' },
    { t: 'Available Rooms', v: s?.availableRooms, i: CalendarCheck, c: 'bg-cream border border-forest/10 text-forest' },
    { t: 'Occupied Rooms', v: s?.occupiedRooms, i: CalendarX, c: 'bg-cream border border-forest/10 text-forest' },
    { t: 'Today Arrivals', v: s?.todayArrivals, i: ArrowUp, c: 'bg-cream border border-forest/10 text-forest' },
    { t: 'Today Departures', v: s?.todayDepartures, i: ArrowDown, c: 'bg-cream border border-forest/10 text-forest' },
    { t: 'Pending Bookings', v: s?.pendingBookings, i: Clock, c: 'bg-clay text-cream' },
    { t: 'Reservations', v: s?.reservations, i: UtensilsCrossed, c: 'bg-cream border border-forest/10 text-forest' },
    { t: 'Revenue (received)', v: s ? KSH(s.revenue) : '—', i: DollarSign, c: 'bg-sand text-forest-deep' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.4em] text-clay">Dashboard</div>
        <h1 className="font-display text-4xl text-forest mt-2">Good day at the haven.</h1>
        <p className="text-earth mt-1">Here’s what’s happening today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => {
          const Icon = c.i
          return (
            <div key={c.t} className={`p-6 rounded-3xl ${c.c} lift`}>
              <div className="flex items-start justify-between"><div className="text-[10px] uppercase tracking-[0.3em] opacity-70">{c.t}</div><Icon className="w-5 h-5 opacity-80" /></div>
              <div className="font-display text-4xl mt-4">{c.v ?? '—'}</div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-forest/5">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl text-forest">Recent Room Bookings</h2><a href="/admin/bookings" className="text-xs text-clay">View all</a></div>
          <div className="mt-4 divide-y divide-forest/5">
            {(s?.recentBookings || []).slice(0, 6).map((b: any) => (
              <div key={b.id} className="py-3 flex items-center justify-between">
                <div><div className="text-sm font-semibold text-forest">{b.guest_name}</div><div className="text-xs text-earth">{b.room_name} · {formatDate(b.check_in)} → {formatDate(b.check_out)}</div></div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold ${b.status === 'confirmed' ? 'bg-forest/10 text-forest' : b.status === 'pending' ? 'bg-clay/10 text-clay' : b.status === 'checked_in' ? 'bg-sand/40 text-forest-deep' : 'bg-earth/10 text-earth'}`}>{b.status}</span>
              </div>
            ))}
            {!s?.recentBookings?.length && <div className="text-sm text-earth py-6 text-center">No bookings yet.</div>}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-forest/5">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl text-forest">Recent Restaurant Reservations</h2><a href="/admin/reservations" className="text-xs text-clay">View all</a></div>
          <div className="mt-4 divide-y divide-forest/5">
            {(s?.recentReservations || []).slice(0, 6).map((r: any) => (
              <div key={r.id} className="py-3 flex items-center justify-between">
                <div><div className="text-sm font-semibold text-forest">{r.name}</div><div className="text-xs text-earth">{formatDate(r.reservation_date)} at {r.reservation_time} · {r.party_size} guests</div></div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold ${r.status === 'confirmed' ? 'bg-forest/10 text-forest' : 'bg-clay/10 text-clay'}`}>{r.status}</span>
              </div>
            ))}
            {!s?.recentReservations?.length && <div className="text-sm text-earth py-6 text-center">No reservations yet.</div>}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="/admin/food" className="p-6 rounded-3xl bg-white border border-forest/5 lift flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-forest text-cream grid place-items-center"><UtensilsCrossed className="w-5 h-5" /></div><div><div className="font-display text-lg text-forest">Food Menu</div><div className="text-xs text-earth">{s?.foodCount ?? '—'} dishes on the menu</div></div></a>
        <a href="/admin/drinks" className="p-6 rounded-3xl bg-white border border-forest/5 lift flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-clay text-cream grid place-items-center"><Wine className="w-5 h-5" /></div><div><div className="font-display text-lg text-forest">Drinks Menu</div><div className="text-xs text-earth">{s?.drinkCount ?? '—'} drinks available</div></div></a>
        <a href="/admin/staff" className="p-6 rounded-3xl bg-white border border-forest/5 lift flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-earth text-cream grid place-items-center"><Users className="w-5 h-5" /></div><div><div className="font-display text-lg text-forest">Staff & Team</div><div className="text-xs text-earth">Receptionists, waiters, bartenders</div></div></a>
        <a href="/admin/messages" className="p-6 rounded-3xl bg-white border border-forest/5 lift flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-sand text-forest-deep grid place-items-center"><MessageSquare className="w-5 h-5" /></div><div><div className="font-display text-lg text-forest">Messages</div><div className="text-xs text-earth">{s?.messages ?? '—'} guest messages</div></div></a>
      </div>
    </div>
  )
}
