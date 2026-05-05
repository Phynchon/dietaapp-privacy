import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isNoCacheMode = mode === 'nocache'
  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
  }

  return {
    plugins: [react()],
    server: {
      port: 4173,
      strictPort: true,
      host: true,
      open: true,
      cors: true,
      headers: isNoCacheMode ? noCacheHeaders : undefined,
    },
    preview: {
      port: 4174,
      strictPort: false,
      host: true,
      open: true,
      headers: isNoCacheMode ? noCacheHeaders : undefined,
    },
  }
})
