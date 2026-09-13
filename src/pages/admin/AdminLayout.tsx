import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, Bed, CalendarRange, UtensilsCrossed, Wine, MessageSquare, Users, Settings, LogOut, ExternalLink, Menu, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/rooms', label: 'Rooms', icon: Bed },
    { to: '/admin/bookings', label: 'Bookings', icon: CalendarRange },
    { to: '/admin/reservations', label: 'Reservations', icon: CalendarRange },
    { to: '/admin/food', label: 'Food Menu', icon: UtensilsCrossed },
    { to: '/admin/drinks', label: 'Drinks Menu', icon: Wine },
    { to: '/admin/staff', label: 'Staff & Team', icon: Users },
    { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const doSignOut = async () => { await signOut(); nav('/login') }

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen bg-forest-deep text-cream w-72 flex flex-col z-40 transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-cream/10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white grid place-items-center overflow-hidden shadow-sm ring-1 ring-cream/20"><img src="/logo.png" alt="" className="w-full h-full object-contain p-1" /></div>
          <div><div className="font-display text-lg">Le Grande Haven</div><div className="text-[10px] uppercase tracking-[0.3em] text-cream/60">Staff Portal</div></div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(l => {
            const Icon = l.icon
            return <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${isActive ? 'bg-sand text-forest-deep font-semibold' : 'text-cream/80 hover:bg-cream/10'}`}><Icon className="w-4 h-4" /> {l.label}</NavLink>
          })}
        </nav>
        <div className="p-4 border-t border-cream/10 space-y-3">
          <div className="text-xs"><div className="text-cream/60">Signed in</div><div className="text-cream truncate">{user?.email}</div></div>
          <div className="flex gap-2">
            <Link to="/" className="flex-1 px-3 py-2 rounded-full bg-cream/10 hover:bg-cream/20 text-xs flex items-center justify-center gap-2"><ExternalLink className="w-3.5 h-3.5" /> Site</Link>
            <button onClick={doSignOut} className="flex-1 px-3 py-2 rounded-full bg-clay hover:opacity-90 text-xs flex items-center justify-center gap-2"><LogOut className="w-3.5 h-3.5" /> Sign out</button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-forest-deep/60 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-20 bg-cream-50/95 backdrop-blur border-b border-forest/10 px-4 py-3 flex items-center justify-between">
          <div className="font-display text-lg text-forest">Admin</div>
          <button onClick={() => setOpen(x => !x)} className="w-10 h-10 grid place-items-center rounded-full bg-forest text-cream">{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        </div>
        <div className="p-6 md:p-10 max-w-[1400px]"><Outlet /></div>
      </div>
    </div>
  )
}
