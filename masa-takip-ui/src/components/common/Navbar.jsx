import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { UtensilsCrossed, LayoutGrid, BookOpen, BarChart2, LogOut, Users } from 'lucide-react'
import clsx from 'clsx'
import useAuthStore from '../../store/useAuthStore'
import Modal from './Modal'

const navItems = [
  { path: '/',             icon: LayoutGrid,      label: 'Masalar'     },
  { path: '/menu',         icon: BookOpen,        label: 'Menü'        },
  { path: '/rapor',        icon: BarChart2,       label: 'Raporlar'    },
  { path: '/kullanicilar', icon: Users,           label: 'Kullanıcılar' },
]

/**
 * Top navigation bar for desktop and bottom tab bar for mobile.
 */
export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  // Filter menu items by role
  const filteredNavItems = navItems.filter((item) => {
    if (item.path === '/rapor' || item.path === '/kullanicilar') {
      return user?.rol === 'Admin'
    }
    return true
  })

  return (
    <>
      {/* ─── Desktop Top Bar ──────────────────────────────────────── */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 glass sticky top-0 z-40 border-b border-white/5">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <UtensilsCrossed size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Masa<span className="text-orange-400">Takip</span>
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {filteredNavItems.map(({ path, icon: Icon, label }) => {
            const isActive = pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* User info & Logout */}
        <div
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass cursor-pointer hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-200"
          title="Çıkış yapmak için tıklayın"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-xs font-bold text-white uppercase">
            {user?.isim?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-xs text-slate-200 font-bold">{user?.isim}</span>
            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{user?.rol}</span>
          </div>
        </div>
      </header>

      {/* ─── Mobile Top Header Bar ────────────────────────────────────────── */}
      <header className="flex md:hidden items-center justify-between px-3.5 py-2.5 sticky top-0 z-40 border-b border-white/10 bg-[#0d0d1a]/95 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-md shadow-orange-500/20">
            <UtensilsCrossed size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            Masa<span className="text-orange-400">Takip</span>
          </span>
        </div>

        {/* User Info & Logout Button */}
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/15 border border-white/15 hover:border-red-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
          title="Çıkış Yap"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-xs font-black text-white uppercase shadow-sm shrink-0">
            {user?.isim?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col items-start text-left leading-tight">
            <span className="text-xs text-white font-extrabold tracking-wide">{user?.isim}</span>
            <span className="text-[9px] text-orange-300 font-bold uppercase tracking-wider">{user?.rol}</span>
          </div>
          <LogOut size={15} className="text-red-400 ml-1 shrink-0" />
        </button>
      </header>

      {/* ─── Mobile Bottom Tab Bar ────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around pb-safe"
        style={{
          background: 'rgba(13,13,26,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
          paddingTop: '0.5rem',
        }}
      >
        {filteredNavItems.map(({ path, icon: Icon, label }) => {
          const isActive = pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 min-w-[56px] transition-all duration-200 active:scale-90"
            >
              <div className={clsx(
                'w-10 h-8 flex items-center justify-center rounded-xl transition-all duration-200',
                isActive ? 'bg-orange-500/20' : 'bg-transparent'
              )}>
                <Icon size={20} className={isActive ? 'text-orange-400' : 'text-slate-500'} />
              </div>
              <span className={clsx(
                'text-[10px] font-semibold tracking-wide',
                isActive ? 'text-orange-400' : 'text-slate-500'
              )}>
                {label}
              </span>
            </button>
          )
        })}

        {/* Mobile Logout Tab Button */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex flex-col items-center gap-0.5 min-w-[56px] transition-all duration-200 active:scale-90"
        >
          <div className="w-10 h-8 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
            <LogOut size={18} className="text-red-400" />
          </div>
          <span className="text-[10px] font-semibold tracking-wide text-red-400">
            Çıkış
          </span>
        </button>
      </nav>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Güvenli Çıkış"
      >
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
            <LogOut size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Oturumu Kapat</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-normal">
              Sistemden çıkış yapmak istediğinize emin misiniz? Tekrar erişmek için PIN kodunuzu girmeniz gerekecektir.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(false)}
              className="btn btn-ghost flex-1 py-2.5 text-xs font-bold"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogoutModalOpen(false)
                logout()
              }}
              className="btn btn-danger flex-1 py-2.5 text-xs font-bold"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
