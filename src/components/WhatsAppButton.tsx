import { MessageCircle } from 'lucide-react'
export default function WhatsAppButton() {
  return (
    <a href="https://wa.me/254700000000?text=Hello%20Le%20Grande%20Haven%2C%20I%27d%20like%20to%20make%20a%20booking" target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-2xl hover:scale-110 transition-transform" aria-label="WhatsApp">
      <MessageCircle className="w-6 h-6" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
    </a>
  )
}
