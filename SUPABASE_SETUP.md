# 🔧 Configuração do Supabase - Cut Time Appointments SaaS

## 🚨 Problema Atual
O projeto Supabase `ymnzbandwpddtxajpjaa` não está respondendo (ERR_NAME_NOT_RESOLVED).

## 🛠️ Solução: Criar Novo Projeto Supabase

### 1. Criar Novo Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"New Project"**
3. Escolha sua organização
4. Nome do projeto: `cut-time-appointments`
5. Senha do banco: (crie uma senha forte)
6. Região: `South America (São Paulo)` ou `US East (N. Virginia)`
7. Clique em **"Create new project"**

### 2. Configurar Variáveis de Ambiente

Após criar o projeto, você receberá:
- **Project URL**: `https://seu-novo-id.supabase.co`
- **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Atualizar Configuração Local

#### Opção A: Usar Variáveis de Ambiente (Recomendado)
Crie um arquivo `.env.local`:
```bash
VITE_SUPABASE_URL=https://seu-novo-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-nova-chave-anonima
```

#### Opção B: Atualizar Arquivo Diretamente
Edite `src/integrations/supabase/client.ts`:
```typescript
const SUPABASE_URL = "https://seu-novo-id.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sua-nova-chave-anonima";
```

### 4. Executar Migrações

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Fazer login
supabase login

# Conectar ao projeto
supabase link --project-ref seu-novo-id

# Executar migrações
supabase db push
```

### 5. Configurar RLS e Políticas

Execute as migrações do diretório `supabase/migrations/`:
```bash
supabase db push
```

### 6. Configurar Auth

1. No dashboard do Supabase, vá em **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:8080` (desenvolvimento)
3. Configure **Redirect URLs**: 
   - `http://localhost:8080/**`
   - `https://seu-dominio.vercel.app/**`

### 7. Testar Conexão

```bash
# Iniciar projeto
npm run dev

# Testar login/registro
```

## 🔒 Configurações de Segurança

### RLS (Row Level Security)
Certifique-se de que o RLS está habilitado:
```sql
-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Políticas de Acesso
As políticas já estão definidas nas migrações, mas verifique se foram aplicadas.

## 🚀 Deploy no Vercel

### 1. Configurar Variáveis no Vercel
No dashboard do Vercel:
- **Settings** → **Environment Variables**
- Adicionar:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 2. Deploy
```bash
npm run deploy
```

## 🐛 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se o projeto Supabase está ativo
- Confirme se as URLs estão corretas
- Teste a conectividade: `curl https://seu-id.supabase.co`

### Erro: "Invalid API key"
- Verifique se a chave anon está correta
- Confirme se não há espaços extras

### Erro: "RLS policy violation"
- Verifique se as políticas estão configuradas
- Confirme se o usuário tem as permissões corretas

## 📞 Suporte

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues**: Use o repositório do projeto

---

**✅ Após seguir estes passos, seu projeto estará funcionando novamente!**

