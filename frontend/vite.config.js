import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  envDir: '..',
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'leaflet': ['leaflet', 'react-leaflet'],
          'editor': ['react-quill'],
          'ui-icons': ['lucide-react'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
