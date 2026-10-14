import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Users, BedDouble, Bath, ArrowRight, Minus, Plus, Star, Coffee, Wifi, Tv, Car, Sparkles, ShowerHead, KeyRound, ConciergeBell, LayoutGrid, Bed, Crown, Baby, BedSingle, Gem, SearchX, Clock, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { KSH } from '../lib/format'
import { useBooking } from '../components/BookingContext'
import { CardSkeleton } from '../components/Skeleton'
import { BrandTile, IconTile, TILE_BG } from '../components/BrandIcons'
import { fetchRoomsWithFallback } from '../lib/roomsData'
import { whatsappLink, PHONE_TEL, PHONE_DISPLAY } from '../lib/contact'
import HeroWave from '../components/HeroWave'

type Room = {
  id: string; slug: string; name: string; short_description: string; room_type: string; guests: number
  bed_config: string; price_per_night: number; amenities: string[]; available: boolean; featured: boolean
  sort_order?: number; images?: { url: string }[]
}

const TYPE_ORDER = ['Standard', 'Deluxe', 'Twin', 'Family', 'Suite']
const TYPE_ICONS: Record<string, LucideIcon> = { All: LayoutGrid, Standard: Bed, Deluxe: Gem, Twin: BedSingle, Family: Baby, Suite: Crown }
const SORTS = { recommended: 'Recommended', 'price-asc': 'Price: low–high', 'price-desc': 'Price: high–low', guests: 'Most guests' } as const
type Sort = keyof typeof SORTS

// Shown on each card — the first of these a room lists, in this priority
const HIGHLIGHTS = ['Breakfast included', 'Private terrace', 'Balcony', 'Garden view', 'Coffee & tea', 'Rain shower', 'Flat-screen TV with DSTV', 'Work desk', 'Wi-Fi']

// Every room lists these, so they're safe to promise as standard
const INCLUDED = [
  { Icon: Coffee, bg: TILE_BG.earth, t: 'Breakfast included', d: 'Bed & breakfast rates' },
  { Icon: Wifi, bg: TILE_BG.ocean, t: 'Free Wi-Fi', d: 'Throughout the property' },
  { Icon: ShowerHead, bg: TILE_BG.forest, t: 'Private bathroom', d: 'Hot shower & fresh towels' },
  { Icon: Tv, bg: TILE_BG.clay, t: 'DSTV', d: 'Flat-screen in every room' },
  { Icon: Sparkles, bg: TILE_BG.sand, t: 'Daily cleaning', d: 'Plus room service' },
  { Icon: Car, bg: TILE_BG.earth, t: 'Secure parking', d: 'On-site for guests' },
]

