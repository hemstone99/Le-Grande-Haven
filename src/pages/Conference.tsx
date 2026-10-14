import { useState } from 'react'
import { Phone, Users, Wifi, Coffee, Utensils, Projector, Trees, Music, ArrowRight, Check, Briefcase, Heart, GraduationCap, PartyPopper, BedDouble, Car, CalendarDays, Loader2, CheckCircle2, MessageSquareText, Mic2, Sparkles } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { BrandTile, IconTile, TILE_BG } from '../components/BrandIcons'
import { whatsappLink, PHONE_DISPLAY, PHONE_TEL } from '../lib/contact'
import HeroWave from '../components/HeroWave'

const EVENT_TYPES = [
  { Icon: Briefcase, bg: TILE_BG.forest, title: 'Corporate meetings', desc: 'Board meetings, strategy sessions and client presentations in a calm setting.' },
  { Icon: Heart, bg: TILE_BG.clay, title: 'Weddings & receptions', desc: 'Garden ceremonies and banquet receptions with catering by our kitchen.' },
  { Icon: GraduationCap, bg: TILE_BG.ocean, title: 'Workshops & training', desc: 'Theatre-style training with projector, whiteboard and full AV.' },
  { Icon: PartyPopper, bg: TILE_BG.sand, title: 'Celebrations', desc: 'Birthdays, anniversaries, graduations and launches — indoors or under the palms.' },
]

const SPACES = [
  { title: 'The Garden Pavilion', capacity: 200, img: '/conference/outdoor.jpg', desc: 'A shaded outdoor pavilion under palms and mangoes — perfect for launches, weddings and receptions.', tags: ['Receptions', 'Weddings', 'Launches'] },
  { title: 'The Banquet Hall', capacity: 120, img: '/conference/banquet.jpg', desc: 'An elegant hall for gala dinners and celebrations, with plated or buffet dining.', tags: ['Gala dinners', 'Parties'] },
  { title: 'The Training Room', capacity: 40, img: '/conference/presentation.jpg', desc: 'A modern theatre-style room with projector, whiteboard and full AV.', tags: ['Training', 'Workshops'] },
  { title: 'The Boardroom', capacity: 16, img: '/conference/meeting-room.jpg', pos: 'center 22%', desc: 'A bright meeting room with U-shaped tables, natural light and garden views — ideal for board meetings and strategy sessions.', tags: ['Board meetings', 'Interviews'] },
]

const PACKAGES = [
  { name: 'Half-Day Meeting', price: 'KSh 1,800', unit: 'per person', inclusions: ['Meeting room hire', 'Tea break with mandazi & samosas', 'Bottled water', 'Wi-Fi & AV equipment', 'Notepads & pens'] },
  { name: 'Full-Day Conference', price: 'KSh 3,500', unit: 'per person', featured: true, inclusions: ['Meeting room hire', 'Morning & afternoon tea', 'Buffet lunch with dessert', 'Bottled water throughout', 'Wi-Fi, projector & AV', 'Notepads, pens & flipchart'] },
  { name: 'Residential Retreat', price: 'KSh 8,500', unit: 'from, per person', inclusions: ['Meeting room + accommodation', 'All meals — breakfast, lunch & dinner', 'Tea breaks & snacks', 'Sundowner welcome cocktail', 'Wi-Fi, projector & AV', 'Gardens & pool tables'] },
]

const AMENITIES = [
  { Icon: Wifi, bg: TILE_BG.ocean, t: 'High-speed Wi-Fi' },
  { Icon: Projector, bg: TILE_BG.forest, t: 'HD projector & screen' },
  { Icon: Mic2, bg: TILE_BG.clay, t: 'PA system & mics' },
  { Icon: Coffee, bg: TILE_BG.earth, t: 'Tea, coffee & snacks' },
  { Icon: Utensils, bg: TILE_BG.sand, t: 'On-site chef & catering' },
  { Icon: Users, bg: TILE_BG.forest, t: 'Dedicated event host' },
  { Icon: BedDouble, bg: TILE_BG.ocean, t: 'Rooms for delegates' },
  { Icon: Car, bg: TILE_BG.earth, t: 'Secure parking' },
]

