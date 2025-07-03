-- Corrigir permissões para acesso público aos perfis de barbeiros

-- Remover a política que bloqueia acesso público
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Criar política para permitir leitura pública de todos os perfis
CREATE POLICY "Public can view all profiles" ON public.profiles
  FOR SELECT USING (true);

-- Manter políticas para inserção e atualização apenas pelo próprio usuário
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);