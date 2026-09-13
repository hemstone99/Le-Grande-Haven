import { useEffect, useState } from 'react'
import { X, Loader2, Check, Calendar, Users, Clock } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

export default function ReservationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast()
  const today = new Date().toISOString().slice(0, 10)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', reservation_date: today, reservation_time: '19:00', party_size: 2, notes: '' })
  useEffect(() => { if (open) setStep('form') }, [open])
  if (!open) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) { push('Please provide your name and phone', 'error'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reservation failed')
      setStep('success'); push('Table reservation received', 'success')
    } catch (err: any) { push(err.message || 'Failed', 'error') } finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <div className="absolute inset-0 bg-forest-deep/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-cream rounded-3xl shadow-2xl overflow-hidden animate-fade-up">
        <div className="bg-clay text-cream px-8 py-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-cream/70">Restaurant</div>
            <div className="font-display text-2xl mt-1">Reserve a Table</div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full grid place-items-center bg-cream/10 hover:bg-cream/20"><X className="w-5 h-5" /></button>
        </div>
        {step === 'form' ? (
          <form onSubmit={submit} className="p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs uppercase tracking-widest text-earth">Name *</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth">Phone *</label><input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none" /></div>
              <div className="md:col-span-2"><label className="text-xs uppercase tracking-widest text-earth">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth"><Calendar className="w-3 h-3 inline mr-1" />Date</label><input required type="date" min={today} value={form.reservation_date} onChange={e => setForm(f => ({ ...f, reservation_date: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth"><Clock className="w-3 h-3 inline mr-1" />Time</label><input required type="time" value={form.reservation_time} onChange={e => setForm(f => ({ ...f, reservation_time: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none" /></div>
              <div className="md:col-span-2"><label className="text-xs uppercase tracking-widest text-earth"><Users className="w-3 h-3 inline mr-1" />Party size</label><input type="number" min={1} max={20} value={form.party_size} onChange={e => setForm(f => ({ ...f, party_size: parseInt(e.target.value) || 1 }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none" /></div>
            </div>
            <div><label className="text-xs uppercase tracking-widest text-earth">Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none resize-none" placeholder="Dietary needs, birthday, seating preference..." /></div>
            <button disabled={submitting} type="submit" className="w-full px-7 py-3.5 rounded-full bg-clay text-cream font-semibold hover:opacity-90 transition disabled:opacity-60 flex items-center gap-2 justify-center">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Reserve Table
            </button>
          </form>
        ) : (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-clay/10 grid place-items-center mx-auto"><Check className="w-8 h-8 text-clay" /></div>
            <div className="font-display text-3xl text-forest mt-6">Table Reserved</div>
            <p className="text-earth mt-3">We look forward to hosting you at Le Grande Haven.</p>
            <button onClick={onClose} className="mt-8 px-8 py-3 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep">Close</button>
          </div>
        )}
      </div>
    </div>
  )
}
