import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteApiPlugin } from './vite-api-plugin';

export default defineConfig(({ mode }) => {
  // .env.local dan GEMINI_API_KEY va boshqa o'zgaruvchilarni yuklash
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
  plugins: [
    viteApiPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'logo-light.png'],
      manifest: {
        name: 'PaketShop.uz Online Do\'kon',
        short_name: 'PaketShop',
        description: 'O\'zbekistondagi eng yaxshi online do\'kon - sifatli mahsulotlar, tez yetkazib berish',
        theme_color: '#DC2626',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/logo-light.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-light.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/logo-light.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 kun
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 yil
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-charts': ['recharts'],
        }
      }
    }
  }
};
});