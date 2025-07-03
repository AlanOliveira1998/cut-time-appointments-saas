-- Corrigir políticas RLS para tabela barbers
-- Permitir que usuários autenticados vejam barbeiros ativos
DROP POLICY IF EXISTS "Público pode visualizar barbeiros ativos" ON public.barbers;

CREATE POLICY "Usuários podem visualizar barbeiros ativos"
ON public.barbers
FOR SELECT
TO authenticated
USING (is_active = true);

-- Permitir que qualquer um veja barbeiros ativos (para sistema de agendamento público)
CREATE POLICY "Público pode visualizar barbeiros ativos para agendamento"
ON public.barbers
FOR SELECT
TO anon
USING (is_active = true);