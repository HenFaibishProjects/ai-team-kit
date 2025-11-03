# Docker Setup Guide

This guide explains how to run the AI Team Kit application using Docker with a custom domain name.

## Overview

The application runs in Docker containers with the following architecture:
- **Frontend**: Angular application served by nginx
- **Backend**: NestJS API server
- **Database**: PostgreSQL 15
- **Reverse Proxy**: Nginx routing traffic to frontend and backend
- **Custom Domain**: `lida.virtualteam.software`

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)
- At least 4GB of available RAM
- Ports 80 available on your machine

## Quick Start

### 1. Add Custom Domain to Hosts File

To access the application via `lida.virtualteam.software`, add this entry to your hosts file:

**On macOS/Linux:**
```bash
sudo nano /etc/hosts
```

**On Windows:**
```
C:\Windows\System32\drivers\etc\hosts
```

Add this line:
```
127.0.0.1    lida.virtualteam.software
```

Save and close the file.

### 2. Start the Application

Run the startup script:

```bash
./start.sh
```

Or manually with docker-compose:

```bash
docker-compose up --build
```

### 3. Access the Application

Once all containers are running (this may take 2-3 minutes on first run), open your browser and navigate to:

```
http://lida.virtualteam.software
```

The application will be available at this URL!

## Container Details

### Services

1. **postgres** (Database)
   - Image: postgres:15-alpine
   - Internal port: 5432
   - Data persisted in Docker volume: `postgres_data`

2. **backend** (API Server)
   - Built from: `./backend/Dockerfile`
   - Internal port: 3000
   - Health check: `http://backend:3000/health`
   - Environment variables configured for production

3. **frontend** (Web Application)
   - Built from: `./frontend/Dockerfile`
   - Internal port: 80
   - Serves Angular application with nginx
   - Health check: `http://frontend:80/health`

4. **nginx** (Reverse Proxy)
   - Image: nginx:alpine
   - External port: 80
   - Routes:
     - `/api/*` → backend:3000
     - `/*` → frontend:80

### Network

All services communicate on the `ai-team-kit-network` bridge network.

## Useful Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f nginx
```

### Stop the Application
```bash
docker-compose down
```

### Stop and Remove All Data
```bash
docker-compose down -v
```

### Rebuild Containers
```bash
docker-compose up --build
```

### Restart a Specific Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Access Container Shell
```bash
# Backend
docker exec -it ai-team-kit-backend sh

# Frontend
docker exec -it ai-team-kit-frontend sh

# Database
docker exec -it ai-team-kit-postgres psql -U postgres -d ai_team_kit
```

## Health Checks

All services have health checks configured:

- **Backend**: `curl http://localhost:3000/health`
- **Frontend**: `wget http://localhost:80/health`
- **Database**: `pg_isready -U postgres`
- **Nginx**: `curl http://localhost/health`

## Troubleshooting

### Port 80 Already in Use

If port 80 is already in use, you can change it in `docker-compose.yml`:

```yaml
nginx:
  ports:
    - "8080:80"  # Change 80 to 8080 or any available port
```

Then update your hosts file URL to: `http://lida.virtualteam.software:8080`

### Containers Won't Start

1. Check Docker is running:
   ```bash
   docker info
   ```

2. Check for port conflicts:
   ```bash
   lsof -i :80
   ```

3. View detailed logs:
   ```bash
   docker-compose logs
   ```

### Database Connection Issues

1. Ensure postgres container is healthy:
   ```bash
   docker-compose ps postgres
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify database is accessible:
   ```bash
   docker exec -it ai-team-kit-postgres psql -U postgres -d ai_team_kit
   ```

### Frontend Not Loading

1. Check nginx configuration:
   ```bash
   docker exec -it ai-team-kit-nginx nginx -t
   ```

2. Verify frontend is built correctly:
   ```bash
   docker exec -it ai-team-kit-frontend ls -la /usr/share/nginx/html
   ```

### Backend API Errors

1. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

2. Verify backend health:
   ```bash
   curl http://localhost/api/health
   ```

## Data Persistence

The PostgreSQL database data is stored in a Docker volume named `postgres_data`. This means:
- Data persists between container restarts
- Data is preserved when you run `docker-compose down`
- Data is only deleted when you run `docker-compose down -v`

## Production Considerations

For production deployment, consider:

1. **HTTPS**: Add SSL certificates and configure nginx for HTTPS
2. **Environment Variables**: Use `.env` file for sensitive configuration
3. **Database Backups**: Set up automated PostgreSQL backups
4. **Monitoring**: Add monitoring tools (Prometheus, Grafana)
5. **Logging**: Configure centralized logging
6. **Resource Limits**: Set memory and CPU limits in docker-compose.yml
7. **Security**: Update default passwords and add authentication

## Custom Domain Configuration

To use a different domain name:

1. Update `nginx/conf.d/default.conf`:
   ```nginx
   server_name your-custom-domain.com;
   ```

2. Update `docker-compose.yml` frontend build args:
   ```yaml
   args:
     - API_URL=http://your-custom-domain.com/api
   ```

3. Add the domain to your hosts file:
   ```
   127.0.0.1    your-custom-domain.com
   ```

4. Rebuild containers:
   ```bash
   docker-compose up --build
   ```

## Support

For issues or questions:
- Check the logs: `docker-compose logs`
- Review this documentation
- Check Docker and Docker Compose versions
- Ensure all prerequisites are met
