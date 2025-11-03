#!/bin/bash

# Quick Frontend Rebuild Script
# Use this during development to quickly rebuild just the frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Rebuilding frontend...${NC}"

# Build the Angular app
cd frontend
npm run build

# Copy the built files to the running container
echo -e "${YELLOW}Copying files to container...${NC}"
docker cp dist/. virtual-team-kit-frontend:/usr/share/nginx/html/

# Restart nginx in the container to pick up changes
echo -e "${YELLOW}Restarting nginx...${NC}"
docker exec virtual-team-kit-frontend nginx -s reload

echo -e "${GREEN}✓ Frontend rebuilt and reloaded!${NC}"
echo -e "${GREEN}Visit: http://lida.virtualteam.software${NC}"
