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
    // Ensure i18n packages are pre-bundled so Rollup can resolve them during build.
    include: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
  },
  build: {
    // Otimizações para produção
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: mode === 'development',
      rollupOptions: {
      // Do not externalize i18next related packages — they must be bundled for the browser.
      // Externalizing them causes runtime errors like:
      // "Failed to resolve module specifier 'i18next'. Relative references must start with either '/', './', or '../'."
      output: {
        manualChunks: {
          // Separar vendor chunks para melhor cache
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
        },
      },
    },
    // Otimizar tamanho do bundle
    chunkSizeWarningLimit: 1000,
  },
  // Configurações para Vercel
  define: {
    // Garantir que as variáveis de ambiente sejam substituídas
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // Usar path absoluto para evitar problemas com espaços em diretórios (ex: OneDrive)
    setupFiles: [path.resolve(__dirname, 'src', 'test', 'setup.ts')],
    css: true,
  },
}));
