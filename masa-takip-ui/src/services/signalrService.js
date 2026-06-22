import * as signalR from '@microsoft/signalr'

/**
 * Resolves the SignalR hub URL depending on the runtime environment.
 * - VITE_API_URL env var  → used in Docker / explicit deployments
 * - Empty origin          → Vite dev proxy forwards /hubs/* to the backend
 * - window.location.origin → Electron / self-hosted production build
 */
const HUB_BASE = import.meta.env.VITE_API_URL
  ?? (import.meta.env.DEV ? '' : window.location.origin)

const HUB_URL = `${HUB_BASE}/hubs/masa`

let _connection = null

/**
 * Returns (and lazily creates) the singleton SignalR HubConnection.
 * Uses WebSockets with automatic fallback to Server-Sent Events and Long Polling.
 * Reconnection is attempted automatically with exponential back-off.
 *
 * @returns {signalR.HubConnection}
 */
export function getConnection() {
  if (!_connection) {
    _connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()
  }
  return _connection
}

/**
 * Starts the SignalR connection if it is not already connected.
 * Safe to call multiple times — subsequent calls are no-ops.
 *
 * @returns {Promise<void>}
 */
export async function startConnection() {
  const conn = getConnection()
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    try {
      await conn.start()
      console.info('[SignalR] Bağlantı kuruldu:', HUB_URL)
    } catch (err) {
      console.error('[SignalR] Bağlantı hatası:', err)
    }
  }
}
