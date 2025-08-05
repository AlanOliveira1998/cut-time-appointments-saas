// Script para verificar e corrigir o problema do perfil do usuário
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymnzbandwpddtxajpjaa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbnpiYW5kd3BkZHR4YWpwamFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODkyNjgsImV4cCI6MjA2Njk2NTI2OH0.2uPLF30WbJDRL9gQMyMy4QCzFr1ZgjsuhtyBLB6PEJY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAndFixProfile(userId) {
  try {
    console.log('Verificando perfil do usuário:', userId);
    
    // Verificar se o perfil existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      console.log('Perfil não encontrado, criando...');
      
      // Criar o perfil
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: 'Novo Usuário',
          email: '',
          phone: '',
          subscription_status: 'trial',
          subscription_start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (createError) {
        console.error('Erro ao criar perfil:', createError);
        return false;
      }

      console.log('Perfil criado com sucesso:', newProfile);
      return true;
    } else if (profileError) {
      console.error('Erro ao verificar perfil:', profileError);
      return false;
    } else {
      console.log('Perfil já existe:', profile);
      return true;
    }
  } catch (error) {
    console.error('Erro geral:', error);
    return false;
  }
}

// Função para verificar políticas RLS
async function checkRLSPolicies() {
  try {
    console.log('Verificando políticas RLS...');
    
    // Tentar inserir um perfil de teste para verificar as políticas
    const testUserId = 'test-user-' + Date.now();
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        phone: '',
        subscription_status: 'trial',
        subscription_start_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao testar inserção:', error);
      return false;
    }

    console.log('Teste de inserção bem-sucedido:', data);
    
    // Limpar o perfil de teste
    await supabase
      .from('profiles')
      .delete()
      .eq('id', testUserId);

    return true;
  } catch (error) {
    console.error('Erro ao verificar políticas RLS:', error);
    return false;
  }
}

// Executar verificações
async function main() {
  const userId = '265b6038-d16f-4e23-ab40-3408a4a00ca6'; // ID do usuário do erro
  
  console.log('=== Verificação e Correção do Perfil ===');
  
  const profileFixed = await checkAndFixProfile(userId);
  const rlsWorking = await checkRLSPolicies();
  
  console.log('\n=== Resultados ===');
  console.log('Perfil corrigido:', profileFixed ? '✅' : '❌');
  console.log('Políticas RLS funcionando:', rlsWorking ? '✅' : '❌');
  
  if (profileFixed && rlsWorking) {
    console.log('\n🎉 Problema resolvido! O dashboard deve carregar normalmente agora.');
  } else {
    console.log('\n⚠️ Ainda há problemas. Verifique os logs acima.');
  }
}

// Executar se chamado diretamente
if (typeof window === 'undefined') {
  main().catch(console.error);
}

export { checkAndFixProfile, checkRLSPolicies }; 