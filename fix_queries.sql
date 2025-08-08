-- =====================================================
-- COMANDOS SQL PARA CORRIGIR POSSÍVEIS PROBLEMAS
-- Execute estes comandos no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR E CORRIGIR POLÍTICAS RLS DA TABELA PROFILES
-- Primeiro, remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can create profiles" ON public.profiles;

-- 2. CRIAR NOVAS POLÍTICAS RLS CORRETAS
-- Política para permitir leitura pública de todos os perfis
CREATE POLICY "Public can view all profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Política para permitir que usuários autenticados gerenciem seus próprios perfis
CREATE POLICY "Users can manage own profile"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política para permitir criação de perfis por usuários autenticados
CREATE POLICY "Authenticated users can create profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 3. VERIFICAR SE RLS ESTÁ HABILITADO
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. GARANTIR PERMISSÕES CORRETAS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.barbers TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.services TO authenticated;
GRANT ALL ON public.working_hours TO authenticated;

-- 5. VERIFICAR SE EXISTE TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar função para lidar com novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    phone, 
    subscription_status,
    subscription_start_date,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'), 
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'trial',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Criar trigger para executar a função quando um usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. VERIFICAR SE EXISTE BARBER PARA O USUÁRIO
-- Criar barber se não existir
INSERT INTO public.barbers (
    profile_id,
    specialty,
    experience_years,
    is_active,
    created_at,
    updated_at
)
SELECT 
    p.id,
    'Corte de Cabelo',
    1,
    true,
    NOW(),
    NOW()
FROM public.profiles p
WHERE p.id = 'df523100-5904-4aec-a187-860fc46d9a48'
AND NOT EXISTS (
    SELECT 1 FROM public.barbers b WHERE b.profile_id = p.id
);

-- 7. VERIFICAR E CORRIGIR ESTRUTURA DA TABELA PROFILES
-- Adicionar colunas que podem estar faltando
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS kiwify_customer_id TEXT,
ADD COLUMN IF NOT EXISTS kiwify_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS barbershop_logo TEXT;

-- 8. VERIFICAR E CORRIGIR ESTRUTURA DA TABELA BARBERS
-- Adicionar colunas que podem estar faltando
ALTER TABLE public.barbers 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'barber' CHECK (role IN ('owner', 'barber')),
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.barbers(id);

-- 9. VERIFICAR SE EXISTEM ÍNDICES NECESSÁRIOS
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_barbers_profile_id ON public.barbers(profile_id);
CREATE INDEX IF NOT EXISTS idx_barbers_is_active ON public.barbers(is_active);

-- 10. VERIFICAR SE EXISTEM CONSTRAINTS NECESSÁRIOS
-- Adicionar constraint para subscription_status se não existir
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_subscription_status_check 
CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired'));

-- 11. VERIFICAR SE EXISTEM FUNÇÕES NECESSÁRIAS
-- Função para verificar se o trial expirou
CREATE OR REPLACE FUNCTION is_trial_expired(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT * INTO user_profile
  FROM public.profiles
  WHERE id = user_id;
  
  IF user_profile IS NULL THEN
    RETURN true; -- Se não há perfil, considera expirado
  END IF;
  
  -- Se tem subscription_end_date, verificar se expirou
  IF user_profile.subscription_end_date IS NOT NULL THEN
    RETURN user_profile.subscription_end_date < NOW();
  END IF;
  
  -- Se tem subscription_start_date, calcular 7 dias
  IF user_profile.subscription_start_date IS NOT NULL THEN
    RETURN user_profile.subscription_start_date + INTERVAL '7 days' < NOW();
  END IF;
  
  -- Se não tem data de início, considerar expirado
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 12. VERIFICAR SE EXISTEM VIEWS ÚTEIS
-- Criar view para dashboard stats
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    p.id as profile_id,
    p.name,
    p.subscription_status,
    p.subscription_start_date,
    COUNT(a.id) as total_appointments,
    COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_appointments,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
    COALESCE(SUM(CASE WHEN a.status = 'completed' THEN s.price ELSE 0 END), 0) as total_revenue
FROM public.profiles p
LEFT JOIN public.barbers b ON p.id = b.profile_id
LEFT JOIN public.appointments a ON b.id = a.barber_id
LEFT JOIN public.services s ON a.service_id = s.id
GROUP BY p.id, p.name, p.subscription_status, p.subscription_start_date;

-- 13. VERIFICAR SE EXISTEM PERMISSÕES PARA A VIEW
GRANT SELECT ON dashboard_stats TO authenticated;

-- 14. VERIFICAR SE EXISTEM FUNÇÕES DE UTILIDADE
-- Função para obter stats do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_profile_id UUID)
RETURNS TABLE (
    total_appointments BIGINT,
    pending_appointments BIGINT,
    completed_appointments BIGINT,
    total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
      COUNT(a.id)::BIGINT as total_appointments,
      COUNT(CASE WHEN a.status = 'pending' THEN 1 END)::BIGINT as pending_appointments,
      COUNT(CASE WHEN a.status = 'completed' THEN 1 END)::BIGINT as completed_appointments,
      COALESCE(SUM(CASE WHEN a.status = 'completed' THEN s.price ELSE 0 END), 0) as total_revenue
  FROM public.profiles p
  LEFT JOIN public.barbers b ON p.id = b.profile_id
  LEFT JOIN public.appointments a ON b.id = a.barber_id
  LEFT JOIN public.services s ON a.service_id = s.id
  WHERE p.id = user_profile_id;
END;
$$ LANGUAGE plpgsql;

-- 15. VERIFICAR SE EXISTEM PERMISSÕES PARA A FUNÇÃO
GRANT EXECUTE ON FUNCTION get_dashboard_stats(UUID) TO authenticated;
