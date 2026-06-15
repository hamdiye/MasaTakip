import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UtensilsCrossed, Delete, RefreshCw, AlertCircle, ArrowLeft, User } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

/**
 * Premium POS-style PIN login page.
 * Step 1: Select a user from the active users list.
 * Step 2: Enter the 4-digit PIN for the selected user.
 */
export default function LoginPage() {
  const [usersList, setUsersList] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [pin, setPin] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usersError, setUsersError] = useState(null)

  const navigate = useNavigate()
  const { login, isLoading: loggingIn, error: loginError, user: loggedUser } = useAuthStore()

  // Redirect to home if already logged in
  useEffect(() => {
    if (loggedUser) {
      navigate('/')
    }
  }, [loggedUser, navigate])

  // Fetch active users list on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true)
      setUsersError(null)
      try {
        const response = await fetch('http://localhost:5115/api/auth/users')
        const result = await response.json()
        if (response.ok && result.basarili) {
          setUsersList(result.data)
        } else {
          setUsersError(result.mesaj || 'Kullanıcı listesi alınamadı.')
        }
      } catch (err) {
        setUsersError('Sunucuya bağlanılamadı. Lütfen API sunucunuzun açık olduğundan emin olun.')
      } finally {
        setLoadingUsers(false)
      }
    }
    fetchUsers()
  }, [])

  // Process PIN submission when length reaches 4
  useEffect(() => {
    if (pin.length === 4 && selectedUser) {
      const performLogin = async () => {
        // Send both pin code and selected user id to backend
        const success = await login(pin, selectedUser.id)
        if (success) {
          navigate('/')
        } else {
          setPin('') // clear on error
        }
      }
      performLogin()
    }
  }, [pin, selectedUser, login, navigate])

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedUser || loggingIn) return

      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 4) {
          setPin((prev) => prev + e.key)
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1))
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        setPin('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pin, selectedUser, loggingIn])

  const handleNumberClick = (num) => {
    if (loggingIn || pin.length >= 4) return
    setPin((prev) => prev + num)
  }

  const handleDeleteClick = () => {
    if (loggingIn) return
    setPin((prev) => prev.slice(0, -1))
  }

  const handleClearClick = () => {
    if (loggingIn) return
    setPin('')
  }

  const handleBackToUsers = () => {
    if (loggingIn) return
    setSelectedUser(null)
    setPin('')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 py-8 bg-[#0d0d1a]">
      {/* ─── Logo and Brand (Sticky Header) ────────────────────── */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <UtensilsCrossed size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Masa<span className="text-orange-400">Takip</span>
        </h1>
      </div>

      {/* ─── Step 1: User Selection Screen ─────────────────────── */}
      {!selectedUser ? (
        <div className="w-full max-w-lg glass rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center">
            <h2 className="text-lg font-extrabold text-white">Personel Girişi</h2>
            <p className="text-xs text-slate-400 mt-1">Giriş yapmak için adınızı seçiniz</p>
          </div>

          <div className="w-full mt-2 min-h-[160px] flex items-center justify-center">
            {loadingUsers ? (
              <div className="flex flex-col items-center gap-2 text-xs font-bold text-orange-400">
                <RefreshCw size={20} className="animate-spin" />
                Personel listesi yükleniyor...
              </div>
            ) : usersError ? (
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-xs font-semibold text-red-400">{usersError}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn btn-ghost text-xs px-4 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : usersList.length === 0 ? (
              <div className="text-slate-500 text-xs font-medium">Aktif personel bulunamadı.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                {usersList.map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => setSelectedUser(usr)}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl glass border border-white/5 hover:border-orange-500/30 hover:bg-white/10 transition-all duration-200 cursor-pointer active:scale-95 group text-center"
                  >
                    {/* User Initials Circle */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center text-lg font-black text-slate-300 group-hover:from-orange-500/20 group-hover:to-orange-400/20 group-hover:border-orange-500/40 group-hover:text-orange-400 transition-all">
                      {usr.isim.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                        {usr.isim}
                      </div>
                      <div className={`text-[9px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-md inline-block ${
                        usr.rol === 'Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {usr.rol}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─── Step 2: PIN Input Pad Screen ─────────────────────── */
        <div className="w-full max-w-sm glass rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl border border-white/5 relative overflow-hidden animate-scale-in">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header & Back Button */}
          <div className="flex items-center w-full relative">
            <button
              onClick={handleBackToUsers}
              disabled={loggingIn}
              className="absolute left-0 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-150 cursor-pointer disabled:opacity-40"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="text-center w-full px-8">
              <h2 className="text-base font-extrabold text-white truncate">{selectedUser.isim}</h2>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-0.5 inline-block ${
                selectedUser.rol === 'Admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-orange-500/10 text-orange-400'
              }`}>
                {selectedUser.rol}
              </span>
            </div>
          </div>

          {/* PIN Dots */}
          <div className="flex justify-center gap-4 py-2">
            {[0, 1, 2, 3].map((index) => {
              const hasValue = pin.length > index
              return (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                    hasValue
                      ? 'bg-orange-500 scale-110 shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                      : 'bg-white/10 border border-white/5 scale-100'
                  }`}
                />
              )
            })}
          </div>

          {/* Messages */}
          <div className="h-6 flex items-center justify-center">
            {loggingIn ? (
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                <RefreshCw size={14} className="animate-spin" />
                Giriş yapılıyor...
              </div>
            ) : loginError ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 animate-shake">
                <AlertCircle size={14} />
                {loginError}
              </div>
            ) : null}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={loggingIn}
                className="h-14 rounded-2xl text-xl font-bold text-white hover:bg-white/10 active:bg-white/5 bg-white/5 border border-white/5 transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40"
              >
                {num}
              </button>
            ))}

            {/* Clear */}
            <button
              onClick={handleClearClick}
              disabled={loggingIn}
              className="h-14 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 bg-white/5 border border-white/5 transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40"
            >
              C
            </button>

            {/* Zero */}
            <button
              onClick={() => handleNumberClick(0)}
              disabled={loggingIn}
              className="h-14 rounded-2xl text-xl font-bold text-white hover:bg-white/10 active:bg-white/5 bg-white/5 border border-white/5 transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40"
            >
              0
            </button>

            {/* Delete */}
            <button
              onClick={handleDeleteClick}
              disabled={loggingIn}
              className="h-14 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 bg-white/5 border border-white/5 transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40"
            >
              <Delete size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
