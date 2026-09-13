# Le Grande Haven — Restaurant & Accommodation

Production-ready website for **Le Grande Haven Kanana, Shimoni** — a coastal Kenyan restaurant and accommodation destination.

**Stack**: Vite + React 19 + TypeScript · Tailwind CSS v4 · Supabase (Postgres + Auth + Storage) · Vercel serverless functions.

---

## Features

- Public site: Home, Food, Drinks, Rooms + Room Details, Conference, About, Contact
- Ten room types with images, amenities, availability and booking flow
- Full menu (49 dishes) + drinks (60+ beverages, beers, spirits, wines, waters)
- Booking system with **50 % deposit up-front** — M-Pesa Paybill, Bank Transfer, Cash on Arrival
- Restaurant table reservations
- Contact / enquiries form
- Homepage promotions pop-up (Happy Hour, Kids Corner, WhatsApp special orders)
- Sticky nav + fully mobile-responsive
- Floating Instagram / TikTok / Facebook / WhatsApp stack
- Six-slide auto-rotating hero (real Kanana photography)
- Admin dashboard at `/admin` — rooms, food, drinks, bookings, reservations, messages
- Direct image upload from admin (Supabase Storage bucket `menu-images`)
- SEO: OpenGraph, Twitter cards, Schema.org LodgingBusiness + Restaurant JSON-LD, sitemap.xml, robots.txt

---

## Quick start

```bash
git clone <repo> le-grande-haven
cd le-grande-haven
cp .env.example .env      # fill in your Supabase keys
npm install
npm run dev               # http://localhost:5173
```

### Available scripts

```bash
npm run dev       # local Vite dev server (frontend only, port 5173)
npm run build     # production build → dist/
npm run preview   # preview the built site
npm run server    # start the standalone Express API + static server (port 3000)
npm start         # alias for `npm run server` (Render / Railway entry point)
npm run lint      # eslint
```

### Two ways to run the backend

The same `api/*.js` handlers work in **both** modes without changes:

1. **Vercel serverless functions** (production) — each file in `api/` is
   auto-deployed as its own function; no server needed.
2. **Express server** (`server.js`) — mounts every handler as an HTTP route
   for platforms that want a single Node process (Render, Railway, Fly, a
   plain VPS). Also serves the built React app from `dist/` with SPA
   fallback so you can host frontend + API together:
   ```bash
   npm run build && npm run server
   # → http://localhost:3000    (frontend + all /api routes)
   ```
   Routes are listed on server boot; try `GET /health`, `GET /api/rooms`,
   `GET /api/food`, `GET /api/drinks`, etc.

---

## Environment variables

All keys live in `.env` (see `.env.example`). Never commit `.env` — it's in `.gitignore`.

| Variable | Where used | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | serverless (`api/`) | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | serverless | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | serverless only | **Server-side only** — never expose |
| `VITE_SUPABASE_URL` | browser | Same project URL |
| `VITE_SUPABASE_ANON_KEY` | browser | Same anon key |
| `VITE_GOOGLE_CLIENT_ID` | browser (optional) | Google OAuth |
| `VITE_GOOGLE_AUTH_PROXY` | browser (optional) | Google OAuth callback URL |

---

## Database schema (Supabase / Postgres)

All tables live in the `public` schema and use `uuid` primary keys (`gen_random_uuid()`) with `timestamptz created_at`.

| Table | Purpose |
|---|---|
| `rooms` | 10 rooms (slug, name, type, guests, bed_config, price, amenities `jsonb`, available, featured) |
| `room_images` | 1..N images per room, ordered by `sort_order` |
| `bookings` | Room bookings: guest info, dates, guests, status (`pending`/`confirmed`/`checked_in`/`checked_out`/`cancelled`), special_requests (holds payment info) |
| `restaurant_reservations` | Table reservations |
| `food_items` | Restaurant menu — 49 dishes |
| `drink_items` | Drinks menu — beers, whiskies, spirits, wines, sodas, waters, juices, hot beverages |
| `gallery` | Homepage gallery (destination → dining → rooms flow) |
| `contact_messages` | Contact-form submissions with `is_read` flag |

Storage bucket: **`menu-images`** (public) — food/drink/room image uploads from the admin dashboard.

