# Quick Start Guide - Virtual Team Kit

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v14 or higher)
3. **npm** or **yarn**

## Setup Instructions

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# From the project root directory
docker-compose up -d
```

This will start PostgreSQL on port 5432 with the credentials from docker-compose.yml.

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database named `ai_team_kit`
3. Update `backend/.env` with your database credentials

```bash
# Create database
createdb ai_team_kit

# Or using psql
psql -U postgres
CREATE DATABASE ai_team_kit;
\q
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cd backend
cp .env.example .env

# Edit .env and update the following:
# - Database credentials (if not using Docker defaults)
# - JWT_SECRET (use a strong random string)
# - Email configuration (if testing email verification)
```

**Minimum required .env settings:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ai_team_kit

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRATION=24h

# CORS
CORS_ORIGIN=http://localhost:4200
```

### 4. Start the Application

#### Terminal 1 - Backend

```bash
cd backend
npm run start:dev
```

The backend will start on **http://localhost:3000**

#### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

The frontend will start on **http://localhost:4200**

## Accessing the Application

1. Open your browser to **http://localhost:4200**
2. You'll see the Virtual Team Kit application
3. Register a new account at **/register**
4. Login at **/login**
5. Access the dashboard and other features

## Available Routes

### Public Routes
- `/login` - User login
- `/register` - New user registration
- `/verify-email` - Email verification (with token)

### Protected Routes (Require Authentication)
- `/dashboard` - Main dashboard
- `/wizard` - Project setup wizard
- `/team-setup` - Team configuration
- `/feature-setup` - Feature configuration
- `/sprint-planning` - Sprint planning
- `/raci` - RACI chart
- `/adr` - Architecture Decision Records
- `/export` - Export project data

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/verify?token=xxx` - Verify email
- `GET /auth/profile` - Get user profile (protected)
- `POST /auth/logout` - Logout (protected)

### Configuration
- `POST /config` - Save project configuration
- `GET /config/:id` - Get project by ID
- `GET /config/user/:userId` - Get user's projects
- `PUT /config/:id` - Update project
- `DELETE /config/:id` - Delete project

### Templates
- `GET /templates/prompt-pack` - Generate prompt pack
- `GET /templates/sprint-plan` - Generate sprint plan
- `GET /templates/raci-chart` - Generate RACI chart
- `GET /templates/adr-document` - Generate ADR document

### Export
- `POST /export/markdown` - Export as Markdown
- `POST /export/json` - Export as JSON

## Troubleshooting

### Backend won't start

**Error: Cannot connect to database**
```
Solution: Make sure PostgreSQL is running
- Docker: docker-compose up -d
- Local: sudo service postgresql start (Linux) or brew services start postgresql (Mac)
```

**Error: Port 3000 already in use**
```
Solution: Kill the process using port 3000
- lsof -ti:3000 | xargs kill -9 (Mac/Linux)
- Or change PORT in backend/.env
```

### Frontend won't start

**Error: Port 4200 already in use**
```
Solution: Kill the process or use a different port
- ng serve --port 4201
```

**Error: Module not found**
```
Solution: Reinstall dependencies
- rm -rf node_modules package-lock.json
- npm install
```

### Database Connection Issues

**Error: ECONNREFUSED**
```
Solution: 
1. Check if PostgreSQL is running
2. Verify database credentials in backend/.env
3. Ensure database 'ai_team_kit' exists
4. Check firewall settings
```

### Email Verification Not Working

```
Solution:
1. Check EMAIL_* settings in backend/.env
2. For Gmail, use an App Password (not your regular password)
3. Enable "Less secure app access" or use OAuth2
4. For testing, you can manually set isEmailVerified=true in database
```

## Development Commands

### Backend

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build

# Run production build
npm run start:prod

# Run tests
npm test

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

### Frontend

```bash
# Development server
npm start
# or
ng serve

# Production build
npm run build
# or
ng build

# Run tests
npm test

# Run e2e tests
npm run e2e

# Lint code
npm run lint
```

## Project Structure

```
ai-team-kit/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── entities/       # TypeORM entities
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── config/     # Configuration
│   │   │   ├── export/     # Export functionality
│   │   │   └── templates/  # Template generation
│   │   ├── config/         # App configuration
│   │   └── main.ts         # Entry point
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/               # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/     # Page components
│   │   │   ├── services/  # Services
│   │   │   ├── guards/    # Route guards
│   │   │   └── app.module.ts
│   │   └── styles.css     # Global styles
│   └── package.json
│
├── shared/                 # Shared types
│   └── types.ts
│
├── docker-compose.yml      # Docker configuration
├── AUTHENTICATION_SYSTEM.md # Auth documentation
└── QUICK_START.md         # This file
```

## Next Steps

1. **Explore the Application**
   - Register a new account
   - Create a project
   - Configure your team
   - Generate documents

2. **Customize**
   - Modify templates in `backend/src/modules/templates/`
   - Update UI in `frontend/src/app/pages/`
   - Add new features as needed

3. **Deploy**
   - See deployment documentation for production setup
   - Configure environment variables for production
   - Set up proper database backups
   - Configure SSL/TLS certificates

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the AUTHENTICATION_SYSTEM.md documentation
3. Check the IMPLEMENTATION.md for technical details
4. Review the code comments and inline documentation

## License

[Your License Here]
