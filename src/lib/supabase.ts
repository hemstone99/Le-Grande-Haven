import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string) || (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string)
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)

if (!url || !key) {
  // Helpful console error for local dev — shows up in the browser dev-tools & terminal
  // eslint-disable-next-line no-console
  console.error(
    '[Le Grande Haven] Supabase env vars missing.\n' +
    'Create a .env file at the project root (copy .env.example) and set:\n' +
    '  VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"\n' +
    '  VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY"\n' +
    'Then restart `npm run dev`.'
  )
}

// Persist session in localStorage + auto-refresh JWT — works identically in local dev,
// preview and production because Supabase Auth is centralized in the cloud project.
const supabase = createClient(url || 'http://invalid.local', key || 'invalid', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'lgh-auth',
  },
})

export default supabase
