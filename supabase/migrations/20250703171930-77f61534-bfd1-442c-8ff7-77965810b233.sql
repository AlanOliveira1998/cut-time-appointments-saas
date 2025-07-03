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

-- Atualizar foreign keys existentes para referenciar barbers
-- Primeiro, adicionar coluna barber_id nas tabelas que referenciam profiles
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_barber_id_fkey,
ADD CONSTRAINT appointments_barber_id_fkey 
FOREIGN KEY (barber_id) REFERENCES public.barbers(id);

ALTER TABLE public.services
DROP CONSTRAINT IF EXISTS services_barber_id_fkey,
ADD CONSTRAINT services_barber_id_fkey 
FOREIGN KEY (barber_id) REFERENCES public.barbers(id);

ALTER TABLE public.working_hours
DROP CONSTRAINT IF EXISTS working_hours_barber_id_fkey,
ADD CONSTRAINT working_hours_barber_id_fkey 
FOREIGN KEY (barber_id) REFERENCES public.barbers(id);