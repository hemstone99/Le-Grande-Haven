import { Beef, Drumstick, EggFried, Fish, IceCreamCone, Salad, Sandwich, Soup, UtensilsCrossed } from 'lucide-react'
import MenuPage, { type MenuConfig, type MenuItem } from '../components/MenuPage'
import { fetchFoodWithFallback } from '../lib/foodData'

const config: MenuConfig = {
  kind: 'food',
  load: () => fetchFoodWithFallback() as Promise<MenuItem[]>,
  eyebrow: 'The Kitchen',
  title: <>Swahili soul,<br /><em className="text-sand">served daily.</em></>,
  intro: 'A menu rooted in Kenyan flavour and coastal produce — from slow breakfasts and fresh seafood to nyama choma straight off the grill.',
  heroImages: ['/food/fish-large.jpg', '/food/mbuzi-choma.jpg', '/food/pilau.jpg'],
  unit: 'dishes',
  categoryOrder: ['Breakfast', 'Kenyan Cuisine', 'Seafood', 'Chicken', 'Beef', 'Snacks', 'Sides', 'Desserts'],
  categoryIcons: { Breakfast: EggFried, 'Kenyan Cuisine': Soup, Seafood: Fish, Chicken: Drumstick, Beef, Snacks: Sandwich, Sides: Salad, Desserts: IceCreamCone },
  fallbackIcon: UtensilsCrossed,
  featuredLabel: 'Chef’s pick',
  featuredTitle: 'Our kitchen’s favourites.',
  searchPlaceholder: 'Search dishes…',
  whatsappMessage: 'Hello Le Grande Haven, I’d like to ask about today’s menu.',
  ctaTitle: <>Hungry yet? <em className="text-sand">Pull up a chair.</em></>,
  ctaText: 'Walk-ins are always welcome — reserve ahead for groups, celebrations and Sunday lunch.',
}

export default function FoodPage() {
  return <MenuPage config={config} />
}
