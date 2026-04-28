import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// Vitest reuses the Vite plugin chain (React fast-refresh, JSX) so the
// same files compile identically in test and prod. jsdom env handles the
// few DOM-touching helpers (safeRedirect parses URLs).
//
// Tests live next to the code they exercise:
//   src/lib/foo.test.js   — pure-function tests
//   src/components/Foo.test.jsx — component tests with @testing-library
//
// Critical-path-first: anything that handles auth, security, or money
// gets a test before "make it pretty" code.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./test/setup.js'],
      include: ['src/**/*.{test,spec}.{js,jsx}'],
      coverage: {
        reporter: ['text', 'html'],
        include: ['src/lib/**/*.js', 'src/components/**/*.{js,jsx}'],
        exclude: ['src/**/*.{test,spec}.{js,jsx}'],
      },
    },
  }),
)
