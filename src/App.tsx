import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { BookingProvider, useBooking } from './components/BookingContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingSocials from './components/FloatingSocials'
import Home from './pages/Home'
import Food from './pages/Food'
import Drinks from './pages/Drinks'
import Rooms from './pages/Rooms'
import RoomDetail from './pages/RoomDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Conference from './pages/Conference'
import Login from './pages/Login'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminRooms from './pages/admin/AdminRooms'
import AdminBookings from './pages/admin/AdminBookings'
import AdminFood from './pages/admin/AdminFood'
import AdminDrinks from './pages/admin/AdminDrinks'
import AdminReservations from './pages/admin/AdminReservations'
import AdminMessages from './pages/admin/AdminMessages'
import AdminStaff from './pages/admin/AdminStaff'
import AdminSettings from './pages/admin/AdminSettings'
import ProtectedRoute from './components/ProtectedRoute'

function Shell() {
  const loc = useLocation()
  const { openBooking, openReservation } = useBooking()
  const isAdmin = loc.pathname.startsWith('/admin') || loc.pathname === '/login'

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) }, [loc.pathname])

  return (
    <>
      {!isAdmin && <Navbar onBookRoom={() => openBooking()} onReserveTable={openReservation} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/food" element={<Food />} />
        <Route path="/drinks" element={<Drinks />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:slug" element={<RoomDetail />} />
        <Route path="/conference" element={<Conference />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="food" element={<AdminFood />} />
          <Route path="drinks" element={<AdminDrinks />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
      {!isAdmin && <><Footer /><FloatingSocials /></>}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BookingProvider>
          <Shell />
        </BookingProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
