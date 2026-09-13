import { useState } from 'react'
import { MapPin, Phone, Mail, MessageCircle, Clock, Loader2, Navigation } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { useBooking } from '../components/BookingContext'

export default function Contact() {
  const { push } = useToast()
  const { openBooking, openReservation } = useBooking()
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { push('Please complete the required fields', 'error'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
      push('Message sent. We’ll be in touch shortly.', 'success')
    } catch { push('Failed to send message', 'error') } finally { setBusy(false) }
  }

  return (
    <main className="bg-cream-50 min-h-screen">
      <section className="relative pt-40 pb-16 bg-forest text-cream overflow-hidden">
        <img src="/hero/hero-accommodation.jpg" className="absolute inset-0 w-full h-full object-cover opacity-25" style={{ objectPosition: 'center 65%' }} alt="Le Grande Haven Kanana" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.4em] text-sand">Say Hello</div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl mt-4 leading-none">Contact Us<em className="text-sand">.</em></h1>
          <p className="text-cream/80 mt-6 max-w-xl">We’d love to hear from you — whether you’re planning a stay, a celebration, or simply a table for two.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-6">
          {[
            { i: Phone, t: 'Call Us', v: '0182 219 969', a: 'tel:0182219969', c: 'forest' },
            { i: MessageCircle, t: 'WhatsApp', v: 'Chat with our team', a: 'https://wa.me/0182219969', c: 'clay' },
            { i: Mail, t: 'Email', v: 'legrandehavenltd@gmail.com', a: 'mailto:legrandehavenltd@gmail.com', c: 'sand-dark' },
          ].map(({ i: Icon, t, v, a }) => (
            <a key={t} href={a} className="p-8 rounded-3xl bg-white border border-forest/5 lift block"><div className="w-12 h-12 rounded-2xl bg-forest text-cream grid place-items-center"><Icon className="w-6 h-6" /></div><div className="font-display text-2xl text-forest mt-6">{t}</div><div className="text-earth mt-1">{v}</div></a>
          ))}
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 p-8 md:p-10 rounded-3xl bg-white border border-forest/5">
            <h2 className="font-display text-4xl text-forest">Send us a message</h2>
            <p className="text-earth mt-2">We reply within a few hours during opening times.</p>
            <form onSubmit={submit} className="mt-8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="text-xs uppercase tracking-widest text-earth">Your name *</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-forest/10 focus:border-forest outline-none" /></div>
                <div><label className="text-xs uppercase tracking-widest text-earth">Email *</label><input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-forest/10 focus:border-forest outline-none" /></div>
                <div><label className="text-xs uppercase tracking-widest text-earth">Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-forest/10 focus:border-forest outline-none" /></div>
                <div><label className="text-xs uppercase tracking-widest text-earth">Subject</label><input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-forest/10 focus:border-forest outline-none" placeholder="Booking enquiry" /></div>
              </div>
              <div><label className="text-xs uppercase tracking-widest text-earth">Message *</label><textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-forest/10 focus:border-forest outline-none resize-none" placeholder="Tell us how we can help…" /></div>
              <button disabled={busy} type="submit" className="px-7 py-3.5 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep transition inline-flex items-center gap-2 disabled:opacity-60">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Send Message</button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-3xl bg-forest text-cream">
              <div className="font-display text-3xl">Le Grande Haven</div>
              <div className="text-cream/70 text-sm mt-1">Kanana, Shimoni</div>
              <div className="hairline my-6 bg-cream/20" />
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3"><Clock className="w-5 h-5 text-sand mt-0.5" /><div><div className="text-cream/60 text-xs uppercase tracking-widest">Restaurant</div><div>7:00am — 11:00pm daily</div></div></div>
                <div className="flex items-start gap-3"><Clock className="w-5 h-5 text-sand mt-0.5" /><div><div className="text-cream/60 text-xs uppercase tracking-widest">Reception</div><div>Open 24 hours</div></div></div>
                <div className="flex items-start gap-3"><Clock className="w-5 h-5 text-sand mt-0.5" /><div><div className="text-cream/60 text-xs uppercase tracking-widest">Check-in / out</div><div>From 11:00am (early check-in on request) · Check-out by 10:00am</div></div></div>
                <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-sand mt-0.5" /><div>Le Grande Haven Kanana, Shimoni</div></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-6">
                <button onClick={() => openBooking()} className="px-4 py-3 rounded-full bg-sand text-forest-deep text-sm font-semibold hover:bg-cream">Book Room</button>
                <button onClick={openReservation} className="px-4 py-3 rounded-full border border-cream/30 text-cream text-sm font-semibold hover:bg-cream/10">Reserve Table</button>
              </div>
              <a href="https://www.google.com/maps/place/Le+Grande+Haven,+Shimoni/@-4.5359358,39.3757662,17z/" target="_blank" rel="noreferrer" className="mt-3 w-full px-4 py-3 rounded-full bg-cream/10 border border-cream/20 text-cream text-sm font-semibold hover:bg-cream/20 flex items-center justify-center gap-2"><Navigation className="w-4 h-4" /> Get Directions</a>
            </div>
            <div className="rounded-3xl overflow-hidden border border-forest/10 shadow-lg">
              <iframe title="Le Grande Haven Location" src="https://maps.google.com/maps?q=Le+Grande+Haven+Shimoni&ll=-4.5359358,39.3757662&t=&z=17&ie=UTF8&iwloc=B&output=embed" className="w-full h-[300px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