const EVENT_OPTIONS = ['Corporate meeting', 'Conference', 'Workshop / training', 'Wedding / reception', 'Celebration', 'Other']
const input = 'w-full px-4 py-3.5 rounded-2xl bg-cream-50 border border-forest/10 text-forest-deep placeholder:text-earth/50 focus:bg-white focus:border-forest focus:ring-4 focus:ring-forest/10 outline-none transition'

export default function Conference() {
  const { push } = useToast()
  const [form, setForm] = useState({ type: EVENT_OPTIONS[0], date: '', guests: '', name: '', email: '', phone: '', notes: '' })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) { push('Please add your name and email', 'error'); return }
    setBusy(true)
    const message = [
      `Event type: ${form.type}`,
      `Preferred date: ${form.date || 'flexible'}`,
      `Guests: ${form.guests || 'not sure yet'}`,
      form.notes && `Notes: ${form.notes}`,
    ].filter(Boolean).join('\n')
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, subject: `Event enquiry · ${form.type}`, message }) })
      if (!res.ok) throw new Error('Failed')
      setSent(true)
    } catch { push('Could not send — please WhatsApp or call us', 'error') } finally { setBusy(false) }
  }

  const waEnquiry = whatsappLink('Hello Le Grande Haven, I’d like to enquire about hosting an event.')

  return (
    <main className="bg-cream-50 min-h-screen">
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-end pt-36 pb-32 md:pb-40 bg-forest-deep text-cream overflow-hidden">
        <img src="/conference/banquet.jpg" alt="" className="absolute inset-0 w-full h-full object-cover animate-zoom-slow" />
        <div className="absolute inset-0 bg-linear-to-t from-forest-deep via-forest-deep/70 to-forest-deep/30" />
        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream/10 border border-cream/15 text-xs font-semibold"><Sparkles className="w-3.5 h-3.5 text-sand" /> Meetings & events</div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl mt-6 leading-[0.95] max-w-4xl">Gatherings, <em className="text-sand">coastal style.</em></h1>
          <p className="text-cream/85 mt-6 max-w-2xl text-lg">From a 16-seat boardroom to garden receptions for 200 — with our own kitchen, full AV and rooms for your delegates.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#enquire" className="px-7 py-4 rounded-full bg-sand text-forest-deep font-semibold hover:bg-cream transition inline-flex items-center gap-2">Plan your event <ArrowRight className="w-4 h-4" /></a>
            <a href={waEnquiry} target="_blank" rel="noreferrer" className="pl-2 pr-6 py-2 rounded-full bg-cream/10 border border-cream/20 font-semibold hover:bg-cream/15 transition inline-flex items-center gap-3"><BrandTile brand="whatsapp" size={40} /> WhatsApp us</a>
          </div>
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px rounded-3xl overflow-hidden bg-cream/10 border border-cream/15 backdrop-blur">
            {[['200', 'guests, max capacity'], ['4', 'indoor & garden venues'], ['3', 'all-inclusive packages'], ['10', 'rooms for delegates']].map(([n, t]) => (
              <div key={t} className="p-5 md:p-6 bg-forest-deep/40">
                <div className="font-display text-4xl text-sand">{n}</div>
                <div className="text-[11px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] text-cream/70 mt-1">{t}</div>
              </div>
            ))}
          </div>
        </div>
        <HeroWave fill="#fbf8f2" />
      </section>

      {/* EVENT TYPES */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.4em] text-clay">What we host</div>
            <h2 className="font-display text-4xl md:text-5xl text-forest mt-4">Made for every occasion.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {EVENT_TYPES.map(({ Icon, bg, title, desc }) => (
              <div key={title} className="p-7 rounded-3xl bg-white border border-forest/5 lift">
                <IconTile icon={Icon} bg={bg} size={56} />
                <h3 className="font-display text-2xl text-forest mt-6">{title}</h3>
                <p className="text-earth mt-2 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VENUES — bento grid */}
      <section className="py-24 bg-cream-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.4em] text-clay">Our spaces</div>
              <h2 className="font-display text-4xl md:text-5xl text-forest mt-4">Four venues, one haven.</h2>
            </div>
            <p className="text-earth max-w-md">Indoor and outdoor spaces that can be combined — a morning session in the training room, lunch in the hall, sundowners in the garden.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {SPACES.map((s, i) => (
              <article key={s.title} className={`group relative rounded-3xl overflow-hidden min-h-[340px] ${i === 0 ? 'lg:col-span-2 lg:row-span-2 lg:min-h-[700px]' : ''} ${i === SPACES.length - 1 ? 'lg:col-span-3 lg:min-h-[320px]' : ''}`}>
                <img loading="lazy" decoding="async" src={s.img} alt={s.title} style={{ objectPosition: s.pos }} className="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-forest-deep/95 via-forest-deep/40 to-transparent" />
                <div className="absolute top-5 left-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-forest text-sm font-semibold shadow"><Users className="w-4 h-4 text-clay" /> Up to {s.capacity}</div>
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-cream">
                  <h3 className={`font-display ${i === 0 ? 'text-4xl md:text-5xl' : 'text-3xl'}`}>{s.title}</h3>
                  <p className={`text-cream/80 mt-2 ${i === 0 ? 'max-w-lg text-lg' : 'text-sm'}`}>{s.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">{s.tags.map(t => <span key={t} className="px-3 py-1 rounded-full bg-cream/15 border border-cream/20 text-xs font-semibold">{t}</span>)}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.4em] text-clay">Packages</div>
            <h2 className="font-display text-4xl md:text-5xl text-forest mt-4">Simple, all-in pricing.</h2>
            <p className="text-earth mt-3">Room hire, catering and equipment included — no surprises on the invoice.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-14 items-stretch">
            {PACKAGES.map(p => (
              <div key={p.name} className={`relative p-8 rounded-[2rem] flex flex-col ${p.featured ? 'bg-forest text-cream shadow-2xl shadow-forest/30 md:-translate-y-4' : 'bg-white border border-forest/10 text-forest'}`}>
                {p.featured && <div className="absolute -top-3.5 left-8 px-3 py-1 rounded-full bg-sand text-forest-deep text-xs uppercase tracking-widest font-bold">Most popular</div>}
                <div className="font-display text-2xl">{p.name}</div>
                <div className="mt-6 flex items-baseline gap-2"><span className="font-display text-5xl">{p.price}</span></div>
                <div className={`text-sm mt-1 ${p.featured ? 'text-cream/70' : 'text-earth'}`}>{p.unit}</div>
                <div className={`h-px my-7 ${p.featured ? 'bg-cream/15' : 'bg-forest/10'}`} />
                <ul className="space-y-3 flex-1">
                  {p.inclusions.map(i => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className={`w-5 h-5 rounded-full grid place-items-center shrink-0 mt-0.5 ${p.featured ? 'bg-sand text-forest-deep' : 'bg-forest/10 text-forest'}`}><Check className="w-3 h-3" strokeWidth={3} /></span>{i}
                    </li>
                  ))}
                </ul>
                <a href="#enquire" className={`mt-8 w-full px-6 py-3.5 rounded-full text-center font-semibold transition ${p.featured ? 'bg-sand text-forest-deep hover:bg-cream' : 'bg-forest text-cream hover:bg-forest-deep'}`}>Request a quote</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AMENITIES */}
      <section className="py-24 bg-forest-deep text-cream relative overflow-hidden">
        <img src="/conference/presentation.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-10" />
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_1.3fr] gap-14 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-sand">The details</div>
            <h2 className="font-display text-4xl md:text-5xl mt-4">Thoughtfully equipped.</h2>
            <p className="text-cream/75 mt-4 text-lg">Every booking includes our full facilities and the attention of a dedicated host — so you can focus on your guests.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AMENITIES.map(({ Icon, bg, t }) => (
              <div key={t} className="p-5 rounded-3xl bg-cream/5 border border-cream/10 flex flex-col items-center text-center gap-3 hover:bg-cream/10 transition">
                <IconTile icon={Icon} bg={bg} size={52} />
                <span className="text-sm font-medium leading-snug">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.4em] text-clay">How it works</div>
            <h2 className="font-display text-4xl md:text-5xl text-forest mt-4">From idea to event in three steps.</h2>
          </div>
          <ol className="grid md:grid-cols-3 gap-6 mt-14">
            {[
              { Icon: MessageSquareText, t: 'Tell us your plans', d: 'Share your date, guest numbers and the kind of event — by the form below or WhatsApp.' },
              { Icon: CalendarDays, t: 'Get a tailored proposal', d: 'Our team replies within 24 hours with venue options, menu and a clear quote.' },
              { Icon: Trees, t: 'Arrive and enjoy', d: 'We set up the room, run the catering and look after your guests on the day.' },
            ].map(({ Icon, t, d }, i) => (
              <li key={t} className="relative p-8 rounded-3xl bg-white border border-forest/5">
                <div className="absolute top-6 right-7 font-display text-6xl text-forest/5 select-none">0{i + 1}</div>
                <IconTile icon={Icon} bg={[TILE_BG.forest, TILE_BG.clay, TILE_BG.sand][i]} size={52} />
                <h3 className="font-display text-2xl text-forest mt-6">{t}</h3>
                <p className="text-earth mt-2 text-sm leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ENQUIRY */}
      <section id="enquire" className="pb-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-[2rem] overflow-hidden grid lg:grid-cols-[1fr_1.4fr] bg-white border border-forest/5 shadow-xl">
            <div className="relative p-10 md:p-12 bg-forest text-cream overflow-hidden">
              <img src="/conference/outdoor.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-20" />
              <div className="relative h-full flex flex-col">
                <div className="text-xs uppercase tracking-[0.4em] text-sand">Enquire</div>
                <h2 className="font-display text-4xl md:text-5xl mt-4">Let’s host your next moment.</h2>
                <p className="text-cream/75 mt-4">Send your details and we’ll come back with a proposal within 24 hours.</p>
                <div className="mt-auto pt-10 space-y-3">
                  <a href={waEnquiry} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-3 pr-5 rounded-2xl bg-cream/10 border border-cream/15 hover:bg-cream/15 transition"><BrandTile brand="whatsapp" size={44} /><div><div className="font-semibold">WhatsApp</div><div className="text-xs text-cream/70">Quickest way to reach us</div></div><ArrowRight className="w-4 h-4 ml-auto" /></a>
                  <a href={PHONE_TEL} className="flex items-center gap-4 p-3 pr-5 rounded-2xl bg-cream/10 border border-cream/15 hover:bg-cream/15 transition"><IconTile icon={Phone} bg={TILE_BG.phone} size={44} /><div><div className="font-semibold">Call {PHONE_DISPLAY}</div><div className="text-xs text-cream/70">Speak to our events team</div></div><ArrowRight className="w-4 h-4 ml-auto" /></a>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12">
              {sent ? (
                <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center animate-fade-up">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 grid place-items-center"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div>
                  <h3 className="font-display text-4xl text-forest mt-6">Enquiry received</h3>
                  <p className="text-earth mt-3 max-w-sm">Thank you, {form.name.split(' ')[0]}. Our events team will reply to <strong className="text-forest">{form.email}</strong> within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <div className="grid md:grid-cols-3 gap-4">
                    <label className="block md:col-span-1"><span className="text-xs font-semibold uppercase tracking-widest text-earth">Event type</span>
                      <select value={form.type} onChange={set('type')} className={`${input} mt-2`}>{EVENT_OPTIONS.map(o => <option key={o}>{o}</option>)}</select></label>
                    <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-earth">Preferred date</span>
                      <input type="date" value={form.date} onChange={set('date')} min={new Date().toISOString().slice(0, 10)} className={`${input} mt-2`} /></label>
                    <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-earth">Guests</span>
                      <input type="number" min={1} max={500} value={form.guests} onChange={set('guests')} placeholder="e.g. 40" className={`${input} mt-2`} /></label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-earth">Your name *</span>
                      <input required value={form.name} onChange={set('name')} autoComplete="name" className={`${input} mt-2`} /></label>
                    <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-earth">Email *</span>
                      <input required type="email" value={form.email} onChange={set('email')} autoComplete="email" className={`${input} mt-2`} /></label>
                  </div>
                  <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-earth">Phone</span>
                    <input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="07xx xxx xxx" className={`${input} mt-2`} /></label>
                  <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-earth">Tell us more</span>
                    <textarea rows={4} value={form.notes} onChange={set('notes')} placeholder="Catering, room layout, accommodation for guests…" className={`${input} mt-2 resize-none`} /></label>
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-earth/80 flex items-center gap-2"><Music className="w-3.5 h-3.5" /> PA, projector and Wi-Fi included with every venue.</p>
                    <button disabled={busy} type="submit" className="px-8 py-4 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep transition inline-flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-forest/20">
                      {busy && <Loader2 className="w-4 h-4 animate-spin" />} Send enquiry <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
