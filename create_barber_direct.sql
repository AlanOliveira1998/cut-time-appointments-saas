BEGIN;

-- Inserir/atualizar o perfil
INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    created_at,
    updated_at
)
VALUES (
    'df523100-5904-4aec-a187-860fc46d9a48',
    'alan.pires.oliveira@gmail.com',
    '{"name": "Alan Oliveira"}',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = NOW();

-- Inserir/atualizar o perfil na tabela profiles
INSERT INTO public.profiles (
    id,
    name,
    email,
    subscription_status,
    subscription_start_date,
    created_at,
    updated_at
)
VALUES (
    'df523100-5904-4aec-a187-860fc46d9a48',
    'Alan Oliveira',
    'alan.pires.oliveira@gmail.com',
    'active',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    subscription_status = 'active',
    updated_at = NOW();

-- Inserir registro de barbeiro
INSERT INTO public.barbers (
    profile_id,
    specialty,
    experience_years,
    is_active,
    role,
    created_at,
    updated_at
)
SELECT 
    'df523100-5904-4aec-a187-860fc46d9a48',
    'Barbeiro Principal',
    5,
    true,
    'owner',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.barbers 
    WHERE profile_id = 'df523100-5904-4aec-a187-860fc46d9a48'
);

COMMIT;

-- Verificar os resultados
SELECT 
    b.id as barber_id,
    b.profile_id,
    p.name,
    p.email,
    b.specialty,
    b.experience_years,
    b.role,
    b.is_active
FROM public.barbers b
JOIN public.profiles p ON p.id = b.profile_id
WHERE p.email = 'alan.pires.oliveira@gmail.com';