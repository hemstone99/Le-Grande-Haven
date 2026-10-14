# Deploying to cPanel (legrande.co.ke)

Production runs as a **cPanel "Setup Node.js App"** (Phusion Passenger) with MySQL.

| Item | Value |
|---|---|
| Website IP (DNS A record) | `102.212.247.139` (cPanel login is on `.138`) |
| App root | `/home/<cpanel-user>/legrandehaven` |
| Startup file | `app.cjs` (loads the ES-module `server.js`) |
| Node.js | 22 |
| Database | `<cpanel-user>_legrande` (user `<cpanel-user>_<db-user>`) |
| Uploaded images | `/home/<cpanel-user>/legrandehaven/uploads` (served at `/uploads`) |
| App log | `/home/<cpanel-user>/logs/legrandehaven.log` |

Environment variables are set in **Setup Node.js App → Edit → Environment variables**
(see `.env.example`). Tables are created automatically on boot.

## Redeploying a new version

1. `npm run build` locally.
2. Upload to the app root (File Manager or FTP): `server.js`, `app.cjs`, `api/`, `dist/`.
   Do **not** overwrite `uploads/` — it holds images added through the admin panel.
3. If runtime dependencies changed, run **Run NPM Install** in Setup Node.js App
   (the server only needs `express`, `mysql2` and `sharp`).
4. Click **Restart** in Setup Node.js App.
5. Optional: **Run JS script → selfcheck** boots the server on a spare port and
   reports database, API and image-processing status.

## Notes

- `node_modules/` in the app root was uploaded pre-built (Linux x64) because cPanel's
  NPM Install refuses to run until the domain resolves. Once DNS works, you can delete
  it and use **Run NPM Install** instead.
- `scripts/export-supabase.mjs` was the one-off migration from the old Supabase project
  into `db/seed.json`, which the server imports only when the database is empty.
- Admin passwords are changed in the admin panel under **Settings**.
