import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/js', import.meta.url)),
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  test: {
    // root above scopes Vite's dev/build to src/, so include is relative to src/ too.
    environment: 'jsdom',
    include: ['**/*.test.js'],
  },
})
