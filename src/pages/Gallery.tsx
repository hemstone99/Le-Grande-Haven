import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, Expand, Images, Trees, BedDouble, UtensilsCrossed, Wine, Presentation } from 'lucide-react'
import { useBooking } from '../components/BookingContext'
import { BrandTile } from '../components/BrandIcons'
import { SOCIALS } from '../lib/contact'

type Category = 'grounds' | 'rooms' | 'dining' | 'bar' | 'events'
type Photo = { url: string; caption: string; category: Category }

const CATEGORIES: { key: Category | 'all'; label: string; Icon: typeof Images }[] = [
  { key: 'all', label: 'All', Icon: Images },
  { key: 'grounds', label: 'Grounds', Icon: Trees },
  { key: 'rooms', label: 'Rooms', Icon: BedDouble },
  { key: 'dining', label: 'Dining', Icon: UtensilsCrossed },
  { key: 'bar', label: 'Bar', Icon: Wine },
  { key: 'events', label: 'Events', Icon: Presentation },
]

// The site's own photography, used alongside the admin-managed gallery
const LIBRARY: Photo[] = [
  { url: '/hero/hero-lush.jpg', caption: 'Arriving at Le Grande Haven · Kanana', category: 'grounds' },
  { url: '/hero/hero-accommodation.jpg', caption: 'The accommodation wing among the palms', category: 'grounds' },
  { url: '/hero/hero-2.jpg', caption: 'Tropical garden paths', category: 'grounds' },
  { url: '/hero/karibu.jpg', caption: 'Karibu — sundowners on the lawn', category: 'grounds' },
  { url: '/hero/kids-playground.jpg', caption: 'The kids’ playground', category: 'grounds' },
  { url: '/hero/hero-5.jpg', caption: 'Four-poster canopy suite', category: 'rooms' },
  { url: '/hero/hero-1.jpg', caption: 'Morning light in a garden room', category: 'rooms' },
  { url: '/hero/hero-4.jpg', caption: 'Sun-warmed retreats', category: 'rooms' },
  { url: '/rooms/una.jpg', caption: 'Una — a private veranda', category: 'rooms' },
  { url: '/rooms/tumbawe.jpg', caption: 'Tumbawe', category: 'rooms' },
  { url: '/rooms/pweza.jpg', caption: 'Pweza — garden view', category: 'rooms' },
  { url: '/rooms/mwani.jpg', caption: 'Mwani', category: 'rooms' },
  { url: '/rooms/bath-2.jpg', caption: 'Ensuite bathrooms', category: 'rooms' },
  { url: '/hero/hero-6.jpg', caption: 'The Pweza Suite', category: 'rooms' },
  { url: '/food/fish-large.jpg', caption: 'Whole fried fish, Swahili style', category: 'dining' },
  { url: '/food/mbuzi-choma.jpg', caption: 'Nyama choma, straight off the grill', category: 'dining' },
  { url: '/food/pilau.jpg', caption: 'Coastal pilau with kachumbari', category: 'dining' },
  { url: '/food/fish-wet.jpg', caption: 'Fish in coconut sauce, by the sea', category: 'dining' },
  { url: '/food/chicken-broiler-choma.jpg', caption: 'Grilled chicken with ugali', category: 'dining' },
  { url: '/food/samosa.jpg', caption: 'Samosas & chutneys', category: 'dining' },
  { url: '/food/full-breakfast.jpg', caption: 'The full Haven breakfast', category: 'dining' },
  { url: '/hero/hero-whiskies.jpg', caption: 'The whisky shelf', category: 'bar' },
  { url: '/beverages/cocktail-juice.jpg', caption: 'Fresh tropical cocktails', category: 'bar' },
  { url: '/beverages/dawa.jpg', caption: 'Signature dawa', category: 'bar' },
  { url: '/beverages/smoothie.jpg', caption: 'Mango smoothies', category: 'bar' },
  { url: '/beverages/african-tea.jpg', caption: 'Spiced African tea', category: 'bar' },
  { url: '/conference/banquet.jpg', caption: 'The banquet hall', category: 'events' },
  { url: '/conference/outdoor.jpg', caption: 'Garden pavilion receptions', category: 'events' },
  { url: '/conference/meeting-room.jpg', caption: 'The boardroom — U-shaped meeting set-up', category: 'events' },
  { url: '/conference/presentation.jpg', caption: 'Training & presentations', category: 'events' },
  { url: '/hero/hero-conference.jpg', caption: 'Conferences at the Haven', category: 'events' },
]

// Admin gallery categories → page categories
const API_CATEGORY: Record<string, Category> = { destination: 'grounds', general: 'grounds', dining: 'dining', rooms: 'rooms', bar: 'bar', events: 'events' }

