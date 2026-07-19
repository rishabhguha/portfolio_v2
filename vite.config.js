import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'static',
  server: {
    open: '/index-react.html',
  },
  build: {
    rollupOptions: {
      input: {
        app: '/Users/rishabhguha/Dropbox/Mac/Documents/Threejs/portfolio/index-react.html',
      },
    },
  },
})
