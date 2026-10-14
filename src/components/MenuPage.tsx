import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Search, Star, X, ArrowRight, Clock, type LucideIcon } from 'lucide-react'
import { KSH } from '../lib/format'
import { useBooking } from './BookingContext'
import { CardSkeleton } from './Skeleton'
import { BrandTile } from './BrandIcons'
import { whatsappLink } from '../lib/contact'

export type MenuItem = { id: string; name: string; description: string; price: number; image_url: string; category: string; available: boolean; featured: boolean }

export type MenuConfig = {
  kind: 'food' | 'drinks'
  load: () => Promise<MenuItem[]>
  eyebrow: string
  title: ReactNode
  intro: string
  heroImages: [string, string, string]
  unit: string // "dishes" / "drinks"
  categoryOrder: string[]
  categoryIcons: Record<string, LucideIcon>
  fallbackIcon: LucideIcon
  featuredLabel: string // badge on featured items
  featuredTitle: string
  searchPlaceholder: string
  whatsappMessage: string
  ctaTitle: ReactNode
  ctaText: string
  notice?: string
}

// Left edge of the max-w-7xl container, so full-bleed rows line up with page content
const EDGE = 'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))'

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

// Defined at module level so cards are not re-created on every scroll-spy update
function Card({ item, isDrinks, featuredLabel }: { item: MenuItem; isDrinks: boolean; featuredLabel: string }) {
  return (
    <article className={`group relative rounded-[1.75rem] overflow-hidden flex flex-col transition duration-500 hover:-translate-y-1 ${isDrinks ? 'bg-white shadow-[0_18px_40px_-28px_rgba(15,29,24,0.7)] hover:shadow-[0_30px_60px_-30px_rgba(15,29,24,0.8)]' : 'bg-white border border-forest/5 shadow-[0_18px_40px_-30px_rgba(15,29,24,0.45)] hover:shadow-[0_30px_60px_-30px_rgba(15,29,24,0.55)]'} ${item.available ? '' : 'opacity-60 grayscale'}`}>
      {isDrinks ? (
        <div className="relative h-64 bg-[radial-gradient(ellipse_at_50%_110%,#efe4d2_0%,#faf6ef_55%,#ffffff_100%)] flex items-end justify-center pt-6 overflow-hidden">
          <img loading="lazy" decoding="async" src={item.image_url} alt={item.name} className="h-full w-auto max-w-[85%] object-contain mix-blend-multiply transition duration-700 group-hover:scale-105 group-hover:-translate-y-1" />
          <div className="absolute bottom-0 inset-x-10 h-3 rounded-full bg-forest-deep/10 blur-md" aria-hidden="true" />
        </div>
      ) : (
        <div className="relative aspect-[4/3] overflow-hidden">
          <img loading="lazy" decoding="async" src={item.image_url} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-linear-to-t from-forest-deep/50 via-transparent to-transparent" />
        </div>
      )}
      <div className="absolute top-3 left-3 right-3 flex justify-between gap-2 pointer-events-none">
        {item.featured ? <span className="px-2.5 py-1 rounded-full bg-clay text-cream text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 shadow"><Star className="w-3 h-3 fill-current" /> {featuredLabel}</span> : <span />}
        {!item.available && <span className="px-2.5 py-1 rounded-full bg-forest-deep/85 text-cream text-[10px] uppercase tracking-widest font-bold">Sold out</span>}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-forest leading-snug">{item.name}</h3>
          <span className="shrink-0 px-3 py-1 rounded-full bg-cream text-forest font-semibold text-sm tabular-nums">{KSH(item.price)}</span>
        </div>
        <p className="text-earth text-sm mt-2 leading-relaxed line-clamp-2">{item.description}</p>
      </div>
    </article>
  )
}

