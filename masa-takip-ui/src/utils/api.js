import useAuthStore from '../store/useAuthStore'

/**
 * Resolves the API base URL depending on the runtime environment.
 * - VITE_API_URL env var → used in Docker / explicit deployments
 * - Empty string        → Vite dev proxy forwards /api/* to the backend
 * - window.location.origin → Electron / self-hosted production build
 */
const BASE_URL = import.meta.env.VITE_API_URL
  ?? (import.meta.env.DEV ? '' : window.location.origin)

/**
 * Helper to fetch data from the backend API.
 * Automatically appends the JWT bearer token and handles unauthorized responses.
 */
async function apiRequest(endpoint, options = {}) {
  const state = useAuthStore.getState()
  const token = state.user?.token

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    // Network hatası: Sunucu kapalı, internet yok vs.
    alert('Sunucuyla bağlantı kesildi! Lütfen Ana Bilgisayarın (Kasa) açık olduğundan emin olun.');
    return { basarili: false, mesaj: 'Sunucuya bağlanılamadı.' };
  }

  // Handle auto logout on 401 Unauthorized
  if (response.status === 401) {
    useAuthStore.getState().logout()
    window.location.href = '/login'
    throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.')
  }

  // Handle 403 Forbidden — return a structured error instead of crashing on empty body
  if (response.status === 403) {
    return { basarili: false, mesaj: 'Bu işlem için yetkiniz bulunmamaktadır.' }
  }

  // Safely parse JSON — some error responses may have an empty body
  const text = await response.text()
  if (!text) {
    return { basarili: false, mesaj: 'Sunucudan boş yanıt geldi.' }
  }

  try {
    return JSON.parse(text)
  } catch {
    return { basarili: false, mesaj: 'Sunucu yanıtı okunamadı.' }
  }
}

export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: (endpoint, body) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
}
