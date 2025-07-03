-- Criar tabela de barbeiros
CREATE TABLE public.barbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialty TEXT,
  experience_years INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id)
);

-- Habilitar RLS
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Barbeiros podem gerenciar próprio perfil"
ON public.barbers
FOR ALL
USING (auth.uid() = profile_id);

CREATE POLICY "Público pode visualizar barbeiros ativos"
ON public.barbers
FOR SELECT
USING (is_active = true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_barbers_updated_at
BEFORE UPDATE ON public.barbers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrar dados existentes: criar um barbeiro para cada profile que já tem dados relacionados
INSERT INTO public.barbers (id, profile_id, specialty, is_active)
SELECT 
  p.id as id,
  p.id as profile_id,
  'Barbeiro Geral' as specialty,
  true as is_active
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 FROM public.appointments a WHERE a.barber_id = p.id
) OR EXISTS (
  SELECT 1 FROM public.services s WHERE s.barber_id = p.id  
) OR EXISTS (
  SELECT 1 FROM public.working_hours w WHERE w.barber_id = p.id
);