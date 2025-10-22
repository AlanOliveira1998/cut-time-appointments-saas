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
  build: {
    // Otimizações para produção
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: mode === 'development',
    rollupOptions: {
      external: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
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
