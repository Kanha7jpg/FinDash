# Run Guide

This guide explains how to run the Financial Dashboard in development and production.

## Prerequisites

- Node.js 22 or newer
- npm 10 or newer
- Docker Desktop (for PostgreSQL and optional full stack runtime)

## Project Setup

1. Install dependencies from repository root:

```bash
npm install
```

2. Create environment files:

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`

3. Set required backend secrets in `backend/.env`:

- `JWT_ACCESS_SECRET` must be at least 16 characters
- `JWT_REFRESH_SECRET` must be at least 16 characters

## Development Run (Recommended)

### Option A: Run both apps with one command

From repository root:

```bash
npm run dev
```

This starts:

- Frontend on http://localhost:5173
- Backend on http://localhost:4000

### Option B: Run services separately

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

## Database Setup for Local Development

1. Start PostgreSQL container:

```bash
docker compose up -d postgres
```

2. Generate Prisma client:

```bash
npm run prisma:generate --workspace backend
```

3. Apply migrations:

```bash
npm run prisma:migrate --workspace backend
```

## Verification Commands

From repository root:

```bash
npm run lint
npm run test
npm run build
```

Expected behavior:

- Lint completes with no errors
- Tests pass for backend and frontend
- Build completes for both apps

## Run Full Production-like Stack with Docker

1. Copy `.env.production.example` to `.env.production`
2. Fill all required secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, database password, optional API keys)
3. Load env file and run compose:

```bash
docker compose --env-file .env.production up -d --build
```

Services:

- Frontend: http://localhost:8080
- Backend API: http://localhost:4000/api
- Health: http://localhost:4000/api/health
- Monitoring health: http://localhost:4000/api/monitoring/healthz

## Common Troubleshooting

### Frontend or backend dev command exits immediately

- Confirm dependencies were installed at root with `npm install`
- Confirm `.env` files exist in both `frontend` and `backend`
- Check secrets in `backend/.env` are present and long enough

### Backend fails to start with environment errors

- Verify `DATABASE_URL` format in `backend/.env`
- Verify `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`

### Prisma migration issues

- Ensure PostgreSQL is running: `docker compose ps`
- Verify credentials in `DATABASE_URL` match compose settings

### Port already in use

- Frontend default: 5173
- Backend default: 4000
- Postgres default: 5432
- Docker frontend default: 8080

Change ports in env/config or stop conflicting processes.
