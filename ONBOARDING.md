# 🚀 Onboarding - Cut Time Appointments SaaS

Bem-vindo ao projeto **Cut Time Appointments SaaS**! Este é um sistema completo de agendamento para barbearias desenvolvido com React, TypeScript, Supabase e Tailwind CSS.

## 📋 Pré-requisitos

- **Node.js**: Versão 18.0.0 ou superior
- **npm**: Versão 8.0.0 ou superior
- **Git**: Para clonar o repositório
- **Conta no Supabase**: Para o banco de dados

## 🛠️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd cut-time-appointments-saas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

#### 3.1 Crie um projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a **URL** e **ANON KEY** do projeto

#### 3.2 Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

#### 3.3 Execute as migrações do banco

```bash
# Instale o CLI do Supabase (se ainda não tiver)
npm install -g supabase

# Faça login no Supabase
supabase login

# Execute as migrações
supabase db push
```

### 4. Execute o projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/            # Componentes base (shadcn/ui)
│   ├── booking/       # Componentes específicos de agendamento
│   └── admin/         # Componentes do painel administrativo
├── pages/             # Páginas da aplicação
├── hooks/             # Hooks personalizados
├── contexts/          # Contextos React (Auth, etc.)
├── services/          # Serviços de API e comunicação externa
├── types/             # Definições de tipos TypeScript
├── lib/               # Utilitários e configurações
├── integrations/      # Integrações externas (Supabase, etc.)
└── assets/            # Recursos estáticos
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build para produção
npm run preview          # Preview da build

# Qualidade de código
npm run lint             # Executa ESLint
npm run lint:fix         # Corrige problemas do ESLint
npm run format           # Formata código com Prettier
npm run type-check       # Verifica tipos TypeScript

# Testes
npm run test             # Executa testes unitários
npm run test:ui          # Interface visual para testes
npm run test:coverage    # Relatório de cobertura de testes

# Utilitários
npm run list-structure   # Lista estrutura do projeto
```

## 🚀 Deploy em Produção

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. Deploy automático a cada push para `main`

### Outras plataformas

O projeto é compatível com qualquer plataforma que suporte aplicações React/Node.js.

## 🔐 Configurações de Segurança

### Variáveis de Ambiente Obrigatórias

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### Variáveis Opcionais

```env
VITE_APP_ENV=development  # development, staging, production
VITE_APP_VERSION=1.0.0    # Versão da aplicação
```

## 🧪 Testes

### Executando testes

```bash
# Todos os testes
npm run test

# Testes com interface visual
npm run test:ui

# Cobertura de testes
npm run test:coverage
```

### Estrutura de testes

```
src/
├── __tests__/          # Testes unitários
├── components/         # Testes de componentes
└── hooks/             # Testes de hooks
```

## 📚 Documentação Adicional

- [Configuração do Google OAuth](./GOOGLE_OAUTH_SETUP.md)
- [Configuração de Webhooks](./WEBHOOK_SETUP.md)
- [Guia de Contribuição](./CONTRIBUTING.md)

## 🆘 Troubleshooting

### Problemas comuns

1. **Erro de conexão com Supabase**
   - Verifique se as variáveis de ambiente estão corretas
   - Confirme se o projeto Supabase está ativo

2. **Erro de build**
   - Execute `npm run type-check` para verificar tipos
   - Verifique se todas as dependências estão instaladas

3. **Problemas de autenticação**
   - Verifique se as políticas RLS estão configuradas no Supabase
   - Confirme se o email de confirmação foi enviado

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- **Issues**: Use o GitHub Issues para reportar bugs
- **Discord**: Junte-se ao nosso servidor para discussões
- **Email**: contato@cuttime.com

---

**Happy Coding! 🎉**
