-- Corrigir políticas RLS para permitir criação de barbeiros por administradores
-- Remover política restritiva atual para inserção
DROP POLICY IF EXISTS "Barbeiros podem gerenciar próprio perfil" ON public.barbers;

-- Criar política que permite ao usuário autenticado inserir barbeiros
CREATE POLICY "Usuários autenticados podem gerenciar barbeiros"
ON public.barbers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Manter política para visualização pública de barbeiros ativos
-- (esta já existe e funciona corretamente)