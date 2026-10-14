import { Route, Routes, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { BookingProvider, useBooking } from './components/BookingContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingSocials from './components/FloatingSocials'
import Home from './pages/Home'
import ProtectedRoute from './components/ProtectedRoute'

// Every page except Home is its own chunk, so first-time visitors only
// download what the landing page needs.
const publicPages = {
  Food: () => import('./pages/Food'),
  Drinks: () => import('./pages/Drinks'),
  Rooms: () => import('./pages/Rooms'),
  RoomDetail: () => import('./pages/RoomDetail'),
  About: () => import('./pages/About'),
  Contact: () => import('./pages/Contact'),
  Conference: () => import('./pages/Conference'),
  Gallery: () => import('./pages/Gallery'),
}
const Food = lazy(publicPages.Food)
const Drinks = lazy(publicPages.Drinks)
const Rooms = lazy(publicPages.Rooms)
const RoomDetail = lazy(publicPages.RoomDetail)
const About = lazy(publicPages.About)
const Contact = lazy(publicPages.Contact)
const Conference = lazy(publicPages.Conference)
const Gallery = lazy(publicPages.Gallery)
const Login = lazy(() => import('./pages/Login'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminRooms = lazy(() => import('./pages/admin/AdminRooms'))
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'))
const AdminFood = lazy(() => import('./pages/admin/AdminFood'))
const AdminDrinks = lazy(() => import('./pages/admin/AdminDrinks'))
const AdminReservations = lazy(() => import('./pages/admin/AdminReservations'))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'))
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

// Once the first page has settled, fetch the other public pages in the
// background so navigating to them doesn't wait on the network.
function usePrefetchPublicPages() {
  useEffect(() => {
    const prefetch = () => Object.values(publicPages).forEach(load => { load().catch(() => {}) })
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(prefetch, 2500)
    return () => clearTimeout(id)
  }, [])
}

const PageFallback = () => <div className="min-h-screen bg-cream-50" />

function Shell() {
  const loc = useLocation()
  const { openBooking, openReservation } = useBooking()
  const isAdmin = loc.pathname.startsWith('/admin') || loc.pathname === '/login'

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) }, [loc.pathname])
  usePrefetchPublicPages()

  return (
    <>
      {!isAdmin && <Navbar onBookRoom={() => openBooking()} onReserveTable={openReservation} />}
      <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/food" element={<Food />} />
        <Route path="/drinks" element={<Drinks />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:slug" element={<RoomDetail />} />
        <Route path="/conference" element={<Conference />} />
        <Route path="/gallery" element={<Gallery />} />
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
      </Suspense>
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
