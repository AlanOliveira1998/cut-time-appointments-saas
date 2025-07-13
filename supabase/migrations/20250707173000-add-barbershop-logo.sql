-- Adicionar coluna barbershop_logo na tabela profiles
ALTER TABLE profiles ADD COLUMN barbershop_logo TEXT;

-- Comentário explicativo
COMMENT ON COLUMN profiles.barbershop_logo IS 'URL da logo da barbearia armazenada no storage'; 