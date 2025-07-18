
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
    exclude: [
      '@radix-ui/react-tooltip', 
      '@radix-ui/react-toast',
      'sonner' // Also exclude sonner as it might use tooltips
    ],
    force: true, 
  },
  define: {
    'process.env': {},
  },
  build: {
    rollupOptions: {
      external: ['@radix-ui/react-tooltip', '@radix-ui/react-toast', 'sonner']
    },
  },
  // NUCLEAR CACHE CLEARING
  clearScreen: false,
  cacheDir: '.vite-nuclear-clean-' + Date.now() + '-' + Math.random().toString(36),
}));
