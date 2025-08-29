import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  define: {
    // Define environment variables for production builds
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://campusassist.kginnovate.com/api'),
  },
})
