/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';

// Configuración separada de la app: Vitest necesita test environment jsdom
// y no debe intentar registrar el SW.
export default defineConfig({
  plugins: [
    react(),
    // PWA desactivado en tests para evitar side-effects al importar
    process.env.NODE_ENV === 'test' ? null : VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: { '@': '/src', '~': resolve(__dirname, 'src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/scales/**/*.ts', 'src/scales/**/*.tsx', 'src/utils/**/*.ts'],
      exclude: ['src/scales/**/*.test.*', 'src/scales/registry.ts'],
    },
  },
});
