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
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Emot-ID',
        short_name: 'Emot-ID',
        description: 'Identifică-ți emoțiile prin bule interactive',
        theme_color: '#8B5CF6',
        background_color: '#1f2937',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/emot-id/',
        start_url: '/emot-id/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  base: '/emot-id/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion'
          }
          if (id.includes('/src/models/wheel/data.json')) {
            return 'model-wheel-data'
          }
          if (id.includes('/src/models/plutchik/data.json')) {
            return 'model-plutchik-data'
          }
          if (id.includes('/src/models/dimensional/data.json')) {
            return 'model-dimensional-data'
          }
          return undefined
        },
      },
    },
  },
})