export default function Gallery() {
  const { openBooking } = useBooking()
  const [admin, setAdmin] = useState<Photo[]>([])
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [open, setOpen] = useState<number | null>(null)
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then((rows: { url: string; caption?: string; category?: string }[]) => {
        if (Array.isArray(rows)) setAdmin(rows.map(r => ({ url: r.url, caption: r.caption || 'Le Grande Haven', category: API_CATEGORY[r.category || ''] || 'grounds' })))
      })
      .catch(() => {})
  }, [])

  // Admin-curated photos first, then the library; each image appears once
  const photos = useMemo(() => {
    const seen = new Set<string>()
    return [...admin, ...LIBRARY].filter(p => (seen.has(p.url) ? false : (seen.add(p.url), true)))
  }, [admin])
  const visible = useMemo(() => (filter === 'all' ? photos : photos.filter(p => p.category === filter)), [photos, filter])
  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map(c => [c.key, c.key === 'all' ? photos.length : photos.filter(p => p.category === c.key).length])), [photos])

  const step = useCallback((d: number) => setOpen(i => (i === null ? i : (i + d + visible.length) % visible.length)), [visible.length])

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, step])

  const current = open === null ? null : visible[open]

  return (
    <main className="bg-cream-50 min-h-screen">
      {/* HERO — a mosaic of the property behind the title */}
      <section className="relative pt-40 pb-20 bg-forest-deep text-cream overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 gap-1 opacity-30" aria-hidden="true">
          {LIBRARY.slice(0, 12).map(p => <img key={p.url} src={p.url} alt="" decoding="async" className="w-full h-full object-cover min-h-40" />)}
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-forest-deep/70 via-forest-deep/80 to-forest-deep" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.4em] text-sand">Moments at the Haven</div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl mt-4 leading-none">Gallery<em className="text-sand">.</em></h1>
          <p className="text-cream/80 mt-6 max-w-xl text-lg">Palm-lined gardens, canopy beds, Swahili seafood and long evenings at the bar — a look around Le Grande Haven, Kanana.</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="px-4 py-2 rounded-full bg-cream/10 border border-cream/15">{photos.length} photos</span>
            <span className="px-4 py-2 rounded-full bg-cream/10 border border-cream/15">Kanana, Shimoni</span>
          </div>
        </div>
      </section>

      {/* FILTERS — stick under the navbar while browsing */}
      <div className="sticky top-[72px] z-30 bg-cream-50/90 backdrop-blur border-b border-forest/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${filter === key ? 'bg-forest text-cream shadow-sm' : 'bg-white text-forest border border-forest/10 hover:border-forest/30'}`}
            >
              <Icon className="w-4 h-4" /> {label}
              <span className={`text-xs ${filter === key ? 'text-cream/70' : 'text-earth/70'}`}>{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MASONRY */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {visible.map((p, i) => (
            <button
              key={p.url}
              onClick={() => setOpen(i)}
              className="group relative block w-full mb-4 break-inside-avoid rounded-2xl overflow-hidden bg-cream-100 text-left shadow-sm hover:shadow-xl transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-clay"
              aria-label={`Open photo: ${p.caption}`}
            >
              <img src={p.url} alt={p.caption} loading={i < 8 ? 'eager' : 'lazy'} decoding="async" className="w-full h-auto block transition duration-700 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-linear-to-t from-forest-deep/85 via-forest-deep/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-sand">{CATEGORIES.find(c => c.key === p.category)?.label}</div>
                  <div className="font-display text-lg text-cream leading-snug mt-1">{p.caption}</div>
                </div>
                <span className="w-9 h-9 rounded-full bg-cream/15 backdrop-blur grid place-items-center text-cream shrink-0"><Expand className="w-4 h-4" /></span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-[2rem] bg-forest text-cream p-10 md:p-14 grid md:grid-cols-[1fr_auto] gap-8 items-center relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-sand/10" aria-hidden="true" />
            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl">Like what you see?</h2>
              <p className="text-cream/75 mt-3 max-w-xl">Come and make your own memories — or follow along for daily moments from the Haven.</p>
              <div className="mt-6 flex items-center gap-3">
                <a href={SOCIALS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:-translate-y-0.5 transition"><BrandTile brand="instagram" size={44} /></a>
                <a href={SOCIALS.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:-translate-y-0.5 transition"><BrandTile brand="facebook" size={44} /></a>
                <a href={SOCIALS.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className="hover:-translate-y-0.5 transition"><BrandTile brand="tiktok" size={44} /></a>
              </div>
            </div>
            <div className="relative flex flex-wrap gap-3">
              <button onClick={() => openBooking()} className="px-7 py-3.5 rounded-full bg-sand text-forest-deep font-semibold hover:bg-cream transition">Book a Room</button>
              <Link to="/contact" className="px-7 py-3.5 rounded-full border border-cream/30 font-semibold hover:bg-cream/10 transition">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      {current && (
        <div
          className="fixed inset-0 z-[70] bg-forest-deep/95 backdrop-blur-sm flex flex-col"
          role="dialog" aria-modal="true" aria-label={current.caption}
          onClick={() => setOpen(null)}
          onTouchStart={e => { touchX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
            touchX.current = null
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 text-cream" onClick={e => e.stopPropagation()}>
            <div className="text-sm tabular-nums text-cream/70">{(open ?? 0) + 1} / {visible.length}</div>
            <button onClick={() => setOpen(null)} className="w-11 h-11 rounded-full bg-cream/10 hover:bg-cream/20 grid place-items-center" aria-label="Close"><X className="w-5 h-5" /></button>
          </div>
          <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 md:px-20">
            <img key={current.url} src={current.url} alt={current.caption} className="max-h-full max-w-full object-contain rounded-xl shadow-2xl animate-fade-up" onClick={e => e.stopPropagation()} />
            <button onClick={e => { e.stopPropagation(); step(-1) }} className="absolute left-3 md:left-6 w-12 h-12 rounded-full bg-cream/10 hover:bg-cream/20 text-cream grid place-items-center" aria-label="Previous photo"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={e => { e.stopPropagation(); step(1) }} className="absolute right-3 md:right-6 w-12 h-12 rounded-full bg-cream/10 hover:bg-cream/20 text-cream grid place-items-center" aria-label="Next photo"><ChevronRight className="w-6 h-6" /></button>
          </div>
          <div className="px-6 py-5 text-center text-cream" onClick={e => e.stopPropagation()}>
            <div className="text-[10px] uppercase tracking-[0.35em] text-sand">{CATEGORIES.find(c => c.key === current.category)?.label}</div>
            <div className="font-display text-xl md:text-2xl mt-1">{current.caption}</div>
          </div>
        </div>
      )}
    </main>
  )
}