function RoomCard({ room, onBook }: { room: Room; onBook: (id: string) => void }) {
  const [main, alt] = [room.images?.[0]?.url || '/hero/hero-5.jpg', room.images?.[1]?.url]
  const highlights = HIGHLIGHTS.filter(h => room.amenities?.includes(h)).slice(0, 3)
  const extra = (room.amenities?.length || 0) - highlights.length
  return (
    <article className={`group rounded-[1.75rem] overflow-hidden bg-white border border-forest/5 shadow-[0_18px_40px_-30px_rgba(15,29,24,0.45)] hover:shadow-[0_30px_60px_-30px_rgba(15,29,24,0.55)] hover:-translate-y-1 transition duration-500 flex flex-col ${room.available ? '' : 'opacity-70'}`}>
      <Link to={`/rooms/${room.slug}`} className="relative block aspect-[4/3] overflow-hidden" aria-label={`View ${room.name}`}>
        <img loading="lazy" decoding="async" src={main} alt={room.name} className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105" />
        {/* Second photo (usually the bathroom) fades in on hover */}
        {alt && <img loading="lazy" decoding="async" src={alt} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-700" />}
        <div className="absolute inset-0 bg-linear-to-t from-forest-deep/90 via-forest-deep/25 via-45% to-forest-deep/10" />
        <div className="absolute top-4 left-4 right-4 flex justify-between gap-2">
          {room.featured ? <span className="px-3 py-1 rounded-full bg-white/95 text-forest text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 shadow"><Star className="w-3 h-3 fill-clay text-clay" /> Guest favourite</span> : <span />}
          <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold shadow ${room.available ? 'bg-emerald-500/90 text-white' : 'bg-clay text-cream'}`}>{room.available ? 'Available' : 'Booked'}</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-cream [text-shadow:0_1px_12px_rgba(0,0,0,0.45)]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-sand">{room.room_type}</div>
            <h3 className="font-display text-3xl leading-none mt-1">{room.name}</h3>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl leading-none">{KSH(room.price_per_night)}</div>
            <div className="text-[10px] uppercase tracking-widest text-cream/75 mt-1">per night · B&amp;B</div>
          </div>
        </div>
      </Link>
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-earth text-sm leading-relaxed">{room.short_description}</p>
        <div className="grid grid-cols-3 gap-2 mt-5">
          {[[Users, `${room.guests} guests`], [BedDouble, room.bed_config], [Bath, 'Ensuite']].map(([Icon, label]) => {
            const I = Icon as LucideIcon
            return <div key={label as string} className="px-2 py-2.5 rounded-xl bg-cream-50 text-center"><I className="w-4 h-4 text-clay mx-auto" /><div className="text-[11px] font-semibold text-forest mt-1 leading-tight">{label as string}</div></div>
          })}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {highlights.map(h => <span key={h} className="px-2.5 py-1 rounded-full border border-forest/10 text-[11px] text-earth">{h.replace('Flat-screen TV with DSTV', 'DSTV')}</span>)}
          {extra > 0 && <span className="px-2.5 py-1 rounded-full bg-forest/5 text-[11px] font-semibold text-forest">+{extra} more</span>}
        </div>
        <div className="flex items-center gap-2 mt-auto pt-6">
          <Link to={`/rooms/${room.slug}`} className="flex-1 px-4 py-3 rounded-full border border-forest/15 text-forest text-sm font-semibold hover:bg-forest/5 transition flex items-center justify-center gap-1.5">Details <ArrowRight className="w-4 h-4" /></Link>
          <button onClick={() => onBook(room.id)} disabled={!room.available} className="flex-1 px-4 py-3 rounded-full bg-forest text-cream text-sm font-semibold hover:bg-forest-deep transition disabled:opacity-50 disabled:cursor-not-allowed">Book now</button>
        </div>
      </div>
    </article>
  )
}

export default function RoomsPage() {
  const { openBooking } = useBooking()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('All')
  const [guests, setGuests] = useState(1)
  const [sort, setSort] = useState<Sort>('recommended')
  const [availableOnly, setAvailableOnly] = useState(false)

  useEffect(() => { fetchRoomsWithFallback().then(d => { setRooms(d as unknown as Room[]); setLoading(false) }) }, [])

  const types = useMemo(() => {
    const present = Array.from(new Set(rooms.map(r => r.room_type)))
    return ['All', ...TYPE_ORDER.filter(t => present.includes(t)), ...present.filter(t => !TYPE_ORDER.includes(t))]
  }, [rooms])
  const maxGuests = Math.max(1, ...rooms.map(r => r.guests))
  const fromPrice = rooms.length ? Math.min(...rooms.map(r => Number(r.price_per_night))) : 0

  const visible = useMemo(() => {
    const list = rooms.filter(r => (type === 'All' || r.room_type === type) && r.guests >= guests && (!availableOnly || r.available))
    const by: Record<Sort, (a: Room, b: Room) => number> = {
      recommended: (a, b) => Number(b.featured) - Number(a.featured) || (a.sort_order ?? 0) - (b.sort_order ?? 0),
      'price-asc': (a, b) => a.price_per_night - b.price_per_night,
      'price-desc': (a, b) => b.price_per_night - a.price_per_night,
      guests: (a, b) => b.guests - a.guests,
    }
    return [...list].sort(by[sort])
  }, [rooms, type, guests, availableOnly, sort])

  const reset = () => { setType('All'); setGuests(1); setAvailableOnly(false); setSort('recommended') }

  return (
    <main className="bg-cream-50 min-h-screen">
      {/* HERO */}
      <section className="relative pt-36 pb-32 md:pb-40 bg-forest-deep text-cream overflow-hidden">
        <img src="/hero/hero-accommodation.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-110" />
        <div className="absolute inset-0 bg-linear-to-r from-forest-deep via-forest-deep/90 to-forest-deep/60" />
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-sand">Stay with us</div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl xl:text-8xl mt-5 leading-[0.95]">Rest easy,<br /><em className="text-sand">by the coast.</em></h1>
            <p className="text-cream/80 mt-6 max-w-xl text-lg">Ten rooms named for the sea creatures and mangroves of Kwale’s shoreline — simple, restful and thoughtfully finished, with breakfast on us.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => openBooking()} className="px-7 py-3.5 rounded-full bg-sand text-forest-deep font-semibold hover:bg-cream transition inline-flex items-center gap-2">Book a Room <ArrowRight className="w-4 h-4" /></button>
              <a href={whatsappLink('Hello Le Grande Haven, I’d like to check room availability.')} target="_blank" rel="noreferrer" className="pl-2 pr-6 py-2 rounded-full bg-cream/10 border border-cream/20 font-semibold hover:bg-cream/15 transition inline-flex items-center gap-3"><BrandTile brand="whatsapp" size={36} /> Check availability</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
              {[[loading ? '—' : String(rooms.length), 'rooms'], [loading ? '—' : KSH(fromPrice), 'from, per night'], ['B&B', 'breakfast included'], ['11am', 'check-in']].map(([n, t]) => (
                <div key={t}><div className="font-display text-3xl md:text-4xl text-sand">{n}</div><div className="text-[11px] uppercase tracking-[0.25em] text-cream/60 mt-1">{t}</div></div>
              ))}
            </div>
          </div>
          <div className="relative h-[420px] hidden lg:block" aria-hidden="true">
            {['/rooms/una.jpg', '/hero/hero-5.jpg', '/rooms/bath-2.jpg'].map((src, i) => (
              <div key={src} className={`absolute w-64 xl:w-72 aspect-[3/4] rounded-[1.75rem] overflow-hidden shadow-2xl ring-1 ring-cream/15 ${['left-4 top-10 -rotate-8', 'left-1/2 -translate-x-1/2 top-0 rotate-1 z-10', 'right-4 top-14 rotate-9'][i]}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        <HeroWave fill="#fbf8f2" />
      </section>

      {/* STICKY FILTERS */}
      <div className="sticky top-[72px] z-30 bg-cream-50/90 backdrop-blur border-b border-forest/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0 flex-1">
            {types.map(t => {
              const Icon = TYPE_ICONS[t] || Bed
              const on = type === t
              const count = t === 'All' ? rooms.length : rooms.filter(r => r.room_type === t).length
              return (
                <button key={t} onClick={() => setType(t)} aria-pressed={on} className={`shrink-0 inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full text-sm font-semibold transition ${on ? 'bg-forest text-cream shadow-md' : 'bg-white text-forest border border-forest/10 hover:border-forest/30'}`}>
                  <span className={`w-7 h-7 rounded-full grid place-items-center ${on ? 'bg-cream/15 text-sand' : 'bg-cream text-clay'}`}><Icon className="w-4 h-4" /></span>{t}<span className={`text-xs ${on ? 'text-cream/60' : 'text-earth/60'}`}>{count}</span>
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-white border border-forest/10" role="group" aria-label="Guests" title="Number of guests">
              <Users className="w-4 h-4 text-earth" />
              <span className="text-sm font-semibold text-forest w-6 text-center tabular-nums" aria-live="polite">{guests}<span className="sr-only"> guests</span></span>
              <button onClick={() => setGuests(g => Math.max(1, g - 1))} disabled={guests <= 1} className="w-8 h-8 rounded-full bg-cream grid place-items-center text-forest disabled:opacity-40" aria-label="Fewer guests"><Minus className="w-3.5 h-3.5" /></button>
              <button onClick={() => setGuests(g => Math.min(maxGuests, g + 1))} disabled={guests >= maxGuests} className="w-8 h-8 rounded-full bg-cream grid place-items-center text-forest disabled:opacity-40" aria-label="More guests"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as Sort)} aria-label="Sort rooms" className="pl-4 pr-2 py-2.5 rounded-full bg-white border border-forest/10 text-sm font-semibold text-forest outline-none focus:border-forest">
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button onClick={() => setAvailableOnly(v => !v)} role="switch" aria-checked={availableOnly} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-forest/10 text-sm font-semibold text-forest">
              <span className={`w-9 h-5 rounded-full p-0.5 transition ${availableOnly ? 'bg-forest' : 'bg-forest/20'}`}><span className={`block w-4 h-4 rounded-full bg-white shadow transition ${availableOnly ? 'translate-x-4' : ''}`} /></span>
              Available
            </button>
          </div>
        </div>
      </div>

      {/* ROOMS */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          {!loading && <div className="text-sm text-earth mb-6">Showing <strong className="text-forest">{visible.length}</strong> of {rooms.length} rooms</div>}
          {loading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : visible.length ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">{visible.map(r => <RoomCard key={r.id} room={r} onBook={openBooking} />)}</div>
          ) : (
            <div className="text-center py-24 rounded-[2rem] bg-white border border-forest/5">
              <SearchX className="w-12 h-12 text-earth-light mx-auto" />
              <div className="font-display text-2xl text-forest mt-4">No rooms match those filters</div>
              <p className="text-earth mt-2">Try fewer guests or another room type — or ask us, we’ll find you something.</p>
              <button onClick={reset} className="mt-6 px-6 py-3 rounded-full bg-forest text-cream font-semibold">Clear filters</button>
            </div>
          )}
        </div>
      </section>

      {/* EVERY STAY INCLUDES */}
      <section className="py-20 bg-forest-deep text-cream relative overflow-hidden">
        <img src="/hero/hero-lush.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-10" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.4em] text-sand">In every room</div>
            <h2 className="font-display text-4xl md:text-5xl mt-4">Everything you need, nothing you don’t.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
            {INCLUDED.map(({ Icon, bg, t, d }) => (
              <div key={t} className="p-5 rounded-3xl bg-cream/5 border border-cream/10 hover:bg-cream/10 transition">
                <IconTile icon={Icon} bg={bg} size={48} />
                <div className="font-semibold mt-4">{t}</div>
                <div className="text-xs text-cream/60 mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GOOD TO KNOW + CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_1.2fr] gap-6">
          <div className="p-8 md:p-10 rounded-[2rem] bg-white border border-forest/5">
            <div className="text-xs uppercase tracking-[0.4em] text-clay">Good to know</div>
            <ul className="mt-6 space-y-5">
              {[
                { Icon: KeyRound, t: 'Check-in from 11:00am', d: 'Early check-in on request — tell us your arrival time.' },
                { Icon: Clock, t: 'Check-out by 10:00am', d: 'Need a little longer? Just ask at reception.' },
                { Icon: ConciergeBell, t: 'Reception open 24 hours', d: 'Someone is always on hand, day or night.' },
                { Icon: ShieldCheck, t: 'Best rate when you book direct', d: 'Book here, by phone or on WhatsApp.' },
              ].map(({ Icon, t, d }) => (
                <li key={t} className="flex gap-4"><span className="w-11 h-11 rounded-2xl bg-cream grid place-items-center text-clay shrink-0"><Icon className="w-5 h-5" /></span><div><div className="font-semibold text-forest">{t}</div><div className="text-sm text-earth mt-0.5">{d}</div></div></li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-[2rem] overflow-hidden p-10 md:p-12 text-cream flex flex-col justify-end min-h-[380px]">
            <img src="/hero/hero-4.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-forest-deep via-forest-deep/60 to-transparent" />
            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl">Your room is <em className="text-sand">waiting.</em></h2>
              <p className="text-cream/80 mt-3 max-w-md">Pick your dates and our team will confirm your booking — or call us on {PHONE_DISPLAY}.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => openBooking()} className="px-7 py-3.5 rounded-full bg-sand text-forest-deep font-semibold hover:bg-cream transition">Book a Room</button>
                <a href={PHONE_TEL} className="pl-2 pr-6 py-2 rounded-full bg-cream/10 border border-cream/25 font-semibold hover:bg-cream/15 transition inline-flex items-center gap-3 backdrop-blur"><IconTile icon={Phone} bg={TILE_BG.phone} size={36} /> Call reception</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
