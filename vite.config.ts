import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        name: 'Medito',
        short_name: 'Medito',
        description: 'App de meditação guiada com respiração, paisagens sonoras e histórico de sessões.',
        theme_color: '#1e3a5f',
        background_color: '#0b1a2e',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        // Never intercept/cache the YouTube iframe/API or Supabase requests.
        navigateFallbackDenylist: [/^\/youtube/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|ytimg\.com)\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /supabase\.co\//,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
