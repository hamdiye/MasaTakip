import { create } from 'zustand'

/**
 * Resolves the API base URL depending on the runtime environment.
 * - VITE_API_URL env var → used in Docker / explicit deployments
 * - Empty string        → Vite dev proxy forwards /api/* to the backend
 * - window.location.origin → Electron / self-hosted production build
 */
const BASE_URL = import.meta.env.VITE_API_URL
  ?? (import.meta.env.DEV ? '' : window.location.origin)

/**
 * Safely retrieves and parses the stored authentication user data.
 * Checks if the JWT token expiration date is still valid.
 * @returns {Object|null} User data object if valid, otherwise null.
 */
const getInitialUser = () => {
  try {
    const stored = localStorage.getItem('masatakip_auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Check if token is expired
      if (new Date(parsed.gecerlilikTarihi) > new Date()) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Auth initialization error:', err)
  }
  return null
}

const useAuthStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
  user: getInitialUser(), // { id, isim, rol, token, gecerlilikTarihi }
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
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
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
