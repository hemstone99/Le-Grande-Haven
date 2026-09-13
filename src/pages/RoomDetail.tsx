import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Users, Bed, Check, Wifi, Bath, Coffee, ShieldCheck, Sparkles, MapPin, Phone, MessageCircle } from 'lucide-react'
import { KSH } from '../lib/format'
import { useBooking } from '../components/BookingContext'
import { fetchRoomsWithFallback } from '../lib/roomsData'

type Room = { id: string; slug: string; name: string; description: string; short_description: string; room_type: string; guests: number; bed_config: string; price_per_night: number; amenities: string[]; available: boolean; images?: { url: string }[] }

export default function RoomDetail() {
  const { slug } = useParams()
  const { openBooking } = useBooking()
  const [room, setRoom] = useState<Room | null>(null)
  const [others, setOthers] = useState<Room[]>([])
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchRoomsWithFallback().then(d => {
      const rows = d as unknown as Room[]
      const found = rows.find(r => r.slug === slug) || null
      setRoom(found)
      setOthers(rows.filter(r => r.slug !== slug).slice(0, 3))
      setLoading(false)
    })
    setActive(0)
  }, [slug])

  if (loading) return <div className="min-h-screen grid place-items-center bg-cream-50"><div className="font-display text-3xl text-forest animate-pulse">Loading...</div></div>
  if (!room) return (
    <div className="min-h-screen grid place-items-center bg-cream-50">
      <div className="text-center"><div className="font-display text-3xl text-forest">Room not found</div><Link to="/rooms" className="mt-4 inline-block text-clay underline">Back to all rooms</Link></div>
    </div>
  )

  const images = room.images && room.images.length ? room.images : [{ url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=80' }]
  const amenityIcon = (a: string) => {
    const s = a.toLowerCase()
    if (s.includes('wi-fi') || s.includes('wifi')) return Wifi
    if (s.includes('shower') || s.includes('bath')) return Bath
    if (s.includes('parking') || s.includes('secure')) return ShieldCheck
    if (s.includes('cleaning') || s.includes('room service')) return Sparkles
    if (s.includes('coffee') || s.includes('tea') || s.includes('breakfast')) return Coffee
    if (s.includes('bed')) return Bed
    return Check
  }

  return (
    <main className="bg-cream-50 min-h-screen">
      <div className="pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <Link to="/rooms" className="inline-flex items-center gap-2 text-earth hover:text-forest text-sm"><ArrowLeft className="w-4 h-4" /> All Rooms</Link>
        </div>
      </div>

      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="rounded-3xl overflow-hidden h-[500px] bg-cream shadow-lg"><img src={images[active].url} alt={room.name} className="w-full h-full object-cover animate-fade-in" /></div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`h-24 rounded-2xl overflow-hidden border-2 transition ${i === active ? 'border-forest' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={img.url} className="w-full h-full object-cover" alt="" /></button>
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="text-xs uppercase tracking-[0.4em] text-clay">{room.room_type}</div>
            <h1 className="font-display text-6xl text-forest mt-3">{room.name}</h1>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="font-display text-4xl text-forest">{KSH(room.price_per_night)}</span>
              <span className="text-earth">/ night</span>
              <span className="ml-2 text-[10px] uppercase tracking-widest text-clay font-semibold">Bed &amp; breakfast</span>
              {room.available ? <span className="ml-auto px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-semibold">Available</span> : <span className="ml-auto px-3 py-1 rounded-full bg-clay/10 text-clay text-xs font-semibold">Currently Booked</span>}
            </div>
            <div className="hairline my-6" />
            <p className="text-earth leading-relaxed">{room.description}</p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 rounded-2xl bg-cream border border-forest/5"><Users className="w-4 h-4 text-clay" /><div className="text-xs text-earth mt-2">Sleeps</div><div className="font-display text-xl text-forest">{room.guests} guests</div></div>
              <div className="p-4 rounded-2xl bg-cream border border-forest/5"><Bed className="w-4 h-4 text-clay" /><div className="text-xs text-earth mt-2">Bed</div><div className="font-display text-xl text-forest">{room.bed_config}</div></div>
            </div>
            <button onClick={() => openBooking(room.id)} className="mt-6 w-full px-7 py-4 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep transition text-lg">Book This Room</button>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <a href="tel:0182219969" className="px-3 py-3 rounded-full border border-forest/20 text-forest text-xs font-semibold hover:bg-forest/5 flex items-center justify-center gap-2"><Phone className="w-4 h-4" /> Call</a>
              <a href="https://wa.me/0182219969" className="px-3 py-3 rounded-full border border-forest/20 text-forest text-xs font-semibold hover:bg-forest/5 flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
              <Link to="/contact" className="px-3 py-3 rounded-full border border-forest/20 text-forest text-xs font-semibold hover:bg-forest/5 flex items-center justify-center gap-2"><MapPin className="w-4 h-4" /> Visit</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-4xl text-forest">Room Amenities</h2>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {room.amenities.map(a => {
                const Icon = amenityIcon(a)
                return <div key={a} className="flex items-center gap-3 p-4 rounded-2xl bg-cream border border-forest/5"><div className="w-10 h-10 rounded-xl bg-forest/10 grid place-items-center"><Icon className="w-4 h-4 text-forest" /></div><span className="text-sm text-forest-deep">{a}</span></div>
              })}
            </div>
          </div>
          <div>
            <h2 className="font-display text-4xl text-forest">House Rules</h2>
            <ul className="mt-6 space-y-3 text-earth">
              {['24-hour reception — check-in from 11:00am (earlier check-in on request)', 'Check-out by 10:00am', 'All rooms include bed & breakfast', 'Quiet hours from 10:00pm to 6:00am', 'No smoking inside the rooms', 'Pets welcome on request', 'Payment on arrival — M-Pesa, bank or cash (50% deposit on booking)', 'Cancellations: free up to 48 hours before arrival'].map(r => <li key={r} className="flex items-start gap-3"><Check className="w-5 h-5 text-forest mt-0.5 shrink-0" /> {r}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="py-16 bg-cream-100">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-display text-4xl text-forest">Similar Rooms</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {others.map(o => (
                <Link key={o.id} to={`/rooms/${o.slug}`} className="group rounded-3xl overflow-hidden bg-white border border-forest/5 lift">
                  <div className="h-56 img-zoom"><img src={o.images?.[0]?.url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'} className="w-full h-full object-cover" alt={o.name} /></div>
                  <div className="p-5"><div className="text-[10px] uppercase tracking-[0.3em] text-clay">{o.room_type}</div><div className="flex items-baseline justify-between mt-1"><h3 className="font-display text-2xl text-forest">{o.name}</h3><span className="font-display text-forest">{KSH(o.price_per_night)}</span></div><p className="text-sm text-earth mt-2 line-clamp-2">{o.short_description}</p></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
