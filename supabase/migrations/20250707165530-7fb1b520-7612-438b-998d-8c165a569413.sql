-- Remover todas as políticas problemáticas da tabela barbers
DROP POLICY IF EXISTS "Owners can manage their employee barbers" ON public.barbers;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar barbeiros" ON public.barbers;
DROP POLICY IF EXISTS "Users can create their own barber profile" ON public.barbers;
DROP POLICY IF EXISTS "Users can view their own barber profile" ON public.barbers;
DROP POLICY IF EXISTS "Users can update their own barber profile" ON public.barbers;
DROP POLICY IF EXISTS "Usuários podem visualizar barbeiros ativos" ON public.barbers;
DROP POLICY IF EXISTS "Público pode visualizar barbeiros ativos para agendamento" ON public.barbers;
DROP POLICY IF EXISTS "Full barber management for authenticated users" ON public.barbers;
DROP POLICY IF EXISTS "Users can manage own barber profile" ON public.barbers;
DROP POLICY IF EXISTS "Active barbers visibility for authenticated" ON public.barbers;
DROP POLICY IF EXISTS "Active barbers visibility for anon" ON public.barbers;

-- Criar função security definer para verificar se usuário é owner de barbeiro
CREATE OR REPLACE FUNCTION public.is_barber_owner(user_id UUID, target_barber_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.barbers owner_barber
    WHERE owner_barber.profile_id = user_id 
    AND owner_barber.role = 'owner'
    AND (
      -- É o próprio barbeiro owner
      target_barber_id = owner_barber.id
      OR 
      -- É um funcionário do owner
      EXISTS (
        SELECT 1 FROM public.barbers employee_barber 
        WHERE employee_barber.id = target_barber_id 
        AND employee_barber.owner_id = owner_barber.id
      )
    )
  );
$$;

-- Criar função security definer para verificar se usuário pode criar barbeiro
CREATE OR REPLACE FUNCTION public.can_create_barber(user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    CASE 
      WHEN new_role = 'owner' THEN 
        -- Pode criar owner se o profile_id for dele
        TRUE
      WHEN new_role = 'employee' THEN 
        -- Pode criar funcionário se for owner
        EXISTS (
          SELECT 1 FROM public.barbers 
          WHERE profile_id = user_id AND role = 'owner'
        )
      ELSE FALSE
    END;
$$;

-- Políticas simplificadas usando as funções
CREATE POLICY "Barber owners can manage their barbershop" 
ON public.barbers 
FOR ALL 
USING (public.is_barber_owner(auth.uid(), id))
WITH CHECK (public.can_create_barber(auth.uid(), role));

-- Política para visualização pública de barbeiros ativos
CREATE POLICY "Public can view active barbers" 
ON public.barbers 
FOR SELECT 
USING (is_active = true);