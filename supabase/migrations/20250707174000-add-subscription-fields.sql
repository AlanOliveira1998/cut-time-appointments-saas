-- Adicionar campos de assinatura na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS kiwify_customer_id TEXT,
ADD COLUMN IF NOT EXISTS kiwify_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;

-- Criar índice para melhor performance nas consultas de assinatura
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_kiwify_customer_id ON profiles(kiwify_customer_id);

-- Função para atualizar status da assinatura baseado na data
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a data de expiração passou, marcar como expirada
  IF NEW.subscription_end_date IS NOT NULL AND NEW.subscription_end_date < NOW() THEN
    NEW.subscription_status = 'expired';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar status automaticamente
DROP TRIGGER IF EXISTS trigger_update_subscription_status ON profiles;
CREATE TRIGGER trigger_update_subscription_status
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_status();

-- Função para verificar se o trial expirou
CREATE OR REPLACE FUNCTION is_trial_expired(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_created TIMESTAMP WITH TIME ZONE;
  subscription_status TEXT;
  user_email TEXT;
BEGIN
  -- Pegar email do usuário
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  -- Exceção para o usuário alan.pires.oliveira@gmail.com - nunca expira
  IF user_email = 'alan.pires.oliveira@gmail.com' THEN
    RETURN FALSE;
  END IF;
  
  -- Pegar data de criação do usuário
  SELECT created_at INTO user_created
  FROM auth.users
  WHERE id = user_id;
  
  -- Pegar status da assinatura
  SELECT subscription_status INTO subscription_status
  FROM profiles
  WHERE id = user_id;
  
  -- Se tem assinatura ativa, trial não expirou
  IF subscription_status = 'active' THEN
    RETURN FALSE;
  END IF;
  
  -- Se passou de 7 dias desde a criação, trial expirou
  IF user_created IS NOT NULL AND user_created < NOW() - INTERVAL '7 days' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 