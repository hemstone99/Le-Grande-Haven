import { Users, Wifi, Coffee, Utensils, Projector, Trees, Music, ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBooking } from '../components/BookingContext'

export default function Conference() {
  const { openReservation } = useBooking()
  const packages = [
    {
      name: 'Half-Day Meeting',
      price: 'KSh 1,800 / person',
      inclusions: ['Meeting room hire', 'Tea break with mandazi & samosas', 'Bottled water', 'Wi-Fi & AV equipment', 'Notepads & pens'],
      accent: 'bg-forest text-cream',
    },
    {
      name: 'Full-Day Conference',
      price: 'KSh 3,500 / person',
      inclusions: ['Meeting room hire', 'Morning & afternoon tea', 'Buffet lunch with dessert', 'Bottled water throughout', 'Wi-Fi, projector & AV', 'Notepads, pens & flipchart'],
      accent: 'bg-sand text-forest-deep',
      featured: true,
    },
    {
      name: 'Residential Retreat',
      price: 'From KSh 8,500 / person',
      inclusions: ['Meeting room + accommodation', 'All meals (breakfast, lunch, dinner)', 'Tea breaks & snacks', 'Sundowner welcome cocktail', 'Wi-Fi, projector & AV', 'Access to gardens & pool tables'],
      accent: 'bg-clay text-cream',
    },
  ]

  const spaces = [
    { title: 'The Boardroom', capacity: 'Up to 16', img: '/conference/boardroom.jpg', desc: 'A polished executive boardroom for high-level meetings, workshops and strategy sessions.' },
    { title: 'The Banquet Hall', capacity: 'Up to 120', img: '/conference/banquet.jpg', desc: 'An elegant hall for weddings, celebrations and gala dinners — plated or buffet dining.' },
    { title: 'The Garden Pavilion', capacity: 'Up to 200', img: '/conference/outdoor.jpg', desc: 'A shaded outdoor pavilion under palms and mangoes — perfect for launches and receptions.' },
    { title: 'The Training Room', capacity: 'Up to 40', img: '/conference/presentation.jpg', desc: 'A modern theatre-style training room with projector, whiteboard and full AV.' },
  ]

  return (
    <main className="bg-cream-50 min-h-screen">
      {/* HERO */}
      <section className="relative pt-40 pb-16 bg-forest text-cream overflow-hidden">
        <img src="/conference/boardroom.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/60 to-forest-deep/90" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.4em] text-sand">Meetings & Events</div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl mt-4 leading-none">Conference<em className="text-sand">.</em></h1>
          <p className="text-cream/85 mt-6 max-w-2xl text-lg">From intimate boardroom meetings to garden weddings for 200 — Le Grande Haven Kanana, Shimoni hosts your gatherings with warm coastal hospitality and modern facilities.</p>
        </div>
      </section>

      {/* Feature strip */}
      <section className="py-10 border-b border-forest/10 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { i: Users, t: 'Up to 200 guests' },
            { i: Projector, t: 'Full AV & Wi-Fi' },
            { i: Utensils, t: 'On-site catering' },
            { i: Trees, t: 'Indoor & garden venues' },
          ].map(({ i: I, t }) => (
            <div key={t} className="flex flex-col items-center gap-2"><I className="w-6 h-6 text-clay" /><div className="text-sm font-semibold text-forest">{t}</div></div>
          ))}
        </div>
      </section>

      {/* SPACES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.4em] text-clay">Our Spaces</div>
            <h2 className="font-display text-5xl text-forest mt-4">Venues for every gathering.</h2>
            <p className="text-earth mt-3">Four dedicated spaces from a 16-seat boardroom to a 200-guest garden pavilion.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-14">
            {spaces.map(s => (
              <div key={s.title} className="group rounded-3xl overflow-hidden bg-white border border-forest/5 lift">
                <div className="h-72 img-zoom"><img src={s.img} alt={s.title} className="w-full h-full object-cover" /></div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-2xl text-forest">{s.title}</h3>
                    <div className="text-sm text-clay font-semibold">{s.capacity}</div>
                  </div>
                  <p className="text-earth mt-2">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.4em] text-clay">Packages</div>
            <h2 className="font-display text-5xl text-forest mt-4">Everything included.</h2>
            <p className="text-earth mt-3">Transparent, all-in pricing with room hire, catering and equipment covered.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-14">
            {packages.map(p => (
              <div key={p.name} className={`p-8 rounded-3xl lift ${p.accent} ${p.featured ? 'md:scale-105 shadow-2xl' : ''}`}>
                {p.featured && <div className="inline-block px-3 py-1 rounded-full bg-forest-deep/10 text-xs uppercase tracking-widest font-semibold mb-4">Most popular</div>}
                <div className="font-display text-2xl">{p.name}</div>
                <div className="font-display text-4xl mt-2">{p.price}</div>
                <div className="h-px bg-current/20 my-6" />
                <ul className="space-y-3">
                  {p.inclusions.map(i => <li key={i} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 mt-0.5 shrink-0" /><span>{i}</span></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-clay">The Details</div>
            <h2 className="font-display text-5xl text-forest mt-4">Thoughtfully equipped.</h2>
            <p className="text-earth mt-4">Every conference booking includes our full facilities and the attention of our hospitality team.</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { i: Wifi, t: 'High-speed Wi-Fi' },
                { i: Projector, t: 'HD projector & screen' },
                { i: Coffee, t: 'Tea, coffee & snacks' },
                { i: Utensils, t: 'On-site chef & catering' },
                { i: Users, t: 'Dedicated event host' },
                { i: Music, t: 'PA system & mics' },
              ].map(({ i: I, t }) => (
                <div key={t} className="flex items-center gap-3 p-3 rounded-2xl bg-cream border border-forest/5"><div className="w-10 h-10 rounded-xl bg-forest text-cream grid place-items-center"><I className="w-4 h-4" /></div><span className="text-sm text-forest-deep font-medium">{t}</span></div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl"><img src="/conference/banquet.jpg" alt="" className="w-full h-[540px] object-cover" /></div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-forest-deep text-cream text-center">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.4em] text-sand">Ready to plan?</div>
          <h2 className="font-display text-5xl mt-4">Let's host your next moment.</h2>
          <p className="text-cream/70 mt-4">Tell us about your event and our team will craft a proposal within 24 hours.</p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <a href="https://wa.me/0182219969?text=Hello%20Le%20Grande%20Haven%2C%20I%27d%20like%20to%20enquire%20about%20conference%20facilities" target="_blank" rel="noreferrer" className="px-8 py-4 rounded-full bg-sand text-forest-deep font-semibold hover:bg-cream transition inline-flex items-center gap-2">WhatsApp Enquiry <ArrowRight className="w-4 h-4" /></a>
            <button onClick={openReservation} className="px-8 py-4 rounded-full border border-cream/40 text-cream font-semibold hover:bg-cream/10 transition">Reserve a Table</button>
            <Link to="/contact" className="px-8 py-4 rounded-full border border-cream/40 text-cream font-semibold hover:bg-cream/10 transition">Send an Email</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
