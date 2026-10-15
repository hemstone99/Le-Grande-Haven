import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, ArrowUpRight, Phone, Clock } from 'lucide-react'
import { useBooking } from './BookingContext'
import { BrandTile, IconTile, TILE_BG } from './BrandIcons'
import { PHONE_DISPLAY, PHONE_TEL, EMAIL, whatsappLink, MAPS_DIRECTIONS, SOCIALS, isRestaurantOpen } from '../lib/contact'

const EXPLORE = [['/', 'Home'], ['/rooms', 'Rooms'], ['/food', 'Food'], ['/drinks', 'Drinks'], ['/conference', 'Conference'], ['/gallery', 'Gallery'], ['/about', 'About'], ['/contact', 'Contact']]

export default function Footer() {
  const { openBooking, openReservation } = useBooking()
  const [openNow, setOpenNow] = useState(isRestaurantOpen())
  useEffect(() => {
    const id = setInterval(() => setOpenNow(isRestaurantOpen()), 60_000)
    return () => clearInterval(id)
  }, [])

  const contacts = [
    { tile: <BrandTile brand="whatsapp" size={40} />, label: 'WhatsApp', value: 'Chat with us', href: whatsappLink(), external: true },
    { tile: <BrandTile brand="gmail" size={40} />, label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
    { tile: <BrandTile brand="maps" size={40} />, label: 'Visit', value: 'Kanana, Shimoni · Kwale', href: MAPS_DIRECTIONS, external: true },
  ]

  return (
    <footer className="relative bg-forest-deep text-cream/80 overflow-hidden">
      {/* Invitation band */}
      <div className="relative border-b border-cream/10">
        <img src="/hero/hero-lush.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-linear-to-r from-forest-deep via-forest-deep/80 to-forest-deep/40" />
        <div className="relative max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-sand">Plan your stay</div>
            <h2 className="font-display text-4xl md:text-5xl text-cream mt-3 leading-tight">Your coastal escape <em className="text-sand">awaits.</em></h2>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button onClick={() => openBooking()} className="px-7 py-3.5 rounded-full bg-sand text-forest-deep font-semibold hover:bg-cream transition">Book a Room</button>
            <button onClick={openReservation} className="px-7 py-3.5 rounded-full border border-cream/30 text-cream font-semibold hover:bg-cream/10 transition">Reserve a Table</button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-10 grid gap-12 lg:grid-cols-[1.3fr_0.7fr_1.2fr_1fr]">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white grid place-items-center overflow-hidden ring-1 ring-cream/20 shadow-sm"><img src="/logo.png" alt="Le Grande Haven logo" className="w-full h-full object-contain p-1" /></div>
            <div>
              <div className="font-display text-2xl text-cream">Le Grande Haven</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-cream/50">Taste · Stay · Relax</div>
            </div>
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-cream/65 max-w-sm">A coastal sanctuary in Kanana where Kenyan hospitality meets calm gardens, honest cooking and restful nights.</p>
           <div className="flex items-center gap-3 mt-6">
             {([['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']] as const).map(([b, label]) => (
               <a key={b} href={SOCIALS[b]} target="_blank" rel="noreferrer" aria-label={label} className="hover:-translate-y-0.5 transition"><BrandTile brand={b} size={40} /></a>
             ))}
             <a href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hover:-translate-y-0.5 transition"><BrandTile brand="whatsapp" size={40} /></a>
             <a href={PHONE_TEL} className="hover:-translate-y-0.5 transition"><IconTile icon={Phone} bg={TILE_BG.phone} size={40} /></a>
           </div>
        </div>

        {/* Explore */}
        <nav aria-label="Footer">
          <div className="text-xs uppercase tracking-[0.3em] text-sand mb-5">Explore</div>
          <ul className="grid grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-2.5 text-sm">
            {EXPLORE.map(([to, label]) => (
              <li key={to}><Link to={to} className="group inline-flex items-center gap-1 hover:text-sand transition">{label}<ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" /></Link></li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-sand mb-5">Get in touch</div>
          <ul className="space-y-2">
            {contacts.map(c => (
              <li key={c.label}>
                <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})} className="group flex items-center gap-3 p-2 -mx-2 rounded-2xl hover:bg-cream/5 transition">
                  {c.tile}
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-widest text-cream/50">{c.label}</span>
                    <span className="block text-sm text-cream truncate group-hover:text-sand transition">{c.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Hours */}
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-sand mb-5 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Hours</div>
          <div className="rounded-3xl bg-cream/5 border border-cream/10 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="relative flex w-2 h-2">
                {openNow && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />}
                <span className={`relative inline-flex rounded-full w-2 h-2 ${openNow ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </span>
              <span className={openNow ? 'text-emerald-300' : 'text-amber-300'}>{openNow ? 'Restaurant open now' : 'Restaurant closed · opens 7am'}</span>
            </div>
            <ul className="mt-4 divide-y divide-cream/10 text-sm">
              {[['Restaurant & bar', '7am – 11pm'], ['Reception', '24 hours'], ['Check-in', 'From 11am'], ['Check-out', 'By 10am']].map(([k, v]) => (
                <li key={k} className="py-2.5 flex justify-between gap-4"><span className="text-cream/60">{k}</span><span className="text-cream font-medium">{v}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div className="relative max-w-7xl mx-auto px-6 select-none pointer-events-none" aria-hidden="true">
        <div className="font-display text-[10.5vw] sm:text-[12.5vw] lg:text-[11rem] leading-[0.8] text-center whitespace-nowrap text-transparent bg-clip-text bg-linear-to-b from-cream/10 to-cream/0 translate-y-[18%]">Le Grande Haven</div>
      </div>

      <div className="relative border-t border-cream/10 bg-forest-deep">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-cream/50">
          <div>© {new Date().getFullYear()} Le Grande Haven · Kanana, Shimoni, Kwale County</div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-sand transition">Staff Portal</Link>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cream/15 hover:border-sand hover:text-sand transition" aria-label="Back to top">
              Back to top <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
