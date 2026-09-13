import { useEffect, useState } from 'react'
import { formatDate } from '../../lib/format'
import { useToast } from '../../contexts/ToastContext'

type R = { id: string; name: string; phone: string; email: string; reservation_date: string; reservation_time: string; party_size: number; notes: string; status: string; created_at: string }

const STATUSES = ['pending', 'confirmed', 'seated', 'cancelled']

export default function AdminReservations() {
  const { push } = useToast()
  const [items, setItems] = useState<R[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => { setLoading(true); fetch('/api/reservations').then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) }) }
  useEffect(load, [])

  const setStatus = async (id: string, status: string) => {
    const res = await fetch('/api/reservations', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (res.ok) { push(`Reservation ${status}`, 'success'); load() }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete?')) return
    const res = await fetch('/api/reservations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { push('Deleted', 'success'); load() }
  }

  return (
    <div className="space-y-6">
      <div><div className="text-xs uppercase tracking-[0.4em] text-clay">Manage</div><h1 className="font-display text-4xl text-forest mt-2">Restaurant Reservations</h1></div>

      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {items.map(r => (
            <div key={r.id} className="p-6 rounded-3xl bg-white border border-forest/5 grid lg:grid-cols-4 gap-4 items-center">
              <div><div className="font-display text-xl text-forest">{r.name}</div><div className="text-xs text-earth mt-1">{r.phone} · {r.email || '—'}</div>{r.notes && <div className="text-xs italic text-earth mt-1">“{r.notes}”</div>}</div>
              <div><div className="text-xs text-earth uppercase tracking-widest">Date & Time</div><div className="font-semibold text-forest">{formatDate(r.reservation_date)}</div><div className="text-xs text-earth">at {r.reservation_time}</div></div>
              <div><div className="text-xs text-earth uppercase tracking-widest">Party</div><div className="font-semibold text-forest">{r.party_size} guests</div></div>
              <div className="flex flex-col gap-2">
                <select value={r.status} onChange={e => setStatus(r.id, e.target.value)} className="px-3 py-2 rounded-full text-xs font-semibold bg-forest/5 text-forest border border-forest/10">{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <button onClick={() => remove(r.id)} className="px-3 py-2 rounded-full bg-clay/10 text-clay text-xs font-semibold">Delete</button>
              </div>
            </div>
          ))}
          {!items.length && <div className="text-center py-16 text-earth">No reservations yet.</div>}
        </div>
      )}
    </div>
  )
}
