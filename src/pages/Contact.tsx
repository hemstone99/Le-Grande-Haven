import { useEffect, useState } from 'react'
import { Phone, Clock, Loader2, Navigation, ArrowUpRight, BedDouble, UtensilsCrossed, Presentation, MessageSquareText, CheckCircle2, ChevronDown, User, Mail, Send, ConciergeBell, KeyRound, MapPin } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { useBooking } from '../components/BookingContext'
import { BrandTile, IconTile, TILE_BG } from '../components/BrandIcons'
import { PHONE_DISPLAY, PHONE_TEL, EMAIL, whatsappLink, MAPS_DIRECTIONS, MAPS_EMBED, SOCIALS, isRestaurantOpen } from '../lib/contact'
import HeroWave from '../components/HeroWave'

const TOPICS = [
  { key: 'Room booking', Icon: BedDouble },
  { key: 'Table reservation', Icon: UtensilsCrossed },
  { key: 'Events & conferences', Icon: Presentation },
  { key: 'General enquiry', Icon: MessageSquareText },
] as const

const FAQS = [
  { q: 'What time is check-in and check-out?', a: 'Check-in is from 11:00am and check-out is by 10:00am. Early check-in can be arranged on request — just let us know your arrival time.' },
  { q: 'When is the restaurant open?', a: 'Our restaurant serves breakfast, lunch and dinner daily from 7:00am to 11:00pm. Reception is open 24 hours.' },
  { q: 'Do I need to reserve a table?', a: 'Walk-ins are always welcome, but reserving helps us prepare for larger groups and celebrations. Use “Reserve a Table” or message us on WhatsApp.' },
  { q: 'Can you host meetings, weddings or parties?', a: 'Yes — from a 16-seat boardroom to garden receptions for up to 200 guests, with catering by our kitchen. See our Conference page or send an enquiry above.' },
]

const field = 'w-full pl-11 pr-4 py-3.5 rounded-2xl bg-cream-50 border border-forest/10 text-forest-deep placeholder:text-earth/50 focus:bg-white focus:border-forest focus:ring-4 focus:ring-forest/10 outline-none transition'

