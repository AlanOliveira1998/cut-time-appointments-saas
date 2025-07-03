-- Inserir perfis para usuários que existem no auth.users mas não têm perfil
INSERT INTO public.profiles (id, name, phone)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', au.email, 'Usuário'), -- usar nome ou email como fallback
  COALESCE(au.raw_user_meta_data->>'phone', '')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL  -- apenas usuários sem perfil
ON CONFLICT (id) DO NOTHING;