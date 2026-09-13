import { useState } from 'react'
import { Loader2, KeyRound, ShieldCheck, Mail } from 'lucide-react'
import supabase from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export default function AdminSettings() {
  const { user } = useAuth()
  const { push } = useToast()
  const [current, setCurrent] = useState('')
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)

  const strong = (p: string) =>
    p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!current) { push('Enter your current password', 'error'); return }
    if (pw1 !== pw2) { push('New passwords do not match', 'error'); return }
    if (!strong(pw1)) { push('Password must be 8+ chars with upper, lower and a number', 'error'); return }
    if (!user?.email) { push('No user session', 'error'); return }

    setBusy(true)
    // Verify current password by re-signing in
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current,
    })
    if (signErr) { push('Current password is incorrect', 'error'); setBusy(false); return }

    // Change to the new one
    const { error } = await supabase.auth.updateUser({ password: pw1 })
    setBusy(false)
    if (error) { push(error.message, 'error'); return }

    setCurrent(''); setPw1(''); setPw2('')
    push('Password updated. Please use the new password on next sign-in.', 'success')
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <div className="text-xs uppercase tracking-[0.4em] text-clay">Settings</div>
        <h1 className="font-display text-4xl text-forest mt-2">Admin Account</h1>
        <p className="text-earth mt-2">Manage your credentials and profile.</p>
      </div>

      {/* Profile card */}
      <div className="p-6 rounded-3xl bg-white border border-forest/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-forest text-cream grid place-items-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-earth">Signed in as</div>
            <div className="font-display text-xl text-forest truncate flex items-center gap-2">
              <Mail className="w-4 h-4 text-clay" /> {user?.email}
            </div>
            <div className="text-xs text-earth mt-1">User ID · <span className="font-mono">{user?.id.slice(0, 8)}…</span></div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <form onSubmit={submit} className="p-6 rounded-3xl bg-white border border-forest/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sand text-forest-deep grid place-items-center"><KeyRound className="w-5 h-5" /></div>
          <div>
            <div className="font-display text-2xl text-forest">Change password</div>
            <div className="text-xs text-earth">Use a strong password — 8+ characters with upper, lower and number.</div>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-earth">Current password</label>
          <input type="password" required value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-forest/10 focus:border-forest outline-none" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-earth">New password</label>
            <input type="password" required value={pw1} onChange={e => setPw1(e.target.value)} autoComplete="new-password" className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-forest/10 focus:border-forest outline-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-earth">Confirm new password</label>
            <input type="password" required value={pw2} onChange={e => setPw2(e.target.value)} autoComplete="new-password" className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-forest/10 focus:border-forest outline-none" />
          </div>
        </div>

        {pw1 && (
          <div className="text-xs text-earth">
            {strong(pw1) ? <span className="text-forest">✓ Strong password</span> : 'Needs 8+ chars, upper, lower and a number.'}
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={busy} className="px-7 py-3 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep transition disabled:opacity-60 flex items-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Update password
          </button>
        </div>
      </form>

      <div className="p-4 rounded-2xl bg-forest/5 text-xs text-earth">
        <strong className="text-forest">Tip:</strong> Password changes apply immediately. On your next sign-in — locally or in production — use the new password.
      </div>
    </div>
  )
}
