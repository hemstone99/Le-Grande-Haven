import { Link } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, Wine, Bed, UtensilsCrossed, Trees, MapPin, Sparkles, Coffee, Waves, HeartHandshake, Star, Tv, Gamepad2, Wifi, GlassWater, Beer, Ticket, ConciergeBell, Car, Baby, Clock, BedDouble, Users, Navigation, Presentation, Images } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useBooking } from '../components/BookingContext'
import { KSH } from '../lib/format'
import { fetchRoomsWithFallback } from '../lib/roomsData'
import { fetchDrinksWithFallback } from '../lib/drinksData'
import { fetchFoodWithFallback } from '../lib/foodData'
import HeroWave from '../components/HeroWave'
import { BrandTile, IconTile, TILE_BG } from '../components/BrandIcons'
import { whatsappLink, MAPS_DIRECTIONS, MAPS_EMBED } from '../lib/contact'

type Room = { id: string; slug: string; name: string; short_description: string; price_per_night: number; guests: number; room_type: string; bed_config?: string; featured?: boolean; images?: { url: string }[] }
type Item = { id: string; name: string; description: string; price: number; image_url: string; category: string; featured: boolean }

// Every slide fills the whole hero frame via object-cover.
// `focal` sets the smart crop position so the subject is preserved on landscape screens.
const HERO_SLIDES: { url: string; label: string; focal: string }[] = [
  { url: '/hero/hero-4.jpg',              label: 'Sun-Warmed Retreats',    focal: 'center 55%' },
  { url: '/hero/hero-5.jpg',              label: 'Serene Rooms',           focal: 'center 55%' },
  { url: '/hero/hero-lush.jpg',           label: 'Lush Coastal Gardens',   focal: 'center 60%' },
  { url: '/hero/hero-accommodation.jpg',  label: 'Coastal Accommodation',  focal: 'center 65%' },
  { url: '/hero/hero-whiskies.jpg',       label: 'The Whisky Bar',         focal: 'center 55%' },
  { url: '/hero/kids-playground.jpg',     label: 'Kids’ Playground',        focal: 'center center' },
  { url: '/hero/hero-conference.jpg',     label: 'Conference & Events',    focal: 'center center' },
]

const AMENITIES: { Icon: LucideIcon; bg: string; t: string }[] = [
  { Icon: Coffee, bg: TILE_BG.earth, t: 'Breakfast included' },
  { Icon: Wifi, bg: TILE_BG.ocean, t: 'Free Wi-Fi' },
  { Icon: Tv, bg: TILE_BG.clay, t: 'Live football on DSTV' },
  { Icon: Gamepad2, bg: TILE_BG.forest, t: 'Pool tables' },
  { Icon: Baby, bg: TILE_BG.sand, t: 'Kids’ playground' },
  { Icon: ConciergeBell, bg: TILE_BG.forest, t: 'Reception 24/7' },
  { Icon: Car, bg: TILE_BG.earth, t: 'Secure parking' },
]

const EXPLORE = [
  { to: '/rooms', title: 'Rooms', line: 'Ten restful rooms, breakfast included', img: '/hero/hero-5.jpg', Icon: BedDouble, span: 'md:col-span-2 md:row-span-2' },
  { to: '/food', title: 'Food', line: 'Swahili seafood & nyama choma', img: '/food/fish-large.jpg', Icon: UtensilsCrossed, span: '' },
  { to: '/drinks', title: 'Drinks', line: 'Cocktails, cold beers & a whisky shelf', img: '/hero/hero-whiskies.jpg', Icon: Wine, span: '' },
  { to: '/conference', title: 'Conference', line: 'Meetings & events for up to 200', img: '/conference/banquet.jpg', Icon: Presentation, span: '' },
  { to: '/gallery', title: 'Gallery', line: 'A look around the Haven', img: '/hero/hero-lush.jpg', Icon: Images, span: '' },
]

