
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
    exclude: ['@radix-ui/react-tooltip'], // Explicitly exclude tooltip
    force: true, // Force complete dependency re-bundling
  },
  define: {
    'process.env': {},
  },
  build: {
    rollupOptions: {
      external: ['@radix-ui/react-tooltip'] // Exclude from build
    },
  },
  // Force complete cache clearing and rebuild
  clearScreen: false,
  cacheDir: '.vite-cache-clean-' + Date.now(), // Use timestamped cache dir to force complete rebuild
}));
