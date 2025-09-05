-- QUICK FIX: Aplicar políticas RLS básicas
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view all profiles" ON public.profiles;

-- 3. Criar políticas básicas para profiles
CREATE POLICY "Public can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. Criar políticas básicas para barbers
CREATE POLICY "Public can view barbers" ON public.barbers
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own barber profile" ON public.barbers
  FOR ALL USING (auth.uid() = profile_id);

-- 5. Criar políticas básicas para services
CREATE POLICY "Public can view services" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Barbers can manage own services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.barbers 
      WHERE barbers.id = services.barber_id 
      AND barbers.profile_id = auth.uid()
    )
  );

-- 6. Criar políticas básicas para appointments
CREATE POLICY "Public can view appointments" ON public.appointments
  FOR SELECT USING (true);

CREATE POLICY "Public can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Barbers can manage own appointments" ON public.appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.barbers 
      WHERE barbers.id = appointments.barber_id 
      AND barbers.profile_id = auth.uid()
    )
  );

-- 7. Criar políticas básicas para working_hours
CREATE POLICY "Public can view working hours" ON public.working_hours
  FOR SELECT USING (true);

CREATE POLICY "Barbers can manage own working hours" ON public.working_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.barbers 
      WHERE barbers.id = working_hours.barber_id 
      AND barbers.profile_id = auth.uid()
    )
  );

-- 8. Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