export default function MenuPage({ config: c }: { config: MenuConfig }) {
  const { openReservation } = useBooking()
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [active, setActive] = useState('')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const navRef = useRef<HTMLDivElement>(null)
  const isDrinks = c.kind === 'drinks'

  useEffect(() => { c.load().then(d => { setItems(d); setLoading(false) }) }, [c])

  // Known categories in menu order first, anything new from the admin panel after
  const categories = useMemo(() => {
    const present = Array.from(new Set(items.map(i => i.category)))
    return [...c.categoryOrder.filter(x => present.includes(x)), ...present.filter(x => !c.categoryOrder.includes(x))]
  }, [items, c.categoryOrder])
  const grouped = useMemo(() => categories.map(cat => ({ cat, list: items.filter(i => i.category === cat) })), [categories, items])
  const featured = useMemo(() => items.filter(i => i.featured && i.available).slice(0, 10), [items])
  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    return term ? items.filter(i => `${i.name} ${i.description} ${i.category}`.toLowerCase().includes(term)) : []
  }, [items, q])

  // Scroll-spy: highlight the category currently in view
  useEffect(() => {
    if (q || !categories.length) return
    const obs = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) setActive(visible[0].target.getAttribute('data-cat') || '')
    }, { rootMargin: '-160px 0px -60% 0px' })
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [categories, q])

  // Keep the active tab visible in the horizontally scrolling bar
  useEffect(() => {
    navRef.current?.querySelector(`[data-tab="${slug(active)}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [active])

  const jump = (cat: string) => {
    setQ('')
    requestAnimationFrame(() => sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }


  const grid = isDrinks ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6' : 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'

  return (
    <main className={`${isDrinks ? 'bg-[#f3ede3]' : 'bg-cream-50'} min-h-screen`}>
      {/* HERO */}
      <section className={`relative pt-36 pb-20 text-cream overflow-hidden ${isDrinks ? 'bg-[#1a1512]' : 'bg-forest-deep'}`}>
        <img src={c.heroImages[0]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-110" />
        <div className={`absolute inset-0 ${isDrinks ? 'bg-linear-to-r from-[#1a1512] via-[#1a1512]/90 to-[#1a1512]/60' : 'bg-linear-to-r from-forest-deep via-forest-deep/90 to-forest-deep/60'}`} />
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-sand">{c.eyebrow}</div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl xl:text-8xl mt-5 leading-[0.95]">{c.title}</h1>
            <p className="text-cream/80 mt-6 max-w-xl text-lg">{c.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={openReservation} className="px-7 py-3.5 rounded-full bg-sand text-forest-deep font-semibold hover:bg-cream transition inline-flex items-center gap-2">Reserve a Table <ArrowRight className="w-4 h-4" /></button>
              <a href={whatsappLink(c.whatsappMessage)} target="_blank" rel="noreferrer" className="pl-2 pr-6 py-2 rounded-full bg-cream/10 border border-cream/20 font-semibold hover:bg-cream/15 transition inline-flex items-center gap-3"><BrandTile brand="whatsapp" size={36} /> Ask on WhatsApp</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
              {[[loading ? '—' : String(items.length), c.unit], [loading ? '—' : String(categories.length), 'categories']].map(([n, t]) => (
                <div key={t}><div className="font-display text-4xl text-sand tabular-nums">{n}</div><div className="text-[11px] uppercase tracking-[0.25em] text-cream/60 mt-1">{t}</div></div>
              ))}
              <div><div className="font-display text-4xl text-sand flex items-center gap-2"><Clock className="w-6 h-6" />7–11</div><div className="text-[11px] uppercase tracking-[0.25em] text-cream/60 mt-1">am – pm, daily</div></div>
            </div>
          </div>
          {/* Fanned photo stack */}
          <div className="relative h-[420px] hidden lg:block" aria-hidden="true">
            {c.heroImages.map((src, i) => (
              <div key={src} className={`absolute w-64 xl:w-72 aspect-[3/4] rounded-[1.75rem] overflow-hidden shadow-2xl ring-1 ring-cream/15 bg-white ${['left-4 top-10 -rotate-8', 'left-1/2 -translate-x-1/2 top-0 rotate-1 z-10', 'right-4 top-14 rotate-9'][i]}`}>
                <img src={src} alt="" className={`w-full h-full ${isDrinks && i !== 0 ? 'object-contain p-4 mix-blend-multiply' : 'object-cover'}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STICKY CATEGORY BAR + SEARCH */}
      <div className={`sticky top-[72px] z-30 backdrop-blur border-b ${isDrinks ? 'bg-[#f3ede3]/90 border-forest/10' : 'bg-cream-50/90 border-forest/10'}`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row md:items-center gap-3">
          <label className="relative md:w-72 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={c.searchPlaceholder} aria-label={c.searchPlaceholder} className="w-full pl-11 pr-10 py-2.5 rounded-full bg-white border border-forest/10 text-sm focus:border-forest focus:ring-4 focus:ring-forest/10 outline-none transition" />
            {q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cream grid place-items-center text-earth" aria-label="Clear search"><X className="w-3.5 h-3.5" /></button>}
          </label>
          <div ref={navRef} className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {categories.map(cat => {
              const Icon = c.categoryIcons[cat] || c.fallbackIcon
              const on = !q && active === cat
              return (
                <button key={cat} data-tab={slug(cat)} onClick={() => jump(cat)} className={`shrink-0 inline-flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full text-sm font-semibold transition ${on ? 'bg-forest text-cream shadow-md' : 'bg-white text-forest border border-forest/10 hover:border-forest/30'}`}>
                  <span className={`w-7 h-7 rounded-full grid place-items-center ${on ? 'bg-cream/15 text-sand' : 'bg-cream text-clay'}`}><Icon className="w-4 h-4" /></span>{cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <section className="py-16"><div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div></section>
      ) : q ? (
        /* SEARCH RESULTS */
        <section className="py-14 min-h-[50vh]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-sm text-earth">{results.length} result{results.length === 1 ? '' : 's'} for <strong className="text-forest">“{q}”</strong></div>
            {results.length ? <div className={`${grid} mt-6`}>{results.map(i => <Card key={i.id} item={i} isDrinks={isDrinks} featuredLabel={c.featuredLabel} />)}</div> : (
              <div className="text-center py-24">
                <c.fallbackIcon className="w-12 h-12 text-earth-light mx-auto" />
                <div className="font-display text-2xl text-forest mt-4">Nothing matches that search</div>
                <p className="text-earth mt-2">Try another word — or ask us on WhatsApp, we may still have it.</p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* SIGNATURE ROW */}
          {featured.length > 0 && (
            <section className="pt-16">
              <div className="max-w-7xl mx-auto px-6 flex items-end justify-between gap-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.4em] text-clay">{c.featuredLabel}s</div>
                  <h2 className="font-display text-4xl md:text-5xl text-forest mt-3">{c.featuredTitle}</h2>
                </div>
                <div className="hidden md:block text-sm text-earth">Swipe to explore →</div>
              </div>
              {/* Padding lines the first card up with the page container; scroll-padding keeps snapping aligned to it */}
              <div className="mt-8 flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6" style={{ paddingInline: EDGE, scrollPaddingInline: EDGE }}>
                {featured.map(item => (
                  <div key={item.id} className="snap-start shrink-0 w-[78%] sm:w-80"><Card item={item} isDrinks={isDrinks} featuredLabel={c.featuredLabel} /></div>
                ))}
              </div>
            </section>
          )}

          {/* MENU, GROUPED BY CATEGORY */}
          <div className="max-w-7xl mx-auto px-6 pb-16">
            {grouped.map(({ cat, list }) => {
              const Icon = c.categoryIcons[cat] || c.fallbackIcon
              return (
                <section key={cat} data-cat={cat} ref={el => { sectionRefs.current[cat] = el }} className="pt-14 scroll-mt-40">
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-forest text-sand grid place-items-center shadow-md"><Icon className="w-6 h-6" /></span>
                    <div>
                      <h2 className="font-display text-3xl md:text-4xl text-forest leading-none">{cat}</h2>
                      <div className="text-xs uppercase tracking-[0.25em] text-earth mt-1.5">{list.length} {list.length === 1 ? c.unit.replace(/e?s$/, '') : c.unit}</div>
                    </div>
                    <div className="flex-1 h-px bg-forest/10 ml-2" />
                  </div>
                  <div className={`${grid} mt-7`}>{list.map(i => <Card key={i.id} item={i} isDrinks={isDrinks} featuredLabel={c.featuredLabel} />)}</div>
                </section>
              )
            })}
          </div>
        </>
      )}

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`relative rounded-[2rem] overflow-hidden p-10 md:p-14 text-cream ${isDrinks ? 'bg-[#1a1512]' : 'bg-forest'}`}>
            <img src={c.heroImages[0]} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-linear-to-r from-black/40 to-transparent" />
            <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <h2 className="font-display text-4xl md:text-5xl">{c.ctaTitle}</h2>
                <p className="text-cream/80 mt-3 max-w-xl">{c.ctaText}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={openReservation} className="px-7 py-3.5 rounded-full bg-sand text-forest-deep font-semibold hover:bg-cream transition">Reserve a Table</button>
                <a href={whatsappLink(c.whatsappMessage)} target="_blank" rel="noreferrer" className="pl-2 pr-6 py-2 rounded-full bg-cream/10 border border-cream/25 font-semibold hover:bg-cream/15 transition inline-flex items-center gap-3"><BrandTile brand="whatsapp" size={36} /> WhatsApp</a>
              </div>
            </div>
          </div>
          {c.notice && <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-earth font-semibold">{c.notice}</p>}
        </div>
      </section>
    </main>
  )
}
