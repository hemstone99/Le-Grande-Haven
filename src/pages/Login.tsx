import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import supabase from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const nav = useNavigate()
  const { push } = useToast()
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [envError, setEnvError] = useState<string | null>(null)

  // Verify env is configured — critical for local VS Code dev
  useEffect(() => {
    const url = (import.meta.env.VITE_SUPABASE_URL as string) || (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string)
    const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    if (!url || !key) {
      setEnvError('Supabase credentials are missing. Copy .env.example → .env, fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.')
    }
  }, [])

  // If already signed in, jump straight to admin
  useEffect(() => {
    if (!loading && user) nav('/admin', { replace: true })
  }, [user, loading, nav])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (envError) { push(envError, 'error'); return }
    setBusy(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      // Friendly error mapping
      const msg = /Invalid login/i.test(error.message)
        ? 'Invalid email or password. Please try again.'
        : /Email not confirmed/i.test(error.message)
        ? 'This admin account has not been confirmed yet. Please contact the site owner.'
        : error.message
      push(msg, 'error')
      setBusy(false)
      return
    }
    if (data.session) {
      push('Welcome back', 'success')
      nav('/admin', { replace: true })
    } else {
      push('Signed in, but no session was created. Please retry.', 'error')
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src="/hero/hero-1.jpg" alt="Le Grande Haven bedroom" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 40%' }} />
        <div className="absolute inset-0 bg-forest-deep/70" />
        <div className="relative h-full flex flex-col justify-between p-12 text-cream">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white grid place-items-center overflow-hidden shadow-sm ring-1 ring-cream/20">
              <img src="/logo.png" alt="" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <div className="font-display text-xl">Le Grande Haven</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-cream/60">Staff Portal</div>
            </div>
          </Link>
          <div>
            <h1 className="font-display text-5xl leading-tight">Manage every stay, meal and moment.</h1>
            <p className="text-cream/70 mt-4 max-w-md">Sign in to review bookings, update menus, and keep our haven running smoothly.</p>
          </div>
          <div className="text-xs text-cream/50">© {new Date().getFullYear()} Le Grande Haven</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-8 bg-cream-50">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 text-forest mb-8">
            <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
            <span className="font-display text-xl">Le Grande Haven</span>
          </Link>

          <div className="text-xs uppercase tracking-[0.4em] text-clay">Sign In</div>
          <h2 className="font-display text-4xl text-forest mt-3">Welcome back</h2>
          <p className="text-earth mt-2">Access the staff dashboard.</p>

          {envError && (
            <div className="mt-6 p-4 rounded-2xl bg-clay/10 border border-clay/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-clay shrink-0 mt-0.5" />
              <div className="text-xs text-forest-deep leading-relaxed whitespace-pre-line">{envError}</div>
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-4" autoComplete="on">
            <div>
              <label htmlFor="email" className="text-xs uppercase tracking-widest text-earth">Email</label>
              <input
                id="email"
                name="email"
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@legrandehaven.co.ke"
                className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs uppercase tracking-widest text-earth">Password</label>
              <input
                id="password"
                name="password"
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-forest/10 focus:border-forest outline-none"
              />
            </div>
            <button
              disabled={busy || !!envError}
              type="submit"
              className="w-full px-6 py-3.5 rounded-full bg-forest text-cream font-semibold hover:bg-forest-deep transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Sign In
            </button>
          </form>

          <div className="mt-8 p-4 rounded-2xl bg-forest/5 border border-forest/10 text-xs text-earth">
            <div className="font-semibold text-forest">First time signing in?</div>
            <div className="mt-1">After you log in, go to <span className="font-semibold text-forest">Settings → Change password</span> to set your own password.</div>
          </div>

          <Link to="/" className="block text-center text-sm text-earth hover:text-forest mt-6">← Back to website</Link>
        </div>
      </div>
    </main>
  )
}
