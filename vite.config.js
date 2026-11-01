import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this repo at https://rishabhguha.github.io/portfolio_v2/,
// so production asset URLs need that prefix. Dev stays at the root.
const PAGES_BASE = '/portfolio_v2/'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  publicDir: 'static',
  base: command === 'build' ? PAGES_BASE : '/',
  server: {
    open: '/index-react.html',
  },
  build: {
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL('./index-react.html', import.meta.url)),
      },
    },
  },
}))
