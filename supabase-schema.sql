-- ============================================================================
-- Le Grande Haven — Complete Supabase / PostgreSQL schema + seed data
-- ============================================================================
-- Run this ONCE in the Supabase SQL editor (or via psql / Render Postgres) to
-- provision every table + seed the full production content of Le Grande Haven.
--
-- Requires:  Postgres 15+, `pgcrypto` extension (for gen_random_uuid).
-- Safe to re-run: uses IF NOT EXISTS on schema and ON CONFLICT on seeds where
-- possible. Room images / food / drinks / gallery use plain INSERTs — if you
-- re-run they will duplicate; TRUNCATE those tables first if you want to
-- re-seed cleanly.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. ROOMS  (10 named rooms — Mwani, Tumbawe, Nyasi, Pweza, Mkoko, Ngisi,
--            Tafi, Una, Chewa, Nguru)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rooms (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT        NOT NULL UNIQUE,
  name              TEXT        NOT NULL,
  room_type         TEXT        NOT NULL,
  short_description TEXT,
  description       TEXT,
  guests            INTEGER     DEFAULT 2,
  bed_config        TEXT,
  price_per_night   NUMERIC     NOT NULL,
  amenities         JSONB       DEFAULT '[]'::jsonb,
  available         BOOLEAN     DEFAULT TRUE,
  featured          BOOLEAN     DEFAULT FALSE,
  sort_order        INTEGER     DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rooms_sort_order_idx ON public.rooms (sort_order);
CREATE INDEX IF NOT EXISTS rooms_slug_idx       ON public.rooms (slug);
CREATE INDEX IF NOT EXISTS rooms_available_idx  ON public.rooms (available);


-- ---------------------------------------------------------------------------
-- 2. ROOM IMAGES (many per room)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.room_images (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    UUID        NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  url        TEXT        NOT NULL,
  sort_order INTEGER     DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS room_images_room_id_idx ON public.room_images (room_id);
CREATE INDEX IF NOT EXISTS room_images_sort_idx    ON public.room_images (room_id, sort_order);


-- ---------------------------------------------------------------------------
-- 3. BOOKINGS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id           UUID        NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  guest_name        TEXT        NOT NULL,
  phone             TEXT        NOT NULL,
  email             TEXT,
  check_in          DATE        NOT NULL,
  check_out         DATE        NOT NULL,
  guests            INTEGER     DEFAULT 1,
  special_requests  TEXT,
  status            TEXT        DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','checked_in','checked_out','cancelled')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT bookings_dates_chk CHECK (check_out > check_in)
);

CREATE INDEX IF NOT EXISTS bookings_room_id_idx ON public.bookings (room_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx  ON public.bookings (status);
CREATE INDEX IF NOT EXISTS bookings_dates_idx   ON public.bookings (check_in, check_out);


-- ---------------------------------------------------------------------------
-- 4. RESTAURANT RESERVATIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.restaurant_reservations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  phone             TEXT        NOT NULL,
  email             TEXT,
  reservation_date  DATE        NOT NULL,
  reservation_time  TEXT        NOT NULL,
  party_size        INTEGER     DEFAULT 2,
  notes             TEXT,
  status            TEXT        DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','seated','cancelled')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS restaurant_reservations_date_idx   ON public.restaurant_reservations (reservation_date);
CREATE INDEX IF NOT EXISTS restaurant_reservations_status_idx ON public.restaurant_reservations (status);


-- ---------------------------------------------------------------------------
-- 5. FOOD MENU
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  price       NUMERIC     NOT NULL,
  image_url   TEXT,
  category    TEXT        NOT NULL,
  available   BOOLEAN     DEFAULT TRUE,
  featured    BOOLEAN     DEFAULT FALSE,
  sort_order  INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS food_items_category_idx ON public.food_items (category);
CREATE INDEX IF NOT EXISTS food_items_sort_idx     ON public.food_items (sort_order);


-- ---------------------------------------------------------------------------
-- 6. DRINKS MENU
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.drink_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  price       NUMERIC     NOT NULL,
  image_url   TEXT,
  category    TEXT        NOT NULL,
  available   BOOLEAN     DEFAULT TRUE,
  featured    BOOLEAN     DEFAULT FALSE,
  sort_order  INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS drink_items_category_idx ON public.drink_items (category);
CREATE INDEX IF NOT EXISTS drink_items_sort_idx     ON public.drink_items (sort_order);


-- ---------------------------------------------------------------------------
-- 7. GALLERY (homepage flow: destination -> dining -> rooms)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  url        TEXT        NOT NULL,
  caption    TEXT,
  category   TEXT        DEFAULT 'general',
  sort_order INTEGER     DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gallery_sort_idx     ON public.gallery (sort_order);
CREATE INDEX IF NOT EXISTS gallery_category_idx ON public.gallery (category);


-- ---------------------------------------------------------------------------
-- 8. CONTACT MESSAGES (inbox)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  phone      TEXT,
  subject    TEXT,
  message    TEXT        NOT NULL,
  is_read    BOOLEAN     DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_unread_idx  ON public.contact_messages (is_read) WHERE is_read = FALSE;


-- ---------------------------------------------------------------------------
-- 9. STAFF / TEAM  (receptionists, waiters, bartenders, chefs, …)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT        NOT NULL,
  role         TEXT        NOT NULL,
  phone        TEXT,
  email        TEXT,
  national_id  TEXT,
  photo_url    TEXT,
  shift        TEXT,
  salary       NUMERIC,
  hire_date    DATE,
  active       BOOLEAN     DEFAULT TRUE,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS staff_role_idx   ON public.staff (role);
CREATE INDEX IF NOT EXISTS staff_active_idx ON public.staff (active);


-- ============================================================================
-- PERMISSIONS  ← FIXES "permission denied for schema public"
-- ============================================================================
-- New Supabase projects sometimes revoke default grants on the public schema
-- when they were created before mid-2024. These GRANTs make sure the anon,
-- authenticated and service_role roles can talk to our tables. Safe to re-run.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role, authenticated;

-- Guest-facing forms need anon INSERT on booking / reservation / message tables
GRANT INSERT ON public.bookings              TO anon;
GRANT INSERT ON public.restaurant_reservations TO anon;
GRANT INSERT ON public.contact_messages      TO anon;

-- Make sequences usable
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Any tables created in the future automatically get the same grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT                        ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT INSERT, UPDATE, DELETE        ON TABLES TO service_role, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT                 ON SEQUENCES TO anon, authenticated, service_role;


-- ============================================================================
-- ROW LEVEL SECURITY  (safe defaults — public reads, anon writes only for
-- guest-facing forms, admin writes gated by service_role which bypasses RLS)
-- ============================================================================
ALTER TABLE public.rooms                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_images               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drink_items               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_reservations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff                     ENABLE ROW LEVEL SECURITY;

-- Everyone (anon + authenticated) can read the public catalogue
DROP POLICY IF EXISTS read_all_rooms       ON public.rooms;
DROP POLICY IF EXISTS read_all_room_images ON public.room_images;
DROP POLICY IF EXISTS read_all_food        ON public.food_items;
DROP POLICY IF EXISTS read_all_drinks      ON public.drink_items;
DROP POLICY IF EXISTS read_all_gallery     ON public.gallery;
CREATE POLICY read_all_rooms       ON public.rooms       FOR SELECT USING (true);
CREATE POLICY read_all_room_images ON public.room_images FOR SELECT USING (true);
CREATE POLICY read_all_food        ON public.food_items  FOR SELECT USING (true);
CREATE POLICY read_all_drinks      ON public.drink_items FOR SELECT USING (true);
CREATE POLICY read_all_gallery     ON public.gallery     FOR SELECT USING (true);

-- Anonymous guests can create their own bookings / reservations / messages
DROP POLICY IF EXISTS anon_insert_bookings ON public.bookings;
DROP POLICY IF EXISTS anon_insert_reserv   ON public.restaurant_reservations;
DROP POLICY IF EXISTS anon_insert_messages ON public.contact_messages;
CREATE POLICY anon_insert_bookings ON public.bookings                FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_reserv   ON public.restaurant_reservations FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_messages ON public.contact_messages        FOR INSERT WITH CHECK (true);

-- Only signed-in admins can read/write bookings, reservations, messages, staff
DROP POLICY IF EXISTS admin_all_bookings ON public.bookings;
DROP POLICY IF EXISTS admin_all_reserv   ON public.restaurant_reservations;
DROP POLICY IF EXISTS admin_all_messages ON public.contact_messages;
DROP POLICY IF EXISTS admin_all_staff    ON public.staff;
CREATE POLICY admin_all_bookings ON public.bookings                FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY admin_all_reserv   ON public.restaurant_reservations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY admin_all_messages ON public.contact_messages        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY admin_all_staff    ON public.staff                   FOR ALL USING (auth.role() = 'authenticated');

-- NOTE: All server-side API routes in api/*.js use the SUPABASE_SERVICE_ROLE_KEY
-- which bypasses RLS entirely — so admin CRUD works regardless of these policies.


-- ============================================================================
-- STORAGE BUCKET  ← FIXES "bucket not found" on image uploads
-- ============================================================================
-- Create the public `menu-images` bucket used by /api/upload for food, drink,
-- room and staff photos. Safe to re-run.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  TRUE,                                                           -- public read
  5242880,                                                        -- 5 MB max per file
  ARRAY['image/png','image/jpeg','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS policies: public read of the bucket, admin write via service_role
DROP POLICY IF EXISTS "menu-images public read"          ON storage.objects;
DROP POLICY IF EXISTS "menu-images admin write"          ON storage.objects;
DROP POLICY IF EXISTS "menu-images admin update"         ON storage.objects;
DROP POLICY IF EXISTS "menu-images admin delete"         ON storage.objects;
CREATE POLICY "menu-images public read"  ON storage.objects FOR SELECT USING (bucket_id = 'menu-images');
CREATE POLICY "menu-images admin write"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
CREATE POLICY "menu-images admin update" ON storage.objects FOR UPDATE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
CREATE POLICY "menu-images admin delete" ON storage.objects FOR DELETE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');


-- ============================================================================
-- SEED DATA — full production content of Le Grande Haven
-- Run once after CREATE TABLEs to populate rooms, room images, food, drinks
-- and gallery. After this the admin dashboard at /admin will show everything
-- for editing / adding / removing.
-- ============================================================================


-- ============================================================================
-- SEED 1/5: 10 NAMED ROOMS  (Bed & Breakfast rates)
-- ============================================================================
INSERT INTO public.rooms (slug, name, room_type, short_description, description, guests, bed_config, price_per_night, amenities, available, featured, sort_order) VALUES
  ('mwani', 'Mwani', 'Standard', 'A calm, sun-lit room named for the sea grasses of the Kwale coast.', 'Mwani is a serene single-room retreat bathed in soft coastal light. Warm timber floors, ivory linens and a small reading nook by the window make this a favourite for solo travellers and writers. Wake to birdsong and the scent of the neighbouring frangipani tree.', 2, 'Queen bed', 1000, '["Comfortable bed", "Private bathroom", "Wi-Fi", "Hot shower", "Fresh towels", "Mosquito net", "Room service", "Daily cleaning", "Secure parking", "Flat-screen TV with DSTV", "Work desk", "Wall drawers & wardrobe"]'::jsonb, TRUE, TRUE, 1),
  ('tumbawe', 'Tumbawe', 'Deluxe', 'Named for the coral reefs, cool blues and ocean-inspired details.', 'Tumbawe channels the calm of an underwater world with soft blues, driftwood accents and a generous king bed. Perfect for couples who want a peaceful base close to the restaurant and gardens.', 2, 'King bed', 2500, '["Comfortable king bed", "Private bathroom", "Wi-Fi", "Rain shower", "Fresh towels", "Mosquito net", "Room service", "Daily cleaning", "Secure parking", "Coffee & tea", "Flat-screen TV with DSTV", "Work desk", "Wall drawers & wardrobe"]'::jsonb, TRUE, TRUE, 2),
  ('nyasi', 'Nyasi', 'Standard', 'Grass-thatched charm with a warm, earthy palette.', 'Nyasi means grass — and this room borrows its warmth from the thatched roofs of the coast. Woven textures, cream walls and a private veranda make it ideal for slow mornings with a Kenyan coffee.', 2, 'Queen bed', 1000, '["Comfortable bed", "Private bathroom", "Wi-Fi", "Hot shower", "Fresh towels", "Mosquito net", "Room service", "Daily cleaning", "Secure parking", "Flat-screen TV with DSTV", "Work desk", "Wall drawers & wardrobe"]'::jsonb, TRUE, FALSE, 3),
  ('pweza', 'Pweza', 'Deluxe', 'Playful, coastal, and full of natural light — named for the octopus.', 'Pweza is a bright and airy room with tall windows opening to the garden. Its palette of coral and cream feels playful yet grown-up. A great choice for those who love natural light.', 3, 'King bed + single', 2500, '["Comfortable beds", "Private bathroom", "Wi-Fi", "Rain shower", "Fresh towels", "Mosquito net", "Room service", "Daily cleaning", "Secure parking", "Coffee & tea", "Garden view", "Flat-screen TV with DSTV", "Work desk", "Wall drawers & wardrobe"]'::jsonb, TRUE, TRUE, 4),
  ('mkoko', 'Mkoko', 'Standard', 'Named for the mangroves — quiet, green and grounded.', 'Mkoko sits at the quieter end of the property, wrapped in mangrove-inspired greens. A study desk and slow ceiling fan make it perfect for a longer stay or working retreat.', 2, 'Queen bed', 2500, '["Comfortable bed", "Private bathroom", "Wi-Fi", "Hot shower", "Fresh towels", "Mosquito net", "Room service", "Daily cleaning", "Secure parking", "Desk", "Flat-screen TV with DSTV", "Work desk", "Wall drawers & wardrobe"]'::jsonb, TRUE, FALSE, 5),
  ('ngisi', 'Ngisi', 'Standard', 'An intimate room with soft coastal storytelling.', 'Ngisi (squid) is a compact but perfectly-formed room with a cosy bed, spa-inspired bathroom and hand-woven kikoi throws. Ideal for a short romantic getaway.', 2, 'Double bed', 2500, '["Comfortable bed", "Private bathroom", "Wi-Fi", "Hot shower", "Fresh towels", "Mosquito net", "Room service", "Daily cleaning", "Secure parking", "Flat-screen TV with DSTV", "Work desk", "Wall drawers & wardrobe"]'::jsonb, TRUE, FALSE, 6),
  ('tafi', 'Tafi', 'Family', 'Family-friendly with two beds and playful details.', 'Tafi is our most family-friendly room — spacious enough for two adults and two children, with soft rugs, a low reading corner and quick access to the garden.', 4, 'King + 2 singles', 2500, '["Comfortable beds", "Private bathroom", "Wi-Fi", "Hot shower", "Fresh towels", "Mosquito nets", "Room service", "Daily cleaning", "Secure parking", "Family friendly", "Extra towels", "Flat-screen TV with DSTV", "Work desk", "Wall drawers & wardrobe"]'::jsonb, TRUE, TRUE, 7),
  ('una', 'Una', 'Deluxe', 'Bright, breezy and made for slow mornings.', 'Una is a light-filled room with cream walls, terracotta tiles and a small balcony overlooking the garden. Wake up slowly with a coffee, or head straight to the restaurant.', 2, 'King bed', 2500, '["Comfortable king bed", "Private bathroom", "Wi-Fi", "Rain shower", "Fresh towels", "Mosquito net", "Room service", "Daily cleaning", "Secure parking", "Balcony", "Coffee & tea", "Flat-screen TV with DSTV", "Work desk", "Wall drawers & wardrobe"]'::jsonb, TRUE, FALSE, 8),
  ('chewa', 'Chewa', 'Twin', 'A serene twin room ideal for friends travelling together.', 'Chewa (grouper fish) offers two comfortable single beds, a shared writing desk and quick access to the pool area. A great pick for friends or colleagues.', 2, 'Two single beds', 2500, '["Two comfortable beds", "Private bathroom", "Wi-Fi", "Hot shower", "Fresh towels", "Mosquito nets", "Room service", "Daily cleaning", "Secure parking", "Flat-screen TV with DSTV", "Work desk", "Wall drawers & wardrobe"]'::jsonb, TRUE, FALSE, 9),
  ('nguru', 'Nguru', 'Suite', 'Our signature suite — named after the mighty kingfish.', 'Nguru is our most spacious accommodation — a suite with a lounge area, generous king bed, spa-inspired bathroom and a private terrace. Ideal for honeymoons, anniversaries and special occasions.', 2, 'Super king bed', 2500, '["Super king bed", "Private lounge", "Ensuite bathroom", "Wi-Fi", "Rain shower", "Bathrobes", "Fresh towels", "Mosquito net", "24hr room service", "Daily cleaning", "Secure parking", "Private terrace", "Breakfast included", "Flat-screen TV with DSTV", "Work desk", "Wall drawers & wardrobe"]'::jsonb, TRUE, TRUE, 10)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, room_type = EXCLUDED.room_type,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  guests = EXCLUDED.guests, bed_config = EXCLUDED.bed_config,
  price_per_night = EXCLUDED.price_per_night, amenities = EXCLUDED.amenities,
  available = EXCLUDED.available, featured = EXCLUDED.featured, sort_order = EXCLUDED.sort_order;


-- ============================================================================
-- SEED 2/5: ROOM IMAGES  (primary photo per room + a bathroom shot)
-- ============================================================================
INSERT INTO public.room_images (room_id, url, sort_order) VALUES
  ((SELECT id FROM public.rooms WHERE slug = 'mwani'),   '/rooms/mwani.jpg',    0),
  ((SELECT id FROM public.rooms WHERE slug = 'mwani'),   '/rooms/bath-1.jpg',  50),
  ((SELECT id FROM public.rooms WHERE slug = 'tumbawe'), '/rooms/tumbawe.jpg',  0),
  ((SELECT id FROM public.rooms WHERE slug = 'tumbawe'), '/rooms/bath-2.jpg',  50),
  ((SELECT id FROM public.rooms WHERE slug = 'nyasi'),   '/rooms/nyasi.jpg',    0),
  ((SELECT id FROM public.rooms WHERE slug = 'nyasi'),   '/rooms/bath-1.jpg',  50),
  ((SELECT id FROM public.rooms WHERE slug = 'pweza'),   '/rooms/pweza.jpg',    0),
  ((SELECT id FROM public.rooms WHERE slug = 'pweza'),   '/rooms/bath-2.jpg',  50),
  ((SELECT id FROM public.rooms WHERE slug = 'mkoko'),   '/rooms/mkoko.jpg',    0),
  ((SELECT id FROM public.rooms WHERE slug = 'mkoko'),   '/rooms/bath-1.jpg',  50),
  ((SELECT id FROM public.rooms WHERE slug = 'ngisi'),   '/hero/hero-1.jpg',    0),
  ((SELECT id FROM public.rooms WHERE slug = 'ngisi'),   '/rooms/bath-2.jpg',  50),
  ((SELECT id FROM public.rooms WHERE slug = 'tafi'),    '/hero/hero-4.jpg',    0),
  ((SELECT id FROM public.rooms WHERE slug = 'tafi'),    '/rooms/bath-1.jpg',  50),
  ((SELECT id FROM public.rooms WHERE slug = 'una'),     '/rooms/una.jpg',      0),
  ((SELECT id FROM public.rooms WHERE slug = 'una'),     '/rooms/bath-2.jpg',  50),
  ((SELECT id FROM public.rooms WHERE slug = 'chewa'),   '/hero/hero-3.jpg',    0),
  ((SELECT id FROM public.rooms WHERE slug = 'chewa'),   '/rooms/bath-1.jpg',  50),
  ((SELECT id FROM public.rooms WHERE slug = 'nguru'),   '/hero/hero-5.jpg',    0),
  ((SELECT id FROM public.rooms WHERE slug = 'nguru'),   '/rooms/bath-2.jpg',  50);


-- ============================================================================
-- SEED 3/5: FOOD MENU  (49 dishes across Snacks, Sides, Breakfast, Seafood,
--                       Beef, Chicken, Kenyan Cuisine, Desserts)
-- ============================================================================
INSERT INTO public.food_items (name, description, price, image_url, category, available, featured, sort_order) VALUES
  ('Chips',                    'Crispy golden fries — a Le Grande Haven favourite.',                            200,  '/food/chips.jpg',                  'Snacks',          TRUE, TRUE,  1),
  ('Ugali',                    'The Kenyan staple — soft, warm maize meal cake.',                                50,  '/food/ugali.jpg',                  'Sides',           TRUE, FALSE, 2),
  ('Chips Zege',               'Chips topped with beaten eggs — pan-fried to crispy perfection.',               250,  '/food/chips-zege.jpg',             'Snacks',          TRUE, TRUE,  3),
  ('Chips Omelette',           'Fluffy omelette folded around chips, tomato and onion.',                        350,  '/food/chips-omelette.jpg',         'Snacks',          TRUE, TRUE,  4),
  ('Bhajia',                   'Crisp potato bhajias with tangy kachumbari and chutneys.',                      150,  '/food/bhajia.jpg',                 'Snacks',          TRUE, FALSE, 5),
  ('Rice Plain',               'Fluffy steamed white rice — the perfect base for any stew.',                    150,  '/food/rice-plain.jpg',             'Sides',           TRUE, FALSE, 6),
  ('Rice Nazi',                'Coconut rice — fragrant, creamy and lightly sweet.',                            200,  '/food/rice-nazi.jpg',              'Sides',           TRUE, TRUE,  7),
  ('Pilau',                    'Fragrant spiced rice with cinnamon, cardamom and caramelised onions.',          400,  '/food/pilau.jpg',                  'Kenyan Cuisine',  TRUE, TRUE,  8),
  ('Chapati',                  'Warm, soft, layered Kenyan chapati — freshly made.',                             75,  '/food/chapati.jpg',                'Sides',           TRUE, FALSE, 9),
  ('Mandazi',                  'Sweet, fluffy cardamom-scented Swahili doughnuts.',                              50,  '/food/mandazi.jpg',                'Snacks',          TRUE, FALSE, 10),
  ('Samosa',                   'Golden triangles filled with spiced meat or vegetables.',                       100,  '/food/samosa.jpg',                 'Snacks',          TRUE, FALSE, 11),
  ('Sausages',                 'Grilled beef sausages, served hot.',                                            100,  '/food/sausages.jpg',               'Snacks',          TRUE, FALSE, 12),
  ('Greens',                   'Sautéed sukuma wiki with tomato, onion and coriander.',                         100,  '/food/greens.jpg',                 'Sides',           TRUE, FALSE, 13),
  ('Salad Veges',              'Fresh garden salad — tomato, cucumber, avocado and greens.',                    100,  '/food/salad-veges.jpg',            'Sides',           TRUE, FALSE, 14),
  ('Fruit Salad',              'A colourful bowl of ripe seasonal Kenyan fruit.',                               200,  '/food/fruit-salad.jpg',            'Desserts',        TRUE, TRUE,  15),
  ('Fried Eggs (2)',           'Two farm-fresh eggs, fried to your liking.',                                    100,  '/food/fried-eggs.jpg',             'Breakfast',       TRUE, FALSE, 16),
  ('Boiled Eggs (2)',          'Two perfectly boiled eggs.',                                                    100,  '/food/boiled-eggs.jpg',            'Breakfast',       TRUE, FALSE, 17),
  ('Scrambled Eggs',           'Soft, creamy scrambled eggs.',                                                  150,  '/food/scrambled-eggs.jpg',         'Breakfast',       TRUE, FALSE, 18),
  ('Full Breakfast',           'The full works — eggs, sausages, bacon, toast, fruit, tea or coffee.',          750,  '/food/full-breakfast.jpg',         'Breakfast',       TRUE, TRUE,  19),
  ('Fish 800g (wet fry)',      'Whole coastal fish, wet-fried in tomato, garlic and lime.',                     800,  '/food/fish-wet.jpg',               'Seafood',         TRUE, FALSE, 30),
  ('Fish 1kg (wet fry)',       'Whole coastal fish, wet-fried in tomato, garlic and lime.',                    1000,  '/food/fish-wet.jpg',               'Seafood',         TRUE, TRUE,  31),
  ('Fish 1.2kg (wet fry)',     'Whole coastal fish, wet-fried in tomato, garlic and lime.',                    1200,  '/food/fish-wet.jpg',               'Seafood',         TRUE, FALSE, 32),
  ('Fish 1.5kg (wet fry)',     'Whole coastal fish, wet-fried in tomato, garlic and lime.',                    1500,  '/food/fish-large.jpg',             'Seafood',         TRUE, TRUE,  33),
  ('Fish 2kg (wet fry)',       'Sharing-size whole fish, wet-fried in tomato, garlic and lime.',               2000,  '/food/fish-large.jpg',             'Seafood',         TRUE, FALSE, 34),
  ('Fish 2.5kg (wet fry)',     'Large sharing-size whole fish, wet-fried in tomato, garlic and lime.',         2500,  '/food/fish-large.jpg',             'Seafood',         TRUE, FALSE, 35),
  ('Beef ½ kg (wet fry)',      'Half kilo of beef simmered in tomato-onion sauce.',                             650,  '/food/beef-wet.jpg',               'Beef',            TRUE, FALSE, 40),
  ('Beef 1kg (wet fry)',       'One kilo of beef simmered in rich tomato-onion sauce.',                        1250,  '/food/beef-wet.jpg',               'Beef',            TRUE, TRUE,  41),
  ('Beef ½ kg (dry fry)',      'Half kilo of beef pan-fried with peppers and onions.',                          900,  '/food/beef-dry.jpg',               'Beef',            TRUE, FALSE, 42),
  ('Beef 1kg (dry fry)',       'One kilo of beef pan-fried with peppers and onions.',                          1600,  '/food/beef-dry.jpg',               'Beef',            TRUE, TRUE,  43),
  ('Beef ½ kg (chemsha)',      'Half kilo of beef gently boiled with herbs and spices.',                        650,  '/food/beef-chemsha.jpg',           'Beef',            TRUE, FALSE, 44),
  ('Beef 1kg (chemsha)',       'One kilo of beef gently boiled with herbs and spices.',                        1400,  '/food/beef-chemsha.jpg',           'Beef',            TRUE, FALSE, 45),
  ('Beef ½ kg (Tumbukiza)',    'Half kilo of beef in our signature Tumbukiza-style stew.',                      850,  '/food/beef-tumbukiza.jpg',         'Beef',            TRUE, FALSE, 46),
  ('Beef 1kg (Tumbukiza)',     'One kilo of beef in our signature Tumbukiza-style stew.',                      1400,  '/food/beef-tumbukiza.jpg',         'Beef',            TRUE, TRUE,  47),
  ('Mbuzi ½ kg (wet fry)',     'Half kilo of tender goat wet-fried in tomato-onion sauce.',                     700,  '/food/mbuzi-wet.jpg',              'Kenyan Cuisine',  TRUE, FALSE, 50),
  ('Mbuzi 1kg (wet fry)',      'One kilo of tender goat wet-fried in tomato-onion sauce.',                     1350,  '/food/mbuzi-wet.jpg',              'Kenyan Cuisine',  TRUE, TRUE,  51),
  ('Mbuzi ½ kg (dry fry)',     'Half kilo of goat, dry-fried with peppers and onions.',                         950,  '/food/mbuzi-dry.jpg',              'Kenyan Cuisine',  TRUE, FALSE, 52),
  ('Mbuzi 1kg (dry fry)',      'One kilo of goat, dry-fried with peppers and onions.',                         1800,  '/food/mbuzi-dry.jpg',              'Kenyan Cuisine',  TRUE, FALSE, 53),
  ('Mbuzi ½ kg (chemsha)',     'Half kilo of goat gently boiled with herbs and spices.',                        700,  '/food/mbuzi-chemsha.jpg',          'Kenyan Cuisine',  TRUE, FALSE, 54),
  ('Mbuzi 1kg (chemsha)',      'One kilo of goat gently boiled with herbs and spices.',                        1400,  '/food/mbuzi-chemsha.jpg',          'Kenyan Cuisine',  TRUE, FALSE, 55),
  ('Mbuzi ½ kg (Tumbukiza)',   'Half kilo of goat in our signature Tumbukiza-style stew.',                      950,  '/food/mbuzi-tumbukiza.jpg',        'Kenyan Cuisine',  TRUE, FALSE, 56),
  ('Mbuzi 1kg (Tumbukiza)',    'One kilo of goat in our signature Tumbukiza-style stew.',                      1650,  '/food/mbuzi-tumbukiza.jpg',        'Kenyan Cuisine',  TRUE, TRUE,  57),
  ('Mbuzi 1kg (choma)',        'One kilo of goat, charcoal-roasted — served with kachumbari.',                 1600,  '/food/mbuzi-choma.jpg',            'Kenyan Cuisine',  TRUE, TRUE,  58),
  ('Chicken Kienyeji — Full',  'Whole free-range Kenyan chicken, wet-fried in rich sauce.',                    2500,  '/food/chicken-kienyeji.jpg',       'Chicken',         TRUE, TRUE,  60),
  ('Chicken Kienyeji — Half',  'Half free-range Kenyan chicken, wet-fried in rich sauce.',                     1250,  '/food/chicken-kienyeji.jpg',       'Chicken',         TRUE, FALSE, 61),
  ('Broiler Full — Wet Fry',   'Whole broiler chicken, wet-fried with tomato and onion.',                      1250,  '/food/chicken-broiler-wet.jpg',    'Chicken',         TRUE, FALSE, 62),
  ('Broiler Half — Wet Fry',   'Half broiler chicken, wet-fried with tomato and onion.',                        650,  '/food/chicken-broiler-wet.jpg',    'Chicken',         TRUE, FALSE, 63),
  ('Broiler Full — Deep Fry',  'Whole broiler chicken, deep-fried until golden and crisp.',                    1250,  '/food/chicken-broiler-dry.jpg',    'Chicken',         TRUE, FALSE, 64),
  ('Broiler Half — Deep Fry',  'Half broiler chicken, deep-fried until golden and crisp.',                      650,  '/food/chicken-broiler-dry.jpg',    'Chicken',         TRUE, FALSE, 65),
  ('Broiler Choma',            'Whole broiler chicken charcoal-roasted — served with kachumbari and ugali.',   1400,  '/food/chicken-broiler-choma.jpg',  'Chicken',         TRUE, TRUE,  66);


-- ============================================================================
-- SEED 4/5: DRINKS MENU  (Beers, Whisky, Spirits, Champagne & Wine, Sodas,
--                          Water, Fresh Juices, Hot Beverages)
-- ============================================================================
INSERT INTO public.drink_items (name, description, price, image_url, category, available, featured, sort_order) VALUES
  -- Beers
  ('Tusker Lager',                          'Kenya''s iconic lager — crisp, refreshing and best served ice-cold. 500ml bottle.',                   300,   '/drinks/tusker.jpg',          'Beers',              TRUE, TRUE,  1),
  ('Tusker Malt',                           'Smooth premium malt lager with a clean finish. 500ml bottle.',                                         350,   '/drinks/tusker-malt.jpg',     'Beers',              TRUE, TRUE,  2),
  ('White Cap Lager',                       'A refreshing Kenyan lager with a mild hop bitterness. 500ml bottle.',                                  300,   '/drinks/white-cap.jpg',       'Beers',              TRUE, FALSE, 3),
  ('Guinness Foreign Extra',                'Rich, dark and full-bodied stout with roasted notes. 500ml bottle.',                                   400,   '/drinks/guinness.jpg',        'Beers',              TRUE, TRUE,  4),
  ('Heineken',                              'Crisp Dutch pilsner with a signature bright finish. 330ml bottle.',                                    400,   '/drinks/heineken.jpg',        'Beers',              TRUE, FALSE, 5),
  ('Corona Extra',                          'Mexican pale lager, best served with a slice of lime. 355ml bottle.',                                  450,   '/drinks/corona.jpg',          'Beers',              TRUE, TRUE,  6),
  ('Balozi Lager',                          'Smooth Kenyan craft-style lager, brewed for the East African palate. 500ml.',                          320,   '/drinks/balozi.jpg',          'Beers',              TRUE, FALSE, 7),

  -- Whiskies
  ('The Macallan 12 Year Old Double Cask',  'Speyside single malt matured in American and European sherry oak. Warm, honeyed and elegant. 25ml.',  950,   '/drinks/macallan.jpg',        'Whisky',             TRUE, TRUE,  10),
  ('Glenfiddich 12 Year Old',               'The world''s most awarded single malt — fresh pear, subtle oak and a long smooth finish. 25ml.',      700,   '/drinks/glenfiddich.jpg',     'Whisky',             TRUE, TRUE,  11),
  ('The Glenlivet 12 Year Old',             'The definitive Speyside single malt. Bright citrus, honey and creamy oak. 25ml.',                     700,   '/drinks/glenlivet.jpg',       'Whisky',             TRUE, FALSE, 12),
  ('Laphroaig 10 Year Old',                 'Islay single malt — intensely peaty and smoky with a briny finish. 25ml.',                            850,   '/drinks/laphroaig.jpg',       'Whisky',             TRUE, TRUE,  13),
  ('Lagavulin 16 Year Old',                 'Rich, deeply peated Islay whisky with dried fruit and a long, smoky finish. 25ml.',                  1100,   '/drinks/lagavulin.jpg',       'Whisky',             TRUE, TRUE,  14),
  ('Ardbeg 10 Year Old',                    'A cult Islay single malt — heavily peated with citrus, brine and coastal smoke. 25ml.',                900,   '/drinks/ardbeg.jpg',          'Whisky',             TRUE, TRUE,  15),
  ('Talisker 10 Year Old',                  'The classic Isle of Skye single malt. Peppery, maritime and full-bodied. 25ml.',                       900,   '/drinks/talisker.jpg',        'Whisky',             TRUE, TRUE,  16),
  ('Highland Park 12 Year Old Viking Honour','Orkney single malt with heather-honey sweetness and a whisper of Highland smoke. 25ml.',              800,   '/drinks/highland-park.jpg',   'Whisky',             TRUE, FALSE, 17),
  ('Glenmorangie Original 10 Year Old',     'The classic Highland single malt — orange, vanilla and gentle spice. 25ml.',                          700,   '/drinks/glenmorangie.jpg',    'Whisky',             TRUE, TRUE,  18),
  ('Nikka From The Barrel',                 'Award-winning Japanese blend — rich, full-bodied and remarkably complex. 25ml.',                     1000,   '/drinks/nikka.jpg',           'Whisky',             TRUE, TRUE,  19),
  ('Monkey Shoulder Blended Malt',          'A vatted malt from three Speyside distilleries. Smooth, mellow and made for sipping. 25ml.',           600,   '/drinks/monkey-shoulder.jpg', 'Whisky',             TRUE, FALSE, 20),
  ('Johnnie Walker Black Label 12',         'The iconic blended Scotch — rich, smoky and beautifully balanced. 25ml.',                              650,   '/drinks/johnnie-walker.jpg',  'Whisky',             TRUE, FALSE, 21),
  ('Chivas Regal 12 Year Old',              'Legendary blended Scotch with silky honey, vanilla and ripe apple. Aged 12 years. 25ml.',              700,   '/drinks/chivas.jpg',          'Whisky',             TRUE, TRUE,  22),
  ('Jack Daniel''s Old No.7',               'Iconic Tennessee whiskey — mellow, charcoal-mellowed with sweet caramel and oak. 25ml.',              650,   '/drinks/jack-daniels.jpg',    'Whisky',             TRUE, TRUE,  23),
  ('Jameson Irish Whiskey',                 'Triple-distilled Irish whiskey — smooth, light and perfectly balanced. 25ml.',                         600,   '/drinks/jameson.jpg',         'Whisky',             TRUE, TRUE,  24),
  ('Bulleit Bourbon',                       'High-rye Kentucky bourbon with bold spice, oak and dark cherry. 25ml.',                                750,   '/drinks/bulleit.jpg',         'Whisky',             TRUE, FALSE, 25),
  ('Woodford Reserve Bourbon',              'Kentucky Straight bourbon with rich caramel, toasted oak and dried fruit. 25ml.',                      850,   '/drinks/woodford.jpg',        'Whisky',             TRUE, TRUE,  26),
  ('Yamazaki 12 Year Old',                  'Japan''s celebrated single malt — mizunara oak, honey and delicate fruit. 25ml.',                    1600,   '/drinks/yamazaki.jpg',        'Whisky',             TRUE, TRUE,  27),
  ('Bushmills Original Irish Whiskey',      'The world''s oldest licensed distillery — smooth, spicy and creamy. 25ml.',                            550,   '/drinks/bushmills.jpg',       'Whisky',             TRUE, FALSE, 28),
  ('Aberlour 12 Year Old',                  'Speyside single malt matured in sherry and bourbon casks — rich and warming. 25ml.',                   800,   '/drinks/aberlour.jpg',        'Whisky',             TRUE, FALSE, 29),
  ('Dewar''s White Label',                  'Classic double-aged blended Scotch — smooth, honeyed and endlessly versatile. 25ml.',                  550,   '/drinks/dewars.jpg',          'Whisky',             TRUE, FALSE, 30),
  ('Hibiki Japanese Harmony',               'Suntory''s masterful blend of Japanese malts and grains — elegant and refined. 25ml.',               1800,   '/drinks/hibiki.jpg',          'Whisky',             TRUE, TRUE,  31),

  -- Spirits
  ('Kenya Cane',                            'Locally distilled Kenyan cane spirit, best served over ice with lime. 25ml.',                          250,   '/drinks/kenya-cane.jpg',      'Spirits',            TRUE, FALSE, 40),
  ('Bacardi Superior White Rum',            'Light-bodied white rum, perfect for cocktails or on the rocks. 25ml.',                                 450,   '/drinks/bacardi.jpg',         'Spirits',            TRUE, TRUE,  41),
  ('Captain Morgan Spiced Rum',             'Caribbean spiced rum with vanilla, warmth and gentle spice. 25ml.',                                    500,   '/drinks/captain-morgan.jpg',  'Spirits',            TRUE, FALSE, 42),
  ('Smirnoff Red Label Vodka',              'Triple-distilled Russian-style vodka. Clean and versatile. 25ml.',                                     400,   '/drinks/smirnoff.jpg',        'Spirits',            TRUE, FALSE, 43),
  ('Absolut Vodka',                         'Premium Swedish vodka — pure, smooth and clean. 25ml.',                                                500,   '/drinks/absolut.jpg',         'Spirits',            TRUE, TRUE,  44),
  ('Gordon''s London Dry Gin',              'The world''s best-selling London dry gin. Botanical, crisp, classic. 25ml.',                           450,   '/drinks/gordons.jpg',         'Spirits',            TRUE, FALSE, 45),
  ('Bombay Sapphire Gin',                   'Premium London dry gin with 10 hand-selected botanicals. 25ml.',                                       550,   '/drinks/bombay.jpg',          'Spirits',            TRUE, TRUE,  46),
  ('Jose Cuervo Especial Tequila',          'Gold tequila with agave sweetness and a smooth finish. 25ml.',                                         550,   '/drinks/cuervo.jpg',          'Spirits',            TRUE, FALSE, 47),

  -- Champagne & wine
  ('Moet & Chandon Brut',                   'Iconic French champagne, elegant and celebratory. 750ml bottle.',                                    12000,   '/drinks/moet.jpg',            'Champagne & Wine',   TRUE, TRUE,  50),
  ('House Red Wine',                        'A crisp, medium-bodied South African merlot. Glass or bottle.',                                        550,   '/drinks/red-wine.jpg',        'Champagne & Wine',   TRUE, FALSE, 51),
  ('House White Wine',                      'Chilled Sauvignon Blanc with citrus and green apple notes. Glass or bottle.',                          550,   '/drinks/white-wine.jpg',      'Champagne & Wine',   TRUE, TRUE,  52),
  ('Four Cousins Sweet Rose',               'South African sweet rose — fruity, easy-drinking, always a favourite. 750ml.',                        1800,   '/drinks/rose-wine.jpg',       'Champagne & Wine',   TRUE, FALSE, 53),

  -- Sodas
  ('Coca-Cola',                             'The classic Coca-Cola — chilled and served over ice. 300ml bottle.',                                   150,   '/drinks/coke.jpg',            'Sodas',              TRUE, TRUE,  60),
  ('Coca-Cola Zero Sugar',                  'All the Coca-Cola taste, none of the sugar. 300ml bottle.',                                            150,   '/drinks/coke-zero.jpg',       'Sodas',              TRUE, FALSE, 61),
  ('Sprite',                                'Crisp lemon-lime soda. 300ml chilled bottle.',                                                         150,   '/drinks/sprite.jpg',          'Sodas',              TRUE, FALSE, 62),
  ('Fanta Orange',                          'Bright and fizzy orange soda. 300ml chilled bottle.',                                                  150,   '/drinks/fanta.jpg',           'Sodas',              TRUE, TRUE,  63),
  ('Fanta Blackcurrant',                    'A Kenyan favourite — sweet blackcurrant fizz. 300ml chilled bottle.',                                  150,   '/drinks/fanta-blackcurrant.jpg','Sodas',            TRUE, FALSE, 64),
  ('Stoney Tangawizi',                      'Kenya''s fiery ginger soda — bold and unforgettable. 300ml bottle.',                                   150,   '/drinks/stoney.jpg',          'Sodas',              TRUE, TRUE,  65),
  ('Krest Bitter Lemon',                    'Sharp, refreshing bitter lemon tonic. 300ml bottle.',                                                  180,   '/drinks/krest.jpg',           'Sodas',              TRUE, FALSE, 66),
  ('Schweppes Tonic Water',                 'Classic Schweppes tonic — the perfect gin partner. 200ml bottle.',                                     200,   '/drinks/tonic.jpg',           'Sodas',              TRUE, FALSE, 67),

  -- Water
  ('Dasani Still Water',                    'Purified still mineral water. 500ml bottle.',                                                          100,   '/drinks/water-still.jpg',     'Water',              TRUE, TRUE,  70),
  ('Keringet Mineral Water',                'Kenyan spring mineral water from the Mau Escarpment. 500ml bottle.',                                   150,   '/drinks/keringet.jpg',        'Water',              TRUE, FALSE, 71),
  ('Aquamist Still Water',                  'Locally-bottled still water — crisp and pure. 1L bottle.',                                             200,   '/drinks/aquamist.jpg',        'Water',              TRUE, FALSE, 72),
  ('Perrier Sparkling Water',               'French naturally sparkling mineral water. 330ml green bottle.',                                        350,   '/drinks/perrier.jpg',         'Water',              TRUE, TRUE,  73),
  ('San Pellegrino Sparkling',              'Italian sparkling mineral water with fine bubbles. 500ml bottle.',                                     400,   '/drinks/pellegrino.jpg',      'Water',              TRUE, FALSE, 74),

  -- Fresh juices
  ('Fresh Juice',                           'Freshly-squeezed seasonal fruit juice. Ask for today''s flavour.',                                     150,   '/beverages/juice.jpg',        'Fresh Juices',       TRUE, TRUE,  80),
  ('Cocktail Juice',                        'A house blend of tropical juices — mango, passion, pineapple.',                                        250,   '/beverages/cocktail-juice.jpg','Fresh Juices',      TRUE, TRUE,  81),
  ('Milkshake',                             'Thick, cold milkshake — vanilla, chocolate or strawberry.',                                            350,   '/beverages/milkshake.jpg',    'Fresh Juices',       TRUE, TRUE,  82),
  ('Smoothie',                              'Blended fresh fruit and yoghurt — healthy and refreshing.',                                            350,   '/beverages/smoothie.jpg',     'Fresh Juices',       TRUE, FALSE, 83),

  -- Hot beverages
  ('Glass of Milk',                         'A cold, fresh glass of milk.',                                                                         150,   '/beverages/milk.jpg',         'Hot Beverages',      TRUE, FALSE, 90),
  ('African Tea',                           'Traditional Kenyan chai brewed in milk with cardamom and ginger.',                                     200,   '/beverages/african-tea.jpg',  'Hot Beverages',      TRUE, TRUE,  91),
  ('Black Tea',                             'Classic Kenyan black tea. Simple and warming.',                                                        100,   '/beverages/black-tea.jpg',    'Hot Beverages',      TRUE, FALSE, 92),
  ('Black Coffee',                          'Freshly brewed single-origin Kenyan coffee.',                                                          150,   '/beverages/black-coffee.jpg', 'Hot Beverages',      TRUE, TRUE,  93),
  ('Dawa',                                  'The Kenyan honey-lemon-ginger cure-all. Warming and restorative.',                                     200,   '/beverages/dawa.jpg',         'Hot Beverages',      TRUE, TRUE,  94),
  ('White Chocolate',                       'Rich, creamy white hot chocolate.',                                                                    200,   '/beverages/white-chocolate.jpg','Hot Beverages',    TRUE, FALSE, 95),
  ('White Coffee',                          'Kenyan coffee with steamed milk.',                                                                     200,   '/beverages/white-coffee.jpg', 'Hot Beverages',      TRUE, FALSE, 96),
  ('Spiced Tea',                            'Black tea steeped with cinnamon, cloves and cardamom.',                                                250,   '/beverages/spiced-tea.jpg',   'Hot Beverages',      TRUE, FALSE, 97),
  ('Pot of Tea',                            'A full pot of freshly brewed Kenyan tea to share.',                                                    350,   '/beverages/pot-tea.jpg',      'Hot Beverages',      TRUE, TRUE,  98);


-- ============================================================================
-- SEED 5/5: HOMEPAGE GALLERY  (flow: destination → dining → rooms)
-- ============================================================================
INSERT INTO public.gallery (url, caption, category, sort_order) VALUES
  ('/hero/hero-lush.jpg',          'Arriving at Le Grande Haven · Kanana', 'destination', 1),
  ('/hero/hero-2.jpg',             'Tropical gardens · Kanana',            'destination', 2),
  ('/hero/hero-accommodation.jpg', 'The accommodation building · Kanana',  'destination', 3),
  ('/hero/hero-whiskies.jpg',      'The Whisky Bar',                       'dining',      4),
  ('/food/fish-large.jpg',         'Fresh Swahili seafood',                'dining',      5),
  ('/hero/hero-1.jpg',             'Four-poster suite · Kanana',           'rooms',       6),
  ('/hero/hero-5.jpg',             'Serene coastal rooms · Kanana',        'rooms',       7),
  ('/hero/hero-6.jpg',             'The Pweza Suite · Kanana',             'rooms',       8);


-- ============================================================================
-- DONE.
-- Next:
--   1. Create an admin user in Supabase Auth (Studio → Authentication → Users)
--      or via SQL:
--        SELECT id FROM auth.users WHERE email = 'admin@legrandehaven.co.ke';
--   2. Sign in at /login with that email + password.
--   3. Go to /admin/settings to change the password.
--
-- The admin dashboard at /admin will now show:
--   • 10 rooms (edit, add, delete, upload images)
--   • 49 food items (edit, add, delete, upload images)
--   • 68 drinks (edit, add, delete, upload images)
--   • 8 gallery images
--   • Empty tables: bookings, restaurant_reservations, contact_messages, staff
--     (they fill up as guests interact with the site and you add team members).
-- ============================================================================
