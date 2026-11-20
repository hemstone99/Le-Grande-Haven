import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bed, CalendarCheck, CalendarX, ArrowUp, ArrowDown, Clock, MessageSquare, UtensilsCrossed, Wine, DollarSign, Users, Search, X } from 'lucide-react'
import { KSH, formatDate } from '../../lib/format'

type Booking = { id: string; guest_name: string; room_name: string; check_in: string; check_out: string; status: string }
type Reservation = { id: string; name: string; reservation_date: string; reservation_time: string; party_size: number; status: string }
type CatalogItem = {
  id: string
  name: string
  category: 'Food' | 'Drink' | 'Room'
  description: string
  searchableText: string
  details: string
  href: string
}
type MenuRecord = { id: string; name: string; category: string; description: string | null; price: number | string; available: boolean | number }
type RoomRecord = {
  id: string
  name: string
  room_type: string
  short_description: string | null
  description: string | null
  bed_config: string
  guests: number | string
  amenities: string[]
  price_per_night: number | string
  available: boolean | number
}

const isMenuRecord = (value: unknown): value is MenuRecord =>
  typeof value === 'object' && value !== null &&
  'id' in value && typeof value.id === 'string' &&
  'name' in value && typeof value.name === 'string' &&
  'category' in value && typeof value.category === 'string' &&
  'description' in value && (typeof value.description === 'string' || value.description === null) &&
  'price' in value && (typeof value.price === 'number' || typeof value.price === 'string') &&
  'available' in value && (typeof value.available === 'boolean' || typeof value.available === 'number')

const isRoomRecord = (value: unknown): value is RoomRecord =>
  typeof value === 'object' && value !== null &&
  'id' in value && typeof value.id === 'string' &&
  'name' in value && typeof value.name === 'string' &&
  'room_type' in value && typeof value.room_type === 'string' &&
  'short_description' in value && (typeof value.short_description === 'string' || value.short_description === null) &&
  'description' in value && (typeof value.description === 'string' || value.description === null) &&
  'bed_config' in value && typeof value.bed_config === 'string' &&
  'guests' in value && (typeof value.guests === 'number' || typeof value.guests === 'string') &&
  'amenities' in value && Array.isArray(value.amenities) && value.amenities.every(amenity => typeof amenity === 'string') &&
  'price_per_night' in value && (typeof value.price_per_night === 'number' || typeof value.price_per_night === 'string') &&
  'available' in value && (typeof value.available === 'boolean' || typeof value.available === 'number')

