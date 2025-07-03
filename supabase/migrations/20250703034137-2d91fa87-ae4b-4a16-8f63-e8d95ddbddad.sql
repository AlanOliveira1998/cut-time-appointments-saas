-- Deletar todos os dados relacionados aos usuários
-- Ordem de deleção respeitando foreign keys

-- 1. Deletar agendamentos
DELETE FROM public.appointments;

-- 2. Deletar serviços
DELETE FROM public.services;

-- 3. Deletar horários de trabalho
DELETE FROM public.working_hours;

-- 4. Deletar perfis
DELETE FROM public.profiles;

-- Resetar sequências se existirem
-- (não temos sequências nas tabelas atuais, mas é boa prática)