// Single source for Le Grande Haven's contact details and links.
// WhatsApp and tel: links need the international format (Kenya +254, no leading 0).
export const PHONE_DISPLAY = '0182 219 969'
export const PHONE_TEL = 'tel:+254182219969'
export const EMAIL = 'legrandehavenltd@gmail.com'

export const whatsappLink = (message = 'Hello Le Grande Haven') =>
  `https://wa.me/254182219969?text=${encodeURIComponent(message)}`

export const MAPS_URL = 'https://www.google.com/maps/place/Le+Grande+Haven,+Shimoni/@-4.5359358,39.3757662,17z/'
export const MAPS_DIRECTIONS = 'https://www.google.com/maps/dir/?api=1&destination=-4.5359358,39.3757662'
export const MAPS_EMBED = 'https://maps.google.com/maps?q=Le+Grande+Haven+Shimoni&ll=-4.5359358,39.3757662&t=&z=17&ie=UTF8&iwloc=B&output=embed'

export const SOCIALS = {
  instagram: 'https://www.instagram.com/legrandehaven?stkn=ZnZ6ZTZjMTIwNWZp&utm_source=ig_contact_invite',
  facebook: 'https://www.facebook.com/share/18zG2jozwq/?mibextid=wwXIfr',
  tiktok: 'https://www.tiktok.com/@legrazzt157?_r=1&_t=ZS-99az9KxQn0n',
} as const

// Restaurant opening hours (Africa/Nairobi), used for the live "open now" badge
export const RESTAURANT_HOURS = { open: 7, close: 23 }

export function isRestaurantOpen(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Africa/Nairobi' }).format(now))
  return hour >= RESTAURANT_HOURS.open && hour < RESTAURANT_HOURS.close
}