async function fetchCatalog<T>(url: string, isItem: (value: unknown) => value is T): Promise<T[]> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Catalog request failed (${response.status})`)
  const items: unknown = await response.json()
  if (!Array.isArray(items) || !items.every(isItem)) throw new Error('Catalog response contained invalid items')
  return items
}

type Stats = {
  totalRooms: number; availableRooms: number; occupiedRooms: number;
  todayArrivals: number; todayDepartures: number; pendingBookings: number;
  reservations: number; messages: number; foodCount: number; drinkCount: number;
  revenue: number; recentBookings: Booking[]; recentReservations: Reservation[]
}

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null)
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [search, setSearch] = useState('')
  const [catalogRetry, setCatalogRetry] = useState(0)
  useEffect(() => { fetch('/api/stats').then(r => r.json()).then(setS).catch(() => {}) }, [])

  useEffect(() => {
    let active = true
    setCatalogLoading(true)
    setCatalogError('')

    Promise.all([
      fetchCatalog('/api/food', isMenuRecord),
      fetchCatalog('/api/drinks', isMenuRecord),
      fetchCatalog('/api/rooms', isRoomRecord),
    ])
      .then(([food, drinks, rooms]) => {
        if (!active) return
        const foodItems: CatalogItem[] = food.map(item => ({
          id: item.id,
          name: item.name,
          category: 'Food',
          description: item.description || '',
          searchableText: [item.name, item.category, item.description, item.price, item.available ? 'available' : 'unavailable'].join(' '),
          details: `${item.category} · ${KSH(item.price)} · ${item.available ? 'Available' : 'Unavailable'}`,
          href: '/admin/food',
        }))
        const drinkItems: CatalogItem[] = drinks.map(item => ({
          id: item.id,
          name: item.name,
          category: 'Drink',
          description: item.description || '',
          searchableText: [item.name, item.category, item.description, item.price, item.available ? 'available' : 'unavailable'].join(' '),
          details: `${item.category} · ${KSH(item.price)} · ${item.available ? 'Available' : 'Unavailable'}`,
          href: '/admin/drinks',
        }))
        const roomItems: CatalogItem[] = rooms.map(item => ({
          id: item.id,
          name: item.name,
          category: 'Room',
          description: item.short_description || item.description || '',
          searchableText: [item.name, item.room_type, item.short_description, item.description, item.bed_config, item.guests, item.amenities.join(' '), item.price_per_night, item.available ? 'available' : 'unavailable'].join(' '),
          details: `${item.room_type} · ${item.guests} guests · ${KSH(item.price_per_night)} / night`,
          href: '/admin/rooms',
        }))
        setCatalog([...foodItems, ...drinkItems, ...roomItems])
        setCatalogLoading(false)
      })
      .catch(error => {
        if (!active) return
        setCatalogError(error instanceof Error ? error.message : 'Unable to load catalog items')
        setCatalogLoading(false)
      })

    return () => { active = false }
  }, [catalogRetry])

  const terms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const results = terms.length ? catalog
    .filter(item => terms.every(term => item.searchableText.toLocaleLowerCase().includes(term)))
    .sort((a, b) => {
      const query = terms.join(' ')
      const score = (item: CatalogItem) => item.name.toLocaleLowerCase() === query ? 3 : item.name.toLocaleLowerCase().startsWith(query) ? 2 : item.name.toLocaleLowerCase().includes(query) ? 1 : 0
      return score(b) - score(a) || a.name.localeCompare(b.name)
    }) : []

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

      <section className="rounded-3xl bg-white border border-forest/5 p-6 md:p-8">
        <div className="mb-4">
          <h2 className="font-display text-2xl text-forest">Search the catalog</h2>
          <p className="text-sm text-earth mt-1">Find food, drinks, and rooms from one search.</p>
        </div>
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth" />
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search by name, category, description, or room features..."
            aria-label="Search food, drinks, and rooms"
            className="w-full rounded-2xl bg-cream-50 border border-forest/10 py-4 pl-12 pr-12 text-forest placeholder:text-earth/70 focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
          {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 text-earth hover:text-forest"><X className="w-5 h-5" /></button>}
        </div>
        {catalogLoading ? (
          <p role="status" className="text-sm text-earth mt-4">Loading food, drinks, and rooms…</p>
        ) : catalogError ? (
          <div role="alert" className="mt-4 flex flex-wrap items-center gap-3 text-sm text-clay">
            <span>Could not load catalog: {catalogError}</span>
            <button type="button" onClick={() => setCatalogRetry(value => value + 1)} className="font-semibold underline">Try again</button>
          </div>
        ) : search.trim() ? (
          <div className="mt-5">
            <div className="text-xs uppercase tracking-widest text-earth mb-2">{results.length} result{results.length === 1 ? '' : 's'}</div>
            {results.length ? (
              <div className="divide-y divide-forest/5">
                {results.map(item => {
                  const Icon = item.category === 'Food' ? UtensilsCrossed : item.category === 'Drink' ? Wine : Bed
                  return (
                    <Link key={`${item.category}-${item.id}`} to={item.href} className="flex items-start gap-4 py-4 hover:bg-cream-50 -mx-3 px-3 rounded-xl transition">
                      <div className={`w-10 h-10 shrink-0 rounded-xl grid place-items-center ${item.category === 'Drink' ? 'bg-clay/10 text-clay' : item.category === 'Room' ? 'bg-sand text-forest-deep' : 'bg-forest/10 text-forest'}`}><Icon className="w-4 h-4" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-forest">{item.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-cream text-[10px] uppercase tracking-widest text-earth">{item.category}</span>
                        </div>
                        <div className="text-xs text-earth mt-1">{item.details}</div>
                        {item.description && <p className="text-sm text-earth mt-1 line-clamp-2">{item.description}</p>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : <p className="text-sm text-earth py-4">No food, drinks, or rooms match “{search.trim()}”.</p>}
          </div>
        ) : null}
      </section>

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
            {(s?.recentBookings || []).slice(0, 6).map((b: Booking) => (
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
            {(s?.recentReservations || []).slice(0, 6).map((r: Reservation) => (
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
