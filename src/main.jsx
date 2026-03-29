import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// ── Inicializar dark mode ANTES del render ──
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

// ── Manejo de errores de despliegue (ChunkLoadError) ──
window.addEventListener('error', (e) => {
  if (e.message?.includes('Failed to fetch dynamically imported module')) {
    window.location.reload()
  }
})
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('Failed to fetch dynamically imported module')) {
    window.location.reload()
  }
})

import { useOnlineStatus } from './hooks/useOnlineStatus'

function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-xs 
      font-bold text-center py-1.5 text-white">
      📡 Sin conexión — mostrando datos guardados
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OfflineBanner />
    <App />
  </StrictMode>
)