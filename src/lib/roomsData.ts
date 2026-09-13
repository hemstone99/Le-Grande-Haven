// Fallback room data — mirrors the seeded Supabase rows.
// Used when the /api/rooms endpoint is unreachable (e.g. Vite preview
// running without Vercel serverless functions) so the site always
// displays the full set of 10 Le Grande Haven rooms with images.

export type FallbackRoom = {
  id: string
  slug: string
  name: string
  room_type: string
  short_description: string
  description: string
  guests: number
  bed_config: string
  price_per_night: number
  amenities: string[]
  available: boolean
  featured: boolean
  images: { url: string }[]
}

export const FALLBACK_ROOMS: FallbackRoom[] = [
  {
    id: 'mwani-fallback',
    slug: 'mwani',
    name: 'Mwani',
    room_type: 'Standard',
    short_description: 'A calm, sun-lit room named for the sea grasses of the Kwale coast.',
    description: 'Mwani is a serene single-room retreat bathed in soft coastal light. Warm timber floors, ivory linens and a small reading nook by the window make this a favourite for solo travellers and writers. Wake to birdsong and the scent of the neighbouring frangipani tree.',
    guests: 2,
    bed_config: 'Queen bed',
    price_per_night: 1000,
    amenities: ['Comfortable bed', 'Private bathroom', 'Wi-Fi', 'Hot shower', 'Fresh towels', 'Mosquito net', 'Room service', 'Daily cleaning', 'Secure parking', 'Flat-screen TV with DSTV', 'Work desk', 'Wall drawers & wardrobe'],
    available: true,
    featured: true,
    images: [
      { url: '/rooms/mwani.jpg' },
      { url: '/hero/hero-1.jpg' },
      { url: '/rooms/bath-1.jpg' },
    ],
  },
  {
    id: 'tumbawe-fallback',
    slug: 'tumbawe',
    name: 'Tumbawe',
    room_type: 'Deluxe',
    short_description: 'Named for the coral reefs, cool blues and ocean-inspired details.',
    description: 'Tumbawe channels the calm of an underwater world with soft blues, driftwood accents and a generous king bed. Perfect for couples who want a peaceful base close to the restaurant and gardens.',
    guests: 2,
    bed_config: 'King bed',
    price_per_night: 2500,
    amenities: ['Comfortable king bed', 'Private bathroom', 'Wi-Fi', 'Rain shower', 'Fresh towels', 'Mosquito net', 'Room service', 'Daily cleaning', 'Secure parking', 'Coffee & tea', 'Flat-screen TV with DSTV', 'Work desk', 'Wall drawers & wardrobe'],
    available: true,
    featured: true,
    images: [
      { url: '/rooms/tumbawe.jpg' },
      { url: '/hero/hero-5.jpg' },
      { url: '/rooms/bath-2.jpg' },
    ],
  },
  {
    id: 'nyasi-fallback',
    slug: 'nyasi',
    name: 'Nyasi',
    room_type: 'Standard',
    short_description: 'Grass-thatched charm with a warm, earthy palette.',
    description: 'Nyasi means grass — and this room borrows its warmth from the thatched roofs of the coast. Woven textures, cream walls and a private veranda make it ideal for slow mornings with a Kenyan coffee.',
    guests: 2,
    bed_config: 'Queen bed',
    price_per_night: 1000,
    amenities: ['Comfortable bed', 'Private bathroom', 'Wi-Fi', 'Hot shower', 'Fresh towels', 'Mosquito net', 'Room service', 'Daily cleaning', 'Secure parking', 'Flat-screen TV with DSTV', 'Work desk', 'Wall drawers & wardrobe'],
    available: true,
    featured: false,
    images: [
      { url: '/rooms/nyasi.jpg' },
      { url: '/hero/hero-4.jpg' },
      { url: '/rooms/bath-1.jpg' },
    ],
  },
  {
    id: 'pweza-fallback',
    slug: 'pweza',
    name: 'Pweza',
    room_type: 'Deluxe',
    short_description: 'Playful, coastal, and full of natural light — named for the octopus.',
    description: 'Pweza is a bright and airy room with tall windows opening to the garden. Its palette of coral and cream feels playful yet grown-up. A great choice for those who love natural light.',
    guests: 3,
    bed_config: 'King bed + single',
    price_per_night: 2500,
    amenities: ['Comfortable beds', 'Private bathroom', 'Wi-Fi', 'Rain shower', 'Fresh towels', 'Mosquito net', 'Room service', 'Daily cleaning', 'Secure parking', 'Coffee & tea', 'Garden view', 'Flat-screen TV with DSTV', 'Work desk', 'Wall drawers & wardrobe'],
    available: true,
    featured: true,
    images: [
      { url: '/rooms/pweza.jpg' },
      { url: '/hero/hero-1.jpg' },
      { url: '/rooms/bath-2.jpg' },
    ],
  },
  {
    id: 'mkoko-fallback',
    slug: 'mkoko',
    name: 'Mkoko',
    room_type: 'Standard',
    short_description: 'Named for the mangroves — quiet, green and grounded.',
    description: 'Mkoko sits at the quieter end of the property, wrapped in mangrove-inspired greens. A study desk and slow ceiling fan make it perfect for a longer stay or working retreat.',
    guests: 2,
    bed_config: 'Queen bed',
    price_per_night: 2500,
    amenities: ['Comfortable bed', 'Private bathroom', 'Wi-Fi', 'Hot shower', 'Fresh towels', 'Mosquito net', 'Room service', 'Daily cleaning', 'Secure parking', 'Flat-screen TV with DSTV', 'Work desk', 'Wall drawers & wardrobe'],
    available: true,
    featured: false,
    images: [
      { url: '/rooms/mkoko.jpg' },
      { url: '/hero/hero-5.jpg' },
      { url: '/rooms/bath-1.jpg' },
    ],
  },
  {
    id: 'ngisi-fallback',
    slug: 'ngisi',
    name: 'Ngisi',
    room_type: 'Standard',
    short_description: 'An intimate room with soft coastal storytelling.',
    description: 'Ngisi (squid) is a compact but perfectly-formed room with a cosy bed, spa-inspired bathroom and hand-woven kikoi throws. Ideal for a short romantic getaway.',
    guests: 2,
    bed_config: 'Double bed',
    price_per_night: 2500,
    amenities: ['Comfortable bed', 'Private bathroom', 'Wi-Fi', 'Hot shower', 'Fresh towels', 'Mosquito net', 'Room service', 'Daily cleaning', 'Secure parking', 'Flat-screen TV with DSTV', 'Work desk', 'Wall drawers & wardrobe'],
    available: true,
    featured: false,
    images: [
      { url: '/hero/hero-1.jpg' },
      { url: '/hero/hero-5.jpg' },
      { url: '/rooms/bath-2.jpg' },
    ],
  },
  {
    id: 'tafi-fallback',
    slug: 'tafi',
    name: 'Tafi',
    room_type: 'Family',
    short_description: 'Family-friendly with two beds and playful details.',
    description: 'Tafi is our most family-friendly room — spacious enough for two adults and two children, with soft rugs, a low reading corner and quick access to the garden.',
    guests: 4,
    bed_config: 'King + 2 singles',
    price_per_night: 2500,
    amenities: ['Comfortable beds', 'Private bathroom', 'Wi-Fi', 'Hot shower', 'Fresh towels', 'Mosquito nets', 'Room service', 'Daily cleaning', 'Secure parking', 'Family friendly', 'Extra towels', 'Flat-screen TV with DSTV', 'Work desk', 'Wall drawers & wardrobe'],
    available: true,
    featured: true,
    images: [
      { url: '/hero/hero-4.jpg' },
      { url: '/hero/hero-1.jpg' },
      { url: '/rooms/bath-1.jpg' },
    ],
  },
  {
    id: 'una-fallback',
    slug: 'una',
    name: 'Una',
    room_type: 'Deluxe',
    short_description: 'Bright, breezy and made for slow mornings.',
    description: 'Una is a light-filled room with cream walls, terracotta tiles and a small balcony overlooking the garden. Wake up slowly with a coffee, or head straight to the restaurant.',
    guests: 2,
    bed_config: 'King bed',
    price_per_night: 2500,
    amenities: ['Comfortable king bed', 'Private bathroom', 'Wi-Fi', 'Rain shower', 'Fresh towels', 'Mosquito net', 'Room service', 'Daily cleaning', 'Secure parking', 'Balcony', 'Coffee & tea', 'Flat-screen TV with DSTV', 'Work desk', 'Wall drawers & wardrobe'],
    available: false,
    featured: false,
    images: [
      { url: '/rooms/una.jpg' },
      { url: '/hero/hero-5.jpg' },
      { url: '/rooms/bath-1.jpg' },
      { url: '/rooms/bath-2.jpg' },
    ],
  },
  {
    id: 'chewa-fallback',
    slug: 'chewa',
    name: 'Chewa',
    room_type: 'Twin',
    short_description: 'A serene twin room ideal for friends travelling together.',
    description: 'Chewa (grouper fish) offers two comfortable single beds, a shared writing desk and quick access to the pool area. A great pick for friends or colleagues.',
    guests: 2,
    bed_config: 'Two single beds',
    price_per_night: 2500,
    amenities: ['Two comfortable beds', 'Private bathroom', 'Wi-Fi', 'Hot shower', 'Fresh towels', 'Mosquito nets', 'Room service', 'Daily cleaning', 'Secure parking', 'Flat-screen TV with DSTV', 'Work desk', 'Wall drawers & wardrobe'],
    available: true,
    featured: false,
    images: [
      { url: '/hero/hero-3.jpg' },
      { url: '/hero/hero-4.jpg' },
      { url: '/rooms/bath-2.jpg' },
    ],
  },
  {
    id: 'nguru-fallback',
    slug: 'nguru',
    name: 'Nguru',
    room_type: 'Suite',
    short_description: 'Our signature suite — named after the mighty kingfish.',
    description: 'Nguru is our most spacious accommodation — a suite with a lounge area, generous king bed, spa-inspired bathroom and a private terrace. Ideal for honeymoons, anniversaries and special occasions.',
    guests: 2,
    bed_config: 'Super king bed',
    price_per_night: 2500,
    amenities: ['Super king bed', 'Private lounge', 'Ensuite bathroom', 'Wi-Fi', 'Rain shower', 'Bathrobes', 'Fresh towels', 'Mosquito net', '24hr room service', 'Daily cleaning', 'Secure parking', 'Private terrace', 'Breakfast included', 'Flat-screen TV with DSTV', 'Work desk', 'Wall drawers & wardrobe'],
    available: true,
    featured: true,
    images: [
      { url: '/hero/hero-5.jpg' },
      { url: '/hero/hero-1.jpg' },
      { url: '/rooms/bath-1.jpg' },
      { url: '/rooms/bath-2.jpg' },
    ],
  },
]

// Fetch rooms with graceful fallback when API is unavailable.
export async function fetchRoomsWithFallback(): Promise<FallbackRoom[]> {
  try {
    const res = await fetch('/api/rooms')
    if (!res.ok) throw new Error('API not ok')
    const data = await res.json()
    if (Array.isArray(data)) return data as FallbackRoom[]
    return FALLBACK_ROOMS
  } catch {
    return FALLBACK_ROOMS
  }
}
