import { useEffect, useMemo, useState } from 'react'
import { Search, Star, UtensilsCrossed } from 'lucide-react'
import { KSH } from '../lib/format'
import { useBooking } from '../components/BookingContext'
import { CardSkeleton } from '../components/Skeleton'
import { fetchFoodWithFallback } from '../lib/foodData'

type Food = { id: string; name: string; description: string; price: number; image_url: string; category: string; available: boolean; featured: boolean }

export default function FoodPage() {
  const { openReservation } = useBooking()
  const [items, setItems] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState<string>('All')
  const [q, setQ] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchFoodWithFallback().then(d => { setItems(d as unknown as Food[]); setLoading(false) })
  }, [])

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category)))], [items])
  const visible = items.filter(i => (cat === 'All' || i.category === cat) && (q === '' || (i.name + i.description).toLowerCase().includes(q.toLowerCase())))

  return (
    <main className="bg-cream-50 min-h-screen">
      <section className="relative pt-40 pb-16 bg-forest text-cream overflow-hidden">
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2400&q=80" className="absolute inset-0 w-full h-full object-cover opacity-25" alt="" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.4em] text-sand">The Kitchen</div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl mt-4 leading-none">Our Food<em className="text-sand">.</em></h1>
          <p className="text-cream/80 mt-6 max-w-xl">A menu rooted in Kenyan flavour and coastal produce. From swahili breakfasts to fresh seafood, each dish is prepared with care.</p>
        </div>
      </section>

      <section className="sticky top-[70px] z-30 bg-cream-50/95 backdrop-blur border-b border-forest/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-forest/10 flex-1 min-w-[200px]"><Search className="w-4 h-4 text-earth" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search dishes..." className="bg-transparent outline-none text-sm flex-1" /></div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {categories.map(c => <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${cat === c ? 'bg-forest text-cream' : 'bg-white border border-forest/10 text-forest hover:bg-forest/5'}`}>{c}</button>)}
          </div>
          <button onClick={openReservation} className="px-5 py-2.5 rounded-full bg-clay text-cream font-semibold text-sm hover:opacity-90">Reserve a Table</button>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({length: 6}).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : visible.length === 0 ? (
            <div className="text-center py-24"><UtensilsCrossed className="w-12 h-12 text-earth-light mx-auto" /><div className="font-display text-2xl text-forest mt-4">No dishes match your search</div><p className="text-earth mt-2">Try another category or clear the search.</p></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map(f => (
                <article key={f.id} className="group rounded-3xl overflow-hidden bg-white border border-forest/5 lift flex flex-col">
                  <div className="relative h-60 img-zoom">
                    <img src={f.image_url} alt={f.name} className="w-full h-full object-cover" />
                    {f.featured && <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-clay text-cream text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1"><Star className="w-3 h-3" /> Chef’s Pick</span>}
                    {!f.available && <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-forest-deep/80 text-cream text-[10px] uppercase tracking-widest">Unavailable</span>}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-clay">{f.category}</div>
                    <div className="flex items-baseline justify-between gap-3 mt-1">
                      <h3 className="font-display text-2xl text-forest">{f.name}</h3>
                      <div className="font-display text-xl text-forest whitespace-nowrap">{KSH(f.price)}</div>
                    </div>
                    <p className="text-earth text-sm mt-3 leading-relaxed flex-1">{f.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-forest text-cream text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.4em] text-sand">Come dine with us</div>
          <h2 className="font-display text-4xl md:text-5xl mt-4">Reserve your table today</h2>
          <button onClick={openReservation} className="mt-8 px-8 py-4 rounded-full bg-sand text-forest-deep font-semibold hover:bg-cream transition">Reserve a Table</button>
        </div>
      </section>
    </main>
  )
}
