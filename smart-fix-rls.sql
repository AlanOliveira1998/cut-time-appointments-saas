-- SMART FIX: Aplicar políticas RLS verificando se já existem
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Habilitar RLS (se não estiver habilitado)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'barbers' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'services' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'appointments' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'working_hours' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Criar políticas para profiles (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Public can view all profiles'
    ) THEN
        CREATE POLICY "Public can view all profiles" ON public.profiles
        FOR SELECT USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- 3. Criar políticas para barbers (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'barbers' 
        AND policyname = 'Public can view barbers'
    ) THEN
        CREATE POLICY "Public can view barbers" ON public.barbers
        FOR SELECT USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'barbers' 
        AND policyname = 'Users can manage own barber profile'
    ) THEN
        CREATE POLICY "Users can manage own barber profile" ON public.barbers
        FOR ALL USING (auth.uid() = profile_id);
    END IF;
END $$;

-- 4. Criar políticas para services (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'services' 
        AND policyname = 'Public can view services'
    ) THEN
        CREATE POLICY "Public can view services" ON public.services
        FOR SELECT USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'services' 
        AND policyname = 'Barbers can manage own services'
    ) THEN
        CREATE POLICY "Barbers can manage own services" ON public.services
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.barbers 
                WHERE barbers.id = services.barber_id 
                AND barbers.profile_id = auth.uid()
            )
        );
    END IF;
END $$;

-- 5. Criar políticas para appointments (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'appointments' 
        AND policyname = 'Public can view appointments'
    ) THEN
        CREATE POLICY "Public can view appointments" ON public.appointments
        FOR SELECT USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'appointments' 
        AND policyname = 'Public can create appointments'
    ) THEN
        CREATE POLICY "Public can create appointments" ON public.appointments
        FOR INSERT WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'appointments' 
        AND policyname = 'Barbers can manage own appointments'
    ) THEN
        CREATE POLICY "Barbers can manage own appointments" ON public.appointments
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.barbers 
                WHERE barbers.id = appointments.barber_id 
                AND barbers.profile_id = auth.uid()
            )
        );
    END IF;
END $$;

-- 6. Criar políticas para working_hours (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'working_hours' 
        AND policyname = 'Public can view working hours'
    ) THEN
        CREATE POLICY "Public can view working hours" ON public.working_hours
        FOR SELECT USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'working_hours' 
        AND policyname = 'Barbers can manage own working hours'
    ) THEN
        CREATE POLICY "Barbers can manage own working hours" ON public.working_hours
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.barbers 
                WHERE barbers.id = working_hours.barber_id 
                AND barbers.profile_id = auth.uid()
            )
        );
    END IF;
END $$;

-- 7. Verificar status final
SELECT 
    'RLS Status' as info,
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'barbers', 'services', 'appointments', 'working_hours')
ORDER BY tablename;

SELECT 
    'Policies Status' as info,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
