import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('firebase')) {
            return 'firebase';
          }
          if (id.includes('recharts')) {
            return 'recharts';
          }
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'pdf';
          }
          if (id.includes('xlsx')) {
            return 'xlsx';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          if (id.includes('sonner')) {
            return 'sonner';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
    sourcemap: false,
  },
})
