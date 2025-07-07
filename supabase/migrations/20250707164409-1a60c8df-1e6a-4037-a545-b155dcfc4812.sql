-- Adicionar campos para definir hierarquia de barbeiros
ALTER TABLE public.barbers 
ADD COLUMN owner_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
ADD COLUMN role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('owner', 'employee'));

-- Atualizar barbeiro atual para ser owner (assumindo que é o primeiro barbeiro)
UPDATE public.barbers 
SET role = 'owner' 
WHERE profile_id = (SELECT id FROM auth.users LIMIT 1);

-- Criar política para que owners possam gerenciar seus barbeiros funcionários
CREATE POLICY "Owners can manage their employee barbers" 
ON public.barbers 
FOR ALL 
USING (
  -- O usuário é owner de uma barbearia
  EXISTS (
    SELECT 1 FROM public.barbers owner_barber 
    WHERE owner_barber.profile_id = auth.uid() 
    AND owner_barber.role = 'owner'
    AND (
      -- Pode gerenciar seu próprio perfil de barbeiro
      barbers.id = owner_barber.id
      OR 
      -- Pode gerenciar barbeiros funcionários
      barbers.owner_id = owner_barber.id
    )
  )
)
WITH CHECK (
  -- Para inserir: deve ser funcionário de um barbeiro owner ou ser o próprio owner
  (role = 'employee' AND owner_id IN (
    SELECT id FROM public.barbers 
    WHERE profile_id = auth.uid() AND role = 'owner'
  ))
  OR 
  (role = 'owner' AND profile_id = auth.uid())
);

-- Atualizar política de serviços para considerar hierarquia
DROP POLICY IF EXISTS "Users can create services for their own barber profile" ON public.services;
DROP POLICY IF EXISTS "Users can view services for their own barber profile" ON public.services;
DROP POLICY IF EXISTS "Users can update services for their own barber profile" ON public.services;
DROP POLICY IF EXISTS "Users can delete services for their own barber profile" ON public.services;

CREATE POLICY "Barber owners can manage all services" 
ON public.services 
FOR ALL 
USING (
  barber_id IN (
    SELECT b.id FROM public.barbers b
    JOIN public.barbers owner_b ON (b.owner_id = owner_b.id OR b.id = owner_b.id)
    WHERE owner_b.profile_id = auth.uid() AND owner_b.role = 'owner'
  )
)
WITH CHECK (
  barber_id IN (
    SELECT b.id FROM public.barbers b
    JOIN public.barbers owner_b ON (b.owner_id = owner_b.id OR b.id = owner_b.id)
    WHERE owner_b.profile_id = auth.uid() AND owner_b.role = 'owner'
  )
);

-- Atualizar política de horários de trabalho para considerar hierarquia
DROP POLICY IF EXISTS "Allow insert for own barber" ON public.working_hours;

CREATE POLICY "Barber owners can manage all working hours" 
ON public.working_hours 
FOR ALL 
USING (
  barber_id IN (
    SELECT b.id FROM public.barbers b
    JOIN public.barbers owner_b ON (b.owner_id = owner_b.id OR b.id = owner_b.id)
    WHERE owner_b.profile_id = auth.uid() AND owner_b.role = 'owner'
  )
)
WITH CHECK (
  barber_id IN (
    SELECT b.id FROM public.barbers b
    JOIN public.barbers owner_b ON (b.owner_id = owner_b.id OR b.id = owner_b.id)
    WHERE owner_b.profile_id = auth.uid() AND owner_b.role = 'owner'
  )
);

-- Atualizar política de agendamentos para considerar hierarquia
DROP POLICY IF EXISTS "Barbers can manage own appointments" ON public.appointments;

CREATE POLICY "Barber owners can manage all appointments" 
ON public.appointments 
FOR ALL 
USING (
  barber_id IN (
    SELECT b.id FROM public.barbers b
    JOIN public.barbers owner_b ON (b.owner_id = owner_b.id OR b.id = owner_b.id)
    WHERE owner_b.profile_id = auth.uid() AND owner_b.role = 'owner'
  )
);