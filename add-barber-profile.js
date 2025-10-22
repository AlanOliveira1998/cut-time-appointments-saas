require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw new Error(`Erro ao obter usuário: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('Usuário não encontrado - faça login primeiro');
    }
    
    console.log('👤 Usuário encontrado:', user.email);

    // 1. Garantir que o perfil exista
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email,
        email: user.email,
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
    const { data: existingBarber } = await supabase
      .from('barbers')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (existingBarber) {
      console.log('ℹ️ Registro de barbeiro já existe:', existingBarber.id);
      return;
    }

    // 3. Criar registro de barbeiro
    const { data: barber, error: barberError } = await supabase
      .from('barbers')
      .insert({
        profile_id: user.id,
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

    // 4. Verificar se tudo foi criado
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
      .eq('profile_id', user.id)
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