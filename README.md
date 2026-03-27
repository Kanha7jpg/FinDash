# Financial Dashboard Monorepo

A clean-architecture-ready monorepo for a multi-country stock dashboard.

## Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router v6
- Backend: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT auth with refresh token rotation

## Quick Start
1. Install dependencies:
   - `npm install`
2. Setup env files:
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`
3. Start PostgreSQL:
   - `docker compose up -d`
4. Generate Prisma client + run migrations:
   - `npm run prisma:generate --workspace backend`
   - `npm run prisma:migrate --workspace backend`
5. Run both apps:
   - `npm run dev`

## Ports
- Frontend: 5173
- Backend: 4000

## Documentation
- Run Guide: `docs/RUN_APP.md`
- Detailed Technology Explanation: `docs/TECH_STACK_DETAILED.md`
