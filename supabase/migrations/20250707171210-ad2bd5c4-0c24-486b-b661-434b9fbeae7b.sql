-- Permitir NULL em profile_id para barbeiros funcionários
ALTER TABLE public.barbers 
ALTER COLUMN profile_id DROP NOT NULL;

-- Atualizar a constraint de foreign key para permitir NULL
ALTER TABLE public.barbers 
DROP CONSTRAINT IF EXISTS barbers_profile_id_fkey;

ALTER TABLE public.barbers 
ADD CONSTRAINT barbers_profile_id_fkey 
FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;