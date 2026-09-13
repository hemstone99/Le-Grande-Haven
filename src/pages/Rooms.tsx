import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Bed, ArrowRight, Wifi, Coffee, Bath, Filter, ShieldCheck } from 'lucide-react'
import { KSH } from '../lib/format'
import { useBooking } from '../components/BookingContext'
import { CardSkeleton } from '../components/Skeleton'
import { fetchRoomsWithFallback } from '../lib/roomsData'

type Room = {
  id: string; slug: string; name: string; short_description: string; room_type: string; guests: number;
  bed_config: string; price_per_night: number; amenities: string[]; available: boolean; featured: boolean;
  images?: { url: string }[]
}

export default function RoomsPage() {
  const { openBooking } = useBooking()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('All')
  const [guests, setGuests] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [availableOnly, setAvailableOnly] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchRoomsWithFallback().then(d => {
      setRooms(d as unknown as Room[])
      setMaxPrice(Math.max(...d.map((x) => Number(x.price_per_night))) || 0)
      setLoading(false)
    })
  }, [])

  const types = useMemo(() => ['All', ...Array.from(new Set(rooms.map(r => r.room_type)))], [rooms])
  const priceCeiling = Math.max(...rooms.map(r => Number(r.price_per_night)), 0)

  const visible = rooms.filter(r =>
    (type === 'All' || r.room_type === type) &&
    (guests === 0 || r.guests >= guests) &&
    (maxPrice === 0 || Number(r.price_per_night) <= maxPrice) &&
    (!availableOnly || r.available)
  )

  return (
    <main className="bg-cream-50 min-h-screen">
      <section className="relative pt-40 pb-16 bg-forest-deep text-cream overflow-hidden">
        <img src="/hero/hero-1.jpg" className="absolute inset-0 w-full h-full object-cover opacity-35" style={{ objectPosition: 'center 40%' }} alt="Le Grande Haven four-poster suite" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.4em] text-sand">Our Ten Rooms</div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl mt-4 leading-none">Stay With Us<em className="text-sand">.</em></h1>
          <p className="text-cream/80 mt-6 max-w-xl">Each room is named after the sea creatures and mangroves of Kwale’s shoreline. Simple, restful, and thoughtfully finished.</p>
        </div>
      </section>

      <section className="sticky top-[70px] z-30 bg-cream-50/95 backdrop-blur border-b border-forest/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-forest"><Filter className="w-4 h-4" /><span className="text-sm font-semibold">Filters</span></div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {types.map(t => <button key={t} onClick={() => setType(t)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${type === t ? 'bg-forest text-cream' : 'bg-white border border-forest/10 text-forest hover:bg-forest/5'}`}>{t}</button>)}
          </div>
          <select value={guests} onChange={e => setGuests(parseInt(e.target.value))} className="px-4 py-2 rounded-full bg-white border border-forest/10 text-sm text-forest">
            <option value={0}>Any guests</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ guests</option>)}
          </select>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-forest/10 flex-1 min-w-[220px] sm:flex-none">
            <span className="text-xs text-earth shrink-0">Max</span>
            <input type="range" min={0} max={priceCeiling || 10000} step={500} value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))} className="accent-forest flex-1" />
            <span className="text-xs font-semibold text-forest w-20 text-right shrink-0">{maxPrice ? KSH(maxPrice) : 'Any'}</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-forest cursor-pointer"><input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} className="accent-forest w-4 h-4" /> Available only</label>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-8">{Array.from({length: 4}).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {visible.map(r => (
                <article key={r.id} className="group rounded-3xl overflow-hidden bg-white border border-forest/5 lift flex flex-col">
                  <Link to={`/rooms/${r.slug}`} className="block h-72 img-zoom relative">
                    <img src={r.images?.[0]?.url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80'} alt={r.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {r.featured && <span className="px-3 py-1 rounded-full bg-sand text-forest-deep text-[10px] uppercase tracking-widest font-semibold">Featured</span>}
                      {r.available ? <span className="px-3 py-1 rounded-full bg-forest text-cream text-[10px] uppercase tracking-widest">Available</span> : <span className="px-3 py-1 rounded-full bg-clay text-cream text-[10px] uppercase tracking-widest">Booked</span>}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-cream/95 px-4 py-2 rounded-full text-right"><div><span className="font-display text-forest text-lg">{KSH(r.price_per_night)}</span><span className="text-xs text-earth"> / night</span></div><div className="text-[10px] uppercase tracking-widest text-clay -mt-0.5">Bed & breakfast</div></div>
                  </Link>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-clay">{r.room_type}</div>
                    <h3 className="font-display text-3xl text-forest mt-1">{r.name}</h3>
                    <p className="text-earth mt-2 flex-1">{r.short_description}</p>
                    <div className="flex flex-wrap gap-4 mt-4 text-xs text-earth">
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {r.guests} guests</span>
                      <span className="flex items-center gap-1.5"><Bed className="w-3.5 h-3.5" /> {r.bed_config}</span>
                      <span className="flex items-center gap-1.5"><Bath className="w-3.5 h-3.5" /> Private bath</span>
                      <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5" /> Wi-Fi</span>
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                      <Link to={`/rooms/${r.slug}`} className="flex-1 px-5 py-3 rounded-full border border-forest/20 text-forest text-sm font-semibold hover:bg-forest/5 transition flex items-center justify-center gap-2">View Details <ArrowRight className="w-4 h-4" /></Link>
                      <button onClick={() => openBooking(r.id)} className="flex-1 px-5 py-3 rounded-full bg-forest text-cream text-sm font-semibold hover:bg-forest-deep transition">Book Now</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-cream-100">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[{i: ShieldCheck, t:'Best rate promise', d:'Booking direct always gives our best price.'},
            {i: Coffee, t:'Breakfast included', d:'Start every morning with a Swahili breakfast.'},
            {i: Bath, t:'Warm hospitality', d:'Fresh towels, hot showers and honest smiles.'}].map(({i:Icon,t,d}) => (
              <div key={t} className="p-6 rounded-2xl bg-white border border-forest/5 flex gap-4"><div className="w-12 h-12 rounded-2xl bg-forest text-cream grid place-items-center shrink-0"><Icon className="w-6 h-6" /></div><div><div className="font-display text-xl text-forest">{t}</div><p className="text-sm text-earth mt-1">{d}</p></div></div>
            ))}
        </div>
      </section>
    </main>
  )
}
