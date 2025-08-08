-- =====================================================
-- COMANDOS SQL PARA DIAGNOSTICAR O PROBLEMA
-- Execute estes comandos no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR SE O USUÁRIO EXISTE NO AUTH.USERS
-- Substitua 'df523100-5904-4aec-a187-860fc46d9a48' pelo ID do usuário que está tentando acessar
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE id = 'df523100-5904-4aec-a187-860fc46d9a48';

-- 2. VERIFICAR SE O PERFIL EXISTE NA TABELA PROFILES
SELECT 
    id,
    name,
    phone,
    subscription_status,
    subscription_start_date,
    created_at,
    updated_at
FROM public.profiles 
WHERE id = 'df523100-5904-4aec-a187-860fc46d9a48';

-- 3. VERIFICAR POLÍTICAS RLS DA TABELA PROFILES
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. VERIFICAR SE RLS ESTÁ HABILITADO NA TABELA PROFILES
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 5. VERIFICAR PERMISSÕES DO USUÁRIO ANONIMO E AUTENTICADO
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles';

-- 6. TESTAR INSERÇÃO DE PERFIL (execute como usuário autenticado)
-- Este comando deve ser executado através da aplicação ou com o usuário logado
INSERT INTO public.profiles (
    id, 
    name, 
    phone, 
    subscription_status, 
    subscription_start_date,
    created_at,
    updated_at
) VALUES (
    'df523100-5904-4aec-a187-860fc46d9a48',
    'Test User',
    '',
    'trial',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING
RETURNING *;

-- 7. VERIFICAR SE EXISTE BARBER PARA O PERFIL
SELECT 
    b.id,
    b.profile_id,
    b.specialty,
    b.is_active,
    b.created_at
FROM public.barbers b
WHERE b.profile_id = 'df523100-5904-4aec-a187-860fc46d9a48';

-- 8. VERIFICAR ESTRUTURA DA TABELA PROFILES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 9. VERIFICAR TRIGGERS NA TABELA PROFILES
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 10. VERIFICAR CONEXÕES ATIVAS (versão simplificada)
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    backend_start,
    state
FROM pg_stat_activity 
WHERE state = 'active';

-- 11. TESTAR CONSULTA SIMPLES (deve funcionar mesmo sem RLS)
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 12. VERIFICAR SE O USUÁRIO TEM PERMISSÕES PARA A TABELA
SELECT 
    grantee,
    table_catalog,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'profiles' 
AND grantee IN ('anon', 'authenticated');

-- 13. VERIFICAR SE EXISTEM CONSTRAINTS QUE PODEM ESTAR BLOQUEANDO
SELECT 
    constraint_name,
    constraint_type,
    table_name,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles';

-- 14. VERIFICAR SE HÁ ÍNDICES QUE PODEM ESTAR CAUSANDO PROBLEMAS
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles';

-- 15. VERIFICAR SE EXISTEM FUNÇÕES RELACIONADAS
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%profile%' OR routine_name LIKE '%user%';

-- 16. VERIFICAR SE EXISTEM VIEWS RELACIONADAS
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%profile%' OR table_name LIKE '%user%';

-- 17. TESTAR CONSULTA COM JOIN (para verificar relacionamentos)
SELECT 
    p.id as profile_id,
    p.name as profile_name,
    b.id as barber_id,
    b.specialty,
    b.is_active
FROM public.profiles p
LEFT JOIN public.barbers b ON p.id = b.profile_id
WHERE p.id = 'df523100-5904-4aec-a187-860fc46d9a48';

-- 18. VERIFICAR SE EXISTEM DADOS DE TESTE
SELECT 
    'profiles' as table_name,
    COUNT(*) as total_records
FROM public.profiles
UNION ALL
SELECT 
    'barbers' as table_name,
    COUNT(*) as total_records
FROM public.barbers
UNION ALL
SELECT 
    'appointments' as table_name,
    COUNT(*) as total_records
FROM public.appointments
UNION ALL
SELECT 
    'services' as table_name,
    COUNT(*) as total_records
FROM public.services;
