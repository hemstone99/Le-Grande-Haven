import { Leaf, Trees, UtensilsCrossed, Bed, MapPin, HeartHandshake, Phone, Mail, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBooking } from '../components/BookingContext'

export default function About() {
  const { openBooking, openReservation } = useBooking()
  return (
    <main className="bg-cream-50 min-h-screen">
      <section className="relative pt-40 pb-24 bg-forest text-cream overflow-hidden">
        <img src="/hero/hero-lush.jpg" className="absolute inset-0 w-full h-full object-cover opacity-35" style={{ objectPosition: 'center 60%' }} alt="Le Grande Haven Kanana gardens" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-sand">Our Story</div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl mt-4 leading-tight">Rooted in Kwale.<br /><em className="text-sand">Built on hospitality.</em></h1>
          <p className="text-cream/80 mt-8 max-w-2xl mx-auto text-lg">Le Grande Haven Kanana, Shimoni is a small, family-hearted restaurant and accommodation destination on the south Kenyan coast. We opened our doors to share the coast we love, the food we grew up on and a slower, warmer way to stay.</p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <img src="/hero/hero-accommodation.jpg" alt="Le Grande Haven accommodation building, Kanana" className="rounded-3xl h-[520px] w-full object-cover shadow-xl" style={{ objectPosition: 'center 65%' }} />
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-clay">Our Story</div>
            <h2 className="font-display text-5xl text-forest mt-4">A haven, honestly.</h2>
            <p className="mt-6 text-earth-light leading-relaxed">What started as a family kitchen serving neighbours became, over time, a destination for travellers passing through Kwale. We planted mango trees, built ten rooms, taught cooks the recipes from our grandmothers and set tables under the stars. Today, Le Grande Haven remains a small, deeply personal place — the same warmth, more room to share it.</p>
            <p className="mt-4 text-earth-light leading-relaxed">We believe hospitality is not something you deliver — it’s something you live. And we live it every day, one plate and one guest at a time.</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center"><div className="text-xs uppercase tracking-[0.4em] text-clay">What Guests Find Here</div><h2 className="font-display text-5xl text-forest mt-4">Four pillars, one home.</h2></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {[
              { i: HeartHandshake, t: 'Our Hospitality', d: 'Warm, unhurried, personal. Every guest becomes a friend.' },
              { i: UtensilsCrossed, t: 'Food & Dining', d: 'Kenyan flavours, coastal produce, honest cooking.' },
              { i: Bed, t: 'Accommodation', d: 'Ten thoughtful rooms designed for calm and comfort.' },
              { i: MapPin, t: 'Our Location', d: 'Set peacefully at Le Grande Haven Kanana, Shimoni.' },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="p-8 rounded-3xl bg-cream border border-forest/5 lift"><div className="w-14 h-14 rounded-2xl bg-forest text-cream grid place-items-center"><Icon className="w-6 h-6" /></div><div className="font-display text-2xl text-forest mt-6">{t}</div><p className="text-earth mt-3">{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-clay">Why Guests Choose Us</div>
            <h2 className="font-display text-5xl text-forest mt-4">The little things, done well.</h2>
            <ul className="mt-6 space-y-4 text-earth-light">
              {['Rooms cleaned to spotless coastal standards','A menu that changes with what’s freshest at the market','A team that remembers your name and your coffee order','Peaceful gardens with shade, birds and jasmine','Easy access to Diani’s beaches and Kwale’s hidden gems'].map(x => (
                <li key={x} className="flex items-start gap-3"><Leaf className="w-5 h-5 text-clay mt-1 shrink-0" /> {x}</li>
              ))}
            </ul>
            <div className="flex gap-3 mt-8">
              <button onClick={() => openBooking()} className="px-7 py-3.5 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep">Book a Room</button>
              <button onClick={openReservation} className="px-7 py-3.5 rounded-full border border-forest/20 text-forest font-semibold hover:bg-forest/5">Reserve a Table</button>
            </div>
          </div>
          <div className="relative">
            <img src="/hero/hero-lush.jpg" className="rounded-3xl h-[500px] w-full object-cover shadow-xl" style={{ objectPosition: 'center 60%' }} alt="Le Grande Haven lush gardens, Kanana" />
            <div className="absolute -bottom-8 -left-8 bg-forest text-cream p-6 rounded-2xl shadow-2xl max-w-xs hidden md:block"><Trees className="w-6 h-6 text-sand" /><div className="font-display text-xl mt-3">In harmony with the coast.</div><div className="text-xs text-cream/70 mt-2">Locally sourced, respectfully served.</div></div>
          </div>
        </div>
      </section>

      {/* Get in touch */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.4em] text-clay">Get in Touch</div>
            <h2 className="font-display text-4xl sm:text-5xl text-forest mt-4">We'd love to hear from you.</h2>
            <p className="text-earth mt-3">Call, WhatsApp or email — we usually reply within a few hours.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-10">
            <a href="tel:0182219969" className="p-6 rounded-2xl bg-white border border-forest/5 lift flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-forest text-cream grid place-items-center shrink-0"><Phone className="w-5 h-5" /></div>
              <div><div className="text-[10px] uppercase tracking-widest text-earth">Call us</div><div className="font-display text-lg text-forest mt-1 break-all">0182 219 969</div></div>
            </a>
            <a href="https://wa.me/0182219969?text=Hello%20Le%20Grande%20Haven" target="_blank" rel="noreferrer" className="p-6 rounded-2xl bg-white border border-forest/5 lift flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#25D366] text-white grid place-items-center shrink-0"><MessageCircle className="w-5 h-5" /></div>
              <div><div className="text-[10px] uppercase tracking-widest text-earth">WhatsApp</div><div className="font-display text-lg text-forest mt-1 break-all">0182 219 969</div></div>
            </a>
            <a href="mailto:legrandehavenltd@gmail.com" className="p-6 rounded-2xl bg-white border border-forest/5 lift flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-clay text-cream grid place-items-center shrink-0"><Mail className="w-5 h-5" /></div>
              <div className="min-w-0"><div className="text-[10px] uppercase tracking-widest text-earth">Email</div><div className="font-display text-lg text-forest mt-1 break-all">legrandehavenltd@gmail.com</div></div>
            </a>
          </div>
          <div className="mt-6 text-center text-xs text-earth flex items-center justify-center gap-2"><MapPin className="w-3.5 h-3.5" /> Le Grande Haven Kanana, Shimoni · Kwale County, Kenya</div>
        </div>
      </section>

      <section className="py-16 bg-forest-deep text-cream text-center">
        <div className="max-w-3xl mx-auto px-6">
          <div className="font-display italic text-3xl md:text-4xl leading-relaxed">“A haven doesn’t need to be far away. It just needs to feel like home the moment you arrive.”</div>
          <div className="text-xs uppercase tracking-[0.4em] text-sand mt-6">— The Le Grande Haven Family</div>
          <div className="mt-8"><Link to="/rooms" className="px-8 py-4 rounded-full bg-sand text-forest-deep font-semibold hover:bg-cream inline-block">Discover the Rooms</Link></div>
        </div>
      </section>
    </main>
  )
}
