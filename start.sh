#!/bin/bash

# AI Team Kit - Docker Startup Script
# This script starts the entire application stack with a single command

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    echo -e "${2}${1}${NC}"
}

# Print header
print_header() {
    echo ""
    print_message "================================================" "$BLUE"
    print_message "  AI Team Kit - Docker Startup" "$BLUE"
    print_message "================================================" "$BLUE"
    echo ""
}

# Check if Docker is running
check_docker() {
    print_message "Checking Docker..." "$YELLOW"
    if ! docker info > /dev/null 2>&1; then
        print_message "ERROR: Docker is not running!" "$RED"
        print_message "Please start Docker and try again." "$RED"
        exit 1
    fi
    print_message "✓ Docker is running" "$GREEN"
}

# Check if docker-compose is available
check_docker_compose() {
    print_message "Checking Docker Compose..." "$YELLOW"
    if ! command -v docker-compose &> /dev/null; then
        print_message "ERROR: docker-compose is not installed!" "$RED"
        print_message "Please install Docker Compose and try again." "$RED"
        exit 1
    fi
    print_message "✓ Docker Compose is available" "$GREEN"
}

# Check if port 80 is available
check_port() {
    print_message "Checking if port 80 is available..." "$YELLOW"
    if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_message "WARNING: Port 80 is already in use!" "$YELLOW"
        print_message "You may need to stop the service using port 80 or modify docker-compose.yml" "$YELLOW"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_message "✓ Port 80 is available" "$GREEN"
    fi
}

# Check hosts file configuration
check_hosts() {
    print_message "Checking hosts file configuration..." "$YELLOW"
    if grep -q "lida.virtualteam.software" /etc/hosts 2>/dev/null; then
        print_message "✓ Domain configured in hosts file" "$GREEN"
    else
        print_message "WARNING: Domain not found in hosts file!" "$YELLOW"
        print_message "Add this line to /etc/hosts:" "$YELLOW"
        print_message "127.0.0.1    lida.virtualteam.software" "$BLUE"
        echo ""
        print_message "On macOS/Linux: sudo nano /etc/hosts" "$YELLOW"
        print_message "On Windows: C:\\Windows\\System32\\drivers\\etc\\hosts" "$YELLOW"
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Stop existing containers
stop_existing() {
    print_message "Stopping existing containers..." "$YELLOW"
    docker-compose down 2>/dev/null || true
    print_message "✓ Existing containers stopped" "$GREEN"
}

# Build and start containers
start_containers() {
    print_message "Building and starting containers..." "$YELLOW"
    print_message "This may take several minutes on first run..." "$YELLOW"
    echo ""
    
    # Build images separately using docker build to avoid buildx
    print_message "Building backend image..." "$YELLOW"
    if ! docker build -t virtual-team-kit-backend:latest ./backend; then
        print_message "ERROR: Failed to build backend!" "$RED"
        exit 1
    fi
    
    print_message "Building frontend image..." "$YELLOW"
    if ! docker build -t virtual-team-kit-frontend:latest \
        --build-arg API_URL=http://lida.virtualteam.software/api \
        ./frontend; then
        print_message "ERROR: Failed to build frontend!" "$RED"
        exit 1
    fi
    
    print_message "Starting containers..." "$YELLOW"
    if docker-compose up -d; then
        print_message "✓ Containers started successfully" "$GREEN"
    else
        print_message "ERROR: Failed to start containers!" "$RED"
        print_message "Check the logs with: docker-compose logs" "$RED"
        exit 1
    fi
}

# Wait for services to be healthy
wait_for_services() {
    print_message "Waiting for services to be ready..." "$YELLOW"
    echo ""
    
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt + 1))
        
        # Check if all containers are running
        local running=$(docker-compose ps --services --filter "status=running" | wc -l)
        local total=$(docker-compose ps --services | wc -l)
        
        if [ "$running" -eq "$total" ]; then
            print_message "✓ All services are running" "$GREEN"
            break
        fi
        
        echo -ne "\rWaiting... ($attempt/$max_attempts) "
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_message "\nWARNING: Some services may not be ready yet" "$YELLOW"
        print_message "Check status with: docker-compose ps" "$YELLOW"
    fi
    echo ""
}

# Display access information
show_access_info() {
    echo ""
    print_message "================================================" "$GREEN"
    print_message "  Application Started Successfully!" "$GREEN"
    print_message "================================================" "$GREEN"
    echo ""
    print_message "Access the application at:" "$BLUE"
    print_message "  http://lida.virtualteam.software" "$GREEN"
    echo ""
    print_message "Useful commands:" "$BLUE"
    print_message "  View logs:        docker-compose logs -f" "$YELLOW"
    print_message "  Stop app:         docker-compose down" "$YELLOW"
    print_message "  Restart service:  docker-compose restart <service>" "$YELLOW"
    print_message "  View status:      docker-compose ps" "$YELLOW"
    echo ""
    print_message "For more information, see DOCKER_SETUP.md" "$BLUE"
    echo ""
}

# Main execution
main() {
    print_header
    check_docker
    check_docker_compose
    check_port
    check_hosts
    echo ""
    stop_existing
    echo ""
    start_containers
    echo ""
    wait_for_services
    show_access_info
}

# Run main function
main
