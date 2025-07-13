# 🔐 Configuração do Google OAuth no Supabase

Este documento explica como configurar o login com Google no BarberTime.

## 📋 Pré-requisitos

1. Conta no Google Cloud Console
2. Projeto no Supabase configurado
3. Acesso ao painel administrativo do Supabase

## 🚀 Configuração no Google Cloud Console

### 1. Criar Projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google+ API** e **Google Identity API**

### 2. Configurar OAuth 2.0

1. Vá para **APIs & Services** > **Credentials**
2. Clique em **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
3. Configure:
   - **Application type**: Web application
   - **Name**: BarberTime OAuth
   - **Authorized JavaScript origins**:
     ```
     http://localhost:8080
     http://localhost:8081
     http://localhost:8082
     http://localhost:8083
     http://localhost:8084
     https://seu-dominio.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://ymnzbandwpddtxajpjaa.supabase.co/auth/v1/callback
     ```

### 3. Obter Credenciais

Após criar, você receberá:
- **Client ID**: `seu-client-id.apps.googleusercontent.com`
- **Client Secret**: `seu-client-secret`

## ⚙️ Configuração no Supabase

### 1. Acessar Configurações de Auth

1. Vá para [supabase.com](https://supabase.com)
2. Acesse seu projeto
3. Vá para **Authentication** > **Providers**

### 2. Configurar Google Provider

1. Encontre **Google** na lista de providers
2. Clique em **"Enable"**
3. Configure:
   - **Client ID**: Cole o Client ID do Google
   - **Client Secret**: Cole o Client Secret do Google
   - **Redirect URL**: `https://ymnzbandwpddtxajpjaa.supabase.co/auth/v1/callback`

### 3. Configurações Adicionais

1. **Site URL**: `https://seu-dominio.com`
2. **Redirect URLs**: 
   ```
   https://seu-dominio.com/auth/callback
   http://localhost:8080/auth/callback
   ```

## 🧪 Teste

1. Acesse sua aplicação
2. Clique em "Continuar com Google"
3. Faça login com sua conta Google
4. Verifique se o usuário foi criado no Supabase

## 🔒 Segurança

- Mantenha o Client Secret seguro
- Use HTTPS em produção
- Configure domínios autorizados corretamente
- Monitore logs de autenticação

## 📝 Notas

- O Google OAuth retorna informações básicas: email, nome, foto
- O Supabase automaticamente cria o perfil do usuário
- Você pode personalizar os campos retornados 