import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Raise the chunk size warning threshold (lazy chunks are expected to be larger)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunk splitting: vendor libraries in a separate long-cached chunk
        manualChunks: {
          // React core — changes very rarely, long browser cache lifetime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Icon library — separate chunk since it's large
          'vendor-icons': ['lucide-react']
        },
      },
    },
  },
});
