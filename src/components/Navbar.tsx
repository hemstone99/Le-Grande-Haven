import { NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navbar({ onBookRoom, onReserveTable }: { onBookRoom: () => void; onReserveTable: () => void }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()
  const onDark = loc.pathname === '/' && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll(); window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [loc.pathname])

  const links = [
    { to: '/', label: 'Home' },
    { to: '/food', label: 'Food' },
    { to: '/drinks', label: 'Drinks' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/conference', label: 'Conference' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'glass border-b border-forest/10 py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className={`flex items-center gap-3 group ${onDark ? 'text-cream' : 'text-forest'}`}>
          <div className={`w-12 h-12 rounded-2xl grid place-items-center overflow-hidden transition ring-1 shadow-sm ${onDark ? 'bg-white ring-cream/30' : 'bg-white ring-forest/15'}`}>
            <img src="/logo.png" alt="Le Grande Haven" className="w-full h-full object-contain p-0.5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl tracking-tight">Le Grande Haven</div>
            <div className={`text-[10px] uppercase tracking-[0.25em] ${onDark ? 'text-cream/60' : 'text-earth'}`}>Kanana, Shimoni</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `px-4 py-2 text-sm font-medium rounded-full transition ${isActive ? (onDark ? 'bg-cream/15 text-cream' : 'bg-forest text-cream') : (onDark ? 'text-cream/85 hover:text-cream' : 'text-forest hover:bg-forest/5')}`}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <button onClick={onReserveTable} className={`px-4 py-2 text-sm font-semibold rounded-full transition border ${onDark ? 'border-cream/30 text-cream hover:bg-cream/10' : 'border-forest/20 text-forest hover:bg-forest/5'}`}>Reserve Table</button>
          <button onClick={onBookRoom} className="px-5 py-2 text-sm font-semibold rounded-full bg-sand text-forest-deep hover:bg-sand-dark transition">Book a Room</button>
        </div>

        <button onClick={() => setOpen(true)} className={`lg:hidden w-10 h-10 grid place-items-center rounded-full ${onDark ? 'bg-cream/15 text-cream' : 'bg-forest/10 text-forest'}`}><Menu className="w-5 h-5" /></button>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-forest-deep/70 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-[86%] max-w-sm bg-cream shadow-2xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-forest/10">
            <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-white ring-1 ring-forest/15 grid place-items-center overflow-hidden shadow-sm"><img src="/logo.png" alt="" className="w-full h-full object-contain p-0.5" /></div><div className="font-display text-xl text-forest">Le Grande Haven</div></div>
            <button onClick={() => setOpen(false)} className="w-10 h-10 grid place-items-center rounded-full bg-forest/10 text-forest"><X className="w-5 h-5" /></button>
          </div>
          <nav className="p-4 flex flex-col">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `px-4 py-3.5 rounded-xl text-base font-medium ${isActive ? 'bg-forest text-cream' : 'text-forest hover:bg-forest/5'}`}>{l.label}</NavLink>
            ))}
          </nav>
          <div className="p-4 space-y-2 border-t border-forest/10">
            <button onClick={() => { setOpen(false); onReserveTable() }} className="w-full px-4 py-3 rounded-xl border border-forest/20 text-forest font-semibold">Reserve a Table</button>
            <button onClick={() => { setOpen(false); onBookRoom() }} className="w-full px-4 py-3 rounded-xl bg-sand text-forest-deep font-semibold">Book a Room</button>
          </div>
        </div>
      </div>
    </header>
  )
}
