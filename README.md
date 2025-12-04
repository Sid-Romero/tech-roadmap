# What's the app about ?

It's a skill-tree project tracker. Track your learning journey, log focus time, and level up as you complete projects.

## Overview

This is a full-stack application I built to organize my technical learning path. It uses a node-based graph to visualize project dependencies and includes time tracking with XP rewards. I needed a way to centralize my path courses and all of my projects with a way to track my time spent on them, accurately.

**Status**: In development — core features working, deployment in progress.

## Stack

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS

**Backend**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy + Alembic
- JWT Authentication

**Infrastructure**
- Docker / Docker Compose
- GitHub Actions (CI/CD)

## Features

- Interactive roadmap graph with dependencies
- Project management (CRUD)
- Pomodoro / focus timer with session logging
- XP system, levels, and badges
- Multiple views: graph, table, portfolio grid

## Local Setup

```bash
# Clone
git clone https://github.com/Sid-Romero/tech-roadmap.git
cd tech-roadmap

# You have a personalized README in the backend/ repository

# Frontend
cd ..
npm install
npm run dev
```

## API Documentation

Once running, access the auto-generated docs at:
```
http://localhost:8000/api/v1/docs
```

## Project Structure

```
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── core/     # Config, security, database
│   │   ├── routes/   # API endpoints
│   │   └── ...
│   └── docker-compose.yml
├── components/       # React components
├── services/         # Frontend services
└── App.tsx
```

## Roadmap

- [x] Core CRUD + auth
- [x] Gamification system
- [x] Time tracking
- [ ] Production deployment
- [ ] Landing page
- [ ] Team collaboration

## License

MIT
