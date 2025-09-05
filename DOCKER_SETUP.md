# 🐳 Configuração Docker para Supabase

Este guia explica como usar Docker para executar a aplicação BarberTime conectada ao Supabase.

## 📋 Pré-requisitos

- Docker Desktop instalado
- Docker Compose instalado
- Conta no Supabase com projeto configurado

## 🚀 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas credenciais do Supabase:

```bash
cp env.docker.example .env
```

Edite o arquivo `.env` com suas credenciais reais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_KEY=sua_chave_service_aqui
```

### 2. Construir a Imagem

```bash
# Usando o script helper
./docker-scripts.sh build

# Ou usando docker-compose diretamente
docker-compose build
```

## 🎯 Modos de Execução

### Modo Desenvolvimento (Apenas App)

Executa apenas a aplicação React conectada ao Supabase remoto:

```bash
./docker-scripts.sh start
```

A aplicação estará disponível em: http://localhost:3000

### Modo Desenvolvimento Local (App + Supabase Local)

Executa a aplicação com uma instância local do Supabase:

```bash
./docker-scripts.sh start-local
```

Serviços disponíveis:
- **Aplicação**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **PostgreSQL**: localhost:54322

### Modo Produção

Executa com nginx reverse proxy:

```bash
./docker-scripts.sh start-prod
```

A aplicação estará disponível em: http://localhost

## 🛠️ Comandos Úteis

### Scripts Helper

#### Linux/macOS (Bash)
```bash
# Construir imagem
./docker-scripts.sh build

# Iniciar aplicação
./docker-scripts.sh start

# Iniciar com Supabase local
./docker-scripts.sh start-local

# Iniciar em produção
./docker-scripts.sh start-prod

# Parar containers
./docker-scripts.sh stop

# Reiniciar aplicação
./docker-scripts.sh restart

# Ver logs
./docker-scripts.sh logs

# Acessar shell do container
./docker-scripts.sh shell

# Limpar tudo
./docker-scripts.sh clean

# Mostrar ajuda
./docker-scripts.sh help
```

#### Windows (PowerShell)
```powershell
# Construir imagem
.\docker-scripts.ps1 build

# Iniciar aplicação
.\docker-scripts.ps1 start

# Iniciar com Supabase local
.\docker-scripts.ps1 start-local

# Iniciar em produção
.\docker-scripts.ps1 start-prod

# Parar containers
.\docker-scripts.ps1 stop

# Reiniciar aplicação
.\docker-scripts.ps1 restart

# Ver logs
.\docker-scripts.ps1 logs

# Acessar shell do container
.\docker-scripts.ps1 shell

# Limpar tudo
.\docker-scripts.ps1 clean

# Mostrar status
.\docker-scripts.ps1 status

# Testar aplicação
.\docker-scripts.ps1 test

# Mostrar ajuda
.\docker-scripts.ps1 help
```

### Comandos Docker Compose Diretos

```bash
# Construir e iniciar
docker-compose up --build

# Iniciar em background
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f

# Reiniciar serviço específico
docker-compose restart app

# Executar comando no container
docker-compose exec app npm run build
```

## 🔧 Configurações Avançadas

### Perfis Docker Compose

O `docker-compose.yml` usa perfis para diferentes cenários:

- **Padrão**: Apenas a aplicação
- **local-db**: Inclui Supabase local e Studio
- **production**: Inclui nginx reverse proxy

### Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Sim |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) | Sim |
| `SUPABASE_SERVICE_KEY` | Chave de serviço (apenas local) | Não |
| `NODE_ENV` | Ambiente de execução | Não |

### Portas Utilizadas

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| App | 3000 | Aplicação React |
| Supabase Studio | 54323 | Interface web do Supabase |
| PostgreSQL | 54322 | Banco de dados local |
| Nginx | 80/443 | Reverse proxy (produção) |

## 🐛 Troubleshooting

### Problema: Container não inicia

```bash
# Verificar logs
docker-compose logs app

# Verificar se as variáveis estão configuradas
docker-compose config
```

### Problema: Erro de conexão com Supabase

1. Verifique se as credenciais no `.env` estão corretas
2. Confirme se o projeto Supabase está ativo
3. Teste a conexão:

```bash
# Testar conexão
./docker-scripts.sh shell
# Dentro do container:
npm run test:supabase
```

### Problema: Porta já em uso

```bash
# Verificar processos usando a porta
netstat -tulpn | grep :3000

# Parar containers conflitantes
docker-compose down
```

### Limpar Cache Docker

```bash
# Limpar tudo
./docker-scripts.sh clean

# Ou manualmente
docker system prune -a
docker volume prune
```

## 📊 Monitoramento

### Health Check

A aplicação inclui um endpoint de health check:

```bash
curl http://localhost:3000/health
```

### Logs em Tempo Real

```bash
# Logs da aplicação
docker-compose logs -f app

# Logs de todos os serviços
docker-compose logs -f
```

## 🔒 Segurança

### Variáveis Sensíveis

- Nunca commite o arquivo `.env`
- Use secrets do Docker em produção
- Rotacione as chaves do Supabase regularmente

### Headers de Segurança

O nginx está configurado com headers de segurança:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

## 🚀 Deploy em Produção

### Docker Swarm

```bash
# Inicializar swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml barbertime
```

### Kubernetes

```bash
# Converter compose para k8s
kompose convert

# Aplicar manifests
kubectl apply -f .
```

## 📚 Recursos Adicionais

- [Documentação Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Supabase Docker](https://supabase.com/docs/guides/self-hosting/docker)
- [Nginx Configuration](https://nginx.org/en/docs/)
