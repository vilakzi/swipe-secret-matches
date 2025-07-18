
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true, // Force complete dependency re-bundling
  },
  define: {
    'process.env': {},
  },
  build: {
    rollupOptions: {},
  },
  // Force complete cache clearing
  clearScreen: false,
  cacheDir: '.vite-clean', // Use a different cache directory to force rebuild
}));
