import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import useMasaStore from './store/useMasaStore.js'

// SignalR bağlantısını uygulama başlarken kur.
// Tüm cihazlarda anlık veri senkronizasyonu bu satırla başlar.
useMasaStore.getState().initSignalR()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

