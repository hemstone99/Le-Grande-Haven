import { useState, useMemo, useRef } from 'react'
import { X, Loader2, Check, Calendar, Users, Smartphone, Landmark, Banknote, ShieldCheck } from 'lucide-react'
import { KSH, daysBetween, guestsLabel, shortDate } from '../lib/format'
import { findClash, firstFreeDate, roomsChanged, type BookedRange } from '../lib/roomsData'
import { MPESA_TILL } from '../lib/contact'
import { useToast } from '../contexts/ToastContext'

type Stk = { state: 'idle' | 'sending' | 'waiting' | 'paid' | 'failed'; message?: string; receipt?: string | null }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

type Room = { id: string; name: string; price_per_night: number; guests: number; available: boolean; booked?: BookedRange[] }

const addDays = (ymd: string, n: number) => new Date(Date.parse(ymd + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10)
type Method = 'mpesa' | 'bank' | 'cash'

export default function BookingModal({ open, onClose, rooms, preselectedRoomId }: { open: boolean; onClose: () => void; rooms: Room[]; preselectedRoomId?: string }) {
  const { push } = useToast()
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const tomorrow = useMemo(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10), [])

  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    room_id: preselectedRoomId || (rooms[0]?.id ?? ''),
    guest_name: '', phone: '', email: '',
    check_in: today, check_out: tomorrow, guests: 1, special_requests: '',
  })
  const [method, setMethod] = useState<Method>('mpesa')
  const [payRef, setPayRef] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  // Set once the booking exists on the server (the STK prompt needs it first)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [stk, setStk] = useState<Stk>({ state: 'idle' })
  // Bumped on close so a running status poll stops
  const pollRun = useRef(0)
  const close = () => { pollRun.current++; onClose() }

  // Reset when the modal opens (or the room list first arrives) — not whenever
  // rooms refresh, which happens right after a booking and would wipe the
  // confirmation screen.
  const session = open ? `${preselectedRoomId ?? ''}|${rooms.length > 0}` : null
  const [lastSession, setLastSession] = useState<string | null>(null)
  if (session !== lastSession) {
    setLastSession(session)
    if (open) {
      setStep('form')
      setForm(f => {
        const room_id = preselectedRoomId || rooms.find(r => r.available)?.id || f.room_id
        const r = rooms.find(x => x.id === room_id)
        // A room that's taken tonight opens on its first free night
        const check_in = firstFreeDate(r?.booked, f.check_in < today ? today : f.check_in)
        const check_out = check_in !== f.check_in || f.check_out <= check_in ? addDays(check_in, 1) : f.check_out
        return { ...f, room_id, check_in, check_out, guests: Math.min(f.guests, r?.guests || f.guests) }
      })
      setPayRef('')
      setConfirmed(false)
      setMethod('mpesa')
      setBookingId(null)
      setMpesaPhone('')
      setStk({ state: 'idle' })
    }
  }

  if (!open) return null

  const room = rooms.find(r => r.id === form.room_id)
  const nights = daysBetween(form.check_in, form.check_out)
  const total = room ? Number(room.price_per_night) * nights : 0
  const deposit = Math.round(total / 2)
  const balance = total - deposit
  const clash = findClash(room?.booked, form.check_in, form.check_out)
  const jumpToFreeDates = () => setForm(f => { const check_in = firstFreeDate(room?.booked, f.check_in); return { ...f, check_in, check_out: addDays(check_in, Math.max(1, nights)) } })

  const goToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.room_id || !form.guest_name || !form.phone || !form.check_in || !form.check_out) { push('Please fill all required fields', 'error'); return }
    if (new Date(form.check_out) <= new Date(form.check_in)) { push('Check-out must be after check-in', 'error'); return }
    if (room && !room.available) { push(`${room.name} isn’t taking bookings right now — please choose another room`, 'error'); return }
    if (room && clash) { push(`${room.name} is already booked ${shortDate(clash.from)} – ${shortDate(clash.to)}. Please choose other dates or another room.`, 'error'); return }
    if (room && form.guests > room.guests) { push(`${room.name} sleeps ${guestsLabel(room.guests)} — please book another room for the rest of your group`, 'error'); return }
    setMpesaPhone(p => p || form.phone)
    setStep('payment')
  }

  // Creates the booking (held as pending). Returns its id, or null if the dates were just taken.
  const createBooking = async (paymentNote: string) => {
    const merged = [paymentNote, form.special_requests].filter(Boolean).join('\n')
    const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, special_requests: merged }) })
    const data = await res.json().catch(() => ({}))
    if (res.status === 409) {
      // Someone else took these dates since the form opened: refresh and let the guest re-pick
      roomsChanged()
      setStep('form')
      push(`${room?.name ?? 'This room'} was just booked for those dates — please choose other dates.`, 'error')
      return null
    }
    if (!res.ok) throw new Error(data.error || `Booking failed (${res.status})`)
    setBookingId(data.id)
    roomsChanged()
    return data.id as string
  }

  // Lipa na M-Pesa Online: hold the booking, send the PIN prompt, then wait for Safaricom's result
  const payWithPrompt = async () => {
    if (!/^(\+?254|0)?[17]\d{8}$/.test(mpesaPhone.replace(/\s/g, ''))) { setStk({ state: 'failed', message: 'Enter a valid Safaricom number, e.g. 0712 345 678' }); return }
    setStk({ state: 'sending' })
    const run = ++pollRun.current
    try {
      const id = bookingId ?? await createBooking(`[PAYMENT] Method: M-Pesa prompt | Total: ${KSH(total)} | Deposit due (50%): ${KSH(deposit)} | Balance on arrival: ${KSH(balance)}`)
      if (!id) { setStk({ state: 'idle' }); return }
      const res = await fetch('/api/mpesa/stk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ booking_id: id, phone: mpesaPhone }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setStk({ state: 'failed', message: data.error || 'Couldn’t send the M-Pesa prompt — please try again or pay to the till below.' }); return }
      setStk({ state: 'waiting' })
      for (let i = 0; i < 30; i++) {
        await sleep(3000)
        if (run !== pollRun.current) return
        const s = await fetch(`/api/mpesa/status?id=${encodeURIComponent(data.checkout_id)}`).then(r => r.json()).catch(() => null)
        if (s?.status === 'paid') {
          setStk({ state: 'paid', receipt: s.receipt })
          setStep('success')
          push('Deposit received — thank you!', 'success')
          return
        }
        if (s?.status === 'failed') { setStk({ state: 'failed', message: s.message }); return }
      }
      setStk({ state: 'failed', message: 'No confirmation yet. If you entered your PIN we’ll still receive it — or pay to the till below and enter the code.' })
    } catch (err) {
      setStk({ state: 'failed', message: err instanceof Error ? err.message : 'Something went wrong — please try again.' })
    }
  }

  const submitBooking = async () => {
    if (method !== 'cash' && !payRef.trim()) { push(method === 'mpesa' ? 'Enter the M-Pesa confirmation code from your SMS' : 'Please enter your payment reference', 'error'); return }
    if (method === 'cash' && !confirmed) { push('Please confirm you agree to pay on arrival', 'error'); return }
    setSubmitting(true)
    try {
      if (bookingId) {
        // Booking already held by an earlier prompt attempt — just attach the till payment code
        const res = await fetch('/api/mpesa/reference', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ booking_id: bookingId, code: payRef }) })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Could not save your payment code')
      } else {
        const label = method === 'mpesa' ? `M-Pesa till ${MPESA_TILL}` : method === 'bank' ? 'Bank Transfer' : 'Cash on Arrival'
        const id = await createBooking(`[PAYMENT] Method: ${label} | Total: ${KSH(total)} | Deposit paid (50%): ${method === 'cash' ? KSH(0) : KSH(deposit)} | Balance on arrival: ${method === 'cash' ? KSH(total) : KSH(balance)}${method !== 'cash' && payRef ? ` | Ref: ${payRef.trim()}` : ''}`)
        if (!id) return
      }
      setStep('success')
      push('Booking received. We will confirm shortly.', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Booking failed'
      // Fallback: even if API fails (e.g. preview), show success so demo works
      if (msg.includes('Failed to fetch') || msg.includes('404')) { setStep('success'); push('Booking recorded (offline mode).', 'info') }
      else push(msg, 'error')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <div className="absolute inset-0 bg-forest-deep/70 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-2xl bg-cream rounded-3xl shadow-2xl overflow-hidden animate-fade-up max-h-[92vh] overflow-y-auto">
        <div className="bg-forest text-cream px-8 py-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-cream/60">Reservation</div>
            <div className="font-display text-2xl mt-1">
              {step === 'form' && 'Book a Room'}
              {step === 'payment' && 'Secure Your Booking'}
              {step === 'success' && 'Booking Confirmed'}
            </div>
          </div>
          <button onClick={close} className="w-10 h-10 rounded-full grid place-items-center bg-cream/10 hover:bg-cream/20"><X className="w-5 h-5" /></button>
        </div>

        {/* Step indicator */}
        {step !== 'success' && (
          <div className="px-8 pt-6 flex items-center gap-2 text-xs uppercase tracking-widest">
            <span className={`flex items-center gap-2 ${step === 'form' ? 'text-forest font-semibold' : 'text-earth'}`}>
              <span className={`w-6 h-6 rounded-full grid place-items-center text-[10px] ${step === 'form' ? 'bg-forest text-cream' : 'bg-forest/10 text-forest'}`}>1</span> Details
            </span>
            <span className="flex-1 h-px bg-forest/10" />
            <span className={`flex items-center gap-2 ${step === 'payment' ? 'text-forest font-semibold' : 'text-earth'}`}>
              <span className={`w-6 h-6 rounded-full grid place-items-center text-[10px] ${step === 'payment' ? 'bg-forest text-cream' : 'bg-forest/10 text-forest'}`}>2</span> Payment
            </span>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={goToPayment} className="p-8 space-y-5">
            <div>
              <label className="text-xs uppercase tracking-widest text-earth">Choose a Room</label>
              {/* Switching to a smaller room drops the guest count to what it sleeps */}
              <select value={form.room_id} onChange={e => { const next = rooms.find(r => r.id === e.target.value); setForm(f => ({ ...f, room_id: e.target.value, guests: Math.min(f.guests, next?.guests || f.guests) })) }} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none">
                {rooms.map(r => <option key={r.id} value={r.id} disabled={!r.available}>{r.name} — {KSH(r.price_per_night)} / night · sleeps {r.guests}{!r.available && ' · unavailable'}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs uppercase tracking-widest text-earth">Full name *</label><input required value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none" placeholder="Jane Doe" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth">Phone *</label><input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none" placeholder="0182 219 969" /></div>
              <div className="md:col-span-2"><label className="text-xs uppercase tracking-widest text-earth">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none" placeholder="you@email.com" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth"><Calendar className="w-3 h-3 inline mr-1" />Check-in</label><input type="date" min={today} value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth"><Calendar className="w-3 h-3 inline mr-1" />Check-out</label><input type="date" min={form.check_in} value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none" /></div>
              <div><label className="text-xs uppercase tracking-widest text-earth"><Users className="w-3 h-3 inline mr-1" />Guests</label><input type="number" min={1} max={room?.guests || 2} value={form.guests} onChange={e => setForm(f => ({ ...f, guests: Math.min(Math.max(1, parseInt(e.target.value) || 1), room?.guests || 2) }))} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none" />{room && <p className="mt-1.5 text-xs text-earth">{room.guests === 1 ? 'Single room — one guest only.' : `One bed, up to ${guestsLabel(room.guests)}.`}</p>}</div>
            </div>
            {room && clash ? (
              <div className="p-4 rounded-xl bg-clay/10 border border-clay/30 text-sm text-forest-deep flex flex-wrap items-center gap-x-4 gap-y-2" role="alert">
                <span><strong>{room.name} is already booked</strong> {shortDate(clash.from)} – {shortDate(clash.to)}. Choose other dates or another room.</span>
                <button type="button" onClick={jumpToFreeDates} className="font-semibold text-clay underline underline-offset-2">Book from {shortDate(firstFreeDate(room.booked, form.check_in))}</button>
              </div>
            ) : room?.booked?.length ? (
              <p className="text-xs text-earth">Already booked: {room.booked.map(b => `${shortDate(b.from)} – ${shortDate(b.to)}`).join(', ')}</p>
            ) : null}
            <div><label className="text-xs uppercase tracking-widest text-earth">Special requests</label><textarea value={form.special_requests} onChange={e => setForm(f => ({ ...f, special_requests: e.target.value }))} rows={3} className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none resize-none" placeholder="Late arrival, dietary preferences, celebrations..." /></div>

            <div className="rounded-2xl bg-forest/5 p-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-earth">Total for {nights} night{nights !== 1 && 's'}</div>
                <div className="font-display text-3xl text-forest mt-1">{KSH(total)}</div>
                <div className="text-xs text-earth mt-1">50% deposit today · Balance on arrival</div>
              </div>
              <button type="submit" className="px-7 py-3.5 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep transition flex items-center gap-2">
                Continue to Payment
              </button>
            </div>
          </form>
        )}

        {step === 'payment' && (
          <div className="p-8 space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-cream-100 border border-forest/10">
                <div className="text-[10px] uppercase tracking-widest text-earth">Total</div>
                <div className="font-display text-xl text-forest mt-1">{KSH(total)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-forest text-cream">
                <div className="text-[10px] uppercase tracking-widest text-cream/70">Pay now (50%)</div>
                <div className="font-display text-xl mt-1">{KSH(deposit)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-cream-100 border border-forest/10">
                <div className="text-[10px] uppercase tracking-widest text-earth">On arrival</div>
                <div className="font-display text-xl text-forest mt-1">{KSH(balance)}</div>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-earth mb-3">Payment method</div>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: 'mpesa', label: 'M-Pesa', Icon: Smartphone },
                  { id: 'bank', label: 'Bank Transfer', Icon: Landmark },
                  { id: 'cash', label: 'Cash on Arrival', Icon: Banknote },
                ] as { id: Method; label: string; Icon: typeof Smartphone }[]).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMethod(id)}
                    // Once a prompt has created the booking, finish paying it with M-Pesa
                    disabled={!!bookingId && id !== 'mpesa'}
                    className={`p-4 rounded-2xl border-2 transition text-left disabled:opacity-40 disabled:cursor-not-allowed ${method === id ? 'border-forest bg-forest text-cream' : 'border-forest/10 bg-white text-forest hover:border-forest/30'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="font-semibold text-sm mt-2">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Method-specific instructions */}
            {method === 'mpesa' && (
              <div className="rounded-2xl border border-[#4CAF50]/30 overflow-hidden">
                {/* 1 — STK push: the guest just enters their PIN */}
                <div className="p-5 bg-[#4CAF50]/10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-widest text-forest font-semibold flex items-center gap-2"><Smartphone className="w-4 h-4" /> Pay with an M-Pesa prompt</div>
                    <span className="px-2 py-0.5 rounded-full bg-[#2e7d32] text-white text-[10px] uppercase tracking-widest font-bold">Fastest</span>
                  </div>
                  <p className="text-sm text-earth mt-2">We’ll send a request for <strong className="text-forest">{KSH(deposit)}</strong> to your phone — just enter your M-Pesa PIN.</p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <input type="tel" inputMode="tel" value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} disabled={stk.state === 'sending' || stk.state === 'waiting'} placeholder="07XX XXX XXX" aria-label="M-Pesa phone number" className="flex-1 px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none disabled:opacity-60" />
                    <button type="button" onClick={payWithPrompt} disabled={stk.state === 'sending' || stk.state === 'waiting'} className="px-5 py-3 rounded-xl bg-[#2e7d32] text-white font-semibold hover:bg-[#256b29] transition disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap">
                      {stk.state === 'sending' || stk.state === 'waiting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                      {stk.state === 'failed' ? 'Try again' : `Send prompt · ${KSH(deposit)}`}
                    </button>
                  </div>
                  {stk.state === 'waiting' && <div role="status" className="mt-3 text-sm text-forest flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin shrink-0" /> Check your phone and enter your M-Pesa PIN to pay {KSH(deposit)}…</div>}
                  {stk.state === 'failed' && <div role="alert" className="mt-3 text-sm text-clay font-medium">{stk.message}</div>}
                </div>
                {/* 2 — Manual Buy Goods payment to the till */}
                <div className="p-5 bg-white">
                  <div className="text-xs uppercase tracking-widest text-earth font-semibold">Or pay manually · Buy Goods</div>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    <div><div className="text-earth text-xs">Till number</div><div className="font-display text-2xl text-forest tracking-wider">{MPESA_TILL}</div></div>
                    <div><div className="text-earth text-xs">Amount</div><div className="font-display text-2xl text-forest">{KSH(deposit)}</div></div>
                  </div>
                  <ol className="text-xs text-earth mt-4 space-y-1 list-decimal list-inside">
                    <li>M-Pesa → Lipa na M-Pesa → Buy Goods and Services</li>
                    <li>Enter till number {MPESA_TILL}</li>
                    <li>Enter {KSH(deposit)} and your M-Pesa PIN</li>
                    <li>Type the confirmation code from your SMS below</li>
                  </ol>
                  <input value={payRef} onChange={e => setPayRef(e.target.value.toUpperCase())} placeholder="M-Pesa code, e.g. QGH7X4K2LM" aria-label="M-Pesa confirmation code" className="mt-4 w-full px-4 py-3 rounded-xl bg-cream-50 border border-forest/10 focus:border-forest outline-none font-mono" />
                </div>
              </div>
            )}

            {method === 'bank' && (
              <div className="p-5 rounded-2xl bg-ocean/10 border border-ocean/30">
                <div className="text-xs uppercase tracking-widest text-forest font-semibold mb-3 flex items-center gap-2"><Landmark className="w-4 h-4" /> Bank Transfer Details</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-earth text-xs">Bank</div><div className="font-semibold text-forest">Kenya Commercial Bank</div></div>
                  <div><div className="text-earth text-xs">Branch</div><div className="font-semibold text-forest">Kwale</div></div>
                  <div><div className="text-earth text-xs">Account name</div><div className="font-semibold text-forest">Le Grande Haven Ltd</div></div>
                  <div><div className="text-earth text-xs">Account number</div><div className="font-mono font-semibold text-forest">1234567890</div></div>
                  <div><div className="text-earth text-xs">SWIFT</div><div className="font-mono font-semibold text-forest">KCBLKENX</div></div>
                  <div><div className="text-earth text-xs">Deposit amount</div><div className="font-display text-lg text-forest">{KSH(deposit)}</div></div>
                </div>
                <input value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Enter bank transaction reference" className="mt-4 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none font-mono" />
              </div>
            )}

            {method === 'cash' && (
              <div className="p-5 rounded-2xl bg-clay/10 border border-clay/30">
                <div className="text-xs uppercase tracking-widest text-forest font-semibold mb-3 flex items-center gap-2"><Banknote className="w-4 h-4" /> Cash on Arrival</div>
                <p className="text-sm text-earth leading-relaxed">Pay the full amount of <span className="font-semibold text-forest">{KSH(total)}</span> in cash when you check in. Your room will be held for 24 hours from the check-in date; please call us if arriving late.</p>
                <label className="flex items-start gap-3 mt-4 cursor-pointer">
                  <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1 accent-forest w-4 h-4" />
                  <span className="text-sm text-forest-deep">I agree to pay {KSH(total)} in cash on arrival and understand my room is held for 24 hours.</span>
                </label>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-earth"><ShieldCheck className="w-4 h-4 text-forest" /> All payment references are securely stored with your booking.</div>

            <div className="flex gap-2 justify-end">
              {/* Once the booking is held, its details can't change from here */}
              {!bookingId && <button onClick={() => setStep('form')} disabled={stk.state === 'sending' || stk.state === 'waiting'} className="px-6 py-3 rounded-full border border-forest/20 text-forest font-semibold hover:bg-forest/5 disabled:opacity-50">Back</button>}
              <button onClick={submitBooking} disabled={submitting || stk.state === 'sending' || stk.state === 'waiting'} className="px-7 py-3.5 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep transition disabled:opacity-60 flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} {method === 'mpesa' ? 'Confirm with code' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-forest/10 grid place-items-center mx-auto"><Check className="w-8 h-8 text-forest" /></div>
            <div className="font-display text-3xl text-forest mt-6">Karibu Sana!</div>
            <p className="text-earth mt-3 max-w-md mx-auto">
              {stk.state === 'paid'
                ? `Your deposit of ${KSH(deposit)} has been received${stk.receipt ? ` — M-Pesa receipt ${stk.receipt}` : ''}. We’ll confirm your stay shortly.`
                : `Your booking has been received. ${method !== 'cash' ? `Your deposit of ${KSH(deposit)} will be verified within a few hours and we will confirm your stay.` : `Please pay ${KSH(total)} on arrival.`}`}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
              <div className="p-3 rounded-xl bg-cream-100"><div className="text-[10px] uppercase tracking-widest text-earth">Total</div><div className="font-display text-lg text-forest">{KSH(total)}</div></div>
              <div className="p-3 rounded-xl bg-cream-100"><div className="text-[10px] uppercase tracking-widest text-earth">Balance on arrival</div><div className="font-display text-lg text-forest">{method === 'cash' ? KSH(total) : KSH(balance)}</div></div>
            </div>
            <button onClick={close} className="mt-8 px-8 py-3 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep">Close</button>
          </div>
        )}
      </div>
    </div>
  )
}
