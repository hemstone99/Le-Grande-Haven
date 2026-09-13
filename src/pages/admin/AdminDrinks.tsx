import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import { KSH } from '../../lib/format'
import { useToast } from '../../contexts/ToastContext'
import ImageUploader from '../../components/ImageUploader'

type Item = { id: string; name: string; description: string; price: number; image_url: string; category: string; available: boolean; featured: boolean }
const CATS = ['Beers','Whisky','Spirits','Champagne & Wine','Sodas','Water']

export default function AdminDrinks() {
  const { push } = useToast()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Item | null>(null)
  const [busy, setBusy] = useState(false)

  const load = () => { setLoading(true); fetch('/api/drinks').then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) }) }
  useEffect(load, [])

  const openNew = () => setEditing({ id: '', name: '', description: '', price: 300, image_url: '', category: CATS[0], available: true, featured: false })
  const save = async () => {
    if (!editing) return
    if (!editing.name || !editing.category) { push('Name & category required', 'error'); return }
    setBusy(true)
    const res = await fetch('/api/drinks', { method: editing.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    setBusy(false)
    if (res.ok) { push('Saved', 'success'); setEditing(null); load() }
  }
  const remove = async (id: string) => {
    if (!confirm('Delete?')) return
    const res = await fetch('/api/drinks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { push('Deleted', 'success'); load() }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><div className="text-xs uppercase tracking-[0.4em] text-clay">Manage</div><h1 className="font-display text-4xl text-forest mt-2">Drinks Menu</h1></div>
        <button onClick={openNew} className="px-5 py-3 rounded-full bg-clay text-cream font-semibold flex items-center gap-2"><Plus className="w-4 h-4" /> Add Drink</button>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(f => (
            <div key={f.id} className="rounded-2xl overflow-hidden bg-white border border-forest/5 flex flex-col">
              <div className="h-36 bg-cream"><img src={f.image_url} alt={f.name} className="w-full h-full object-cover" /></div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-[10px] uppercase tracking-widest text-clay">{f.category}</div>
                <div className="flex items-baseline justify-between mt-1"><div className="font-display text-base text-forest">{f.name}</div><div className="text-sm font-semibold text-forest">{KSH(f.price)}</div></div>
                <div className="flex gap-1 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${f.available ? 'bg-forest/10 text-forest' : 'bg-clay/10 text-clay'}`}>{f.available ? 'On' : 'Off'}</span>
                  {f.featured && <span className="px-2 py-0.5 rounded-full bg-sand text-forest-deep text-[9px] font-semibold">Signature</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditing(f)} className="flex-1 px-3 py-1.5 rounded-full bg-forest/10 text-forest text-xs font-semibold flex items-center justify-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
                  <button onClick={() => remove(f.id)} className="px-3 py-1.5 rounded-full bg-clay/10 text-clay text-xs font-semibold"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4">
          <div className="absolute inset-0 bg-forest-deep/70 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-cream rounded-3xl shadow-2xl">
            <div className="bg-clay text-cream px-8 py-6 flex items-center justify-between"><div className="font-display text-2xl">{editing.id ? 'Edit' : 'New'} Drink</div><button onClick={() => setEditing(null)} className="w-10 h-10 rounded-full bg-cream/10 grid place-items-center"><X className="w-5 h-5" /></button></div>
            <div className="p-8 space-y-4">
              <div><label className="text-xs uppercase tracking-widest text-earth">Name</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth">Description</label><textarea rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs uppercase tracking-widest text-earth">Category</label><select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10">{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="text-xs uppercase tracking-widest text-earth">Price (KSh)</label><input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" /></div>
              </div>
              <ImageUploader label="Drink image" value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} folder="drinks" />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.available} onChange={e => setEditing({ ...editing, available: e.target.checked })} className="accent-forest w-4 h-4" /> Available</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} className="accent-forest w-4 h-4" /> Signature</label>
              </div>
              <div className="flex justify-end gap-2"><button onClick={() => setEditing(null)} className="px-6 py-3 rounded-full border border-forest/20 text-forest font-semibold">Cancel</button><button onClick={save} disabled={busy} className="px-7 py-3 rounded-full bg-clay text-cream font-semibold disabled:opacity-60 flex items-center gap-2">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Save</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
