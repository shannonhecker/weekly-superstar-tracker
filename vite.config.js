import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Manual chunk splitting — keeps the main app bundle small by isolating
// large vendor libs into their own files. Browsers long-cache vendor
// chunks (they change rarely) while the app bundle (churns per deploy)
// stays under ~80 KB gzip.
//
// Match by id-substring rather than exact module name so we catch
// transitive imports. Order matters — first match wins.
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Firebase SDK is the largest dep — ~250 KB raw / ~70 KB gzip.
            // Splits across firebase/auth, firebase/firestore, etc.
            if (id.includes('/firebase/') || id.includes('@firebase/')) {
              return 'vendor-firebase'
            }
            // React + react-dom + react-router pinned together — always
            // loaded together and version-bump together.
            if (
              id.includes('react/') ||
              id.includes('react-dom/') ||
              id.includes('react-router-dom/') ||
              id.includes('react-router/') ||
              id.includes('scheduler/') ||
              id.includes('@remix-run/')
            ) {
              return 'vendor-react'
            }
            // Confetti only fires on celebrations — isolated so the main
            // bundle stays tighter. Could lazy-import later.
            if (id.includes('canvas-confetti')) {
              return 'vendor-confetti'
            }
            // QR code only used in PrintSheet — split so other routes
            // don't pay for it.
            if (id.includes('react-qr-code') || id.includes('qrcode')) {
              return 'vendor-qr'
            }
            return 'vendor-misc'
          }
        },
      },
    },
  },
})
