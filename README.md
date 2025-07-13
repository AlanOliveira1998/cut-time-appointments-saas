# 🪒 BarberTime - Sistema de Agendamento para Barbearias

Um sistema SaaS completo para gerenciamento de agendamentos em barbearias, construído com React, TypeScript e Supabase.

## ✨ Funcionalidades

### 🎯 Para Clientes
- **Agendamento Online**: Interface intuitiva para agendar horários
- **Seleção de Barbeiros**: Escolha entre diferentes profissionais
- **Serviços Personalizados**: Visualize preços e durações
- **Confirmação por Email**: Receba confirmações automáticas
- **Histórico de Agendamentos**: Acompanhe seus agendamentos

### 🏪 Para Barbeiros
- **Dashboard Completo**: Gerenciamento centralizado
- **Gestão de Serviços**: Adicione e edite serviços
- **Horários de Trabalho**: Configure disponibilidade
- **Lista de Agendamentos**: Visualize agenda diária
- **Gestão de Funcionários**: Adicione barbeiros à equipe

### 🔧 Recursos Técnicos
- **Autenticação Segura**: Supabase Auth com RLS
- **Interface Responsiva**: Funciona em desktop e mobile
- **Validação Robusta**: Formulários com validação em tempo real
- **Performance Otimizada**: Lazy loading e memoização
- **Acessibilidade**: Suporte a leitores de tela

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Formulários**: React Hook Form + Zod
- **Roteamento**: React Router DOM
- **Estado**: React Query + Context API
- **Deploy**: Vercel/Netlify (compatível)

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm 8+ ou yarn
- Conta no Supabase

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/barbertime-appointments-saas.git
cd barbertime-appointments-saas
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Configure o Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrations na pasta `supabase/migrations/`
3. Configure as políticas RLS conforme necessário

### 5. Execute o projeto
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:8080`

## 🗂️ Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── auth/           # Componentes de autenticação
│   ├── booking/        # Componentes de agendamento
│   ├── dashboard/      # Componentes do dashboard
│   └── ui/             # Componentes de UI reutilizáveis
├── contexts/           # Contextos React (Auth, etc.)
├── hooks/              # Hooks customizados
├── integrations/       # Integrações externas (Supabase)
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
├── types/              # Definições de tipos TypeScript
└── utils/              # Funções utilitárias
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build para produção
npm run preview          # Preview do build

# Qualidade de Código
npm run lint             # Executa ESLint
npm run lint:fix         # Corrige problemas do ESLint
npm run format           # Formata código com Prettier
npm run type-check       # Verifica tipos TypeScript

# Testes
npm run test             # Executa testes
npm run test:ui          # Interface visual para testes
npm run test:coverage    # Relatório de cobertura

# Utilitários
npm run list-structure   # Lista estrutura do projeto
```

## 🛠️ Configuração do Supabase

### 1. Tabelas Principais
- `profiles`: Perfis de usuários
- `barbers`: Barbeiros e funcionários
- `services`: Serviços oferecidos
- `working_hours`: Horários de funcionamento
- `appointments`: Agendamentos

### 2. Políticas RLS
O projeto inclui políticas de segurança configuradas:
- Usuários autenticados podem gerenciar seus próprios dados
- Agendamentos públicos podem ser criados por qualquer pessoa
- Barbeiros podem gerenciar seus serviços e horários

### 3. Funções de Banco
- `handle_new_user()`: Cria perfil automaticamente
- `is_barber_owner()`: Verifica se usuário é owner
- `can_create_barber()`: Valida criação de barbeiros

## 🎨 Personalização

### Cores e Tema
As cores podem ser personalizadas no arquivo `src/index.css`:
```css
:root {
  --primary: 200 100% 20%; /* Azul petróleo */
  --accent: 80 85% 55%;    /* Verde limão */
  /* ... outras variáveis */
}
```

### Componentes
Os componentes usam shadcn/ui e podem ser personalizados:
```bash
npx shadcn@latest add [component-name]
```

## 📱 Responsividade

O projeto é totalmente responsivo e funciona em:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🔒 Segurança

- **Autenticação**: Supabase Auth com JWT
- **Autorização**: Row Level Security (RLS)
- **Validação**: Zod schemas em todos os formulários
- **Sanitização**: Input sanitization
- **Rate Limiting**: Proteção contra spam

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Netlify
1. Conecte seu repositório ao Netlify
2. Configure build command: `npm run build`
3. Configure publish directory: `dist`

### Outros
O projeto é compatível com qualquer plataforma que suporte aplicações React estáticas.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- 📧 Email: suporte@barbertime.com
- 💬 Discord: [BarberTime Community](https://discord.gg/barbertime)
- 📖 Documentação: [docs.barbertime.com](https://docs.barbertime.com)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) pela infraestrutura
- [shadcn/ui](https://ui.shadcn.com) pelos componentes
- [Vercel](https://vercel.com) pela hospedagem
- Comunidade React/TypeScript

---

**BarberTime** - Transformando a gestão de barbearias 🪒✨
