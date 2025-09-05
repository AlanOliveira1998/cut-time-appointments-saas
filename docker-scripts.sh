#!/bin/bash

# Scripts para gerenciar a aplicação com Docker

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar ajuda
show_help() {
    echo -e "${BLUE}Comandos disponíveis:${NC}"
    echo ""
    echo "  build          - Constrói a imagem Docker"
    echo "  start          - Inicia a aplicação"
    echo "  start-local    - Inicia com banco local Supabase"
    echo "  start-prod     - Inicia em modo produção com nginx"
    echo "  stop           - Para todos os containers"
    echo "  restart        - Reinicia a aplicação"
    echo "  logs           - Mostra logs da aplicação"
    echo "  shell          - Acessa shell do container"
    echo "  clean          - Remove containers e imagens"
    echo "  help           - Mostra esta ajuda"
    echo ""
}

# Função para verificar se o arquivo .env existe
check_env() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  Arquivo .env não encontrado!${NC}"
        echo -e "${YELLOW}   Copie o arquivo env.docker.example para .env e configure as variáveis${NC}"
        echo -e "${YELLOW}   cp env.docker.example .env${NC}"
        return 1
    fi
    return 0
}

# Função para construir a imagem
build_image() {
    echo -e "${BLUE}🔨 Construindo imagem Docker...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✅ Imagem construída com sucesso!${NC}"
}

# Função para iniciar apenas a aplicação
start_app() {
    if ! check_env; then
        exit 1
    fi
    
    echo -e "${BLUE}🚀 Iniciando aplicação...${NC}"
    docker-compose up -d app
    echo -e "${GREEN}✅ Aplicação iniciada em http://localhost:3000${NC}"
}

# Função para iniciar com banco local
start_local() {
    if ! check_env; then
        exit 1
    fi
    
    echo -e "${BLUE}🚀 Iniciando aplicação com Supabase local...${NC}"
    docker-compose --profile local-db up -d
    echo -e "${GREEN}✅ Aplicação iniciada em http://localhost:3000${NC}"
    echo -e "${GREEN}✅ Supabase Studio em http://localhost:54323${NC}"
    echo -e "${GREEN}✅ Banco PostgreSQL em localhost:54322${NC}"
}

# Função para iniciar em produção
start_prod() {
    if ! check_env; then
        exit 1
    fi
    
    echo -e "${BLUE}🚀 Iniciando em modo produção...${NC}"
    docker-compose --profile production up -d
    echo -e "${GREEN}✅ Aplicação iniciada em http://localhost${NC}"
}

# Função para parar containers
stop_containers() {
    echo -e "${BLUE}🛑 Parando containers...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Containers parados!${NC}"
}

# Função para reiniciar
restart_app() {
    echo -e "${BLUE}🔄 Reiniciando aplicação...${NC}"
    docker-compose restart app
    echo -e "${GREEN}✅ Aplicação reiniciada!${NC}"
}

# Função para mostrar logs
show_logs() {
    echo -e "${BLUE}📋 Mostrando logs...${NC}"
    docker-compose logs -f app
}

# Função para acessar shell
access_shell() {
    echo -e "${BLUE}🐚 Acessando shell do container...${NC}"
    docker-compose exec app sh
}

# Função para limpar
clean_docker() {
    echo -e "${YELLOW}🧹 Limpando containers e imagens...${NC}"
    docker-compose down --rmi all --volumes --remove-orphans
    docker system prune -f
    echo -e "${GREEN}✅ Limpeza concluída!${NC}"
}

# Main script
case "$1" in
    "build")
        build_image
        ;;
    "start")
        start_app
        ;;
    "start-local")
        start_local
        ;;
    "start-prod")
        start_prod
        ;;
    "stop")
        stop_containers
        ;;
    "restart")
        restart_app
        ;;
    "logs")
        show_logs
        ;;
    "shell")
        access_shell
        ;;
    "clean")
        clean_docker
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando não reconhecido: $1${NC}"
        show_help
        exit 1
        ;;
esac
