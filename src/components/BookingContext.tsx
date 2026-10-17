import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchRoomsWithFallback, onRoomsChanged, type BookedRange } from '../lib/roomsData'

// The modals are only downloaded the first time a visitor opens one
const BookingModal = lazy(() => import('./BookingModal'))
const ReservationModal = lazy(() => import('./ReservationModal'))

type Room = { id: string; name: string; price_per_night: number; guests: number; available: boolean; booked?: BookedRange[] }
type Ctx = { openBooking: (roomId?: string) => void; openReservation: () => void }
const BC = createContext<Ctx>({ openBooking: () => {}, openReservation: () => {} })

export function BookingProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bOpen, setBOpen] = useState(false)
  const [rOpen, setROpen] = useState(false)
  const [preselect, setPreselect] = useState<string | undefined>()
  const [bUsed, setBUsed] = useState(false)
  const [rUsed, setRUsed] = useState(false)

  useEffect(() => {
    const load = () => fetchRoomsWithFallback().then(d => setRooms(d.map(r => ({ id: r.id, name: r.name, price_per_night: r.price_per_night, guests: r.guests, available: r.available, booked: r.booked }))))
    load()
    return onRoomsChanged(load)
  }, [])

  const openBooking = useCallback((roomId?: string) => { setPreselect(roomId); setBOpen(true); setBUsed(true) }, [])
  const openReservation = useCallback(() => { setROpen(true); setRUsed(true) }, [])

  return (
    <BC.Provider value={{ openBooking, openReservation }}>
      {children}
      <Suspense fallback={null}>
        {bUsed && <BookingModal open={bOpen} onClose={() => setBOpen(false)} rooms={rooms} preselectedRoomId={preselect} />}
        {rUsed && <ReservationModal open={rOpen} onClose={() => setROpen(false)} />}
      </Suspense>
    </BC.Provider>
  )
}

export const useBooking = () => useContext(BC)
