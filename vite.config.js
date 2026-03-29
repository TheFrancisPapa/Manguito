import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/node_modules/**'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/dolarapi\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'cotizaciones-cache',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 10, maxAgeSeconds: 300 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/(query1\.finance\.yahoo\.com|api\.coingecko\.com)\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'precios-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 900 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /supabase\.co/,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: {
        name: 'Manguito',
        short_name: 'Manguito',
        description: 'Gestión inteligente de finanzas personales',
        theme_color: '#F59E0B',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'icons/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'charts': [
            './src/components/charts/GraficoTorta.jsx',
            './src/components/charts/LineaTemporal.jsx',
            './src/components/charts/ResumenBalance.jsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})