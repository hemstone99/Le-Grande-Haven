import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook, MessageCircle, Music2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-forest-deep text-cream/85 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white grid place-items-center overflow-hidden ring-1 ring-cream/20 shadow-sm"><img src="/logo.png" alt="Le Grande Haven logo" className="w-full h-full object-contain p-1" /></div>
            <div>
              <div className="font-display text-2xl text-cream">Le Grande Haven</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-cream/50">Taste · Stay · Relax</div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-cream/70">A coastal sanctuary in Kanana where Kenyan hospitality meets calm gardens, honest cooking and restful nights.</p>
          <div className="flex items-center gap-3 mt-6">
            <a href="https://www.instagram.com/legrandehaven?stkn=ZnZ6ZTZjMTIwNWZp&utm_source=ig_contact_invite" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full grid place-items-center bg-cream/10 hover:bg-sand hover:text-forest-deep transition"><Instagram className="w-4 h-4" /></a>
            <a href="https://www.tiktok.com/@legrazzt157?_r=1&_t=ZS-99az9KxQn0n" target="_blank" rel="noreferrer" aria-label="TikTok" className="w-9 h-9 rounded-full grid place-items-center bg-cream/10 hover:bg-sand hover:text-forest-deep transition"><Music2 className="w-4 h-4" /></a>
            <a href="https://www.facebook.com/share/18zG2jozwq/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full grid place-items-center bg-cream/10 hover:bg-sand hover:text-forest-deep transition"><Facebook className="w-4 h-4" /></a>
            <a href="https://wa.me/0182219969" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-9 h-9 rounded-full grid place-items-center bg-cream/10 hover:bg-sand hover:text-forest-deep transition"><MessageCircle className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <div className="font-display text-cream mb-4">Explore</div>
          <ul className="space-y-2 text-sm">
            {[['/', 'Home'], ['/food', 'Food'], ['/drinks', 'Drinks'], ['/rooms', 'Rooms'], ['/conference', 'Conference'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-sand transition">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-display text-cream mb-4">Contact</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-sand shrink-0" /> Le Grande Haven Kanana, Shimoni</li>
            <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 text-sand shrink-0" /> 0182 219 969</li>
            <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 text-sand shrink-0" /> legrandehavenltd@gmail.com</li>
          </ul>
        </div>

        <div>
          <div className="font-display text-cream mb-4">Hours</div>
          <ul className="space-y-2 text-sm text-cream/70">
            <li className="flex justify-between"><span>Restaurant</span><span className="text-cream">7am – 11pm</span></li>
            <li className="flex justify-between"><span>Reception</span><span className="text-cream">24 hours</span></li>
            <li className="flex justify-between"><span>Check-in</span><span className="text-cream">from 11am (any time on request)</span></li>
            <li className="flex justify-between"><span>Check-out</span><span className="text-cream">by 10am</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-cream/50">
          <div>© {new Date().getFullYear()} Le Grande Haven Kanana, Shimoni</div>
          <div className="flex items-center gap-6"><Link to="/login" className="hover:text-sand">Staff Portal</Link><span>Crafted with care</span></div>
        </div>
      </div>
    </footer>
  )
}