const WHY: { i: LucideIcon; bg: string; t: string; d: string }[] = [
  { i: UtensilsCrossed, bg: TILE_BG.clay, t: 'Delicious Food', d: 'A menu rooted in Kenyan flavours and coastal produce, cooked with care.' },
  { i: Bed, bg: TILE_BG.forest, t: 'Comfortable Rooms', d: 'Ten thoughtfully styled rooms with soft beds and quiet views.' },
  { i: Tv, bg: TILE_BG.ocean, t: 'DSTV — Live Football', d: 'Catch every big match on our big-screen DSTV in the bar lounge.' },
  { i: Gamepad2, bg: TILE_BG.earth, t: 'Pool Tables', d: 'Two well-kept pool tables — friendly games, cold drinks in hand.' },
  { i: GlassWater, bg: TILE_BG.sand, t: 'Open Bar', d: 'A fully stocked bar with premium spirits, wines and Kenyan beers on tap.' },
  { i: Wifi, bg: TILE_BG.ocean, t: 'Free High-Speed Wi-Fi', d: 'Stay connected across the rooms, restaurant and gardens.' },
  { i: HeartHandshake, bg: TILE_BG.clay, t: 'Friendly Hospitality', d: 'Warm, unhurried service from a team that treats guests like family.' },
  { i: Trees, bg: TILE_BG.forest, t: 'Peaceful Environment', d: 'Shaded gardens, birdsong mornings and lantern-lit evenings.' },
  { i: MapPin, bg: TILE_BG.earth, t: 'Convenient Location', d: 'Set in Kanana, Shimoni — easy to reach, easy to relax in.' },
  { i: Sparkles, bg: TILE_BG.sand, t: 'Memorable Experiences', d: 'Small touches, honest cooking and genuine welcomes you’ll remember.' },
]

const Eyebrow = ({ children, light = false }: { children: ReactNode; light?: boolean }) => (
  <div className={`text-xs uppercase tracking-[0.4em] flex items-center gap-3 ${light ? 'text-sand' : 'text-clay'}`}><span className={`h-px w-10 ${light ? 'bg-sand' : 'bg-clay'}`} /> {children}</div>
)

