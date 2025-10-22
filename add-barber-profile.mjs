import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addBarberProfile() {
  try {
    console.log('🔍 Verificando usuário...');
    
    // Inserir direto na tabela profiles primeiro
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

    // Verificar se já existe um registro de barbeiro
    const { data: existingBarber } = await supabase
      .from('barbers')
      .select('id')
      .eq('profile_id', 'df523100-5904-4aec-a187-860fc46d9a48')
      .single();

    if (existingBarber) {
      console.log('ℹ️ Registro de barbeiro já existe:', existingBarber.id);
      return;
    }

    // Criar registro de barbeiro
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

    // Verificar se tudo foi criado
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
  }
}

// Executar o script
addBarberProfile();