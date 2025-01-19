#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Get the script's directory (ensures paths work relative to the script's location)
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_PROJECT=$(realpath "$SCRIPT_DIR/../..")

# Paths
DOCKER_COMPOSE_DEV="$ROOT_PROJECT/infrastructure/docker/docker-compose.dev.yml"
NGINX_DEV="$ROOT_PROJECT/infrastructure/nginx/nginx.dev.conf"

run_dev() {
    echo -e "${GREEN}Starting development environment...${NC}"

    if [[ ! -f "$NGINX_DEV" ]]; then
        echo -e "${RED}Error: $NGINX_DEV not found.${NC}"
        exit 1
    fi

    docker compose -f "$DOCKER_COMPOSE_DEV" up --build -d
    docker compose -f "$DOCKER_COMPOSE_DEV" ps
    echo -e "${GREEN}Development environment is running!${NC}"
    echo "Access the app at https://localhost"
}

stop_dev() {
    echo -e "${RED}Stopping development environment...${NC}"
    docker compose -f "$DOCKER_COMPOSE_DEV" down
    echo -e "${GREEN}✓ Development environment stopped.${NC}"
}

clean_dev() {
    echo -e "${RED}Cleaning up development environment...${NC}"
    docker compose -f "$DOCKER_COMPOSE_DEV" down --volumes --remove-orphans
    docker image rm kanban/frontend:latest kanban/backend:latest || echo -e "${RED}Some images could not be removed.${NC}"
    echo -e "${GREEN}✓ Development environment cleaned.${NC}"
}

usage() {
    echo -e "${GREEN}Usage:${NC}"
    echo "./dev.sh run    - Start the development environment"
    echo "./dev.sh stop   - Stop the development environment"
    echo "./dev.sh clean  - Clean up all resources"
}

case "$1" in
    run) run_dev ;;
    stop) stop_dev ;;
    clean) clean_dev ;;
    *) usage ;;
esac
