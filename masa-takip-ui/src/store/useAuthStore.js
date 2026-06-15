import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
  user: null, // { id, isim, rol, token, gecerlilikTarihi }
  isLoading: false,
  error: null,

  // ─── Actions ────────────────────────────────────────────────────────────────

  /**
   * Initializes the authentication state from localStorage.
   */
  initialize: () => {
    try {
      const stored = localStorage.getItem('masatakip_auth')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Check if token is expired
        if (new Date(parsed.gecerlilikTarihi) > new Date()) {
          set({ user: parsed, error: null })
        } else {
          // Token expired
          get().logout()
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
      get().logout()
    }
  },

  /**
   * Performs user login using a 4-digit PIN code and user ID.
   * @param {string} pinCode - 4-digit PIN code
   * @param {number} kullaniciId - Selected user ID
   * @returns {Promise<boolean>} True if login is successful, false otherwise
   */
  login: async (pinCode, kullaniciId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('http://localhost:5115/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode, kullaniciId }),
      })

      const result = await response.json()

      if (response.ok && result.basarili) {
        const userData = result.data // { token, id, isim, rol, gecerlilikTarihi }
        localStorage.setItem('masatakip_auth', JSON.stringify(userData))
        set({ user: userData, isLoading: false, error: null })
        return true
      } else {
        set({ error: result.mesaj || 'Giriş başarısız.', isLoading: false })
        return false
      }
    } catch (err) {
      set({ error: 'Sunucuya bağlanılamadı.', isLoading: false })
      return false
    }
  },

  /**
   * Performs user logout by clearing the state and localStorage.
   */
  logout: () => {
    localStorage.removeItem('masatakip_auth')
    set({ user: null, error: null })
  },
}))

export default useAuthStore
