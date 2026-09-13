import { useEffect, useMemo, useState } from 'react'
import { Search, Star, Wine } from 'lucide-react'
import { KSH } from '../lib/format'
import { useBooking } from '../components/BookingContext'
import { CardSkeleton } from '../components/Skeleton'
import { fetchDrinksWithFallback } from '../lib/drinksData'

type Drink = { id: string; name: string; description: string; price: number; image_url: string; category: string; available: boolean; featured: boolean }

export default function DrinksPage() {
  const { openBooking } = useBooking()
  const [items, setItems] = useState<Drink[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchDrinksWithFallback().then(d => { setItems(d as unknown as Drink[]); setLoading(false) })
  }, [])

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category)))], [items])
  const visible = items.filter(i => (cat === 'All' || i.category === cat) && (q === '' || (i.name + i.description).toLowerCase().includes(q.toLowerCase())))

  return (
    <main className="bg-cream-50 min-h-screen">
      <section className="relative pt-40 pb-16 bg-clay text-cream overflow-hidden">
        <img src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=2400&q=80" className="absolute inset-0 w-full h-full object-cover opacity-25" alt="" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.4em] text-sand">The Bar</div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl mt-4 leading-none">Our Drinks<em className="text-sand">.</em></h1>
          <p className="text-cream/85 mt-6 max-w-xl">Cold-pressed juices, house cocktails, world-class coffee and honest Kenyan teas. Whatever the moment, we’ve poured for it.</p>
        </div>
      </section>

      <section className="sticky top-[70px] z-30 bg-cream-50/95 backdrop-blur border-b border-forest/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-forest/10 flex-1 min-w-[200px]"><Search className="w-4 h-4 text-earth" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search drinks..." className="bg-transparent outline-none text-sm flex-1" /></div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {categories.map(c => <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${cat === c ? 'bg-clay text-cream' : 'bg-white border border-forest/10 text-forest hover:bg-forest/5'}`}>{c}</button>)}
          </div>
          <button onClick={() => openBooking()} className="px-5 py-2.5 rounded-full bg-forest text-cream font-semibold text-sm hover:bg-forest-deep">Visit Le Grande Haven</button>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({length: 6}).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : visible.length === 0 ? (
            <div className="text-center py-24"><Wine className="w-12 h-12 text-earth-light mx-auto" /><div className="font-display text-2xl text-forest mt-4">Nothing matches your search</div></div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map(d => (
                <article key={d.id} className="group rounded-3xl overflow-hidden bg-white border border-forest/5 lift flex flex-col">
                  <div className="relative h-80 sm:h-96 img-zoom bg-gradient-to-b from-white to-cream-100 flex items-end justify-center overflow-hidden py-2">
                    <img
                      src={d.image_url}
                      alt={d.name}
                      loading="lazy"
                      className="h-full w-auto max-w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700"
                    />
                    {d.featured && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-clay text-cream text-[9px] uppercase tracking-widest font-semibold flex items-center gap-1"><Star className="w-3 h-3" /> Signature</span>}
                    {!d.available && <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-forest-deep/80 text-cream text-[9px] uppercase tracking-widest">Sold out</span>}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-clay">{d.category}</div>
                    <div className="flex items-baseline justify-between gap-2 mt-1">
                      <h3 className="font-display text-xl text-forest">{d.name}</h3>
                      <div className="font-semibold text-sm text-clay whitespace-nowrap">{KSH(d.price)}</div>
                    </div>
                    <p className="text-earth text-xs mt-2 leading-relaxed flex-1">{d.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
