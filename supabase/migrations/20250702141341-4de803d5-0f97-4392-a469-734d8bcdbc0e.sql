
-- Garantir que usuários autenticados tenham acesso ao schema public
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Garantir que as tabelas tenham RLS habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Recriar as políticas RLS para garantir que estejam corretas

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view barber profiles" ON public.profiles;

-- Permitir que usuários vejam seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Permitir leitura pública dos perfis para página de agendamento
CREATE POLICY "Public can view barber profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para services
DROP POLICY IF EXISTS "Public can view services" ON public.services;
DROP POLICY IF EXISTS "Barbers can manage own services" ON public.services;
DROP POLICY IF EXISTS "Allow authenticated to insert their own services" ON public.services;

CREATE POLICY "Public can view services" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Barbers can manage own services" ON public.services
  FOR ALL USING (auth.uid() = barber_id);

-- Políticas para working_hours
DROP POLICY IF EXISTS "Public can view working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Barbers can manage own working hours" ON public.working_hours;

CREATE POLICY "Public can view working hours" ON public.working_hours
  FOR SELECT USING (true);

CREATE POLICY "Barbers can manage own working hours" ON public.working_hours
  FOR ALL USING (auth.uid() = barber_id);

-- Políticas para appointments
DROP POLICY IF EXISTS "Public can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Barbers can manage own appointments" ON public.appointments;

CREATE POLICY "Public can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Barbers can manage own appointments" ON public.appointments
  FOR ALL USING (auth.uid() = barber_id);
