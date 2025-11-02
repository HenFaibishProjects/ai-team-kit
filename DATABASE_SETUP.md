# PostgreSQL Database Setup Guide

This guide explains how to set up and use PostgreSQL with the Virtual Team Kit application.

## Overview

The application now uses PostgreSQL as the database backend with TypeORM as the ORM. Data is organized by users, where each user can have multiple projects.

## Database Schema

### Tables

#### `users`
Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| email | VARCHAR | Unique email address |
| username | VARCHAR | User's display name |
| passwordHash | VARCHAR | Hashed password (nullable for now) |
| createdAt | TIMESTAMP | Account creation date |
| updatedAt | TIMESTAMP | Last update date |

#### `projects`
Stores project configurations with all related data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| userId | UUID | Foreign key to users table |
| projectName | VARCHAR | Project name |
| teamConfig | JSONB | Complete team configuration (agents, features) |
| sprintPlan | TEXT | Sprint planning document (optional) |
| raciChart | TEXT | RACI chart document (optional) |
| adrDocument | TEXT | ADR document (optional) |
| createdAt | TIMESTAMP | Project creation date |
| updatedAt | TIMESTAMP | Last update date |

### Relationships

- **One-to-Many**: User → Projects
  - One user can have multiple projects
  - Cascade delete: Deleting a user deletes all their projects

## Prerequisites

1. PostgreSQL 12 or higher installed
2. Database client (optional): pgAdmin, DBeaver, or psql CLI

## Installation

### macOS

```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows

Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

## Database Setup

### Step 1: Create Database

```bash
# Connect to PostgreSQL as superuser
psql postgres

# Create database
CREATE DATABASE ai_team_kit;

# Create user (optional, for production)
CREATE USER ai_team_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ai_team_kit TO ai_team_user;

# Exit psql
\q
```

### Step 2: Configure Environment Variables

Copy the example environment file:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres          # or ai_team_user
DB_PASSWORD=postgres          # your password
DB_DATABASE=ai_team_kit
DB_SSL=false                  # set to true for production
```

### Step 3: Run the Application

The database schema will be automatically created on first run (development mode):

```bash
cd backend
npm install
npm run start:dev
```

## API Endpoints

### Save Configuration

**POST** `/config/save`

```json
{
  "teamConfig": {
    "projectName": "My Project",
    "agents": [...],
    "features": [...]
  },
  "userId": "optional-user-id",
  "sprintPlan": "optional sprint plan text",
  "raciChart": "optional RACI chart text",
  "adrDocument": "optional ADR document text"
}
```

Response:
```json
{
  "id": "project-uuid",
  "project": { ... }
}
```

### Get Project

**GET** `/config/:id`

Returns the complete project data.

### Get User's Projects

**GET** `/config/user/:userId`

Returns all projects for a specific user.

### Update Project

**PUT** `/config/:id`

```json
{
  "userId": "user-id",
  "teamConfig": { ... },
  "sprintPlan": "updated text",
  "raciChart": "updated text",
  "adrDocument": "updated text"
}
```

### Delete Project

**DELETE** `/config/:id?userId=user-id`

Returns:
```json
{
  "success": true
}
```

## User Authentication (Future Implementation)

Currently, the application uses temporary user IDs. When implementing authentication:

1. **Add Authentication Middleware**
   - JWT tokens or session-based auth
   - Extract userId from authenticated session

2. **Update Controllers**
   - Remove `userId` from request bodies
   - Get `userId` from authenticated user context

3. **Add User Registration/Login Endpoints**
   - POST `/auth/register`
   - POST `/auth/login`
   - GET `/auth/profile`

## Database Migrations

For production, you should use migrations instead of auto-sync:

### Step 1: Disable Auto-Sync

In `backend/src/config/database.config.ts`:

```typescript
synchronize: false, // Change from process.env.NODE_ENV !== 'production'
```

### Step 2: Generate Migration

```bash
npm run typeorm migration:generate -- -n InitialSchema
```

### Step 3: Run Migrations

```bash
npm run typeorm migration:run
```

## Backup and Restore

### Backup

```bash
pg_dump -U postgres ai_team_kit > backup.sql
```

### Restore

```bash
psql -U postgres ai_team_kit < backup.sql
```

## Troubleshooting

### Connection Refused

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Check port
sudo lsof -i :5432
```

### Permission Denied

```bash
# Grant user access to database
psql postgres
GRANT ALL PRIVILEGES ON DATABASE ai_team_kit TO your_user;
```

### Schema Not Created

- Ensure `synchronize: true` in development
- Check console for errors
- Verify database connection in logs

## Production Deployment

### Environment Variables

```env
NODE_ENV=production
DB_HOST=your-db-host.com
DB_PORT=5432
DB_USERNAME=production_user
DB_PASSWORD=strong_password_here
DB_DATABASE=ai_team_kit_prod
DB_SSL=true
```

### Best Practices

1. **Use Connection Pooling**
   - TypeORM handles this automatically

2. **Enable SSL**
   - Required for most cloud providers

3. **Use Migrations**
   - Never use `synchronize: true` in production

4. **Regular Backups**
   - Automated daily backups
   - Test restore procedures

5. **Monitoring**
   - Database performance
   - Query optimization
   - Connection pool metrics

## Cloud Deployment Options

### AWS RDS

1. Create PostgreSQL RDS instance
2. Configure security groups
3. Use connection string from RDS

### Heroku Postgres

```bash
heroku addons:create heroku-postgresql:hobby-dev
heroku config:get DATABASE_URL
```

### DigitalOcean

1. Create Managed PostgreSQL Database
2. Get connection details from dashboard
3. Add to environment variables

## Next Steps

1. **Implement User Authentication**
   - Add JWT or Passport.js
   - Update controllers to use auth

2. **Add Data Validation**
   - Class-validator decorators
   - Input sanitization

3. **Implement Soft Deletes**
   - Keep deleted data for recovery
   - Add `deletedAt` column

4. **Add Indexes**
   - Index `userId` for faster queries
   - Index `createdAt`, `updatedAt` for sorting

5. **Add Full-Text Search**
   - PostgreSQL full-text search
   - Search across project names and configs

## Support

For issues or questions:
- Check PostgreSQL logs: `/var/log/postgresql/`
- Application logs: Backend console output
- TypeORM documentation: https://typeorm.io/
