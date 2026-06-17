import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
        target: 'http://localhost:5115',
        changeOrigin: true,
      },
      '/swagger': {
        target: 'http://localhost:5115',
        changeOrigin: true,
      },
    },
  },
})

