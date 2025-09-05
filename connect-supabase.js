#!/usr/bin/env node

/**
 * Script para conectar ao Supabase remotamente
 * Execute: node connect-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// Configuração do Supabase
const SUPABASE_URL = "https://ymnzbandwpddtxajpjaa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbnpiYW5kd3BkZHR4YWpwamFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODkyNjgsImV4cCI6MjA2Njk2NTI2OH0.2uPLF30WbJDRL9gQMyMy4QCzFr1ZgjsuhtyBLB6PEJY";

// Interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function connectToSupabase() {
  console.log('🔧 Conectando ao Supabase...');
  console.log('URL:', SUPABASE_URL);
  console.log('');

  try {
    // Criar cliente Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ Cliente Supabase criado com sucesso');
    
    // Testar conexão básica
    console.log('🔄 Testando conexão...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Menu de opções
    while (true) {
      console.log('');
      console.log('📋 Menu de Opções:');
      console.log('1. Ver tabelas do banco');
      console.log('2. Ver políticas RLS');
      console.log('3. Executar SQL customizado');
      console.log('4. Testar autenticação');
      console.log('5. Sair');
      
      const choice = await askQuestion('Escolha uma opção (1-5): ');
      
      switch (choice) {
        case '1':
          await showTables(supabase);
          break;
        case '2':
          await showPolicies(supabase);
          break;
        case '3':
          await executeCustomSQL(supabase);
          break;
        case '4':
          await testAuth(supabase);
          break;
        case '5':
          console.log('👋 Até logo!');
          rl.close();
          return true;
        default:
          console.log('❌ Opção inválida');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return false;
  }
}

async function showTables(supabase) {
  console.log('📊 Tabelas do banco:');
  
  const tables = ['profiles', 'barbers', 'services', 'appointments', 'working_hours'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${data.length} registros (amostra)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Erro de conexão`);
    }
  }
}

async function showPolicies(supabase) {
  console.log('🔒 Políticas RLS:');
  
  try {
    const { data, error } = await supabase.rpc('get_policies');
    if (error) {
      console.log('❌ Erro ao buscar políticas:', error.message);
    } else {
      console.log('✅ Políticas encontradas:', data);
    }
  } catch (err) {
    console.log('❌ Erro ao buscar políticas');
  }
}

async function executeCustomSQL(supabase) {
  const sql = await askQuestion('Digite o SQL a executar: ');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.log('❌ Erro:', error.message);
    } else {
      console.log('✅ Resultado:', data);
    }
  } catch (err) {
    console.log('❌ Erro ao executar SQL');
  }
}

async function testAuth(supabase) {
  console.log('🔐 Testando autenticação...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Erro na autenticação:', error.message);
    } else {
      console.log('✅ Autenticação funcionando');
      console.log('👤 Sessão:', data.session ? 'Usuário logado' : 'Nenhum usuário logado');
    }
  } catch (err) {
    console.log('❌ Erro ao testar autenticação');
  }
}

// Executar
connectToSupabase().then(success => {
  if (success) {
    console.log('🎉 Sessão concluída com sucesso!');
  } else {
    console.log('💥 Sessão falhou!');
    process.exit(1);
  }
});
