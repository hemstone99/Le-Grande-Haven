import { Beer, Citrus, Coffee, CupSoda, Droplets, GlassWater, Martini, Wine } from 'lucide-react'
import MenuPage, { type MenuConfig, type MenuItem } from '../components/MenuPage'
import { fetchDrinksWithFallback, DRINK_CATEGORIES } from '../lib/drinksData'

const config: MenuConfig = {
  kind: 'drinks',
  load: () => fetchDrinksWithFallback() as Promise<MenuItem[]>,
  eyebrow: 'The Bar',
  title: <>Raise a glass,<br /><em className="text-sand">coastal style.</em></>,
  intro: 'Fresh tropical juices, spiced Kenyan teas, ice-cold Tusker and a whisky shelf worth the trip — whatever the moment, we’ve poured for it.',
  heroImages: ['/hero/hero-whiskies.jpg', '/drinks/tusker.jpg', '/drinks/moet.jpg'],
  unit: 'drinks',
  categoryOrder: DRINK_CATEGORIES,
  categoryIcons: { 'Fresh Juices': Citrus, 'Hot Beverages': Coffee, Beers: Beer, Whisky: GlassWater, Spirits: Martini, 'Champagne & Wine': Wine, Sodas: CupSoda, Water: Droplets },
  fallbackIcon: Wine,
  featuredLabel: 'Signature',
  featuredTitle: 'Poured with pride.',
  searchPlaceholder: 'Search drinks…',
  whatsappMessage: 'Hello Le Grande Haven, I’d like to ask about the drinks menu.',
  ctaTitle: <>Sundowners <em className="text-sand">on the lawn?</em></>,
  ctaText: 'Join us at the bar from morning coffee to last orders at 11pm — or reserve a table for your group.',
  notice: 'Not for sale to persons under the age of 18 · Please drink responsibly',
}

export default function DrinksPage() {
  return <MenuPage config={config} />
}