export default function Contact() {
  const { push } = useToast()
  const { openBooking, openReservation } = useBooking()
  const [topic, setTopic] = useState<string>(TOPICS[0].key)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [faq, setFaq] = useState<number | null>(0)
  const [openNow, setOpenNow] = useState(isRestaurantOpen())

  useEffect(() => {
    const id = setInterval(() => setOpenNow(isRestaurantOpen()), 60_000)
    return () => clearInterval(id)
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { push('Please complete the required fields', 'error'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, subject: topic }) })
      if (!res.ok) throw new Error('Failed')
      setSent(true)
    } catch { push('Failed to send message — please try WhatsApp or call us', 'error') } finally { setBusy(false) }
  }

  const channels = [
    { tile: <BrandTile brand="whatsapp" size={52} />, title: 'WhatsApp', detail: 'Fastest reply — chat with our team', action: 'Start chat', href: whatsappLink(), external: true },
    { tile: <IconTile icon={Phone} bg={TILE_BG.phone} size={52} />, title: 'Call us', detail: PHONE_DISPLAY, action: 'Call now', href: PHONE_TEL },
    { tile: <BrandTile brand="gmail" size={52} />, title: 'Email', detail: EMAIL, action: 'Write to us', href: `mailto:${EMAIL}` },
    { tile: <BrandTile brand="maps" size={52} />, title: 'Visit', detail: 'Kanana, Shimoni · Kwale', action: 'Get directions', href: MAPS_DIRECTIONS, external: true },
  ]

  return (
    <main className="bg-cream-50 min-h-screen">
      {/* HERO */}
      <section className="relative pt-36 pb-40 bg-forest-deep text-cream overflow-hidden">
        <img src="/hero/hero-accommodation.jpg" className="absolute inset-0 w-full h-full object-cover opacity-35" style={{ objectPosition: 'center 65%' }} alt="" />
        <div className="absolute inset-0 bg-linear-to-r from-forest-deep via-forest-deep/85 to-forest-deep/40" />
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-end">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream/10 border border-cream/15 text-xs font-semibold">
              <span className={`relative flex w-2 h-2`}>
                {openNow && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />}
                <span className={`relative inline-flex rounded-full w-2 h-2 ${openNow ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </span>
              {openNow ? 'Restaurant open now · until 11pm' : 'Restaurant opens at 7am · Reception open 24/7'}
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl mt-6 leading-[0.95]">Let’s talk<em className="text-sand">.</em></h1>
            <p className="text-cream/80 mt-6 max-w-xl text-lg">Planning a stay, a celebration or simply a table for two? Our team in Kanana is always happy to help.</p>
          </div>
          <div className="hidden lg:flex justify-end gap-3">
            {[{ i: KeyRound, t: 'Check-in', v: '11:00am' }, { i: ConciergeBell, t: 'Reception', v: '24 hours' }, { i: UtensilsCrossed, t: 'Restaurant', v: '7am – 11pm' }].map(({ i: I, t, v }) => (
              <div key={t} className="w-36 p-4 rounded-2xl bg-cream/10 border border-cream/15 backdrop-blur">
                <I className="w-5 h-5 text-sand" />
                <div className="text-[10px] uppercase tracking-[0.25em] text-cream/60 mt-3">{t}</div>
                <div className="font-display text-lg mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <HeroWave fill="#fbf8f2" />
      </section>

      {/* CHANNELS — overlap the hero */}
      <section className="relative -mt-24 z-10">
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map(c => (
            <a key={c.title} href={c.href} {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="group p-6 rounded-3xl bg-white border border-forest/5 shadow-[0_20px_50px_-25px_rgba(20,37,32,0.45)] hover:-translate-y-1 hover:shadow-[0_30px_60px_-25px_rgba(20,37,32,0.55)] transition duration-300 flex flex-col">
              {c.tile}
              <div className="font-display text-2xl text-forest mt-5">{c.title}</div>
              <div className="text-earth text-sm mt-1 break-all">{c.detail}</div>
              <div className="mt-5 pt-4 border-t border-forest/5 flex items-center justify-between text-sm font-semibold text-clay">
                {c.action}<ArrowUpRight className="w-4 h-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* FORM + DETAILS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 p-8 md:p-10 rounded-[2rem] bg-white border border-forest/5 shadow-sm">
            {sent ? (
              <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center animate-fade-up">
                <div className="w-20 h-20 rounded-full bg-emerald-50 grid place-items-center"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div>
                <h2 className="font-display text-4xl text-forest mt-6">Asante, {form.name.split(' ')[0]}!</h2>
                <p className="text-earth mt-3 max-w-sm">Your message is with our team. We’ll reply to <strong className="text-forest">{form.email}</strong> shortly.</p>
                <div className="mt-8 flex flex-wrap gap-3 justify-center">
                  <a href={whatsappLink()} target="_blank" rel="noreferrer" className="px-6 py-3 rounded-full bg-[#25D366] text-white font-semibold inline-flex items-center gap-2 hover:brightness-95">Need it sooner? WhatsApp us</a>
                  <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }) }} className="px-6 py-3 rounded-full border border-forest/15 text-forest font-semibold hover:bg-forest/5">Send another</button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-xs uppercase tracking-[0.4em] text-clay">Send a message</div>
                <h2 className="font-display text-4xl text-forest mt-3">How can we help?</h2>
                <form onSubmit={submit} className="mt-8 space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="radiogroup" aria-label="Topic">
                    {TOPICS.map(({ key, Icon }) => (
                      <button type="button" key={key} role="radio" aria-checked={topic === key} onClick={() => setTopic(key)}
                        className={`p-3 rounded-2xl border text-left transition ${topic === key ? 'bg-forest text-cream border-forest shadow-md' : 'bg-cream-50 text-forest border-forest/10 hover:border-forest/30'}`}>
                        <Icon className={`w-5 h-5 ${topic === key ? 'text-sand' : 'text-clay'}`} />
                        <div className="text-xs font-semibold mt-2 leading-tight">{key}</div>
                      </button>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-earth">Your name *</span>
                      <div className="relative mt-2"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth/60" /><input required value={form.name} onChange={set('name')} autoComplete="name" placeholder="Jane Wanjiru" className={field} /></div></label>
                    <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-earth">Email *</span>
                      <div className="relative mt-2"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth/60" /><input required type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" className={field} /></div></label>
                  </div>
                  <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-earth">Phone <span className="normal-case tracking-normal font-normal text-earth/60">(optional)</span></span>
                    <div className="relative mt-2"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth/60" /><input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="07xx xxx xxx" className={field} /></div></label>
                  <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-earth">Message *</span>
                    <div className="relative mt-2"><MessageSquareText className="absolute left-4 top-4 w-4 h-4 text-earth/60" /><textarea required rows={5} value={form.message} onChange={set('message')} placeholder="Dates, number of guests, anything we should know…" className={`${field} resize-none`} /></div></label>
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-earth/80">We reply within a few hours during opening times.</p>
                    <button disabled={busy} type="submit" className="px-8 py-4 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep transition inline-flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-forest/20">
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send message
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <aside className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-[2rem] bg-forest text-cream relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-sand/10" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-sand" /><div className="font-display text-2xl">Opening hours</div></div>
                <ul className="mt-6 divide-y divide-cream/10 text-sm">
                  <li className="py-3 flex items-center justify-between gap-4"><span className="text-cream/70">Restaurant & bar</span><span className="flex items-center gap-2 font-semibold">7:00am – 11:00pm <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${openNow ? 'bg-emerald-400/20 text-emerald-300' : 'bg-amber-400/20 text-amber-300'}`}>{openNow ? 'Open' : 'Closed'}</span></span></li>
                  <li className="py-3 flex items-center justify-between gap-4"><span className="text-cream/70">Reception</span><span className="font-semibold">24 hours</span></li>
                  <li className="py-3 flex items-center justify-between gap-4"><span className="text-cream/70">Check-in</span><span className="font-semibold">From 11:00am</span></li>
                  <li className="py-3 flex items-center justify-between gap-4"><span className="text-cream/70">Check-out</span><span className="font-semibold">By 10:00am</span></li>
                </ul>
                <div className="grid grid-cols-2 gap-2 mt-6">
                  <button onClick={() => openBooking()} className="px-4 py-3 rounded-full bg-sand text-forest-deep text-sm font-semibold hover:bg-cream transition">Book a Room</button>
                  <button onClick={openReservation} className="px-4 py-3 rounded-full border border-cream/30 text-cream text-sm font-semibold hover:bg-cream/10 transition">Reserve Table</button>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-white border border-forest/5">
              <div className="font-display text-2xl text-forest">Follow the Haven</div>
              <p className="text-earth text-sm mt-1">Daily moments from Kanana.</p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {([['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']] as const).map(([b, label]) => (
                  <a key={b} href={SOCIALS[b]} target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-cream-50 transition">
                    <BrandTile brand={b} size={48} className="group-hover:-translate-y-0.5 transition" />
                    <span className="text-xs font-semibold text-forest">{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* MAP */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-[2rem] overflow-hidden border border-forest/10 shadow-xl">
            <iframe title="Le Grande Haven location" src={MAPS_EMBED} className="w-full h-[460px] block" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="absolute left-4 bottom-4 md:left-8 md:bottom-8 max-w-sm p-6 rounded-3xl bg-white/95 backdrop-blur shadow-2xl">
              <div className="flex items-start gap-4">
                <BrandTile brand="maps" size={48} />
                <div>
                  <div className="font-display text-xl text-forest">Le Grande Haven</div>
                  <div className="text-sm text-earth mt-0.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Kanana, Shimoni · Kwale County</div>
                </div>
              </div>
              <a href={MAPS_DIRECTIONS} target="_blank" rel="noreferrer" className="mt-5 w-full px-5 py-3 rounded-full bg-forest text-cream text-sm font-semibold hover:bg-forest-deep transition flex items-center justify-center gap-2"><Navigation className="w-4 h-4" /> Get directions</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.4em] text-clay">Good to know</div>
            <h2 className="font-display text-4xl md:text-5xl text-forest mt-3">Frequently asked</h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.q} className={`rounded-2xl border transition ${faq === i ? 'bg-white border-forest/15 shadow-sm' : 'bg-cream-50 border-forest/10'}`}>
                <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i} className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left">
                  <span className="font-semibold text-forest">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-clay shrink-0 transition-transform ${faq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-all duration-300 ${faq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden"><p className="px-6 pb-5 text-earth leading-relaxed">{f.a}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
