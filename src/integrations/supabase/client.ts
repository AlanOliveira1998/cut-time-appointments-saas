import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuração com fallback para variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ymnzbandwpddtxajpjaa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbnpiYW5kd3BkZHR4YWpwamFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODkyNjgsImV4cCI6MjA2Njk2NTI2OH0.2uPLF30WbJDRL9gQMyMy4QCzFr1ZgjsuhtyBLB6PEJY";

// Validação das variáveis
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Log para debug (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Configuration:');
  console.log('URL:', SUPABASE_URL);
  console.log('Key:', SUPABASE_PUBLISHABLE_KEY.substring(0, 20) + '...');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});