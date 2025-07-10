import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // --- Add the proxy configuration ---
  server: {
    proxy: {
      // All requests starting with /api will be redirected to the backend
      '/api': {
        target: 'http://localhost:5000', // Your backend server's address
        changeOrigin: true,
        secure: false,
      },
    },
  },
})