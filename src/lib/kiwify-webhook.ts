import { supabase } from '../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Tipos para webhook do Kiwify
interface KiwifyWebhookData {
  event: string;
  data: {
    customer: {
      email: string;
      id: string;
    };
    subscription?: {
      id: string;
      status: string;
      start_date: string;
      end_date: string;
    };
    payment?: {
      amount: number;
      status: string;
      date: string;
    };
  };
}

// Função para processar webhook do Kiwify
export const processKiwifyWebhook = async (webhookData: KiwifyWebhookData) => {
  try {
    console.log('🔄 Processando webhook do Kiwify:', webhookData);

    const { event, data } = webhookData;
    const customerEmail = data.customer.email;
    const customerId = data.customer.id;

    // Buscar usuário pelo email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (userError || !user) {
      console.error('❌ Usuário não encontrado:', customerEmail);
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Processar diferentes tipos de eventos
    switch (event) {
      case 'subscription.created':
      case 'subscription.activated':
        await handleSubscriptionActivated(user.id, data, customerId);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(user.id);
        break;

      case 'payment.succeeded':
        await handlePaymentSucceeded(user.id, data);
        break;

      case 'subscription.expired':
        await handleSubscriptionExpired(user.id);
        break;

      default:
        console.log('⚠️ Evento não processado:', event);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return { success: false, error: error.message };
  }
};

// Ativar assinatura
const handleSubscriptionActivated = async (
  userId: string, 
  data: any, 
  customerId: string
) => {
  const subscription = data.subscription;
  
  const updateData = {
    subscription_status: 'active',
    subscription_start_date: subscription?.start_date || new Date().toISOString(),
    subscription_end_date: subscription?.end_date || null,
    kiwify_customer_id: customerId,
    kiwify_subscription_id: subscription?.id || null,
    last_payment_date: new Date().toISOString()
  };

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    console.error('❌ Erro ao ativar assinatura:', error);
    throw error;
  }

  console.log('✅ Assinatura ativada para usuário:', userId);
  
  // Notificar usuário
  toast({
    title: "Assinatura ativada!",
    description: "Seu plano foi ativado com sucesso. Bem-vindo ao BarberTime Premium!",
  });
};

// Cancelar assinatura
const handleSubscriptionCancelled = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      subscription_status: 'cancelled',
      subscription_end_date: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('❌ Erro ao cancelar assinatura:', error);
    throw error;
  }

  console.log('❌ Assinatura cancelada para usuário:', userId);
};

// Pagamento realizado
const handlePaymentSucceeded = async (userId: string, data: any) => {
  const payment = data.payment;
  
  const { error } = await supabase
    .from('profiles')
    .update({ 
      last_payment_date: payment?.date || new Date().toISOString(),
      subscription_status: 'active' // Reativar se estava cancelada
    })
    .eq('id', userId);

  if (error) {
    console.error('❌ Erro ao registrar pagamento:', error);
    throw error;
  }

  console.log('💰 Pagamento registrado para usuário:', userId);
};

// Assinatura expirada
const handleSubscriptionExpired = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'expired' })
    .eq('id', userId);

  if (error) {
    console.error('❌ Erro ao expirar assinatura:', error);
    throw error;
  }

  console.log('⏰ Assinatura expirada para usuário:', userId);
};

// Função para verificar status da assinatura manualmente
export const checkSubscriptionStatus = async (userId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_end_date, kiwify_customer_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Erro ao verificar status:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('❌ Erro ao verificar status da assinatura:', error);
    return null;
  }
};

// Função para simular ativação manual (para testes)
export const simulateSubscriptionActivation = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        kiwify_customer_id: 'test_customer_' + Date.now(),
        kiwify_subscription_id: 'test_subscription_' + Date.now(),
        last_payment_date: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Erro ao simular ativação:', error);
      throw error;
    }

    console.log('✅ Ativação simulada para usuário:', userId);
    
    toast({
      title: "Assinatura ativada!",
      description: "Seu plano foi ativado com sucesso (simulação).",
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Erro na simulação:', error);
    return { success: false, error: error.message };
  }
}; 