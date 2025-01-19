# dev.ps1
# PowerShell script for automating Docker Compose dev tasks on Windows
param (
    [string]$Action = "help"
)

$GREEN = "Green"
$RED = "Red"
$NC = "Default"

# Get the script's directory (ensures relative paths work regardless of CWD)
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$ROOT_PROJECT = Join-Path $SCRIPT_DIR "../.."

# Paths
$DOCKER_COMPOSE_DEV = Join-Path $ROOT_PROJECT "infrastructure\docker\docker-compose.dev.yml"
$NGINX_DEV = Join-Path $ROOT_PROJECT "infrastructure\nginx\nginx.dev.conf"

function Run-Dev {
    Write-Host "Starting development environment..." -ForegroundColor $GREEN

    if (!(Test-Path $NGINX_DEV)) {
        Write-Host "Error: NGINX_DEV not found." -ForegroundColor $RED
        exit 1
    }

    docker-compose -f $DOCKER_COMPOSE_DEV up --build -d
    docker-compose -f $DOCKER_COMPOSE_DEV ps
    Write-Host "Development environment is running!" -ForegroundColor $GREEN
    Write-Host "Access the app at https://localhost"
}

function Stop-Dev {
    Write-Host "Stopping development environment..." -ForegroundColor $RED
    docker-compose -f $DOCKER_COMPOSE_DEV down
    Write-Host "Development environment stopped." -ForegroundColor $GREEN
}

function Clean-Dev {
    Write-Host "Cleaning up development environment..." -ForegroundColor $RED
    docker-compose -f $DOCKER_COMPOSE_DEV down --volumes --remove-orphans
    docker-compose -f $DOCKER_COMPOSE_DEV rm --stop --force
    if (-not (docker image rm kanban/frontend:latest kanban/backend:latest)) {
        Write-Host "Some images could not be removed." -ForegroundColor $RED
    }
    Write-Host "Development environment cleaned." -ForegroundColor $GREEN
}

function Show-Usage {
    Write-Host "Usage:" -ForegroundColor $GREEN
    Write-Host "./dev.ps1 run    - Start the development environment"
    Write-Host "./dev.ps1 stop   - Stop the development environment"
    Write-Host "./dev.ps1 clean  - Clean up all resources"
}

switch ($Action.ToLower()) {
    "run" { Run-Dev }
    "stop" { Stop-Dev }
    "clean" { Clean-Dev }
    "help" { Show-Usage }
    default { Show-Usage }
}