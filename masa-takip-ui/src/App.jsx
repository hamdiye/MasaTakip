import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import MasalarPage    from './pages/MasalarPage'
import MasaDetayPage  from './pages/MasaDetayPage'
import MenuYonetimPage from './pages/MenuYonetimPage'
import RaporPage      from './pages/RaporPage'
import LoginPage      from './pages/LoginPage'
import useAuthStore   from './store/useAuthStore'

/**
 * Layout wrapped with authentication protection.
 */
function ProtectedLayout() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Top navbar (desktop) */}
      <Navbar />

      {/* Page content */}
      <main
        className="flex flex-col flex-1 min-h-0 overflow-hidden"
        style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
        <Routes>
          <Route path="/"          element={<MasalarPage />}     />
          <Route path="/masa/:id"  element={<MasaDetayPage />}   />
          <Route path="/menu"      element={<MenuYonetimPage />}  />
          <Route path="/rapor"     element={<RaporPage />}        />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

/**
 * Root application component with routing and layout.
 */
export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*"     element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
