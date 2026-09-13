import { useEffect, useState } from 'react'
import { formatDateTime } from '../../lib/format'
import { useToast } from '../../contexts/ToastContext'
import { Mail, Phone, Trash2 } from 'lucide-react'

type M = { id: string; name: string; email: string; phone: string; subject: string; message: string; is_read: boolean; created_at: string }

export default function AdminMessages() {
  const { push } = useToast()
  const [items, setItems] = useState<M[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => { setLoading(true); fetch('/api/messages').then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) }) }
  useEffect(load, [])

  const markRead = async (id: string, is_read: boolean) => {
    await fetch('/api/messages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_read }) })
    load()
  }
  const remove = async (id: string) => {
    if (!confirm('Delete?')) return
    const res = await fetch('/api/messages', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { push('Deleted'); load() }
  }

  return (
    <div className="space-y-6">
      <div><div className="text-xs uppercase tracking-[0.4em] text-clay">Inbox</div><h1 className="font-display text-4xl text-forest mt-2">Guest Messages</h1></div>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {items.map(m => (
            <div key={m.id} className={`p-6 rounded-3xl bg-white border ${m.is_read ? 'border-forest/5' : 'border-clay/40 shadow-md'}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3"><div className="font-display text-xl text-forest">{m.name}</div>{!m.is_read && <span className="px-2 py-0.5 rounded-full bg-clay text-cream text-[10px] uppercase tracking-widest">New</span>}</div>
                  <div className="text-xs text-earth mt-1 flex gap-3"><span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {m.email}</span>{m.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {m.phone}</span>}</div>
                  <div className="text-xs text-earth mt-1">{formatDateTime(m.created_at)}</div>
                </div>
                <div className="flex gap-2"><button onClick={() => markRead(m.id, !m.is_read)} className="px-4 py-2 rounded-full bg-forest/5 text-forest text-xs font-semibold">{m.is_read ? 'Mark unread' : 'Mark read'}</button><button onClick={() => remove(m.id)} className="w-9 h-9 rounded-full bg-clay/10 text-clay grid place-items-center"><Trash2 className="w-4 h-4" /></button></div>
              </div>
              {m.subject && <div className="mt-4 font-semibold text-forest">{m.subject}</div>}
              <div className="mt-2 text-earth leading-relaxed whitespace-pre-wrap">{m.message}</div>
            </div>
          ))}
          {!items.length && <div className="text-center py-16 text-earth">No messages yet.</div>}
        </div>
      )}
    </div>
  )
}
