#!/usr/bin/env node

/**
 * Script para testar a conexão com o Supabase
 * Execute: node test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substitua pelos seus valores)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://ymnzbandwpddtxajpjaa.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbnpiYW5kd3BkZHR4YWpwamFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODkyNjgsImV4cCI6MjA2Njk2NTI2OH0.2uPLF30WbJDRL9gQMyMy4QCzFr1ZgjsuhtyBLB6PEJY";

console.log('🔧 Testando conexão com Supabase...');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
console.log('');

async function testSupabaseConnection() {
  try {
    // Criar cliente Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ Cliente Supabase criado com sucesso');
    
    // Testar conexão básica
    console.log('🔄 Testando conexão básica...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      console.error('Código do erro:', error.code);
      console.error('Detalhes:', error.details);
      console.error('Hint:', error.hint);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    console.log('📊 Dados recebidos:', data);
    
    // Testar autenticação
    console.log('🔄 Testando autenticação...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Erro na autenticação:', authError.message);
      return false;
    }
    
    console.log('✅ Autenticação funcionando!');
    console.log('👤 Sessão atual:', authData.session ? 'Usuário logado' : 'Nenhum usuário logado');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    
    if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
      console.error('🔍 Diagnóstico: O domínio do Supabase não está sendo resolvido.');
      console.error('💡 Possíveis causas:');
      console.error('   - Projeto Supabase foi pausado ou deletado');
      console.error('   - URL incorreta');
      console.error('   - Problemas de DNS');
      console.error('');
      console.error('🛠️ Soluções:');
      console.error('   1. Verifique se o projeto existe no dashboard do Supabase');
      console.error('   2. Crie um novo projeto se necessário');
      console.error('   3. Atualize as variáveis de ambiente');
    }
    
    return false;
  }
}

// Executar teste
testSupabaseConnection().then(success => {
  if (success) {
    console.log('');
    console.log('🎉 Teste concluído com sucesso!');
    console.log('✅ Seu projeto está configurado corretamente.');
  } else {
    console.log('');
    console.log('💥 Teste falhou!');
    console.log('❌ Verifique a configuração do Supabase.');
    process.exit(1);
  }
});

