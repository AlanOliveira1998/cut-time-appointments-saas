-- Remover todas as políticas existentes para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view barber profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view all profiles" ON public.profiles;

-- Criar política para permitir leitura pública de todos os perfis (para página de agendamento)
CREATE POLICY "Public can view all profiles" ON public.profiles
  FOR SELECT USING (true);

-- Permitir que usuários autenticados vejam, insiram e atualizem seus próprios perfis
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);