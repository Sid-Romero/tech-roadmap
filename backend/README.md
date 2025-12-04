# Tech Roadmap Tracker - Backend

FastAPI backend for the Tech Roadmap Tracker application.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Security](#-security)

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)

### 1. Clone and Setup Environment

```bash
cd backend

# You can generate a new secure SECRET_KEY for production in your local .env after cloning
openssl rand -hex 32  # output for SECRET_KEY
```

### 2. Start with Docker (Recommended)

```bash
# Development mode (with hot reload)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker compose logs -f api

# Stop all the containers
docker compose down
```

### 3. Access the API

- **API Docs**: http://localhost:8000/api/v1/docs
- **Health Check**: http://localhost:8000/health

---

## Project Structure

```
backend/
├── app/
│   ├── core/               # Configuration, security, database
│   │   ├── config.py       # Environment settings (Pydantic)
│   │   ├── database.py     # SQLAlchemy async setup
│   │   └── security.py     # JWT, password hashing
│   ├── routes/             # API endpoints
│   │   ├── auth.py         # Register, login, me
│   │   ├── projects.py     # CRUD projects & sessions
│   │   └── profile.py      # User profile & gamification
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── crud.py             # Database operations
│   ├── constants.py        # Initial data, ranks, badges
│   └── main.py             # FastAPI application
├── alembic/                # Database migrations
├── .github/workflows/      # CI/CD pipeline
├── .env.example            # Environment template
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # Production image
└── requirements.txt        # Python dependencies
```

---

## API Documentation - Not 100% complete.

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Create new user |
| `/api/v1/auth/login` | POST | Get access token (OAuth2) |
| `/api/v1/auth/login/json` | POST | Login with JSON body |
| `/api/v1/auth/me` | GET | Get current user |

### Projects

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/projects` | GET | List all projects |
| `/api/v1/projects` | POST | Create project |
| `/api/v1/projects/{id}` | GET | Get project |
| `/api/v1/projects/{id}` | PUT | Update project |
| `/api/v1/projects/{id}` | DELETE | Delete project |
| `/api/v1/projects/{id}/sessions` | POST | Add work session |

### Profile

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/profile` | GET | Get user profile |
| `/api/v1/profile` | PUT | Update profile |
| `/api/v1/profile/xp` | POST | Add XP |
| `/api/v1/profile/stats` | GET | Get computed stats |

---

### Database Migrations

```bash
# new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest -v

# With coverage
pytest --cov=app --cov-report=html
```

---

## Deployment (Optional part)

### Option 1: AWS App Runner (Recommended)
### That's only an temporary option, if by default you don't have any idea of a way to deploy the app once done.


1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name tech-roadmap-backend
   ```

2. **Push Docker Image**
   ```bash
   # Login to ECR
   aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin <account>.dkr.ecr.eu-west-3.amazonaws.com

   # Build and push
   docker build -t tech-roadmap-backend .
   docker tag tech-roadmap-backend:latest <account>.dkr.ecr.eu-west-3.amazonaws.com/tech-roadmap-backend:latest
   docker push <account>.dkr.ecr.eu-west-3.amazonaws.com/tech-roadmap-backend:latest
   ```

3. **Create App Runner Service**
   - Source: ECR image
   - Environment variables from AWS Secrets Manager
   - Auto-scaling: 1-10 instances

### Option 2: Railway.app (Quick & Easy)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Environment Variables for Production

```env
# REQUIRED - Generate new values!
SECRET_KEY=<openssl rand -hex 32>
POSTGRES_PASSWORD=<strong-password>

# Database (use managed DB like RDS)
POSTGRES_HOST=your-db-host.region.rds.amazonaws.com
POSTGRES_USER=roadmap_user
POSTGRES_DB=tech_roadmap

# API Config
DEBUG=false
CORS_ORIGINS=https://your-frontend-domain.com
```

---

## Security

### Best Practices Implemented

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT tokens with expiration
- ✅ Non-root Docker user
- ✅ Environment-based configuration
- ✅ CORS protection
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Input validation (Pydantic)
- ✅ Health checks for container orchestration

### Security Checklist for Production

- [ ] Generate new `SECRET_KEY` with `openssl rand -hex 32`
- [ ] Set `DEBUG=false`
- [ ] Use strong database password
- [ ] Restrict CORS to your frontend domain only
- [ ] Enable HTTPS (via load balancer/reverse proxy)
- [ ] Set up rate limiting (nginx or API Gateway)
- [ ] Configure database backups
- [ ] Set up monitoring and alerting

### Actually trying to use Clooudfare workers and github pages.
---

## 📄 License

MIT License - See LICENSE file for details.

---

Built using FastAPI, SQLAlchemy, and PostgreSQL.
