import { useEffect, useState } from 'react'
import { formatDate, KSH } from '../../lib/format'
import { useToast } from '../../contexts/ToastContext'

type Booking = { id: string; guest_name: string; phone: string; email: string; check_in: string; check_out: string; guests: number; status: string; special_requests: string; room_id: string; room_name?: string; room_price?: number; created_at: string }

const STATUSES = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']

export default function AdminBookings() {
  const { push } = useToast()
  const [items, setItems] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => { setLoading(true); fetch('/api/bookings').then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) }) }
  useEffect(load, [])

  const setStatus = async (id: string, status: string) => {
    const res = await fetch('/api/bookings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (res.ok) { push(`Booking ${status.replace('_', ' ')}`, 'success'); load() } else push('Update failed', 'error')
  }

  const remove = async (id: string) => {
    if (!confirm('Delete booking?')) return
    const res = await fetch('/api/bookings', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { push('Deleted', 'success'); load() }
  }

  const visible = filter === 'all' ? items : items.filter(i => i.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.4em] text-clay">Manage</div>
        <h1 className="font-display text-4xl text-forest mt-2">Room Bookings</h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', ...STATUSES].map(s => <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-semibold ${filter === s ? 'bg-forest text-cream' : 'bg-white border border-forest/10 text-forest'}`}>{s.replace('_', ' ')}</button>)}
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {visible.map(b => (
            <div key={b.id} className="p-6 rounded-3xl bg-white border border-forest/5 grid lg:grid-cols-5 gap-4 items-center">
              <div className="lg:col-span-2">
                <div className="font-display text-xl text-forest">{b.guest_name}</div>
                <div className="text-xs text-earth mt-1">{b.phone} · {b.email || '—'}</div>
                <div className="text-xs text-earth">Booked: {formatDate(b.created_at)}</div>
                {b.special_requests && <div className="mt-2 text-xs italic text-earth">“{b.special_requests}”</div>}
              </div>
              <div className="text-sm"><div className="text-xs text-earth uppercase tracking-widest">Room</div><div className="font-semibold text-forest">{b.room_name || '—'}</div><div className="text-xs text-earth">{b.guests} guests</div></div>
              <div className="text-sm"><div className="text-xs text-earth uppercase tracking-widest">Stay</div><div className="font-semibold text-forest">{formatDate(b.check_in)}</div><div className="text-xs text-earth">to {formatDate(b.check_out)}</div></div>
              <div className="flex flex-col gap-2">
                <select value={b.status} onChange={e => setStatus(b.id, e.target.value)} className="px-3 py-2 rounded-full text-xs font-semibold bg-forest/5 text-forest border border-forest/10">
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <button onClick={() => remove(b.id)} className="px-3 py-2 rounded-full bg-clay/10 text-clay text-xs font-semibold">Delete</button>
              </div>
            </div>
          ))}
          {!visible.length && <div className="text-center py-16 text-earth">No bookings in this view.</div>}
        </div>
      )}
    </div>
  )
}
