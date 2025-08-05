-- Corrigir políticas RLS para a tabela profiles
-- Esta migração garante que os usuários possam criar e gerenciar seus próprios perfis

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que possam estar causando conflitos
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Criar políticas mais permissivas para desenvolvimento
-- Política para permitir que usuários autenticados vejam seus próprios perfis
CREATE POLICY "Users can view own profile" 
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política para permitir que usuários autenticados criem seus próprios perfis
CREATE POLICY "Users can create own profile" 
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Política para permitir que usuários autenticados atualizem seus próprios perfis
CREATE POLICY "Users can update own profile" 
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política para permitir que usuários autenticados deletem seus próprios perfis
CREATE POLICY "Users can delete own profile" 
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Garantir que o service_role tenha acesso total para operações administrativas
GRANT ALL ON public.profiles TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Verificar se a função handle_new_user está funcionando corretamente
-- Se não estiver, recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Garantir permissões para a função
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated; 