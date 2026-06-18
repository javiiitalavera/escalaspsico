import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'favicon-32.png', 'favicon-16.png', 'robots.txt'],
      manifest: {
        name: 'NeuroGeri Calc',
        short_name: 'NeuroGeri',
        description: 'Escalas clínicas psicogeriatría',
        theme_color: '#3a7abf',
        background_color: '#fdf8f0',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Cache de assets estáticos para offline real.
        // Incluye woff2 (fuentes @fontsource self-hosted).
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,ttf}'],
        // Las fuentes pesan, aumentar límite (default 2MB)
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: { '@': '/src' },
  },
});
