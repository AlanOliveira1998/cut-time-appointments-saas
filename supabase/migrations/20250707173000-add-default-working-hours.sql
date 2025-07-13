-- Adicionar horários de trabalho padrão para barbeiros existentes
-- Esta migração garante que todos os barbeiros tenham horários configurados

-- Função para inserir horários padrão para um barbeiro
CREATE OR REPLACE FUNCTION add_default_working_hours(barber_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Inserir horários padrão (Segunda a Sábado, 9h às 18h)
  INSERT INTO public.working_hours (barber_id, day_of_week, start_time, end_time, is_active)
  VALUES 
    (barber_id, 1, '09:00:00', '18:00:00', true),  -- Segunda
    (barber_id, 2, '09:00:00', '18:00:00', true),  -- Terça
    (barber_id, 3, '09:00:00', '18:00:00', true),  -- Quarta
    (barber_id, 4, '09:00:00', '18:00:00', true),  -- Quinta
    (barber_id, 5, '09:00:00', '18:00:00', true),  -- Sexta
    (barber_id, 6, '09:00:00', '18:00:00', true),  -- Sábado
    (barber_id, 0, '09:00:00', '17:00:00', false)  -- Domingo (desabilitado)
  ON CONFLICT (barber_id, day_of_week) DO NOTHING;
END;
$$;

-- Adicionar horários padrão para barbeiros que não têm horários configurados
DO $$
DECLARE
  barber_record RECORD;
BEGIN
  FOR barber_record IN 
    SELECT id FROM public.barbers 
    WHERE is_active = true 
    AND id NOT IN (SELECT DISTINCT barber_id FROM public.working_hours)
  LOOP
    PERFORM add_default_working_hours(barber_record.id);
  END LOOP;
END $$;

-- Limpar a função após o uso
DROP FUNCTION IF EXISTS add_default_working_hours(UUID); 