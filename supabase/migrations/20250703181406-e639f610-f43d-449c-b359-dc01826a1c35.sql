-- Primeiro, criar perfil para o usuário atual se não existir
INSERT INTO public.profiles (id, name, phone)
SELECT 
    '524b53fc-c5ea-4703-bfd3-15dcd2009ce2' as id,
    'Admin User' as name,
    '' as phone
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = '524b53fc-c5ea-4703-bfd3-15dcd2009ce2'
);

-- Atualizar as foreign keys para referenciar a tabela barbers corretamente
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_barber_id_fkey;

ALTER TABLE public.services
DROP CONSTRAINT IF EXISTS services_barber_id_fkey;

ALTER TABLE public.working_hours
DROP CONSTRAINT IF EXISTS working_hours_barber_id_fkey;

-- Recriar as foreign keys corretamente
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_barber_id_fkey 
FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE CASCADE;

ALTER TABLE public.services
ADD CONSTRAINT services_barber_id_fkey 
FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE CASCADE;

ALTER TABLE public.working_hours
ADD CONSTRAINT working_hours_barber_id_fkey 
FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE CASCADE;

-- Corrigir políticas RLS para profiles - permitir que usuários autenticados criem perfis
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;

CREATE POLICY "Users can manage own profile"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Adicionar política para permitir criação de perfis por usuários autenticados
CREATE POLICY "Authenticated users can create profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);