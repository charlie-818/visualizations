import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Note: When using 'netlify dev', Netlify Dev handles /api requests automatically
    // Proxy is disabled to let Netlify Dev handle API routing
    // For standalone development with Flask, uncomment the proxy below:
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5001',
    //     changeOrigin: true,
    //   },
    // },
  },
})