---

## Admin dashboard

Route: **`/admin`** (protected — requires an authenticated Supabase user).

Sign in at **`/login`** with an admin email + password created in Supabase Auth.

### Signing in locally (VS Code)

Because Supabase Auth is centralized in the cloud project, **the same admin credentials work everywhere** — local dev, preview and production. There is no separate local user store.

Setup:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in the three Supabase keys from **Supabase → Project Settings → API**:
   ```
   VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
   VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
   NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
   SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
   ```
3. Start the dev server:
   ```bash
   npm install
   npm run dev
   ```
4. Open `http://localhost:5173/login` and sign in with your admin email + password.

Missing env vars will surface a clear error in the browser console.

### Creating / resetting an admin

- **Supabase Studio → Authentication → Users → Invite user** (email + password) — that account can immediately sign in at `/login`.
- To reset a password, open the user in Studio → **Send magic link** or **Reset password**.

### Default admin credentials

For local testing the following account is pre-provisioned in the linked Supabase project:

```
Email:    admin@legrandehaven.co.ke
Password: LegrandeHaven2026!
```

**Change the password immediately** — once signed in, go to **Settings → Change password** in the admin sidebar (self-service, no need for Supabase Studio).

---

## PostgreSQL — viewing & editing tables directly

Supabase **is** managed PostgreSQL 15+, so anything you can do in Postgres you can do here:

- **Supabase Studio (recommended)** — visit `https://app.supabase.com/project/<PROJECT>/editor` for a spreadsheet-style Table Editor and full SQL editor. Every table (`rooms`, `room_images`, `bookings`, `restaurant_reservations`, `food_items`, `drink_items`, `gallery`, `contact_messages`) is browsable and editable there in real time.
- **psql / DBeaver / TablePlus / pgAdmin** — get the connection string from **Project Settings → Database → Connection string** and paste it into any Postgres client:
  ```
  postgresql://postgres:[PASSWORD]@db.<PROJECT>.supabase.co:5432/postgres
  ```
- **Direct SQL from your app** — `api/*.js` routes use `@supabase/supabase-js`, but you can also `SELECT / INSERT` directly via the SQL editor for admin scripts and reports.

Any change you make in Postgres immediately reflects on the public site because all pages read live from the API routes (with local frontend fallbacks purely as a safety net).

Admin features:
- **Dashboard** — occupancy, arrivals, departures, pending, revenue, recent bookings & reservations
- **Rooms** — full CRUD, multi-image gallery uploader
- **Bookings** — status transitions, delete
- **Reservations** — status transitions, delete
- **Food menu** — CRUD, image uploader
- **Drinks menu** — CRUD, image uploader
- **Messages** — inbox with read/unread toggle and delete

All admin edits are written to Supabase and reflect on the public site in real time.

---

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add all env vars from `.env.example` in **Project Settings → Environment Variables**.
4. Build command: `npm run build` · Output directory: `dist`
5. Deploy.

The `api/*.js` files become serverless functions automatically (they import from `./db-client.js`).

## Troubleshooting — Render + Supabase

If the admin dashboard shows nothing / booking returns *"permission denied for schema public"* / upload returns *"bucket not found"*:

1. **Re-run `supabase-schema.sql` in Supabase → SQL editor.** The current version includes:
   - `GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;` (fixes "permission denied")
   - `INSERT INTO storage.buckets` for `menu-images` + storage policies (fixes "bucket not found")
   - RLS policies for public reads and anon inserts on booking/reservation/message tables.
2. **Set env vars on Render → your Web Service → Environment**:
   ```
   NEXT_PUBLIC_SUPABASE_URL       = https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY  = YOUR_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY      = YOUR_SERVICE_ROLE_KEY
   VITE_SUPABASE_URL              = https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY         = YOUR_ANON_KEY
   ```
   Get them from **Supabase → Project Settings → API**. The `SUPABASE_SERVICE_ROLE_KEY` is required for admin CRUD (rooms / food / drinks / bookings / messages).
3. **Trigger a redeploy** on Render after saving env vars — the server logs on boot will confirm all API routes mounted successfully.

The `/api/upload` route now auto-creates the `menu-images` bucket on first upload if the SQL didn't run.

