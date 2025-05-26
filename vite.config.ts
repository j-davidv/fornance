import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

console.log('Environment variables:', {
  VITE_EXCHANGE_RATE_API_KEY: process.env.VITE_EXCHANGE_RATE_API_KEY
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
}) 