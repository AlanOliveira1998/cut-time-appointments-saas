# 🔗 Configuração de Webhooks do Kiwify

Este documento explica como configurar os webhooks do Kiwify para sincronizar automaticamente o status de pagamento com o BarberTime.

## 📋 Pré-requisitos

1. Conta no Kiwify com produto configurado
2. Acesso ao painel administrativo do Kiwify
3. URL de webhook configurada no seu servidor

## 🚀 Configuração no Kiwify

### 1. Acessar Configurações de Webhook

1. Faça login no [Kiwify](https://kiwify.com.br)
2. Vá para **Produtos** > Seu Produto
3. Clique em **Configurações** > **Webhooks**

### 2. Configurar URL do Webhook

**URL do Webhook:**
```
https://seu-dominio.com/api/webhook/kiwify
```

**Eventos a serem monitorados:**
- ✅ `subscription.created` - Nova assinatura criada
- ✅ `subscription.activated` - Assinatura ativada
- ✅ `subscription.cancelled` - Assinatura cancelada
- ✅ `subscription.expired` - Assinatura expirada
- ✅ `payment.succeeded` - Pagamento realizado com sucesso
- ✅ `payment.failed` - Pagamento falhou

### 3. Configurar Segurança

**Chave Secreta (recomendado):**
```
barbertime_webhook_secret_2024
```

## 🔧 Implementação no Servidor

### Opção 1: Vercel (Recomendado)

1. **Criar arquivo de API:**
```typescript
// api/webhook/kiwify.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { processKiwifyWebhook } from '../../lib/kiwify-webhook';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar assinatura do webhook
    const signature = req.headers['x-kiwify-signature'];
    const secret = process.env.KIWIFY_WEBHOOK_SECRET;
    
    // TODO: Implementar verificação de assinatura
    
    const result = await processKiwifyWebhook(req.body);
    
    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
```

2. **Configurar variáveis de ambiente:**
```env
KIWIFY_WEBHOOK_SECRET=barbertime_webhook_secret_2024
```

### Opção 2: Netlify Functions

1. **Criar função:**
```typescript
// netlify/functions/kiwify-webhook.ts
import { Handler } from '@netlify/functions';
import { processKiwifyWebhook } from '../../src/lib/kiwify-webhook';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const result = await processKiwifyWebhook(JSON.parse(event.body || '{}'));
    
    return {
      statusCode: result.success ? 200 : 400,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Internal server error' })
    };
  }
};
```

### Opção 3: Supabase Edge Functions

1. **Criar função:**
```typescript
// supabase/functions/kiwify-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const webhookData = await req.json();
    
    // Processar webhook
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Implementar lógica de processamento aqui
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## 🧪 Testando o Webhook

### 1. Usando cURL

```bash
curl -X POST https://seu-dominio.com/api/webhook/kiwify \
  -H "Content-Type: application/json" \
  -H "x-kiwify-signature: test_signature" \
  -d '{
    "event": "subscription.activated",
    "data": {
      "customer": {
        "email": "teste@exemplo.com",
        "id": "customer_123"
      },
      "subscription": {
        "id": "sub_456",
        "status": "active",
        "start_date": "2024-01-01T00:00:00Z",
        "end_date": "2024-02-01T00:00:00Z"
      }
    }
  }'
```

### 2. Usando Postman

1. Crie uma nova requisição POST
2. URL: `https://seu-dominio.com/api/webhook/kiwify`
3. Headers:
   - `Content-Type: application/json`
   - `x-kiwify-signature: test_signature`
4. Body (JSON):
```json
{
  "event": "subscription.activated",
  "data": {
    "customer": {
      "email": "teste@exemplo.com",
      "id": "customer_123"
    },
    "subscription": {
      "id": "sub_456",
      "status": "active",
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-02-01T00:00:00Z"
    }
  }
}
```

## 🔍 Monitoramento

### 1. Logs do Servidor

Monitore os logs do seu servidor para verificar se os webhooks estão sendo recebidos:

```bash
# Vercel
vercel logs

# Netlify
netlify functions:logs

# Supabase
supabase functions logs kiwify-webhook
```

### 2. Dashboard do Kiwify

No painel do Kiwify, você pode ver:
- Status dos webhooks enviados
- Histórico de tentativas
- Erros de entrega

### 3. Banco de Dados

Verifique se os dados estão sendo atualizados:

```sql
-- Verificar assinaturas ativas
SELECT id, name, subscription_status, subscription_start_date, subscription_end_date
FROM profiles
WHERE subscription_status = 'active';

-- Verificar últimas atualizações
SELECT id, name, subscription_status, last_payment_date
FROM profiles
ORDER BY last_payment_date DESC
LIMIT 10;
```

## 🚨 Troubleshooting

### Problema: Webhook não está sendo recebido

**Soluções:**
1. Verificar se a URL está correta no Kiwify
2. Confirmar se o servidor está online
3. Verificar logs do servidor
4. Testar com ferramentas como webhook.site

### Problema: Webhook recebido mas dados não atualizados

**Soluções:**
1. Verificar logs de erro no servidor
2. Confirmar se o email do cliente existe no sistema
3. Verificar permissões do banco de dados
4. Testar com dados de exemplo

### Problema: Assinatura não é ativada automaticamente

**Soluções:**
1. Verificar se o webhook está processando o evento correto
2. Confirmar se a função `processKiwifyWebhook` está sendo chamada
3. Verificar se há erros no console do navegador
4. Testar manualmente com o botão "🧪 Testar Ativação"

## 📞 Suporte

Se você encontrar problemas:

1. **Verifique os logs** do servidor
2. **Teste com dados de exemplo**
3. **Entre em contato** com o suporte do Kiwify
4. **Abra uma issue** no repositório do projeto

---

**Nota:** Esta configuração garante que o status de pagamento seja sincronizado automaticamente entre o Kiwify e o BarberTime, eliminando a necessidade de verificação manual. 