import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Docker'da BACKEND_URL=http://backend:5115 set edilir.
// Lokal geliştirmede fallback olarak localhost:5115 kullanılır.
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5115'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Geliştirme modunda /api/* ve /swagger/* isteklerini backend'e yönlendir
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/swagger': {
        target: backendUrl,
        changeOrigin: true,
      },
      // SignalR WebSocket bağlantıları için — ws:true zorunludur
      '/hubs': {
        target: backendUrl,
        changeOrigin: true,
        ws: true,    // WebSocket upgrade isteklerini proxy'den geçir
      },
    },
  },
})


