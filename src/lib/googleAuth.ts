import supabase from './supabase'

export async function handleGoogleRedirect() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('google_id_token')
  if (!token) return
  window.history.replaceState({}, '', window.location.pathname)
  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token })
  if (error) console.error('[google-auth] failed', error.message)
  try { window.close() } catch { /* noop */ }
}
