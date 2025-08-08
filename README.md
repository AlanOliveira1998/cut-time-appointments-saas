# BarberTime - Sistema de Agendamento para Barbearias

Sistema SaaS completo para gerenciamento de agendamentos em barbearias, com dashboard administrativo, sistema de usuários e agendamentos.

## 🚀 Funcionalidades

- **Sistema de Autenticação**: Login/registro com Supabase
- **Dashboard Administrativo**: Gestão completa de barbearias e usuários
- **Sistema de Agendamentos**: Interface intuitiva para clientes
- **Gestão de Serviços**: CRUD completo de serviços oferecidos
- **Relatórios e Analytics**: Dashboard com métricas importantes
- **Interface Responsiva**: Design moderno com Tailwind CSS

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: React Context + Custom Hooks
- **Formulários**: React Hook Form + Zod
- **Testes**: Vitest + React Testing Library
- **Documentação**: Storybook
- **Internacionalização**: i18next

## 📋 Pré-requisitos

- Node.js 18+
- npm 8+
- Conta no Supabase

## 🚀 Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/barbertime-appointments-saas.git
   cd barbertime-appointments-saas
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edite o arquivo `.env.local` com suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

4. **Configure o banco de dados:**
   ```bash
   npx supabase db push
   ```

5. **Execute o projeto:**
   ```bash
   npm run dev
   ```

## 📚 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run test` - Executa os testes
- `npm run lint` - Verifica o código com ESLint
- `npm run format` - Formata o código com Prettier
- `npm run storybook` - Inicia o Storybook

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── admin/          # Componentes administrativos
│   ├── auth/           # Componentes de autenticação
│   ├── booking/        # Componentes de agendamento
│   └── ui/             # Componentes de interface
├── contexts/            # Contextos React (Auth, etc.)
├── hooks/               # Hooks customizados
├── lib/                 # Utilitários e configurações
├── pages/               # Páginas da aplicação
├── services/            # Serviços para comunicação com APIs
└── types/               # Definições de tipos TypeScript
```

## 🔧 Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as tabelas necessárias (veja `supabase/migrations/`)
3. Configure as políticas de segurança (RLS)
4. Adicione as credenciais no arquivo `.env.local`

## 🧪 Testes

O projeto inclui testes unitários abrangentes:

```bash
# Executar todos os testes
npm run test

# Executar testes com UI
npm run test:ui

# Verificar cobertura
npm run test:coverage
```

## 📖 Storybook

Para visualizar e testar componentes isoladamente:

```bash
npm run storybook
```

## 🌐 Internacionalização

O projeto suporta português e inglês usando i18next:

```bash
# Adicionar novo idioma
# Edite src/lib/i18n.ts e adicione as traduções
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras plataformas
- Netlify
- Railway
- Heroku

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/barbertime-appointments-saas/issues)
- **Email**: suporte@barbertime.com
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/barbertime-appointments-saas/wiki)

---

**Desenvolvido com ❤️ pela equipe BarberTime**

## 🧪 Teste do Husky com PowerShell

Esta linha foi adicionada para testar se o hook do Husky está funcionando corretamente com PowerShell no Windows.
