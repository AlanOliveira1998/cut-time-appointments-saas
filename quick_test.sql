-- =====================================================
-- TESTE RÁPIDO - Execute estes comandos primeiro
-- =====================================================

-- 1. VERIFICAR SE O USUÁRIO EXISTE
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE id = 'df523100-5904-4aec-a187-860fc46d9a48';

-- 2. VERIFICAR SE O PERFIL EXISTE
SELECT 
    id,
    name,
    subscription_status,
    created_at
FROM public.profiles 
WHERE id = 'df523100-5904-4aec-a187-860fc46d9a48';

-- 3. VERIFICAR POLÍTICAS RLS
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. TESTAR CONSULTA SIMPLES
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 5. VERIFICAR PERMISSÕES
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'profiles' 
AND grantee IN ('anon', 'authenticated');
