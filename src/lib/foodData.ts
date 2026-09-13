// Fallback food data — mirrors the seeded Supabase rows.
// Used when /api/food is unreachable so the preview always shows the full menu.

export type FallbackFood = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  available: boolean
  featured: boolean
}

export const FALLBACK_FOOD: FallbackFood[] = [
  // Snacks / sides
  { id: 'f1',  name: 'Chips',            description: 'Crispy golden fries — a Le Grande Haven favourite.',        price: 200,  category: 'Snacks',   image_url: '/food/chips.jpg',            featured: true,  available: true },
  { id: 'f2',  name: 'Ugali',            description: 'The Kenyan staple — soft, warm maize meal cake.',           price: 50,   category: 'Sides',    image_url: '/food/ugali.jpg',            featured: false, available: true },
  { id: 'f3',  name: 'Chips Zege',       description: 'Chips topped with beaten eggs — pan-fried to crispy perfection.', price: 250, category: 'Snacks', image_url: '/food/chips-zege.jpg', featured: true, available: true },
  { id: 'f4',  name: 'Chips Omelette',   description: 'Fluffy omelette folded around chips, tomato and onion.',    price: 350,  category: 'Snacks',   image_url: '/food/chips-omelette.jpg',   featured: true,  available: true },
  { id: 'f5',  name: 'Bhajia',           description: 'Crisp potato bhajias with tangy kachumbari and chutneys.',  price: 150,  category: 'Snacks',   image_url: '/food/bhajia.jpg',           featured: false, available: true },
  { id: 'f6',  name: 'Rice Plain',       description: 'Fluffy steamed white rice — the perfect base for any stew.',price: 150,  category: 'Sides',    image_url: '/food/rice-plain.jpg',       featured: false, available: true },
  { id: 'f7',  name: 'Rice Nazi',        description: 'Coconut rice — fragrant, creamy and lightly sweet.',        price: 200,  category: 'Sides',    image_url: '/food/rice-nazi.jpg',        featured: true,  available: true },
  { id: 'f8',  name: 'Pilau',            description: 'Fragrant spiced rice with cinnamon, cardamom and caramelised onions.', price: 400, category: 'Kenyan Cuisine', image_url: '/food/pilau.jpg', featured: true, available: true },
  { id: 'f9',  name: 'Chapati',          description: 'Warm, soft, layered Kenyan chapati — freshly made.',        price: 75,   category: 'Sides',    image_url: '/food/chapati.jpg',          featured: false, available: true },
  { id: 'f10', name: 'Mandazi',          description: 'Sweet, fluffy cardamom-scented Swahili doughnuts.',         price: 50,   category: 'Snacks',   image_url: '/food/mandazi.jpg',          featured: false, available: true },
  { id: 'f11', name: 'Samosa',           description: 'Golden triangles filled with spiced meat or vegetables.',   price: 100,  category: 'Snacks',   image_url: '/food/samosa.jpg',           featured: false, available: true },
  { id: 'f12', name: 'Sausages',         description: 'Grilled beef sausages, served hot.',                        price: 100,  category: 'Snacks',   image_url: '/food/sausages.jpg',         featured: false, available: true },
  { id: 'f13', name: 'Greens',           description: 'Sautéed sukuma wiki with tomato, onion and coriander.',     price: 100,  category: 'Sides',    image_url: '/food/greens.jpg',           featured: false, available: true },
  { id: 'f14', name: 'Salad Veges',      description: 'Fresh garden salad — tomato, cucumber, avocado and greens.',price: 100,  category: 'Sides',    image_url: '/food/salad-veges.jpg',      featured: false, available: true },
  { id: 'f15', name: 'Fruit Salad',      description: 'A colourful bowl of ripe seasonal Kenyan fruit.',           price: 200,  category: 'Desserts', image_url: '/food/fruit-salad.jpg',      featured: true,  available: true },

  // Breakfast
  { id: 'f16', name: 'Fried Eggs (2)',   description: 'Two farm-fresh eggs, fried to your liking.',                price: 100,  category: 'Breakfast',image_url: '/food/fried-eggs.jpg',       featured: false, available: true },
  { id: 'f17', name: 'Boiled Eggs (2)',  description: 'Two perfectly boiled eggs.',                                price: 100,  category: 'Breakfast',image_url: '/food/boiled-eggs.jpg',      featured: false, available: true },
  { id: 'f18', name: 'Scrambled Eggs',   description: 'Soft, creamy scrambled eggs.',                              price: 150,  category: 'Breakfast',image_url: '/food/scrambled-eggs.jpg',   featured: false, available: true },
  { id: 'f19', name: 'Full Breakfast',   description: 'The full works — eggs, sausages, bacon, toast, fruit, tea or coffee.', price: 750, category: 'Breakfast', image_url: '/food/full-breakfast.jpg', featured: true, available: true },

  // Seafood — Fish (wet fry variants)
  { id: 'f20', name: 'Fish 800g (wet fry)',    description: 'Whole coastal fish, wet-fried in tomato, garlic and lime.', price: 800,  category: 'Seafood', image_url: '/food/fish-wet.jpg',   featured: false, available: true },
  { id: 'f21', name: 'Fish 1kg (wet fry)',     description: 'Whole coastal fish, wet-fried in tomato, garlic and lime.', price: 1000, category: 'Seafood', image_url: '/food/fish-wet.jpg',   featured: true,  available: true },
  { id: 'f22', name: 'Fish 1.2kg (wet fry)',   description: 'Whole coastal fish, wet-fried in tomato, garlic and lime.', price: 1200, category: 'Seafood', image_url: '/food/fish-wet.jpg',   featured: false, available: true },
  { id: 'f23', name: 'Fish 1.5kg (wet fry)',   description: 'Whole coastal fish, wet-fried in tomato, garlic and lime.', price: 1500, category: 'Seafood', image_url: '/food/fish-large.jpg', featured: true,  available: true },
  { id: 'f24', name: 'Fish 2kg (wet fry)',     description: 'Sharing-size whole fish, wet-fried in tomato, garlic and lime.', price: 2000, category: 'Seafood', image_url: '/food/fish-large.jpg', featured: false, available: true },
  { id: 'f25', name: 'Fish 2.5kg (wet fry)',   description: 'Large sharing-size whole fish, wet-fried in tomato, garlic and lime.', price: 2500, category: 'Seafood', image_url: '/food/fish-large.jpg', featured: false, available: true },

  // Beef
  { id: 'f30', name: 'Beef ½ kg (wet fry)',    description: 'Half kilo of beef simmered in tomato-onion sauce.',   price: 650,  category: 'Beef', image_url: '/food/beef-wet.jpg',       featured: false, available: true },
  { id: 'f31', name: 'Beef 1kg (wet fry)',     description: 'One kilo of beef simmered in rich tomato-onion sauce.',price: 1250, category: 'Beef', image_url: '/food/beef-wet.jpg',       featured: true,  available: true },
  { id: 'f32', name: 'Beef ½ kg (dry fry)',    description: 'Half kilo of beef pan-fried with peppers and onions.', price: 900, category: 'Beef', image_url: '/food/beef-dry.jpg',       featured: false, available: true },
  { id: 'f33', name: 'Beef 1kg (dry fry)',     description: 'One kilo of beef pan-fried with peppers and onions.',  price: 1600, category: 'Beef', image_url: '/food/beef-dry.jpg',       featured: true,  available: true },
  { id: 'f34', name: 'Beef ½ kg (chemsha)',    description: 'Half kilo of beef gently boiled with herbs and spices.',price: 650, category: 'Beef', image_url: '/food/beef-chemsha.jpg',   featured: false, available: true },
  { id: 'f35', name: 'Beef 1kg (chemsha)',     description: 'One kilo of beef gently boiled with herbs and spices.',price: 1400, category: 'Beef', image_url: '/food/beef-chemsha.jpg',   featured: false, available: true },
  { id: 'f36', name: 'Beef ½ kg (Tumbukiza)',  description: 'Half kilo of beef in our signature Tumbukiza-style stew.', price: 850, category: 'Beef', image_url: '/food/beef-tumbukiza.jpg', featured: false, available: true },
  { id: 'f37', name: 'Beef 1kg (Tumbukiza)',   description: 'One kilo of beef in our signature Tumbukiza-style stew.',  price: 1400, category: 'Beef', image_url: '/food/beef-tumbukiza.jpg', featured: true, available: true },

  // Mbuzi (goat) — Kenyan Cuisine
  { id: 'f40', name: 'Mbuzi ½ kg (wet fry)',   description: 'Half kilo of tender goat wet-fried in tomato-onion sauce.', price: 700, category: 'Kenyan Cuisine', image_url: '/food/mbuzi-wet.jpg', featured: false, available: true },
  { id: 'f41', name: 'Mbuzi 1kg (wet fry)',    description: 'One kilo of tender goat wet-fried in tomato-onion sauce.',  price: 1350, category: 'Kenyan Cuisine', image_url: '/food/mbuzi-wet.jpg', featured: true, available: true },
  { id: 'f42', name: 'Mbuzi ½ kg (dry fry)',   description: 'Half kilo of goat, dry-fried with peppers and onions.',    price: 950, category: 'Kenyan Cuisine', image_url: '/food/mbuzi-dry.jpg', featured: false, available: true },
  { id: 'f43', name: 'Mbuzi 1kg (dry fry)',    description: 'One kilo of goat, dry-fried with peppers and onions.',     price: 1800, category: 'Kenyan Cuisine', image_url: '/food/mbuzi-dry.jpg', featured: false, available: true },
  { id: 'f44', name: 'Mbuzi ½ kg (chemsha)',   description: 'Half kilo of goat gently boiled with herbs and spices.',   price: 700, category: 'Kenyan Cuisine', image_url: '/food/mbuzi-chemsha.jpg', featured: false, available: true },
  { id: 'f45', name: 'Mbuzi 1kg (chemsha)',    description: 'One kilo of goat gently boiled with herbs and spices.',    price: 1400, category: 'Kenyan Cuisine', image_url: '/food/mbuzi-chemsha.jpg', featured: false, available: true },
  { id: 'f46', name: 'Mbuzi ½ kg (Tumbukiza)', description: 'Half kilo of goat in our signature Tumbukiza-style stew.', price: 950, category: 'Kenyan Cuisine', image_url: '/food/mbuzi-tumbukiza.jpg', featured: false, available: true },
  { id: 'f47', name: 'Mbuzi 1kg (Tumbukiza)',  description: 'One kilo of goat in our signature Tumbukiza-style stew.',  price: 1650, category: 'Kenyan Cuisine', image_url: '/food/mbuzi-tumbukiza.jpg', featured: true, available: true },
  { id: 'f48', name: 'Mbuzi 1kg (choma)',      description: 'One kilo of goat, charcoal-roasted — the Kenyan classic. Served with kachumbari.', price: 1600, category: 'Kenyan Cuisine', image_url: '/food/mbuzi-choma.jpg', featured: true, available: true },

  // Chicken
  { id: 'f50', name: 'Chicken Kienyeji — Full', description: 'Whole free-range Kenyan chicken, wet-fried in rich sauce.', price: 2500, category: 'Chicken', image_url: '/food/chicken-kienyeji.jpg', featured: true, available: true },
  { id: 'f51', name: 'Chicken Kienyeji — Half', description: 'Half free-range Kenyan chicken, wet-fried in rich sauce.',  price: 1250, category: 'Chicken', image_url: '/food/chicken-kienyeji.jpg', featured: false, available: true },
  { id: 'f52', name: 'Broiler Full — Wet Fry',  description: 'Whole broiler chicken, wet-fried with tomato and onion.',   price: 1250, category: 'Chicken', image_url: '/food/chicken-broiler-wet.jpg', featured: false, available: true },
  { id: 'f53', name: 'Broiler Half — Wet Fry',  description: 'Half broiler chicken, wet-fried with tomato and onion.',    price: 650,  category: 'Chicken', image_url: '/food/chicken-broiler-wet.jpg', featured: false, available: true },
  { id: 'f54', name: 'Broiler Full — Deep Fry', description: 'Whole broiler chicken, deep-fried until golden and crisp.', price: 1250, category: 'Chicken', image_url: '/food/chicken-broiler-dry.jpg', featured: false, available: true },
  { id: 'f55', name: 'Broiler Half — Deep Fry', description: 'Half broiler chicken, deep-fried until golden and crisp.',  price: 650,  category: 'Chicken', image_url: '/food/chicken-broiler-dry.jpg', featured: false, available: true },
  { id: 'f56', name: 'Broiler Choma',           description: 'Whole broiler chicken charcoal-roasted — served with kachumbari and ugali.', price: 1400, category: 'Chicken', image_url: '/food/chicken-broiler-choma.jpg', featured: true, available: true },
]

export async function fetchFoodWithFallback(featuredOnly = false): Promise<FallbackFood[]> {
  try {
    const res = await fetch(featuredOnly ? '/api/food?featured=1' : '/api/food')
    if (!res.ok) throw new Error('API not ok')
    const data = await res.json()
    if (Array.isArray(data)) return data as FallbackFood[]
    return featuredOnly ? FALLBACK_FOOD.filter(f => f.featured) : FALLBACK_FOOD
  } catch {
    return featuredOnly ? FALLBACK_FOOD.filter(f => f.featured) : FALLBACK_FOOD
  }
}
