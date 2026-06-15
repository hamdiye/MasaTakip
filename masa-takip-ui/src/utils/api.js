import useAuthStore from '../store/useAuthStore'

const BASE_URL = 'http://localhost:5115'

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

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle auto logout on 401 Unauthorized
  if (response.status === 401) {
    useAuthStore.getState().logout()
    window.location.href = '/login'
    throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.')
  }

  const result = await response.json()
  return result
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
