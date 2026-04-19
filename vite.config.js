import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    strictPort: true,
    host: true,
    open: true,
    cors: true,
  },
  preview: {
    port: 4174,
    strictPort: false,
    host: true,
    open: true,
  },

})