export default function Home() {
  const { openBooking, openReservation } = useBooking()
  const [rooms, setRooms] = useState<Room[]>([])
  const [food, setFood] = useState<Item[]>([])
  const [drinks, setDrinks] = useState<Item[]>([])
  const [fromPrice, setFromPrice] = useState(0)
  const [slide, setSlide] = useState(0)
  // Only mount hero slides up to one ahead of the current one, so the first
  // slide isn't competing with six other full-screen downloads
  const [slidesMounted, setSlidesMounted] = useState(2)
  useEffect(() => { setSlidesMounted(n => Math.max(n, slide + 2)) }, [slide])

  useEffect(() => {
    fetchRoomsWithFallback().then(d => {
      const list = d as unknown as Room[]
      setFromPrice(Math.min(...list.map(r => Number(r.price_per_night))))
      setRooms([...list].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 4))
    })
    fetchFoodWithFallback(true).then(d => setFood((d as unknown as Item[]).slice(0, 6)))
    fetchDrinksWithFallback(true).then(d => {
      // Curate a balanced bar showcase: prioritise whiskies (min 2), then mix in one from each other category
      const all = d as unknown as (Item & { category: string })[]
      const whiskies = all.filter(x => x.category === 'Whisky').slice(0, 2)
      const rest = all.filter(x => x.category !== 'Whisky')
      const picked: (Item & { category: string })[] = [...whiskies]
      const seen = new Set(picked.map(p => p.category))
      for (const item of rest) {
        if (picked.length >= 6) break
        if (!seen.has(item.category)) { picked.push(item); seen.add(item.category) }
      }
      // Fill remaining slots with any other featured items
      for (const item of rest) {
        if (picked.length >= 6) break
        if (!picked.includes(item)) picked.push(item)
      }
      setDrinks(picked.slice(0, 6))
    })
  }, [])

  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="bg-cream-50">
      {/* HERO */}
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-forest-deep">
        {HERO_SLIDES.map((s, i) => {
          const isActive = i === slide
          if (i >= slidesMounted && !isActive) return null
          return (
            <img
              key={s.url}
              src={s.url}
              alt={s.label}
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding="async"
              style={{ objectPosition: s.focal }}
              className={`absolute inset-0 w-full h-full object-cover will-change-[opacity,transform] transition-[opacity,transform,filter] duration-[2200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? 'opacity-100 scale-100 blur-0 animate-hero-ken' : 'opacity-0 scale-105 blur-[2px]'}`}
            />
          )
        })}
        <div className="absolute inset-0 bg-linear-to-b from-forest-deep/70 via-forest-deep/30 to-forest-deep/85" />
        <div className="absolute inset-0 bg-linear-to-r from-forest-deep/75 via-forest-deep/20 to-transparent" />

        {/* Slide caption + counter — top-right */}
        <div className="absolute top-28 right-6 md:right-10 z-10 hidden sm:flex items-center gap-3">
          <div className="font-display text-cream/80 text-sm tabular-nums">{String(slide + 1).padStart(2, '0')}<span className="text-cream/40"> / {String(HERO_SLIDES.length).padStart(2, '0')}</span></div>
          <div key={`cap-${slide}`} className="animate-fade-up rounded-full px-4 py-2 bg-cream/10 border border-cream/20 backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.3em] text-cream/90">{HERO_SLIDES[slide].label}</div>
          </div>
        </div>

        <style>{`
          @keyframes heroProgress { from { width: 0% } to { width: 100% } }
          @keyframes heroKen {
            0%   { transform: scale(1.02); filter: brightness(0.98); }
            100% { transform: scale(1.10); filter: brightness(1); }
          }
          .animate-hero-ken { animation: heroKen 5.5s ease-out forwards; }
        `}</style>

         <div className="relative z-10 min-h-[100svh] flex items-center">
           <div className="max-w-7xl mx-auto px-6 w-full pt-32 pb-44 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
             <div className="text-cream animate-fade-up">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream/10 border border-cream/20 backdrop-blur text-[11px] uppercase tracking-[0.3em] text-sand">
                 <MapPin className="w-3.5 h-3.5" /> Kanana · Kwale County
               </div>
               <h1 className="font-display text-6xl sm:text-7xl md:text-8xl xl:text-[8.5rem] leading-[0.9] tracking-tight mt-6">Le Grande<br /><em className="text-sand">Haven</em></h1>
               <div className="font-display italic text-2xl md:text-3xl text-cream/90 mt-6">Taste. Stay. Relax.</div>
               <p className="mt-5 text-lg text-cream/80 max-w-xl leading-relaxed">Experience great food, refreshing drinks and peaceful accommodation in the heart of Kanana, Shimoni.</p>
               <div className="mt-9 flex flex-wrap gap-3">
                 <button onClick={() => openBooking()} className="group px-7 py-4 rounded-full bg-sand text-forest-deep font-semibold hover:bg-cream transition inline-flex items-center gap-2 shadow-lg shadow-black/20">Book Your Stay <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" /></button>
                 <button onClick={openReservation} className="px-7 py-4 rounded-full bg-cream/10 border border-cream/30 backdrop-blur text-cream font-semibold hover:bg-cream/20 transition">Reserve a Table</button>
                 <Link to="/food" className="px-5 py-4 rounded-full text-cream font-semibold hover:text-sand transition inline-flex items-center gap-2">Explore the menu <ArrowUpRight className="w-4 h-4" /></Link>
               </div>
             </div>
           </div>
         </div>

        {/* Progress bars — sit above the wave */}
        <div className="absolute bottom-24 md:bottom-32 inset-x-0 z-10">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`relative h-1 rounded-full overflow-hidden transition-all ${i === slide ? 'w-14 bg-cream/25' : 'w-6 bg-cream/25 hover:bg-cream/40'}`}
              >
                {i === slide && (
                  <span
                    key={`p-${slide}`}
                    className="absolute inset-y-0 left-0 bg-sand"
                    style={{ animation: 'heroProgress 4000ms linear forwards' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <HeroWave fill="#fbf8f2" />
      </section>

      {/* AMENITIES STRIP */}
      <section className="relative -mt-2 pb-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-3 overflow-x-auto no-scrollbar lg:justify-between py-2">
            {AMENITIES.map(({ Icon, bg, t }) => (
              <div key={t} className="shrink-0 flex items-center gap-3 pl-2 pr-5 py-2 rounded-2xl bg-white border border-forest/5 shadow-sm">
                <IconTile icon={Icon} bg={bg} size={40} />
                <span className="text-sm font-semibold text-forest whitespace-nowrap">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WELCOME */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Eyebrow>Karibu Sana</Eyebrow>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-forest mt-6 leading-[1.05]">A coastal <em className="text-clay">haven</em> where every guest becomes family.</h2>
            <p className="mt-6 text-lg text-earth-light leading-relaxed">Le Grande Haven Kanana, Shimoni is a hospitality destination on the south Kenyan coast. We bring together honest Kenyan cooking, considered drinks and restful rooms in gardens shaded by mikoko and jasmine. Whether you’re here for a slow meal or a long weekend, our home is set for warm welcomes and unhurried moments.</p>
            <div className="grid grid-cols-3 gap-3 mt-10">
              {[['10', 'Rooms'], ['9·10', 'Guest Rating'], ['24/7', 'Reception']].map(([v, l]) => (
                <div key={l} className="p-4 rounded-2xl bg-white border border-forest/5"><div className="font-display text-3xl text-forest">{v}</div><div className="text-[11px] uppercase tracking-widest text-earth mt-1">{l}</div></div>
              ))}
            </div>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-forest font-semibold hover:text-clay transition">Our story <ArrowRight className="w-4 h-4" /></Link>
          </div>
           <div className="relative h-[520px] md:h-[600px]">
             <img loading="lazy" decoding="async" src="/hero/hero-lush.jpg" className="absolute right-0 top-0 w-[82%] h-[78%] rounded-[2rem] object-cover shadow-2xl" style={{ objectPosition: 'center 55%' }} alt="Tropical gardens at Le Grande Haven" />
             <img loading="lazy" decoding="async" src="/hero/karibu.jpg" className="absolute left-0 bottom-0 w-[55%] h-[48%] rounded-[2rem] object-cover shadow-2xl ring-8 ring-cream-50" style={{ objectPosition: 'center 60%' }} alt="Guests enjoying drinks in the Le Grande Haven garden" />
             <div className="absolute right-4 bottom-6 bg-white rounded-2xl p-5 shadow-xl max-w-[15rem]">
              <div className="flex items-center gap-1 text-sand">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
              <p className="text-sm text-forest-deep mt-2 italic leading-relaxed">“A quiet, generous stay. The seafood is exceptional and the gardens are magical.”</p>
              <div className="text-xs text-earth mt-2">— Amina, Nairobi</div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE — bento */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <Eyebrow>Discover</Eyebrow>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-forest mt-4">Everything under <em className="text-clay">one roof.</em></h2>
            </div>
            <p className="text-earth max-w-sm">Stay the night, eat well, raise a glass or bring the whole team — it’s all a few steps apart.</p>
          </div>
          <div className="grid md:grid-cols-4 md:grid-rows-2 gap-4 mt-12 md:h-[560px]">
            {EXPLORE.map(({ to, title, line, img, Icon, span }) => (
              <Link key={to} to={to} className={`group relative rounded-[1.75rem] overflow-hidden min-h-[220px] ${span}`}>
                <img loading="lazy" decoding="async" src={img} alt="" className="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-forest-deep/90 via-forest-deep/25 to-transparent" />
                <div className="absolute top-4 right-4 w-11 h-11 rounded-full bg-cream/15 backdrop-blur border border-cream/25 grid place-items-center text-cream transition group-hover:bg-sand group-hover:text-forest-deep group-hover:rotate-45"><ArrowUpRight className="w-5 h-5" /></div>
                <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
                  <Icon className="w-5 h-5 text-sand" />
                  <h3 className={`font-display mt-2 ${span ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>{title}</h3>
                  <p className="text-sm text-cream/80 mt-1">{line}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOD */}
      <section className="relative py-24 bg-forest text-cream overflow-hidden">
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-sand/5" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <Eyebrow light>Kitchen</Eyebrow>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mt-4">From our kitchen<br /><em className="text-sand">to your table.</em></h2>
            </div>
            <Link to="/food" className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cream/10 border border-cream/20 text-cream hover:bg-sand hover:text-forest-deep font-semibold transition">View the full menu <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition" /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {food.length ? food.map(f => (
              <Link to="/food" key={f.id} className="group rounded-[1.75rem] overflow-hidden bg-forest-light/40 border border-cream/10 hover:-translate-y-1 transition duration-500">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img loading="lazy" decoding="async" src={f.image_url} alt={f.name} className="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-105" />
                  <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-cream text-forest-deep font-semibold text-sm shadow">{KSH(f.price)}</span>
                </div>
                <div className="p-6">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-sand">{f.category}</div>
                  <h3 className="font-display text-2xl mt-1.5">{f.name}</h3>
                  <p className="text-cream/70 text-sm mt-2 leading-relaxed line-clamp-2">{f.description}</p>
                </div>
              </Link>
            )) : Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-96 rounded-[1.75rem] bg-forest-light/30 animate-pulse" />)}
          </div>
        </div>
      </section>

      {/* DRINKS */}
      <section className="py-24 bg-[#f3ede3]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4">
              <Eyebrow>The Bar</Eyebrow>
              <h2 className="font-display text-4xl sm:text-5xl text-forest mt-4 leading-tight">Sundowners, mocktails &amp; everything in between.</h2>
              <p className="text-earth mt-4">Cocktails, cold-pressed juices, single-origin coffee and Kenya’s finest teas. Every drink poured with care.</p>
              <Link to="/drinks" className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep transition">See the Drinks <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              {drinks.length ? drinks.slice(0, 6).map(d => (
                <Link to="/drinks" key={d.id} className="group rounded-[1.5rem] overflow-hidden bg-white shadow-[0_18px_40px_-28px_rgba(15,29,24,0.6)] hover:-translate-y-1 transition duration-500">
                  <div className="h-56 md:h-64 bg-[radial-gradient(ellipse_at_50%_110%,#efe4d2_0%,#faf6ef_55%,#ffffff_100%)] flex items-end justify-center pt-5 overflow-hidden"><img src={d.image_url} alt={d.name} loading="lazy" decoding="async" className="h-full w-auto max-w-[85%] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700" /></div>
                  <div className="p-4 flex items-start justify-between gap-2">
                    <div><div className="text-[9px] uppercase tracking-[0.3em] text-earth">{d.category}</div><div className="font-display text-lg text-forest mt-1 leading-snug">{d.name}</div></div>
                    <div className="text-sm text-clay font-semibold whitespace-nowrap">{KSH(d.price)}</div>
                  </div>
                </Link>
              )) : Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 rounded-[1.5rem] bg-cream animate-pulse" />)}
            </div>
          </div>
        </div>
      </section>

      {/* OFFERS */}
      <section className="py-20 bg-forest-deep text-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <Eyebrow light>This week at the Haven</Eyebrow>
              <h2 className="font-display text-4xl sm:text-5xl mt-4">Good times, <em className="text-sand">served beautifully.</em></h2>
            </div>
            <div className="text-sm text-cream/65 max-w-sm">Bring your people, choose your moment, and let us take care of the rest.</div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-12">
            <article className="group relative min-h-[420px] rounded-[2rem] overflow-hidden border border-cream/15 shadow-2xl">
              <img loading="lazy" decoding="async" src="/hero/hero-whiskies.jpg" alt="Cold beers at The Haven bar" className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105" style={{ objectPosition: 'center 55%' }} />
              <div className="absolute inset-0 bg-linear-to-t from-forest-deep via-forest-deep/55 to-transparent" />
              <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-sand text-forest-deep px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-bold"><Beer className="w-4 h-4" /> Bar special</div>
              <div className="relative min-h-[420px] flex flex-col justify-end p-7 md:p-9">
                <div className="text-sand text-xs uppercase tracking-[0.3em] font-semibold">Happy hour · Mon–Thu · 4–5 PM</div>
                <h3 className="font-display text-4xl md:text-5xl mt-3">Beer o’clock<br /><em className="text-sand">starts here.</em></h3>
                <p className="text-cream/80 mt-4 max-w-md">Cold Kenyan beers, garden sunsets and bar snacks at a little more of a treat. Pull up a chair and stay for one more.</p>
                <Link to="/drinks" className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-cream text-forest-deep px-5 py-3 text-sm font-semibold hover:bg-sand transition">Explore the bar <ArrowRight className="w-4 h-4" /></Link>
              </div>
            </article>

            <article className="group relative min-h-[420px] rounded-[2rem] overflow-hidden border border-sand/40 shadow-2xl">
              <img loading="lazy" decoding="async" src="/hero/kids-playground.jpg" alt="Kids playing on the playground at Le Grande Haven" className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105" style={{ objectPosition: 'center center' }} />
              <div className="absolute inset-0 bg-linear-to-t from-forest-deep/90 via-forest-deep/30 to-transparent" />
              <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-clay text-cream px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-bold"><Gamepad2 className="w-4 h-4" /> Family favourite</div>
              <div className="relative min-h-[420px] flex flex-col justify-end p-7 md:p-9">
                <div className="text-sand text-xs uppercase tracking-[0.3em] font-semibold">Kids’ play offer</div>
                <h3 className="font-display text-4xl md:text-5xl mt-3">Little guests,<br /><em className="text-sand">big adventures.</em></h3>
                <p className="text-cream/85 mt-4 max-w-md">Chips, two sausages and a 300 ml soda, plus unlimited playground access.</p>
                <div className="mt-6 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 rounded-2xl bg-cream text-forest-deep px-4 py-3"><Ticket className="w-5 h-5 text-clay" /><span className="font-display text-2xl">KSh 300</span></div>
                  <span className="text-xs uppercase tracking-[0.2em] text-cream/75">while you unwind</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* STAY */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <Eyebrow>Accommodation</Eyebrow>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-forest mt-4">Stay with us.</h2>
              <p className="text-earth mt-3 max-w-lg">Ten rooms named for the sea life and mangrove forests that shape our coast. Simple, thoughtful, restful.</p>
            </div>
            <Link to="/rooms" className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep transition">Explore all rooms <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition" /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {rooms.length ? rooms.map(r => (
              <Link key={r.id} to={`/rooms/${r.slug}`} className="group rounded-[1.75rem] overflow-hidden bg-white border border-forest/5 shadow-[0_18px_40px_-30px_rgba(15,29,24,0.45)] hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(15,29,24,0.55)] transition duration-500 block">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img loading="lazy" decoding="async" src={r.images?.[0]?.url || '/hero/hero-5.jpg'} alt={r.name} className="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-linear-to-t from-forest-deep/90 via-forest-deep/20 via-50% to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-cream [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-sand">{r.room_type}</div>
                    <h3 className="font-display text-3xl mt-1">{r.name}</h3>
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <span className="flex items-center gap-1.5 text-cream/85"><Users className="w-4 h-4" /> {r.guests} guests</span>
                      <span><span className="font-display text-xl">{KSH(r.price_per_night)}</span><span className="text-xs text-cream/70"> /night</span></span>
                    </div>
                  </div>
                </div>
              </Link>
            )) : Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[4/5] rounded-[1.75rem] bg-cream animate-pulse" />)}
          </div>
        </div>
      </section>



      {/* LOCATION */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_1.3fr] gap-10 items-center">
          <div>
            <Eyebrow>Find Us</Eyebrow>
            <h2 className="font-display text-4xl sm:text-5xl text-forest mt-4">Kanana, Shimoni.</h2>
            <p className="text-earth-light mt-4 text-lg leading-relaxed">Tucked in a quiet corner of Kwale, minutes from the coast. Come for a lunch under the mango tree, stay for a sunset on the terrace.</p>
            <div className="mt-8 grid gap-3 max-w-md">
              {[[MapPin, 'Le Grande Haven Kanana, Shimoni'], [Clock, 'Restaurant · 7am to 11pm daily'], [Waves, 'A short drive from Diani’s beaches']].map(([I, t]) => {
                const Icon = I as LucideIcon
                return <div key={t as string} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-forest/5"><span className="w-10 h-10 rounded-xl bg-cream grid place-items-center text-clay"><Icon className="w-5 h-5" /></span><span className="text-forest font-medium">{t as string}</span></div>
              })}
            </div>
            <a href={MAPS_DIRECTIONS} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep transition"><Navigation className="w-4 h-4" /> Get directions</a>
          </div>
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-forest/10">
            <iframe title="Le Grande Haven Location" src={MAPS_EMBED} className="w-full h-[460px] block" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="absolute left-4 top-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur shadow-lg">
              <BrandTile brand="maps" size={36} />
              <div><div className="font-display text-forest leading-none">Le Grande Haven</div><div className="text-xs text-earth mt-1">Kanana, Shimoni · Kwale</div></div>
            </div>
          </div>
        </div>
      </section>



      {/* signature line */}
      <div className="py-10 border-t border-forest/10 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-sand-dark font-display text-3xl">
          {Array.from({ length: 4 }).map((_, i) => <span key={i} className="flex items-center gap-16"><Wine className="w-6 h-6" /> Taste <span>·</span> Stay <span>·</span> Relax <span>·</span> Le Grande Haven <span>·</span></span>)}
        </div>
      </div>
    </main>
  )
}
