import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, UserCheck, UserX } from 'lucide-react'
import { KSH, formatDate } from '../../lib/format'
import { useToast } from '../../contexts/ToastContext'
import ImageUploader from '../../components/ImageUploader'

type Staff = {
  id: string
  full_name: string
  role: string
  phone: string | null
  email: string | null
  national_id: string | null
  photo_url: string | null
  shift: string | null
  salary: number | null
  hire_date: string | null
  active: boolean
  notes: string | null
  created_at?: string
}

const ROLES = ['Receptionist', 'Waiter', 'Waitress', 'Bartender', 'Chef', 'Sous Chef', 'Housekeeper', 'Security', 'Groundskeeper', 'Driver', 'Manager', 'Accountant']
const SHIFTS = ['Morning (6am–2pm)', 'Afternoon (2pm–10pm)', 'Night (10pm–6am)', 'Split / On-call', 'Full day']

export default function AdminStaff() {
  const { push } = useToast()
  const [items, setItems] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Staff | null>(null)
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState<string>('All')

  const load = () => {
    setLoading(true)
    fetch('/api/staff').then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  const openNew = () => setEditing({
    id: '', full_name: '', role: 'Receptionist', phone: '', email: '', national_id: '',
    photo_url: '', shift: 'Morning (6am–2pm)', salary: null, hire_date: new Date().toISOString().slice(0, 10),
    active: true, notes: '',
  })

  const save = async () => {
    if (!editing) return
    if (!editing.full_name || !editing.role) { push('Name and role are required', 'error'); return }
    setBusy(true)
    const res = await fetch('/api/staff', {
      method: editing.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    setBusy(false)
    if (res.ok) { push('Saved', 'success'); setEditing(null); load() } else push('Save failed', 'error')
  }

  const remove = async (id: string) => {
    if (!confirm('Remove this staff member?')) return
    const res = await fetch('/api/staff', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { push('Removed', 'success'); load() }
  }

  const toggleActive = async (s: Staff) => {
    const res = await fetch('/api/staff', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, active: !s.active }) })
    if (res.ok) { push(!s.active ? 'Activated' : 'Deactivated', 'success'); load() }
  }

  const visible = filter === 'All' ? items : items.filter(i => i.role === filter)
  const roles = ['All', ...Array.from(new Set(items.map(i => i.role)))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-[0.4em] text-clay">Manage</div>
          <h1 className="font-display text-4xl text-forest mt-2">Staff & Team</h1>
        </div>
        <button onClick={openNew} className="px-5 py-3 rounded-full bg-forest text-cream font-semibold flex items-center gap-2 hover:bg-forest-deep">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
        {roles.map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-semibold whitespace-nowrap ${filter === r ? 'bg-forest text-cream' : 'bg-white border border-forest/10 text-forest'}`}
          >{r}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-earth">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-forest/10 text-center">
          <div className="font-display text-2xl text-forest">No staff yet.</div>
          <p className="text-earth mt-2">Add your first receptionist, waiter or bartender to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(s => (
            <div key={s.id} className={`rounded-3xl bg-white border p-5 lift ${s.active ? 'border-forest/5' : 'border-earth/10 opacity-70'}`}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-cream overflow-hidden shrink-0 grid place-items-center">
                  {s.photo_url ? <img src={s.photo_url} alt={s.full_name} className="w-full h-full object-cover" /> : <span className="font-display text-2xl text-forest">{s.full_name.slice(0, 2).toUpperCase()}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-clay">{s.role}</div>
                  <div className="font-display text-xl text-forest truncate">{s.full_name}</div>
                  <div className="text-xs text-earth mt-1">{s.shift || '—'}</div>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-earth">
                {s.phone && <div>📞 {s.phone}</div>}
                {s.email && <div className="truncate">✉️ {s.email}</div>}
                {s.hire_date && <div>Joined {formatDate(s.hire_date)}</div>}
                {typeof s.salary === 'number' && s.salary > 0 && <div>Salary: {KSH(s.salary)} / month</div>}
                {s.notes && <div className="italic text-earth-light mt-2 line-clamp-2">"{s.notes}"</div>}
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => toggleActive(s)} className={`flex-1 px-3 py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1 ${s.active ? 'bg-forest/10 text-forest' : 'bg-clay/10 text-clay'}`}>
                  {s.active ? <><UserCheck className="w-3.5 h-3.5" /> Active</> : <><UserX className="w-3.5 h-3.5" /> Inactive</>}
                </button>
                <button onClick={() => setEditing(s)} className="w-9 h-9 rounded-full bg-forest/10 text-forest grid place-items-center hover:bg-forest hover:text-cream"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(s.id)} className="w-9 h-9 rounded-full bg-clay/10 text-clay grid place-items-center hover:bg-clay hover:text-cream"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4">
          <div className="absolute inset-0 bg-forest-deep/70 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-cream rounded-3xl shadow-2xl">
            <div className="bg-forest text-cream px-8 py-6 flex items-center justify-between sticky top-0 z-10">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-cream/60">Staff Member</div>
                <div className="font-display text-2xl mt-1">{editing.id ? 'Edit staff' : 'New staff'}</div>
              </div>
              <button onClick={() => setEditing(null)} className="w-10 h-10 rounded-full bg-cream/10 grid place-items-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <ImageUploader label="Staff photo" value={editing.photo_url || ''} onChange={(url) => setEditing({ ...editing, photo_url: url })} folder="staff" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-earth">Full name *</label>
                <input required value={editing.full_name} onChange={e => setEditing({ ...editing, full_name: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-earth">Role *</label>
                <select value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-earth">Phone</label>
                <input value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} placeholder="0182 219 969" className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-earth">Email</label>
                <input type="email" value={editing.email || ''} onChange={e => setEditing({ ...editing, email: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-earth">National ID</label>
                <input value={editing.national_id || ''} onChange={e => setEditing({ ...editing, national_id: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-earth">Shift</label>
                <select value={editing.shift || ''} onChange={e => setEditing({ ...editing, shift: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10">
                  <option value="">—</option>
                  {SHIFTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-earth">Monthly salary (KSh)</label>
                <input type="number" value={editing.salary ?? ''} onChange={e => setEditing({ ...editing, salary: e.target.value ? parseFloat(e.target.value) : null })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-earth">Hire date</label>
                <input type="date" value={editing.hire_date || ''} onChange={e => setEditing({ ...editing, hire_date: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-widest text-earth">Notes</label>
                <textarea rows={3} value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 resize-none" placeholder="Languages spoken, specialties, emergency contact…" />
              </div>
              <label className="md:col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="accent-forest w-4 h-4" />
                Active (currently working at Le Grande Haven)
              </label>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button onClick={() => setEditing(null)} className="px-6 py-3 rounded-full border border-forest/20 text-forest font-semibold">Cancel</button>
                <button onClick={save} disabled={busy} className="px-7 py-3 rounded-full bg-forest text-cream font-semibold disabled:opacity-60 flex items-center gap-2">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />} Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
