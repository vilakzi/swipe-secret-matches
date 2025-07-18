
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
    exclude: ['@radix-ui/react-tooltip'], // Explicitly exclude the problematic package
    force: true, // Force dependency re-bundling
  },
  define: {
    'process.env': {},
  },
  build: {
    rollupOptions: {
      external: ['@radix-ui/react-tooltip'], // Ensure it's not bundled
    },
  },
  // Clear all caches
  clearScreen: false,
}));
