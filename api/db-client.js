import { createClient } from '@supabase/supabase-js';
import { triggerRestore } from './db-wake.js';

// Accept both Vercel-style and Vite-style env var names so this works
// identically on Vercel, Render, Railway, Fly, and local `node server.js`.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;

const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;

if (!url || !serviceKey) {
  // Fail loudly with an actionable message instead of returning misleading
  // 500s from every API route.
  const missing = [
    !url && 'NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)',
    !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY',
  ].filter(Boolean).join(', ');
  console.error(
    '\n════════════════════════════════════════════════════════════════════\n' +
    `  [db-client] Missing required Supabase env var(s): ${missing}\n\n` +
    '  Set them in your host (Render → Environment, Vercel → Project\n' +
    '  Settings → Environment Variables, or .env locally). Get the values\n' +
    '  from Supabase → Project Settings → API.\n' +
    '════════════════════════════════════════════════════════════════════\n'
  );
}

// Create the client even if env vars are missing so imports don't crash the
// module — every API route will surface a clear error via the fetch handler.
const supabase = createClient(
  url || 'https://missing.supabase.co',
  serviceKey || 'missing-service-role-key',
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (u, options) => {
        try {
          const res = await fetch(u, options);
          if (!res.ok && res.status >= 500) triggerRestore();
          return res;
        } catch (err) {
          console.error('[db-client] Network error contacting Supabase:', err.message);
          throw err;
        }
      },
    },
  }
);

export default supabase;
