// Fallback drinks data — mirrors the seeded Supabase rows.
// Images are stored locally under /public/drinks/ so they are 100% reliable
// (no CORS, no rate limits, no 404s). Sourced from Pexels (free-license).

export type FallbackDrink = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  available: boolean
  featured: boolean
}

export const DRINK_CATEGORIES = ['Fresh Juices', 'Hot Beverages', 'Beers', 'Whisky', 'Spirits', 'Champagne & Wine', 'Sodas', 'Water']

export const FALLBACK_DRINKS: FallbackDrink[] = [
  // Fresh juices & milks
  { id: 'dj1', name: 'Fresh Juice', description: "Freshly-squeezed seasonal fruit juice. Ask for today's flavour.", price: 150, category: 'Fresh Juices', image_url: '/beverages/juice.jpg', featured: true, available: true },
  { id: 'dj2', name: 'Cocktail Juice', description: 'A house blend of tropical juices — mango, passion, pineapple.', price: 250, category: 'Fresh Juices', image_url: '/beverages/cocktail-juice.jpg', featured: true, available: true },
  { id: 'dj3', name: 'Milkshake', description: 'Thick, cold milkshake — vanilla, chocolate or strawberry.', price: 350, category: 'Fresh Juices', image_url: '/beverages/milkshake.jpg', featured: true, available: true },
  { id: 'dj4', name: 'Smoothie', description: 'Blended fresh fruit and yoghurt — healthy and refreshing.', price: 350, category: 'Fresh Juices', image_url: '/beverages/smoothie.jpg', available: true, featured: false },
  { id: 'dj5', name: 'Glass of Milk', description: 'A cold, fresh glass of milk.', price: 150, category: 'Hot Beverages', image_url: '/beverages/milk.jpg', available: true, featured: false },
  // Hot beverages
  { id: 'dh1', name: 'African Tea', description: 'Traditional Kenyan chai brewed in milk with cardamom and ginger.', price: 200, category: 'Hot Beverages', image_url: '/beverages/african-tea.jpg', featured: true, available: true },
  { id: 'dh2', name: 'Black Tea', description: 'Classic Kenyan black tea. Simple and warming.', price: 100, category: 'Hot Beverages', image_url: '/beverages/black-tea.jpg', available: true, featured: false },
  { id: 'dh3', name: 'Black Coffee', description: 'Freshly brewed single-origin Kenyan coffee.', price: 150, category: 'Hot Beverages', image_url: '/beverages/black-coffee.jpg', featured: true, available: true },
  { id: 'dh4', name: 'Dawa', description: 'The Kenyan honey-lemon-ginger cure-all. Warming and restorative.', price: 200, category: 'Hot Beverages', image_url: '/beverages/dawa.jpg', featured: true, available: true },
  { id: 'dh5', name: 'White Chocolate', description: 'Rich, creamy white hot chocolate.', price: 200, category: 'Hot Beverages', image_url: '/beverages/white-chocolate.jpg', available: true, featured: false },
  { id: 'dh6', name: 'White Coffee', description: 'Kenyan coffee with steamed milk.', price: 200, category: 'Hot Beverages', image_url: '/beverages/white-coffee.jpg', available: true, featured: false },
  { id: 'dh7', name: 'Spiced Tea', description: 'Black tea steeped with cinnamon, cloves and cardamom.', price: 250, category: 'Hot Beverages', image_url: '/beverages/spiced-tea.jpg', available: true, featured: false },
  { id: 'dh8', name: 'Pot of Tea', description: 'A full pot of freshly brewed Kenyan tea to share.', price: 350, category: 'Hot Beverages', image_url: '/beverages/pot-tea.jpg', featured: true, available: true },

  // Beers
  { id: 'd1', name: 'Tusker Lager', description: "Kenya's iconic lager — crisp, refreshing and best served ice-cold. 500ml bottle.", price: 300, category: 'Beers', image_url: '/drinks/tusker.jpg', featured: true, available: true },
  { id: 'd2', name: 'Tusker Malt', description: 'Smooth premium malt lager with a clean finish. 500ml bottle.', price: 350, category: 'Beers', image_url: '/drinks/tusker-malt.jpg', featured: true, available: true },
  { id: 'd3', name: 'White Cap Lager', description: 'A refreshing Kenyan lager with a mild hop bitterness. 500ml bottle.', price: 300, category: 'Beers', image_url: '/drinks/white-cap.jpg', available: true, featured: false },
  { id: 'd4', name: 'Guinness Foreign Extra', description: 'Rich, dark and full-bodied stout with roasted notes. 500ml bottle.', price: 400, category: 'Beers', image_url: '/drinks/guinness.jpg', featured: true, available: true },
  { id: 'd5', name: 'Heineken', description: 'Crisp Dutch pilsner with a signature bright finish. 330ml bottle.', price: 400, category: 'Beers', image_url: '/drinks/heineken.jpg', available: true, featured: false },
  { id: 'd6', name: 'Corona Extra', description: 'Mexican pale lager, best served with a slice of lime. 355ml bottle.', price: 450, category: 'Beers', image_url: '/drinks/corona.jpg', featured: true, available: true },
  { id: 'd7', name: 'Balozi Lager', description: 'Smooth Kenyan craft-style lager, brewed for the East African palate. 500ml.', price: 320, category: 'Beers', image_url: '/drinks/balozi.jpg', available: true, featured: false },

  // Whiskies (curated from The Whisky Exchange bestseller list)
  { id: 'd8', name: 'The Macallan 12 Year Old Double Cask', description: 'Speyside single malt matured in American and European sherry oak. Warm, honeyed and elegant. 25ml tot.', price: 950, category: 'Whisky', image_url: '/drinks/macallan.jpg', featured: true, available: true },
  { id: 'd8a', name: 'Glenfiddich 12 Year Old', description: "The world's most awarded single malt — fresh pear, subtle oak and a long smooth finish. 25ml tot.", price: 700, category: 'Whisky', image_url: '/drinks/glenfiddich.jpg', featured: true, available: true },
  { id: 'd8b', name: 'The Glenlivet 12 Year Old', description: 'The definitive Speyside single malt. Bright citrus, honey and creamy oak. 25ml tot.', price: 700, category: 'Whisky', image_url: '/drinks/glenlivet.jpg', available: true, featured: false },
  { id: 'd9', name: 'Laphroaig 10 Year Old', description: 'Islay single malt — intensely peaty and smoky with a briny finish. 25ml tot.', price: 850, category: 'Whisky', image_url: '/drinks/laphroaig.jpg', featured: true, available: true },
  { id: 'd9a', name: 'Lagavulin 16 Year Old', description: 'Rich, deeply peated Islay whisky with dried fruit and a long, smoky finish. 25ml tot.', price: 1100, category: 'Whisky', image_url: '/drinks/lagavulin.jpg', available: true, featured: true },
  { id: 'd10', name: 'Ardbeg 10 Year Old', description: 'A cult Islay single malt — heavily peated with citrus, brine and coastal smoke. 25ml tot.', price: 900, category: 'Whisky', image_url: '/drinks/ardbeg.jpg', featured: true, available: true },
  { id: 'd10a', name: 'Talisker 10 Year Old', description: 'The classic Isle of Skye single malt. Peppery, maritime and full-bodied. 25ml tot.', price: 900, category: 'Whisky', image_url: '/drinks/talisker.jpg', available: true, featured: true },
  { id: 'd10b', name: 'Highland Park 12 Year Old Viking Honour', description: 'Orkney single malt with heather-honey sweetness and a whisper of Highland smoke. 25ml tot.', price: 800, category: 'Whisky', image_url: '/drinks/highland-park.jpg', available: true, featured: false },
  { id: 'd11', name: 'Glenmorangie Original 10 Year Old', description: 'The classic Highland single malt — orange, vanilla and gentle spice. 25ml tot.', price: 700, category: 'Whisky', image_url: '/drinks/glenmorangie.jpg', featured: true, available: true },
  { id: 'd11a', name: 'Nikka From The Barrel', description: 'Award-winning Japanese blend — rich, full-bodied and remarkably complex. 25ml tot.', price: 1000, category: 'Whisky', image_url: '/drinks/nikka.jpg', featured: true, available: true },
  { id: 'd11b', name: 'Monkey Shoulder Blended Malt', description: 'A vatted malt from three Speyside distilleries. Smooth, mellow and made for sipping. 25ml tot.', price: 600, category: 'Whisky', image_url: '/drinks/monkey-shoulder.jpg', available: true, featured: false },
  { id: 'd11c', name: 'Johnnie Walker Black Label 12', description: 'The iconic blended Scotch — rich, smoky and beautifully balanced. 25ml tot.', price: 650, category: 'Whisky', image_url: '/drinks/johnnie-walker.jpg', available: true, featured: false },
  { id: 'd11d', name: 'Chivas Regal 12 Year Old', description: 'Legendary blended Scotch with silky honey, vanilla and ripe apple. Aged 12 years. 25ml tot.', price: 700, category: 'Whisky', image_url: '/drinks/chivas.jpg', featured: true, available: true },
  { id: 'd11e', name: "Jack Daniel's Old No.7", description: 'Iconic Tennessee whiskey — mellow, charcoal-mellowed with sweet caramel and oak. 25ml tot.', price: 650, category: 'Whisky', image_url: '/drinks/jack-daniels.jpg', featured: true, available: true },
  { id: 'd11f', name: 'Jameson Irish Whiskey', description: 'Triple-distilled Irish whiskey — smooth, light and perfectly balanced. 25ml tot.', price: 600, category: 'Whisky', image_url: '/drinks/jameson.jpg', featured: true, available: true },
  { id: 'd11g', name: 'Bulleit Bourbon', description: 'High-rye Kentucky bourbon with bold spice, oak and dark cherry. 25ml tot.', price: 750, category: 'Whisky', image_url: '/drinks/bulleit.jpg', available: true, featured: false },
  { id: 'd11h', name: 'Woodford Reserve Bourbon', description: 'Kentucky Straight bourbon with rich caramel, toasted oak and dried fruit. 25ml tot.', price: 850, category: 'Whisky', image_url: '/drinks/woodford.jpg', featured: true, available: true },
  { id: 'd11i', name: 'Yamazaki 12 Year Old', description: "Japan's celebrated single malt — mizunara oak, honey and delicate fruit. 25ml tot.", price: 1600, category: 'Whisky', image_url: '/drinks/yamazaki.jpg', featured: true, available: true },
  { id: 'd11j', name: 'Bushmills Original Irish Whiskey', description: "The world's oldest licensed distillery — smooth, spicy and creamy. 25ml tot.", price: 550, category: 'Whisky', image_url: '/drinks/bushmills.jpg', available: true, featured: false },
  { id: 'd11k', name: 'Aberlour 12 Year Old', description: 'Speyside single malt matured in sherry and bourbon casks — rich and warming. 25ml tot.', price: 800, category: 'Whisky', image_url: '/drinks/aberlour.jpg', available: true, featured: false },
  { id: 'd11l', name: "Dewar's White Label", description: 'Classic double-aged blended Scotch — smooth, honeyed and endlessly versatile. 25ml tot.', price: 550, category: 'Whisky', image_url: '/drinks/dewars.jpg', available: true, featured: false },
  { id: 'd11m', name: 'Hibiki Japanese Harmony', description: "Suntory's masterful blend of Japanese malts and grains — elegant, refined, unforgettable. 25ml tot.", price: 1800, category: 'Whisky', image_url: '/drinks/hibiki.jpg', featured: true, available: true },

  // Spirits
  { id: 'd12', name: 'Kenya Cane', description: 'Locally distilled Kenyan cane spirit, best served over ice with lime. 25ml.', price: 250, category: 'Spirits', image_url: '/drinks/kenya-cane.jpg', available: true, featured: false },
  { id: 'd13', name: 'Bacardi Superior White Rum', description: 'Light-bodied white rum, perfect for cocktails or on the rocks. 25ml tot.', price: 450, category: 'Spirits', image_url: '/drinks/bacardi.jpg', featured: true, available: true },
  { id: 'd14', name: 'Captain Morgan Spiced Rum', description: 'Caribbean spiced rum with vanilla, warmth and gentle spice. 25ml tot.', price: 500, category: 'Spirits', image_url: '/drinks/captain-morgan.jpg', available: true, featured: false },
  { id: 'd15', name: 'Smirnoff Red Label Vodka', description: 'Triple-distilled Russian-style vodka. Clean and versatile. 25ml tot.', price: 400, category: 'Spirits', image_url: '/drinks/smirnoff.jpg', available: true, featured: false },
  { id: 'd16', name: 'Absolut Vodka', description: 'Premium Swedish vodka — pure, smooth and clean. 25ml tot.', price: 500, category: 'Spirits', image_url: '/drinks/absolut.jpg', featured: true, available: true },
  { id: 'd17', name: "Gordon's London Dry Gin", description: "The world's best-selling London dry gin. Botanical, crisp, classic. 25ml tot.", price: 450, category: 'Spirits', image_url: '/drinks/gordons.jpg', available: true, featured: false },
  { id: 'd18', name: 'Bombay Sapphire Gin', description: 'Premium London dry gin with 10 hand-selected botanicals. 25ml tot.', price: 550, category: 'Spirits', image_url: '/drinks/bombay.jpg', featured: true, available: true },
  { id: 'd19', name: 'Jose Cuervo Especial Tequila', description: 'Gold tequila with agave sweetness and a smooth finish. 25ml tot.', price: 550, category: 'Spirits', image_url: '/drinks/cuervo.jpg', available: true, featured: false },

  // Champagne & Wine
  { id: 'd20', name: 'Moet & Chandon Brut', description: 'Iconic French champagne, elegant and celebratory. 750ml bottle.', price: 12000, category: 'Champagne & Wine', image_url: '/drinks/moet.jpg', featured: true, available: true },
  { id: 'd21', name: 'House Red Wine', description: 'A crisp, medium-bodied South African merlot. Glass or bottle.', price: 550, category: 'Champagne & Wine', image_url: '/drinks/red-wine.jpg', available: true, featured: false },
  { id: 'd22', name: 'House White Wine', description: 'Chilled Sauvignon Blanc with citrus and green apple notes. Glass or bottle.', price: 550, category: 'Champagne & Wine', image_url: '/drinks/white-wine.jpg', featured: true, available: true },
  { id: 'd23', name: 'Four Cousins Sweet Rose', description: 'South African sweet rose — fruity, easy-drinking, always a favourite. 750ml.', price: 1800, category: 'Champagne & Wine', image_url: '/drinks/rose-wine.jpg', available: true, featured: false },

  // Sodas
  { id: 'd24', name: 'Coca-Cola', description: 'The classic Coca-Cola — chilled and served over ice. 300ml bottle.', price: 150, category: 'Sodas', image_url: '/drinks/coke.jpg', featured: true, available: true },
  { id: 'd25', name: 'Coca-Cola Zero Sugar', description: 'All the Coca-Cola taste, none of the sugar. 300ml bottle.', price: 150, category: 'Sodas', image_url: '/drinks/coke-zero.jpg', available: true, featured: false },
  { id: 'd26', name: 'Sprite', description: 'Crisp lemon-lime soda. 300ml chilled bottle.', price: 150, category: 'Sodas', image_url: '/drinks/sprite.jpg', available: true, featured: false },
  { id: 'd27', name: 'Fanta Orange', description: 'Bright and fizzy orange soda. 300ml chilled bottle.', price: 150, category: 'Sodas', image_url: '/drinks/fanta.jpg', featured: true, available: true },
  { id: 'd28', name: 'Fanta Blackcurrant', description: 'A Kenyan favourite — sweet blackcurrant fizz. 300ml chilled bottle.', price: 150, category: 'Sodas', image_url: '/drinks/fanta-blackcurrant.jpg', available: true, featured: false },
  { id: 'd29', name: 'Stoney Tangawizi', description: "Kenya's fiery ginger soda — bold and unforgettable. 300ml bottle.", price: 150, category: 'Sodas', image_url: '/drinks/stoney.jpg', featured: true, available: true },
  { id: 'd30', name: 'Krest Bitter Lemon', description: 'Sharp, refreshing bitter lemon tonic. 300ml bottle.', price: 180, category: 'Sodas', image_url: '/drinks/krest.jpg', available: true, featured: false },
  { id: 'd31', name: 'Schweppes Tonic Water', description: 'Classic Schweppes tonic — the perfect gin partner. 200ml bottle.', price: 200, category: 'Sodas', image_url: '/drinks/tonic.jpg', available: true, featured: false },

  // Water
  { id: 'd32', name: 'Dasani Still Water', description: 'Purified still mineral water. 500ml bottle.', price: 100, category: 'Water', image_url: '/drinks/water-still.jpg', featured: true, available: true },
  { id: 'd33', name: 'Keringet Mineral Water', description: 'Kenyan spring mineral water from the Mau Escarpment. 500ml bottle.', price: 150, category: 'Water', image_url: '/drinks/keringet.jpg', available: true, featured: false },
  { id: 'd34', name: 'Aquamist Still Water', description: 'Locally-bottled still water — crisp and pure. 1L bottle.', price: 200, category: 'Water', image_url: '/drinks/aquamist.jpg', available: true, featured: false },
  { id: 'd35', name: 'Perrier Sparkling Water', description: 'French naturally sparkling mineral water. 330ml green bottle.', price: 350, category: 'Water', image_url: '/drinks/perrier.jpg', featured: true, available: true },
  { id: 'd36', name: 'San Pellegrino Sparkling', description: 'Italian sparkling mineral water with fine bubbles. 500ml bottle.', price: 400, category: 'Water', image_url: '/drinks/pellegrino.jpg', available: true, featured: false },
]

export async function fetchDrinksWithFallback(featuredOnly = false): Promise<FallbackDrink[]> {
  try {
    const res = await fetch(featuredOnly ? '/api/drinks?featured=1' : '/api/drinks')
    if (!res.ok) throw new Error('API not ok')
    const data = await res.json()
    if (Array.isArray(data)) return data as FallbackDrink[]
    return featuredOnly ? FALLBACK_DRINKS.filter(d => d.featured) : FALLBACK_DRINKS
  } catch {
    return featuredOnly ? FALLBACK_DRINKS.filter(d => d.featured) : FALLBACK_DRINKS
  }
}
