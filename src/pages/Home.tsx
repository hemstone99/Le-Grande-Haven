import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, Wine, Bed, UtensilsCrossed, Trees, MapPin, Sparkles, Coffee, Waves, HeartHandshake, Star, Tv, Gamepad2, Wifi, GlassWater, Beer, Ticket } from 'lucide-react'
import { useBooking } from '../components/BookingContext'
import { KSH } from '../lib/format'
import { fetchRoomsWithFallback } from '../lib/roomsData'
import { fetchDrinksWithFallback } from '../lib/drinksData'
import { fetchFoodWithFallback } from '../lib/foodData'

type Room = { id: string; slug: string; name: string; short_description: string; price_per_night: number; guests: number; room_type: string; images?: { url: string }[] }
type Item = { id: string; name: string; description: string; price: number; image_url: string; category: string; featured: boolean }
type Gal = { id: string; url: string; caption: string; category: string }

// Every slide fills the whole hero frame via object-cover.
// `focal` sets the smart crop position so the subject is preserved on landscape screens.
const HERO_SLIDES: { url: string; label: string; focal: string }[] = [
  { url: '/hero/hero-4.jpg',              label: 'Sun-Warmed Retreats',    focal: 'center 55%' },
  { url: '/hero/hero-5.jpg',              label: 'Serene Rooms',           focal: 'center 55%' },
  { url: '/hero/hero-lush.jpg',           label: 'Lush Coastal Gardens',   focal: 'center 60%' },
  { url: '/hero/hero-accommodation.jpg',  label: 'Coastal Accommodation',  focal: 'center 65%' },
  { url: '/hero/hero-whiskies.jpg',       label: 'The Whisky Bar',         focal: 'center 55%' },
  { url: '/hero/kids-playground.png',     label: 'Kids’ Playground',        focal: 'center center' },
  { url: '/hero/hero-conference.jpg',     label: 'Conference & Events',    focal: 'center center' },
]

