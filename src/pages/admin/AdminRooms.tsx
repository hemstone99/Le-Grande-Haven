import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import { KSH, slugify } from '../../lib/format'
import { useToast } from '../../contexts/ToastContext'
import ImageUploader from '../../components/ImageUploader'

type Room = { id: string; slug: string; name: string; short_description: string; description: string; room_type: string; guests: number; bed_config: string; price_per_night: number; amenities: string[]; available: boolean; featured: boolean; images?: { url: string }[] }

export default function AdminRooms() {
  const { push } = useToast()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Room | null>(null)
  const [creating, setCreating] = useState(false)

  const load = () => { setLoading(true); fetch('/api/rooms').then(r => r.json()).then(d => { setRooms(Array.isArray(d) ? d : []); setLoading(false) }) }
  useEffect(load, [])

  const openNew = () => setEditing({ id: '', slug: '', name: '', short_description: '', description: '', room_type: 'Standard', guests: 2, bed_config: 'Queen bed', price_per_night: 5000, amenities: ['Wi-Fi', 'Private bathroom'], available: true, featured: false, images: [] })

  const save = async () => {
    if (!editing) return
    if (!editing.name || !editing.price_per_night) { push('Name and price required', 'error'); return }
    setCreating(true)
    const payload = { ...editing, slug: editing.slug || slugify(editing.name) }
    try {
      const method = editing.id ? 'PUT' : 'POST'
      const res = await fetch('/api/rooms', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed')
      push(editing.id ? 'Room updated' : 'Room created', 'success')
      setEditing(null); load()
    } catch { push('Failed to save', 'error') } finally { setCreating(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this room?')) return
    const res = await fetch('/api/rooms', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { push('Room deleted', 'success'); load() } else push('Failed to delete', 'error')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><div className="text-xs uppercase tracking-[0.4em] text-clay">Manage</div><h1 className="font-display text-4xl text-forest mt-2">Rooms</h1></div>
        <button onClick={openNew} className="px-5 py-3 rounded-full bg-forest text-cream font-semibold flex items-center gap-2 hover:bg-forest-deep"><Plus className="w-4 h-4" /> Add Room</button>
      </div>

      {loading ? <div className="text-earth">Loading...</div> : (
        <div className="overflow-x-auto rounded-3xl bg-white border border-forest/5">
          <table className="w-full min-w-[900px]">
            <thead className="bg-forest/5 text-xs uppercase tracking-widest text-earth">
              <tr><th className="text-left px-6 py-4">Room</th><th className="text-left px-6 py-4">Type</th><th className="text-left px-6 py-4">Guests</th><th className="text-left px-6 py-4">Price</th><th className="text-left px-6 py-4">Available</th><th className="text-left px-6 py-4">Featured</th><th className="px-6"></th></tr>
            </thead>
            <tbody className="divide-y divide-forest/5">
              {rooms.map(r => (
                <tr key={r.id} className="hover:bg-cream-50">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={r.images?.[0]?.url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=200&q=80'} className="w-14 h-14 rounded-xl object-cover" alt="" /><div><div className="font-semibold text-forest">{r.name}</div><div className="text-xs text-earth">{r.short_description}</div></div></div></td>
                  <td className="px-6 py-4 text-sm">{r.room_type}</td>
                  <td className="px-6 py-4 text-sm">{r.guests}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{KSH(r.price_per_night)}</td>
                  <td className="px-6 py-4 text-sm">{r.available ? <span className="text-forest">Yes</span> : <span className="text-clay">No</span>}</td>
                  <td className="px-6 py-4 text-sm">{r.featured ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4"><div className="flex gap-2 justify-end"><button onClick={() => setEditing(r)} className="w-9 h-9 rounded-full bg-forest/10 hover:bg-forest hover:text-cream text-forest grid place-items-center"><Pencil className="w-4 h-4" /></button><button onClick={() => remove(r.id)} className="w-9 h-9 rounded-full bg-clay/10 hover:bg-clay hover:text-cream text-clay grid place-items-center"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4">
          <div className="absolute inset-0 bg-forest-deep/70 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-cream rounded-3xl shadow-2xl">
            <div className="bg-forest text-cream px-8 py-6 flex items-center justify-between sticky top-0 z-10">
              <div><div className="text-[10px] uppercase tracking-[0.3em] text-cream/60">Room</div><div className="font-display text-2xl mt-1">{editing.id ? 'Edit Room' : 'New Room'}</div></div>
              <button onClick={() => setEditing(null)} className="w-10 h-10 rounded-full grid place-items-center bg-cream/10"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 grid md:grid-cols-2 gap-4">
              <div><label className="text-xs uppercase tracking-widest text-earth">Name</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth">Room Type</label><input value={editing.room_type} onChange={e => setEditing({ ...editing, room_type: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" /></div>
              <div className="md:col-span-2"><label className="text-xs uppercase tracking-widest text-earth">Short Description</label><input value={editing.short_description} onChange={e => setEditing({ ...editing, short_description: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" /></div>
              <div className="md:col-span-2"><label className="text-xs uppercase tracking-widest text-earth">Description</label><textarea rows={4} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 resize-none" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth">Guests</label><input type="number" value={editing.guests} onChange={e => setEditing({ ...editing, guests: parseInt(e.target.value) || 1 })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth">Bed Configuration</label><input value={editing.bed_config} onChange={e => setEditing({ ...editing, bed_config: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth">Price per Night (KSh)</label><input type="number" value={editing.price_per_night} onChange={e => setEditing({ ...editing, price_per_night: parseFloat(e.target.value) || 0 })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth">Amenities (comma separated)</label><input value={editing.amenities.join(', ')} onChange={e => setEditing({ ...editing, amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10" /></div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-widest text-earth">Room images</label>
                <div className="mt-2 space-y-3 p-4 rounded-xl bg-white border border-forest/10">
                  {(editing.images || []).map((img, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img src={img.url} alt="" className="w-16 h-16 rounded-lg object-cover bg-cream" />
                      <input
                        type="url"
                        value={img.url}
                        onChange={e => {
                          const next = [...(editing.images || [])]
                          next[idx] = { url: e.target.value }
                          setEditing({ ...editing, images: next })
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-cream border border-forest/10 text-xs"
                      />
                      <button type="button" onClick={() => {
                        const next = (editing.images || []).filter((_, i) => i !== idx)
                        setEditing({ ...editing, images: next })
                      }} className="px-3 py-2 rounded-lg bg-clay/10 text-clay text-xs font-semibold hover:bg-clay/20">Remove</button>
                    </div>
                  ))}
                  <ImageUploader
                    label="Add another image (upload or URL)"
                    value=""
                    onChange={(url) => {
                      if (!url) return
                      setEditing({ ...editing, images: [...(editing.images || []), { url }] })
                    }}
                    folder="rooms"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.available} onChange={e => setEditing({ ...editing, available: e.target.checked })} className="accent-forest w-4 h-4" /> Available</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} className="accent-forest w-4 h-4" /> Featured</label>
              <div className="md:col-span-2 flex justify-end gap-2 mt-4"><button onClick={() => setEditing(null)} className="px-6 py-3 rounded-full border border-forest/20 text-forest font-semibold">Cancel</button><button onClick={save} disabled={creating} className="px-7 py-3 rounded-full bg-forest text-cream font-semibold disabled:opacity-60 flex items-center gap-2">{creating && <Loader2 className="w-4 h-4 animate-spin" />} Save</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
