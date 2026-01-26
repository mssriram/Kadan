import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite configuration for Kadan Frontend.
 * - Enables React Fast Refresh
 * - Sets up path aliases (@/ -> src/)
 * - Configures dev server port
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    open: true,
  },
});
