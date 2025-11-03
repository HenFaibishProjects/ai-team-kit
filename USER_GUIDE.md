# Virtual Team Kit - User Installation Guide

## Complete Guide for End Users

Welcome! This guide will help you install and run Virtual Team Kit on your computer using Docker.

---

## Table of Contents
1. [What You'll Need](#what-youll-need)
2. [Installation Steps](#installation-steps)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Accessing the Application](#accessing-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Updating](#updating)
8. [Uninstalling](#uninstalling)

---

## What You'll Need

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: At least 2GB free space
- **Internet Connection**: Required for initial download

### Required Software

You need to install **Docker Desktop** on your computer:

#### For Windows:
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Run the installer
3. Follow the installation wizard
4. Restart your computer when prompted
5. Open Docker Desktop and wait for it to start

#### For macOS:
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Open the `.dmg` file
3. Drag Docker to Applications folder
4. Open Docker from Applications
5. Grant necessary permissions when prompted

#### For Linux (Ubuntu/Debian):
```bash
# Update package index
sudo apt-get update

# Install Docker
sudo apt-get install docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# Log out and log back in for changes to take effect
```

---

## Installation Steps

### Method 1: Using Docker Compose (Recommended)

This is the easiest method and recommended for most users.

#### Step 1: Create a Project Folder

Create a new folder on your computer where you want to keep Virtual Team Kit:

**Windows:**
```cmd
mkdir C:\VirtualTeamKit
cd C:\VirtualTeamKit
```

**macOS/Linux:**
```bash
mkdir ~/VirtualTeamKit
cd ~/VirtualTeamKit
```

#### Step 2: Download Configuration Files

Download these two files and save them in your VirtualTeamKit folder:

**File 1: `docker-compose.yml`**

Create a file named `docker-compose.yml` with this content:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: virtual-team-kit-db
    environment:
      POSTGRES_DB: virtual_team_kit
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: YOUR_DOCKERHUB_USERNAME/virtual-team-kit-backend:latest
    container_name: virtual-team-kit-backend
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: postgres
      DATABASE_PASSWORD: postgres123
      DATABASE_NAME: virtual_team_kit
      JWT_SECRET: your-super-secret-jwt-key-change-this-in-production
      PORT: 3000
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: YOUR_DOCKERHUB_USERNAME/virtual-team-kit-frontend:latest
    container_name: virtual-team-kit-frontend
    depends_on:
      - backend
    ports:
      - "80:80"
    environment:
      API_URL: http://localhost:3000

volumes:
  postgres_data:
```

**File 2: `.env` (Optional - for custom configuration)**

Create a file named `.env` if you want to customize settings:

```env
# Database Configuration
POSTGRES_DB=virtual_team_kit
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123

# Backend Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000

# Frontend Configuration
API_URL=http://localhost:3000
```

#### Step 3: Start the Application

Open a terminal/command prompt in your VirtualTeamKit folder and run:

```bash
docker-compose up -d
```

This command will:
- Download all necessary Docker images (first time only - may take 5-10 minutes)
- Create and start all containers
- Set up the database
- Start the application

#### Step 4: Wait for Startup

Wait about 30-60 seconds for all services to fully start. You can check the status with:

```bash
docker-compose ps
```

All services should show "Up" status.

---

### Method 2: Using Docker Commands Directly

If you prefer not to use docker-compose:

```bash
# Create a network
docker network create virtual-team-kit-network

# Start PostgreSQL
docker run -d \
  --name virtual-team-kit-db \
  --network virtual-team-kit-network \
  -e POSTGRES_DB=virtual_team_kit \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine

# Wait 10 seconds for database to start
sleep 10

# Start Backend
docker run -d \
  --name virtual-team-kit-backend \
  --network virtual-team-kit-network \
  -e DATABASE_HOST=virtual-team-kit-db \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=postgres123 \
  -e DATABASE_NAME=virtual_team_kit \
  -e JWT_SECRET=your-secret-key \
  -p 3000:3000 \
  YOUR_DOCKERHUB_USERNAME/virtual-team-kit-backend:latest

# Start Frontend
docker run -d \
  --name virtual-team-kit-frontend \
  --network virtual-team-kit-network \
  -e API_URL=http://localhost:3000 \
  -p 80:80 \
  YOUR_DOCKERHUB_USERNAME/virtual-team-kit-frontend:latest
```

---

## Quick Start

### Starting the Application

```bash
# Navigate to your VirtualTeamKit folder
cd ~/VirtualTeamKit  # or C:\VirtualTeamKit on Windows

# Start all services
docker-compose up -d
```

### Stopping the Application

```bash
# Stop all services (keeps your data)
docker-compose stop

# Or stop and remove containers (keeps your data in volumes)
docker-compose down
```

### Restarting the Application

```bash
docker-compose restart
```

---

## Configuration

### Changing the Port

If port 80 is already in use on your computer, you can change it:

Edit `docker-compose.yml` and change the frontend ports line:

```yaml
ports:
  - "8080:80"  # Change 8080 to any available port
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

### Changing Database Password

1. Edit `.env` file or the `docker-compose.yml` file
2. Change `POSTGRES_PASSWORD` to your desired password
3. Update the same password in the backend's `DATABASE_PASSWORD`
4. Remove old database volume:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Persistent Data

Your data is stored in Docker volumes and will persist even if you stop or remove containers. To see your volumes:

```bash
docker volume ls
```

---

## Accessing the Application

### Open in Your Browser

Once the application is running, open your web browser and go to:

```
http://localhost
```

Or if you changed the port to 8080:

```
http://localhost:8080
```

### First Time Setup

1. The application will load the dashboard
2. Start by setting up your organization
3. Add team members
4. Create your first project

### Features Available

- **Dashboard**: Overview of all projects and activities
- **Organization Setup**: Configure your organization details
- **Team Management**: Add and manage team members
- **Project Creation**: Start new projects with AI assistance
- **Sprint Planning**: Plan and manage sprints
- **AI Command Center**: Get AI-powered insights and assistance
- **Export**: Export project documentation

---

## Troubleshooting

### Application Won't Start

**Check if Docker is running:**
```bash
docker ps
```

If you get an error, start Docker Desktop.

**Check container logs:**
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Can't Access the Application

**Check if containers are running:**
```bash
docker-compose ps
```

All services should show "Up" status.

**Check if port is available:**

On Windows:
```cmd
netstat -ano | findstr :80
```

On macOS/Linux:
```bash
lsof -i :80
```

If port 80 is in use, change to a different port (see Configuration section).

### Database Connection Errors

**Reset the database:**
```bash
docker-compose down -v
docker-compose up -d
```

**Note:** This will delete all your data!

### "Out of Memory" Errors

Increase Docker's memory allocation:

1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase Memory to at least 4GB
4. Click "Apply & Restart"

### Slow Performance

**Check Docker resource usage:**
```bash
docker stats
```

**Restart Docker Desktop:**
1. Right-click Docker Desktop icon
2. Select "Restart"

### Port Already in Use

If you see "port is already allocated":

1. Find what's using the port:
   - Windows: `netstat -ano | findstr :80`
   - macOS/Linux: `lsof -i :80`

2. Either stop that service or change Virtual Team Kit's port (see Configuration)

---

## Updating

### Update to Latest Version

```bash
# Stop the application
docker-compose down

# Pull latest images
docker-compose pull

# Start with new images
docker-compose up -d
```

### Update to Specific Version

Edit `docker-compose.yml` and change `latest` to the version number:

```yaml
image: YOUR_DOCKERHUB_USERNAME/virtual-team-kit-backend:1.2.0
```

Then:
```bash
docker-compose down
docker-compose up -d
```

---

## Uninstalling

### Remove Application (Keep Data)

```bash
docker-compose down
```

### Remove Application and All Data

```bash
# Stop and remove containers and volumes
docker-compose down -v

# Remove images
docker rmi YOUR_DOCKERHUB_USERNAME/virtual-team-kit-backend:latest
docker rmi YOUR_DOCKERHUB_USERNAME/virtual-team-kit-frontend:latest
docker rmi postgres:15-alpine
```

### Complete Cleanup

```bash
# Remove everything
docker-compose down -v --rmi all

# Remove the project folder
# Windows: rmdir /s C:\VirtualTeamKit
# macOS/Linux: rm -rf ~/VirtualTeamKit
```

---

## Backup and Restore

### Backup Your Data

```bash
# Create backup of database
docker exec virtual-team-kit-db pg_dump -U postgres virtual_team_kit > backup.sql
```

### Restore Your Data

```bash
# Restore from backup
docker exec -i virtual-team-kit-db psql -U postgres virtual_team_kit < backup.sql
```

---

## Getting Help

### Check Logs

```bash
# View all logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# View specific service
docker-compose logs -f backend
```

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Can't connect to database | Wait 30 seconds after starting, or run `docker-compose restart backend` |
| Frontend shows error | Check backend is running: `docker-compose ps` |
| Slow performance | Increase Docker memory in Docker Desktop settings |
| Port conflict | Change port in docker-compose.yml |
| Out of disk space | Run `docker system prune` to clean up |

### Support Resources

- **Documentation**: Check the included documentation files
- **GitHub Issues**: Report bugs or request features
- **Community**: Join discussions on GitHub

---

## Tips for Best Experience

1. **Regular Backups**: Backup your database weekly
2. **Keep Updated**: Update to latest version monthly
3. **Monitor Resources**: Check Docker stats if performance degrades
4. **Clean Up**: Run `docker system prune` monthly to free space
5. **Secure Passwords**: Change default passwords in production

---

## System Commands Reference

### Essential Commands

```bash
# Start application
docker-compose up -d

# Stop application
docker-compose stop

# Restart application
docker-compose restart

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Update to latest
docker-compose pull && docker-compose up -d

# Complete shutdown
docker-compose down

# Shutdown and remove data
docker-compose down -v
```

---

## FAQ

**Q: Do I need to keep the terminal open?**
A: No, the `-d` flag runs containers in the background.

**Q: Will my data be lost if I stop Docker?**
A: No, data is stored in volumes and persists across restarts.

**Q: Can I run this on a server?**
A: Yes, but change `localhost` to your server's IP address in the configuration.

**Q: How much disk space do I need?**
A: About 2GB for the application plus space for your data.

**Q: Can multiple people use it at once?**
A: Yes, it's designed for team collaboration.

**Q: Is internet required after installation?**
A: Only for initial download. After that, it runs locally.

---

## Next Steps

After installation:

1. ✅ Open http://localhost in your browser
2. ✅ Set up your organization
3. ✅ Add team members
4. ✅ Create your first project
5. ✅ Explore the AI Command Center
6. ✅ Check out the Help & Support section in the app

---

**Enjoy using Virtual Team Kit!** 🚀

For questions or issues, please check the troubleshooting section or visit our GitHub repository.

---

**Last Updated**: November 2025
**Version**: 1.0.0
**License**: MIT
