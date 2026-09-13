import { Instagram, Facebook, Music2, MessageCircle, Plus } from 'lucide-react'
import { useState } from 'react'

const items = [
  { href: 'https://www.instagram.com/legrandehaven?stkn=ZnZ6ZTZjMTIwNWZp&utm_source=ig_contact_invite', label: 'Instagram', Icon: Instagram, bg: 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]' },
  { href: 'https://www.tiktok.com/@legrazzt157?_r=1&_t=ZS-99az9KxQn0n', label: 'TikTok', Icon: Music2, bg: 'bg-black' },
  { href: 'https://www.facebook.com/share/18zG2jozwq/?mibextid=wwXIfr', label: 'Facebook', Icon: Facebook, bg: 'bg-[#1877f2]' },
  { href: 'https://wa.me/0182219969?text=Hello%20Le%20Grande%20Haven', label: 'WhatsApp', Icon: MessageCircle, bg: 'bg-[#25D366]' },
]

export default function FloatingSocials() {
  const [open, setOpen] = useState(true)
  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3">
      <div className={`flex flex-col gap-3 transition-all duration-500 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {items.map(({ href, label, Icon, bg }, i) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            style={{ transitionDelay: open ? `${i * 60}ms` : '0ms' }}
            className={`group relative w-12 h-12 rounded-full ${bg} text-white grid place-items-center shadow-xl hover:scale-110 transition-transform`}
          >
            <Icon className="w-5 h-5" />
            <span className="absolute right-full mr-3 px-3 py-1 rounded-full bg-forest-deep text-cream text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">{label}</span>
          </a>
        ))}
      </div>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Hide social links' : 'Show social links'}
        className={`w-12 h-12 rounded-full bg-forest text-cream grid place-items-center shadow-2xl hover:bg-forest-deep transition-transform ${open ? 'rotate-45' : ''}`}
      >
        <Plus className="w-5 h-5 transition-transform" />
      </button>
    </div>
  )
}