export default function Home() {
  const { openBooking, openReservation } = useBooking()
  const [rooms, setRooms] = useState<Room[]>([])
  const [food, setFood] = useState<Item[]>([])
  const [drinks, setDrinks] = useState<Item[]>([])
  const [gallery, setGallery] = useState<Gal[]>([])
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    fetchRoomsWithFallback().then(d => setRooms(d.slice(0, 4)))
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
    // Gallery flow: destination → dining → rooms
    const FALLBACK_GALLERY: Gal[] = [
      // Destination
      { id: 'g1', url: '/hero/hero-lush.jpg',          caption: 'Arriving at Le Grande Haven · Kanana',    category: 'destination' },
      { id: 'g2', url: '/hero/hero-2.jpg',             caption: 'Tropical gardens · Kanana',                category: 'destination' },
      { id: 'g3', url: '/hero/hero-accommodation.jpg', caption: 'The accommodation building · Kanana',      category: 'destination' },
      // Dining
      { id: 'g4', url: '/hero/hero-whiskies.jpg',      caption: 'The Whisky Bar',                           category: 'dining' },
      { id: 'g5', url: '/food/fish-large.jpg',         caption: 'Fresh Swahili seafood',                    category: 'dining' },
      // Rooms
      { id: 'g6', url: '/hero/hero-1.jpg',             caption: 'Four-poster suite · Kanana',               category: 'rooms' },
      { id: 'g7', url: '/hero/hero-5.jpg',             caption: 'Serene coastal rooms · Kanana',            category: 'rooms' },
      { id: 'g8', url: '/hero/hero-6.jpg',             caption: 'The Pweza Suite · Kanana',                 category: 'rooms' },
    ]
    fetch('/api/gallery')
      .then(r => r.json())
      .then(d => setGallery(Array.isArray(d) && d.length ? d.slice(0, 8) : FALLBACK_GALLERY))
      .catch(() => setGallery(FALLBACK_GALLERY))
  }, [])

  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="bg-cream-50">
      {/* HERO */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {HERO_SLIDES.map((s, i) => {
          const isActive = i === slide
          return (
            <img
              key={s.url}
              src={s.url}
              alt={s.label}
              style={{ objectPosition: s.focal }}
              className={`absolute inset-0 w-full h-full object-cover will-change-[opacity,transform] transition-[opacity,transform,filter] duration-[2200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? 'opacity-100 scale-100 blur-0 animate-hero-ken' : 'opacity-0 scale-105 blur-[2px]'}`}
            />
          )
        })}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/65 via-forest-deep/35 to-forest-deep/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/50 via-transparent to-transparent" />

        {/* Slide caption — floats top-right of the hero, above content, no overlap */}
        <div className="absolute top-28 right-6 md:right-10 z-10 hidden sm:block">
          <div key={`cap-${slide}`} className="animate-fade-up glass border border-cream/20 rounded-full px-4 py-2 backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.3em] text-cream/90">{HERO_SLIDES[slide].label}</div>
          </div>
        </div>

        {/* Progress dots only */}
        <div className="absolute bottom-20 inset-x-0 z-10 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
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

        <style>{`
          @keyframes heroProgress { from { width: 0% } to { width: 100% } }
          @keyframes heroKen {
            0%   { transform: scale(1.02); filter: brightness(0.98); }
            100% { transform: scale(1.10); filter: brightness(1); }
          }
          .animate-hero-ken { animation: heroKen 5.5s ease-out forwards; }
        `}</style>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full pt-24">
            <div className="max-w-3xl text-cream animate-fade-up">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-sand mb-6">
                <span className="h-px w-10 bg-sand" /> Kanana · Kwale County
              </div>
              <h1 className="font-display text-5xl sm:text-6xl md:text-8xl leading-[0.95] tracking-tight">Le Grande<br /><em className="not-italic text-sand">Haven</em></h1>
              <div className="font-display italic text-2xl md:text-3xl text-cream/90 mt-6">Taste. Stay. Relax.</div>
              <p className="mt-6 text-lg text-cream/80 max-w-xl leading-relaxed">Experience great food, refreshing drinks and peaceful accommodation in the heart of Kanana, Shimoni.</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/food" className="group px-7 py-4 rounded-full bg-cream text-forest-deep font-semibold hover:bg-sand transition inline-flex items-center gap-2">Explore Our Food <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" /></Link>
                <Link to="/rooms" className="px-7 py-4 rounded-full border border-cream/40 text-cream font-semibold hover:bg-cream/10 transition">View Rooms</Link>
                <button onClick={() => openBooking()} className="px-7 py-4 rounded-full bg-sand text-forest-deep font-semibold hover:bg-sand-dark transition">Book Your Stay</button>
              </div>
            </div>
          </div>
        </div>
        {/* bottom scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/70 text-[10px] uppercase tracking-[0.4em] animate-pulse">Scroll to discover</div>
      </section>

      {/* WELCOME */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-clay flex items-center gap-3"><span className="h-px w-10 bg-clay" /> Karibu Sana</div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-forest mt-6 leading-tight">A coastal <em className="text-clay">haven</em> where every guest becomes family.</h2>
            <p className="mt-6 text-lg text-earth-light leading-relaxed">Le Grande Haven Kanana, Shimoni is a hospitality destination on the south Kenyan coast. We bring together honest Kenyan cooking, considered drinks and restful rooms in gardens shaded by mikoko and jasmine. Whether you’re here for a slow meal or a long weekend, our home is set for warm welcomes and unhurried moments.</p>
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[['10', 'Rooms'], ['9·10', 'Guest Rating'], ['24/7', 'Reception']].map(([v, l]) => (
                <div key={l} className="border-l border-forest/15 pl-4"><div className="font-display text-3xl text-forest">{v}</div><div className="text-xs uppercase tracking-widest text-earth mt-1">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-2/3 h-2/3 border-2 border-sand rounded-3xl" />
            <img src="/hero/karibu.jpg" className="relative rounded-3xl w-full h-[560px] object-cover shadow-2xl" style={{ objectPosition: 'center 55%' }} alt="Guests enjoying drinks in the Le Grande Haven garden" />
            <div className="absolute -bottom-6 -right-6 bg-cream rounded-2xl p-5 shadow-xl max-w-xs">
              <div className="flex items-center gap-1 text-sand">{Array.from({length: 5}).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
              <p className="text-sm text-forest-deep mt-2 italic">“A quiet, generous stay. The seafood is exceptional and the gardens are magical.”</p>
              <div className="text-xs text-earth mt-2">— Amina, Nairobi</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOD */}
      <section className="py-24 bg-forest text-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-sand flex items-center gap-3"><span className="h-px w-10 bg-sand" /> Kitchen</div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mt-4">From our kitchen<br /><em className="text-sand">to your table.</em></h2>
            </div>
            <Link to="/food" className="group inline-flex items-center gap-2 text-sand hover:text-cream font-semibold">View Menu <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition" /></Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {food.length ? food.map(f => (
              <div key={f.id} className="group rounded-3xl overflow-hidden bg-forest-light/40 border border-cream/10 lift">
                <div className="h-56 img-zoom"><img src={f.image_url} alt={f.name} className="w-full h-full object-cover" /></div>
                <div className="p-6">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-sand">{f.category}</div>
                  <div className="flex items-baseline justify-between mt-2 gap-3">
                    <h3 className="font-display text-2xl">{f.name}</h3>
                    <div className="font-display text-xl text-sand">{KSH(f.price)}</div>
                  </div>
                  <p className="text-cream/70 text-sm mt-3 leading-relaxed line-clamp-2">{f.description}</p>
                </div>
              </div>
            )) : Array.from({length: 3}).map((_, i) => <div key={i} className="h-96 rounded-3xl bg-forest-light/30 animate-pulse" />)}
          </div>
        </div>
      </section>

      {/* DRINKS */}
      <section className="py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4">
              <div className="text-xs uppercase tracking-[0.4em] text-clay flex items-center gap-3"><span className="h-px w-10 bg-clay" /> The Bar</div>
              <h2 className="font-display text-4xl sm:text-5xl text-forest mt-4 leading-tight">Sundowners, mocktails & everything in between.</h2>
              <p className="text-earth mt-4">Cocktails, cold-pressed juices, single-origin coffee and Kenya’s finest teas. Every drink poured with care.</p>
              <Link to="/drinks" className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep transition">See the Drinks <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              {drinks.length ? drinks.slice(0, 6).map(d => (
                <div key={d.id} className="group rounded-2xl overflow-hidden bg-white border border-forest/5 lift">
                  <div className="h-80 bg-gradient-to-b from-white to-cream-100 flex items-end justify-center overflow-hidden py-2"><img src={d.image_url} alt={d.name} loading="lazy" className="h-full w-auto max-w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700" /></div>
                  <div className="p-4"><div className="text-[9px] uppercase tracking-[0.3em] text-earth">{d.category}</div><div className="font-display text-lg text-forest mt-1">{d.name}</div><div className="text-sm text-clay font-semibold mt-1">{KSH(d.price)}</div></div>
                </div>
              )) : Array.from({length: 6}).map((_, i) => <div key={i} className="h-80 rounded-2xl bg-cream animate-pulse" />)}
            </div>
          </div>
        </div>
      </section>

      {/* OFFERS */}
      <section className="py-20 bg-forest-deep text-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-sand flex items-center gap-3"><span className="h-px w-10 bg-sand" /> This week at the Haven</div>
              <h2 className="font-display text-4xl sm:text-5xl mt-4">Good times, <em className="text-sand">served beautifully.</em></h2>
            </div>
            <div className="text-sm text-cream/65 max-w-sm">Bring your people, choose your moment, and let us take care of the rest.</div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-12">
            <article className="group relative min-h-[420px] rounded-[2rem] overflow-hidden border border-cream/15 shadow-2xl">
              <img src="/hero/hero-whiskies.jpg" alt="Cold beers at The Haven bar" className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105" style={{ objectPosition: 'center 55%' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/55 to-transparent" />
              <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-sand text-forest-deep px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-bold"><Beer className="w-4 h-4" /> Bar special</div>
              <div className="relative min-h-[420px] flex flex-col justify-end p-7 md:p-9">
                <div className="text-sand text-xs uppercase tracking-[0.3em] font-semibold">Happy hour · Mon–Thu · 4–5 PM</div>
                <h3 className="font-display text-4xl md:text-5xl mt-3">Beer o’clock<br /><em className="text-sand">starts here.</em></h3>
                <p className="text-cream/80 mt-4 max-w-md">Cold Kenyan beers, garden sunsets and bar snacks at a little more of a treat. Pull up a chair and stay for one more.</p>
                <Link to="/drinks" className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-cream text-forest-deep px-5 py-3 text-sm font-semibold hover:bg-sand transition">Explore the bar <ArrowRight className="w-4 h-4" /></Link>
              </div>
            </article>

            <article className="group relative min-h-[420px] rounded-[2rem] overflow-hidden border border-sand/40 shadow-2xl">
              <img src="/hero/kids-playground.png" alt="Kids playing on the playground at Le Grande Haven" className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105" style={{ objectPosition: 'center center' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/30 to-transparent" />
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
              <div className="text-xs uppercase tracking-[0.4em] text-clay flex items-center gap-3"><span className="h-px w-10 bg-clay" /> Accommodation</div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-forest mt-4">Stay with us.</h2>
              <p className="text-earth mt-3 max-w-lg">Ten rooms named for the sea life and mangrove forests that shape our coast. Simple, thoughtful, restful.</p>
            </div>
            <Link to="/rooms" className="group inline-flex items-center gap-2 text-forest hover:text-clay font-semibold">Explore Rooms <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition" /></Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {rooms.length ? rooms.map(r => (
              <Link key={r.id} to={`/rooms/${r.slug}`} className="group rounded-3xl overflow-hidden bg-white border border-forest/5 lift block">
                <div className="h-72 img-zoom"><img src={r.images?.[0]?.url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'} alt={r.name} className="w-full h-full object-cover" /></div>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-clay">{r.room_type}</div>
                  <div className="flex items-baseline justify-between mt-1"><h3 className="font-display text-2xl text-forest">{r.name}</h3><div className="font-display text-forest">{KSH(r.price_per_night)}<span className="text-xs text-earth">/night</span></div></div>
                  <p className="text-sm text-earth-light mt-2 line-clamp-2">{r.short_description}</p>
                </div>
              </Link>
            )) : Array.from({length: 4}).map((_, i) => <div key={i} className="h-[400px] rounded-3xl bg-cream animate-pulse" />)}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="py-24 bg-cream-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.4em] text-clay">Why Guests Choose Us</div>
            <h2 className="font-display text-4xl sm:text-5xl text-forest mt-4">The details that make a stay memorable.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {[
              { i: UtensilsCrossed, t: 'Delicious Food', d: 'A menu rooted in Kenyan flavours and coastal produce, cooked with care.' },
              { i: Bed, t: 'Comfortable Rooms', d: 'Ten thoughtfully styled rooms with soft beds and quiet views.' },
              { i: Tv, t: 'DSTV — Live Football', d: 'Catch every big match on our big-screen DSTV in the bar lounge.' },
              { i: Gamepad2, t: 'Pool Tables', d: 'Two well-kept pool tables — friendly games, cold drinks in hand.' },
              { i: GlassWater, t: 'Open Bar', d: 'A fully stocked bar with premium spirits, wines and Kenyan beers on tap.' },
              { i: Wifi, t: 'Free High-Speed Wi-Fi', d: 'Stay connected across the rooms, restaurant and gardens.' },
              { i: HeartHandshake, t: 'Friendly Hospitality', d: 'Warm, unhurried service from a team that treats guests like family.' },
              { i: Trees, t: 'Peaceful Environment', d: 'Shaded gardens, birdsong mornings and lantern-lit evenings.' },
              { i: MapPin, t: 'Convenient Location', d: 'Set in Kanana, Shimoni — easy to reach, easy to relax in.' },
              { i: Sparkles, t: 'Memorable Experiences', d: 'Small touches, honest cooking and genuine welcomes you\u2019ll remember.' },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="p-8 rounded-3xl bg-cream border border-forest/5 lift">
                <div className="w-12 h-12 rounded-2xl bg-forest text-cream grid place-items-center"><Icon className="w-6 h-6" strokeWidth={1.6} /></div>
                <div className="font-display text-2xl text-forest mt-5">{t}</div>
                <p className="text-earth-light mt-2 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.4em] text-clay">Gallery</div>
            <h2 className="font-display text-4xl sm:text-5xl text-forest mt-4">Moments at Le Grande Haven.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14">
            {gallery.length ? gallery.map((g, idx) => (
              <div key={g.id} className={`img-zoom rounded-2xl overflow-hidden ${idx % 5 === 0 ? 'md:row-span-2 md:h-full' : ''}`}>
                <img src={g.url} alt={g.caption} className={`w-full object-cover ${idx % 5 === 0 ? 'h-full min-h-[420px]' : 'h-56'}`} />
              </div>
            )) : Array.from({length: 8}).map((_, i) => <div key={i} className="h-56 rounded-2xl bg-cream animate-pulse" />)}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="py-24 bg-cream-100">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-clay">Find Us</div>
            <h2 className="font-display text-4xl sm:text-5xl text-forest mt-4">Kanana, Shimoni.</h2>
            <p className="text-earth-light mt-4 text-lg leading-relaxed">Tucked in a quiet corner of Kwale, minutes from the coast. Come for a lunch under the mango tree, stay for a sunset on the terrace.</p>
            <div className="mt-6 grid gap-3 max-w-md">
              <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-clay" /> Le Grande Haven Kanana, Shimoni</div>
              <div className="flex items-center gap-3"><Coffee className="w-5 h-5 text-clay" /> Restaurant · 7am to 11pm daily</div>
              <div className="flex items-center gap-3"><Waves className="w-5 h-5 text-clay" /> A short drive from Diani’s beaches</div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl border border-forest/10">
            <iframe title="Le Grande Haven Location" src="https://maps.google.com/maps?q=Le+Grande+Haven+Shimoni&ll=-4.5359358,39.3757662&t=&z=17&ie=UTF8&iwloc=B&output=embed" className="w-full h-[420px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <img src="/hero/hero-lush.jpg" alt="Le Grande Haven gardens, Kanana" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 60%' }} />
        <div className="absolute inset-0 bg-forest-deep/80" />
        <div className="relative max-w-4xl mx-auto px-6 text-center text-cream">
          <div className="text-xs uppercase tracking-[0.4em] text-sand">Ready for a memorable stay?</div>
          <h2 className="font-display text-5xl md:text-7xl mt-6 leading-tight">Come as guests, <em className="text-sand">leave as friends.</em></h2>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <button onClick={() => openBooking()} className="px-8 py-4 rounded-full bg-sand text-forest-deep font-semibold hover:bg-cream transition">Book a Room</button>
            <button onClick={openReservation} className="px-8 py-4 rounded-full border border-cream/40 text-cream font-semibold hover:bg-cream/10 transition">Reserve a Table</button>
          </div>
        </div>
      </section>

      {/* signature line */}
      <div className="py-10 border-t border-forest/10 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-sand-dark font-display text-3xl">
          {Array.from({length: 4}).map((_, i) => <span key={i} className="flex items-center gap-16"><Wine className="w-6 h-6" /> Taste <span>·</span> Stay <span>·</span> Relax <span>·</span> Le Grande Haven <span>·</span></span>)}
        </div>
      </div>
    </main>
  )
}
