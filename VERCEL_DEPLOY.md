# 🚀 Guia de Deploy no Vercel - Cut Time Appointments SaaS

## 📋 Pré-requisitos

1. **Conta no Vercel**: [vercel.com](https://vercel.com)
2. **Projeto no Supabase**: [supabase.com](https://supabase.com)
3. **Repositório no GitHub**: Conectado ao Vercel

## 🔧 Configuração das Variáveis de Ambiente

### No Vercel Dashboard:

1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione as seguintes variáveis:

```bash
# Obrigatórias
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# Opcionais
NODE_ENV=production
```

### Como obter as credenciais do Supabase:

1. Acesse seu projeto no Supabase
2. Vá em **Settings** → **API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## 🚀 Deploy Automático

### 1. Conectar Repositório
- No Vercel, clique em **"New Project"**
- Conecte seu repositório GitHub
- O Vercel detectará automaticamente que é um projeto Vite

### 2. Configurações de Build
O projeto já está configurado com:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Deploy
- Clique em **"Deploy"**
- O Vercel fará o build automaticamente
- Aguarde a conclusão (2-3 minutos)

## 🔒 Configurações de Segurança

O `vercel.json` já inclui:
- ✅ Headers de segurança
- ✅ Cache otimizado para assets
- ✅ Rewrites para SPA
- ✅ Configuração de runtime

## 📊 Monitoramento

### Vercel Analytics (Opcional)
1. No dashboard do Vercel
2. Vá em **Analytics**
3. Ative para monitorar performance

### Logs de Deploy
- Acesse **Deployments** no dashboard
- Clique em qualquer deploy para ver logs detalhados

## 🐛 Troubleshooting

### Erro de Build
```bash
# Verifique se todas as dependências estão no package.json
npm install

# Teste o build localmente
npm run build
```

### Erro de Variáveis de Ambiente
- Verifique se todas as variáveis estão configuradas no Vercel
- Certifique-se de que começam com `VITE_` para serem expostas no frontend

### Erro de Rota
- O `vercel.json` já está configurado para SPAs
- Todas as rotas redirecionam para `index.html`

## 🔄 Deploy Contínuo

### Configuração Automática
- **Push para main**: Deploy automático em produção
- **Pull Requests**: Preview deployments automáticos
- **Branches**: Deploy automático para branches

### Comandos Úteis
```bash
# Deploy manual via CLI
npx vercel

# Deploy para produção
npx vercel --prod

# Ver logs
npx vercel logs
```

## 📈 Otimizações Implementadas

### Performance
- ✅ Cache de assets (1 ano)
- ✅ Compressão gzip/brotli
- ✅ CDN global
- ✅ Build otimizado

### Segurança
- ✅ Headers de segurança
- ✅ HTTPS obrigatório
- ✅ Proteção XSS
- ✅ Content Security Policy

### SEO
- ✅ Meta tags otimizadas
- ✅ Sitemap automático
- ✅ Robots.txt

## 🌐 Domínio Customizado

### Adicionar Domínio
1. No Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções

### SSL
- ✅ Certificado SSL automático
- ✅ Renovação automática
- ✅ HTTPS redirect

## 📱 PWA (Futuro)

Para implementar PWA:
1. Adicione `vite-plugin-pwa`
2. Configure service worker
3. Adicione manifest.json

## 🔧 Scripts de Deploy

### package.json
```json
{
  "scripts": {
    "deploy": "vercel --prod",
    "deploy:preview": "vercel",
    "build:vercel": "npm run build"
  }
}
```

## 📞 Suporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Issues**: Use o GitHub Issues do projeto

---

**✅ Seu projeto está pronto para produção no Vercel!**

