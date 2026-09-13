import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import BookingModal from './BookingModal'
import ReservationModal from './ReservationModal'
import { fetchRoomsWithFallback } from '../lib/roomsData'

type Room = { id: string; name: string; price_per_night: number; guests: number }
type Ctx = { openBooking: (roomId?: string) => void; openReservation: () => void }
const BC = createContext<Ctx>({ openBooking: () => {}, openReservation: () => {} })

export function BookingProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bOpen, setBOpen] = useState(false)
  const [rOpen, setROpen] = useState(false)
  const [preselect, setPreselect] = useState<string | undefined>()

  useEffect(() => {
    fetchRoomsWithFallback().then(d => setRooms(d.map(r => ({ id: r.id, name: r.name, price_per_night: r.price_per_night, guests: r.guests }))))
  }, [])

  const openBooking = useCallback((roomId?: string) => { setPreselect(roomId); setBOpen(true) }, [])
  const openReservation = useCallback(() => setROpen(true), [])

  return (
    <BC.Provider value={{ openBooking, openReservation }}>
      {children}
      <BookingModal open={bOpen} onClose={() => setBOpen(false)} rooms={rooms} preselectedRoomId={preselect} />
      <ReservationModal open={rOpen} onClose={() => setROpen(false)} />
    </BC.Provider>
  )
}

export const useBooking = () => useContext(BC)
