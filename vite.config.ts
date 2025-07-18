
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
      'sonner',
      'next-themes'
    ],
    force: true, 
  },
  define: {
    'process.env': {},
  },
  build: {
    rollupOptions: {
      external: ['@radix-ui/react-tooltip', '@radix-ui/react-toast', 'sonner', 'next-themes']
    },
  },
  // ULTIMATE CACHE CLEARING - forces complete rebuild
  clearScreen: false,
  cacheDir: '.vite-ultimate-clean-' + Date.now() + '-' + Math.random() + '-force',
}));
