import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          vendor: ['react', 'react-dom'],
          // UI libraries
          ui: ['framer-motion', 'react-icons'],
          // Chart libraries
          charts: ['chart.js', 'react-chartjs-2'],
          // Utility libraries
          utils: ['axios', 'react-toastify', 'zxcvbn'],
          // Router
          router: ['react-router-dom']
        }
      }
    },
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: false,
    // Minify with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3001 // Changed to 3001 to avoid conflicts
  }
})
