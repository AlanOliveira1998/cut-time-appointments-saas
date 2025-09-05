# Scripts PowerShell para gerenciar a aplicação com Docker

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Cores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Função para mostrar ajuda
function Show-Help {
    Write-Host "Comandos disponíveis:" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "  build          - Constrói a imagem Docker" -ForegroundColor White
    Write-Host "  start          - Inicia a aplicação" -ForegroundColor White
    Write-Host "  start-local    - Inicia com banco local Supabase" -ForegroundColor White
    Write-Host "  start-prod     - Inicia em modo produção com nginx" -ForegroundColor White
    Write-Host "  stop           - Para todos os containers" -ForegroundColor White
    Write-Host "  restart        - Reinicia a aplicação" -ForegroundColor White
    Write-Host "  logs           - Mostra logs da aplicação" -ForegroundColor White
    Write-Host "  shell          - Acessa shell do container" -ForegroundColor White
    Write-Host "  clean          - Remove containers e imagens" -ForegroundColor White
    Write-Host "  status         - Mostra status dos containers" -ForegroundColor White
    Write-Host "  test           - Testa se a aplicação está funcionando" -ForegroundColor White
    Write-Host "  help           - Mostra esta ajuda" -ForegroundColor White
    Write-Host ""
}

# Função para verificar se o arquivo .env existe
function Test-EnvFile {
    if (-not (Test-Path ".env")) {
        Write-Host "AVISO: Arquivo .env não encontrado!" -ForegroundColor $Yellow
        Write-Host "   Copie o arquivo env.docker.example para .env e configure as variáveis" -ForegroundColor $Yellow
        Write-Host "   Copy-Item env.docker.example .env" -ForegroundColor $Yellow
        return $false
    }
    return $true
}

# Função para construir a imagem
function Build-Image {
    Write-Host "Construindo imagem Docker..." -ForegroundColor $Blue
    docker compose build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Imagem construída com sucesso!" -ForegroundColor $Green
    } else {
        Write-Host "Erro ao construir a imagem" -ForegroundColor $Red
    }
}

# Função para iniciar apenas a aplicação
function Start-App {
    if (-not (Test-EnvFile)) {
        exit 1
    }
    
    Write-Host "Iniciando aplicação..." -ForegroundColor $Blue
    docker compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Aplicação iniciada em http://localhost:3000" -ForegroundColor $Green
    } else {
        Write-Host "Erro ao iniciar a aplicação" -ForegroundColor $Red
    }
}

# Função para iniciar com banco local
function Start-Local {
    if (-not (Test-EnvFile)) {
        exit 1
    }
    
    Write-Host "Iniciando aplicação com Supabase local..." -ForegroundColor $Blue
    docker compose --profile local-db up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Aplicação iniciada em http://localhost:3000" -ForegroundColor $Green
        Write-Host "Supabase Studio em http://localhost:54323" -ForegroundColor $Green
        Write-Host "Banco PostgreSQL em localhost:54322" -ForegroundColor $Green
    } else {
        Write-Host "Erro ao iniciar a aplicação" -ForegroundColor $Red
    }
}

# Função para iniciar em produção
function Start-Production {
    if (-not (Test-EnvFile)) {
        exit 1
    }
    
    Write-Host "Iniciando em modo produção..." -ForegroundColor $Blue
    docker compose --profile production up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Aplicação iniciada em http://localhost" -ForegroundColor $Green
    } else {
        Write-Host "Erro ao iniciar a aplicação" -ForegroundColor $Red
    }
}

# Função para parar containers
function Stop-Containers {
    Write-Host "Parando containers..." -ForegroundColor $Blue
    docker compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Containers parados!" -ForegroundColor $Green
    } else {
        Write-Host "Erro ao parar containers" -ForegroundColor $Red
    }
}

# Função para reiniciar
function Restart-App {
    Write-Host "Reiniciando aplicação..." -ForegroundColor $Blue
    docker compose restart app
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Aplicação reiniciada!" -ForegroundColor $Green
    } else {
        Write-Host "Erro ao reiniciar aplicação" -ForegroundColor $Red
    }
}

# Função para mostrar logs
function Show-Logs {
    Write-Host "Mostrando logs..." -ForegroundColor $Blue
    docker compose logs -f app
}

# Função para acessar shell
function Access-Shell {
    Write-Host "Acessando shell do container..." -ForegroundColor $Blue
    docker compose exec app sh
}

# Função para limpar
function Clean-Docker {
    Write-Host "Limpando containers e imagens..." -ForegroundColor $Yellow
    docker compose down --rmi all --volumes --remove-orphans
    docker system prune -f
    Write-Host "Limpeza concluída!" -ForegroundColor $Green
}

# Função para mostrar status
function Show-Status {
    Write-Host "Status dos containers:" -ForegroundColor $Blue
    docker compose ps
}

# Função para testar aplicação
function Test-App {
    Write-Host "Testando aplicação..." -ForegroundColor $Blue
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "Aplicação está funcionando! (Status: $($response.StatusCode))" -ForegroundColor $Green
        } else {
            Write-Host "Aplicação respondeu com status: $($response.StatusCode)" -ForegroundColor $Yellow
        }
    } catch {
        Write-Host "Aplicação não está respondendo: $($_.Exception.Message)" -ForegroundColor $Red
    }
}

# Main script
switch ($Command.ToLower()) {
    "build" { Build-Image }
    "start" { Start-App }
    "start-local" { Start-Local }
    "start-prod" { Start-Production }
    "stop" { Stop-Containers }
    "restart" { Restart-App }
    "logs" { Show-Logs }
    "shell" { Access-Shell }
    "clean" { Clean-Docker }
    "status" { Show-Status }
    "test" { Test-App }
    "help" { Show-Help }
    default {
        Write-Host "Comando não reconhecido: $Command" -ForegroundColor $Red
        Show-Help
        exit 1
    }
}