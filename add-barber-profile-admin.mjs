import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pzxkvdsywbjkvjynpajq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6eGt2ZHN5d2Jqa3ZqeW5wYWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY3NTI5NDksImV4cCI6MjAwMjMyODk0OX0.YzE9HA5Sx9Rzws8F_4I4HJT8MhBgArqoxlSF5XMqtYg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addBarberProfile() {
  try {
    console.log('🔍 Iniciando criação do perfil de barbeiro...');
    
    // 1. Inserir/atualizar o perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: 'df523100-5904-4aec-a187-860fc46d9a48', // ID do usuário alan.pires.oliveira@gmail.com
        name: 'Alan Oliveira',
        email: 'alan.pires.oliveira@gmail.com',
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      throw new Error(`Erro ao criar/atualizar perfil: ${profileError.message}`);
    }

    console.log('✅ Perfil atualizado');

    // 2. Verificar se já existe um registro de barbeiro
    const { data: existingBarber, error: checkError } = await supabase
      .from('barbers')
      .select('id')
      .eq('profile_id', 'df523100-5904-4aec-a187-860fc46d9a48')
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 significa "não encontrado"
      throw new Error(`Erro ao verificar barbeiro existente: ${checkError.message}`);
    }

    if (existingBarber) {
      console.log('ℹ️ Registro de barbeiro já existe:', existingBarber.id);
      return;
    }

    // 3. Criar registro de barbeiro
    const { data: barber, error: barberError } = await supabase
      .from('barbers')
      .insert({
        profile_id: 'df523100-5904-4aec-a187-860fc46d9a48',
        specialty: 'Barbeiro Principal',
        experience_years: 5,
        is_active: true,
        role: 'owner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (barberError) {
      throw new Error(`Erro ao criar barbeiro: ${barberError.message}`);
    }

    console.log('✅ Registro de barbeiro criado com sucesso:', barber.id);

    // 4. Verificação final
    const { data: verification, error: verificationError } = await supabase
      .from('barbers')
      .select(`
        id,
        profile_id,
        profiles (
          name,
          email
        ),
        specialty,
        experience_years,
        role,
        is_active
      `)
      .eq('profile_id', 'df523100-5904-4aec-a187-860fc46d9a48')
      .single();

    if (verificationError) {
      throw new Error(`Erro na verificação: ${verificationError.message}`);
    }

    console.log('🎉 Tudo pronto! Detalhes do barbeiro:', verification);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executar o script
addBarberProfile();