## Deploying to Render / Railway / a VPS (Express mode)

The repository includes `render.yaml` for a Render Web Service. If configuring Render manually, use **Build command** `npm ci && npm run build`, **Start command** `npm start`, and health check path `/health`. Do not deploy this repository as a Render Static Site: the admin dashboard, booking endpoint, and upload endpoint require the Express Web Service.

If you'd rather run a single Node process:

1. Create a new **Web Service** on [render.com](https://render.com) (or Railway, Fly, Heroku, etc.) pointing at your repo.
2. Environment variables — paste all keys from `.env.example`, especially `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY`.
3. **Build command:** `npm install && npm run build`
4. **Start command:** `npm start` (or `node server.js`)
5. Open the service URL — frontend + API both served from a single origin.

`server.js` is the entry point: it mounts every `api/*.js` handlers as an
Express route (`/api/rooms`, `/api/food`, `/api/drinks`, `/api/bookings`,
`/api/reservations`, `/api/staff`, `/api/messages`, `/api/gallery`,
`/api/stats`, `/api/upload`) and serves the built React app from `dist/`
with SPA fallback. Health check: `GET /health`.

### Custom domain

Point your DNS at Vercel and add the domain in **Project Settings → Domains**. Update the `<link rel="canonical">` in `index.html` and the URLs in `public/sitemap.xml` / `robots.txt` to match your production domain.

---

## Deploying the database (Supabase hosting)

1. Create a new project at [app.supabase.com](https://app.supabase.com).
2. **Run `supabase-schema.sql`** from the repo root in Supabase Studio → **SQL editor**. It creates every table (`rooms`, `room_images`, `bookings`, `restaurant_reservations`, `food_items`, `drink_items`, `gallery`, `contact_messages`, `staff`) with the right columns, indexes, foreign keys, check constraints and (optional) RLS policies.
3. Enable **Auth → Providers → Email** for admin sign-in.
4. In **Storage**, create a public bucket called `menu-images`.
5. Copy your project URL + anon key + service role key into your Vercel env vars.
6. Optionally seed rooms / food / drinks — the frontend has `src/lib/roomsData.ts`, `foodData.ts`, `drinksData.ts` with the full fallback content you can use as a reference, and the bottom of `supabase-schema.sql` has a ready-to-uncomment `INSERT` for the 10 named rooms.

### Row Level Security

For a public read-only site with an authenticated admin, either:
- **Simple** — leave RLS disabled and rely on the service-role key server-side (current setup).
- **Strict** — enable RLS on `bookings`, `restaurant_reservations`, `contact_messages` with `USING (true)` for anon inserts and `USING (auth.uid() IS NOT NULL)` for select/update/delete.

---

## Security notes

- The `SUPABASE_SERVICE_ROLE_KEY` is only used server-side inside `api/*.js`. It never ships to the browser.
- All API routes set CORS headers explicitly.
- Bookings enforce overlap prevention server-side (`api/bookings.js`).
- Auth is Supabase-managed (email + password) — passwords are hashed by Supabase; sessions are JWT with automatic refresh.

---

## Project structure

```
api/                 Vercel serverless functions (rooms, bookings, food, drinks, gallery, messages, upload, stats)
public/
  hero/              Authentic Le Grande Haven photography (hero slideshow + gallery)
  rooms/             Room images per slug
  food/              Kenyan dish photography
  beverages/         Hot & cold drink photography
  drinks/            Bottle photography (beers, whiskies, spirits, wines, sodas, waters)
  logo.png favicon.svg robots.txt sitemap.xml
src/
  components/        Navbar, Footer, BookingModal, ReservationModal, PromotionsPopup, FloatingSocials, ImageUploader, …
  contexts/          AuthContext, ToastContext
  lib/               supabase client, format helpers, fallback data (rooms/food/drinks)
  pages/             Home, Food, Drinks, Rooms, RoomDetail, About, Contact, Conference, Login
  pages/admin/       AdminLayout, Dashboard, AdminRooms, AdminFood, AdminDrinks, AdminBookings, AdminReservations, AdminMessages
```

---

## Contact

Le Grande Haven Kanana, Shimoni · Kwale County, Kenya
