import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Se actualiza sola cuando subís cambios
      includeAssets: ['favicon.png', 'Mango.png'], // Los íconos que ya tenés en public/
      manifest: {
        name: 'Manguito - Finanzas Personales',
        short_name: 'Manguito',
        description: 'Tu asistente financiero y control de gastos en el bolsillo.',
        theme_color: '#f59e0b', // El color ámbar/mango que venís usando
        background_color: '#fafafa', // Color de fondo al cargar
        display: 'standalone', // Esto oculta la barra del navegador
        icons: [
          {
            src: 'Mango.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'Mango.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Para que se adapte bien en Android
          }
        ]
      }
    })
  ],
})