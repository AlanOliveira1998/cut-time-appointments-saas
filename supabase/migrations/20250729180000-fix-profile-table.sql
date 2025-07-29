-- Primeiro, verificar se a tabela profiles existe e sua estrutura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Corrigir a função handle_new_user para usar a estrutura correta da tabela
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir um novo perfil para o usuário recém-criado
  -- Usando uma abordagem mais segura com try/catch
  BEGIN
    INSERT INTO public.profiles (
      id, 
      name, 
      email, 
      phone, 
      subscription_status,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      'trial',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    -- Log do erro para debug
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
    RETURN NEW; -- Importante: retornar NEW mesmo em caso de erro para não falhar o registro
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger para garantir que ele está configurado corretamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Garantir permissões corretas
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;

-- Atualizar políticas RLS para a tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can create profiles" ON public.profiles;

-- Criar políticas RLS
CREATE POLICY "Users can manage own profile" 
ON public.profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Permitir que usuários autenticados criem perfis
CREATE POLICY "Authenticated users can create profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);
