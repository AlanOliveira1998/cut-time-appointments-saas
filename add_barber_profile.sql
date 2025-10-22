-- 1. Primeiro, garantir que o perfil exista
INSERT INTO public.profiles (
    id,
    name,
    email,
    subscription_status,
    subscription_start_date,
    created_at,
    updated_at
)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', email) as name,
    email,
    'active' as subscription_status,
    NOW() as subscription_start_date,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users
WHERE email = 'alan.pires.oliveira@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    subscription_status = 'active',
    updated_at = NOW();

-- 2. Depois, criar o registro de barbeiro
INSERT INTO public.barbers (
    id,
    profile_id,
    specialty,
    experience_years,
    is_active,
    role,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    au.id as profile_id,
    'Barbeiro Principal' as specialty,
    5 as experience_years,
    true as is_active,
    'owner' as role,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN public.barbers b ON b.profile_id = au.id
WHERE au.email = 'alan.pires.oliveira@gmail.com'
AND b.id IS NULL;

-- 3. Verificar se tudo foi criado corretamente
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