# Detailed Technology Explanation

This document explains what has been used to build the Financial Dashboard and why each piece exists.

## 1) Project Structure and Architecture

The project is a monorepo with npm workspaces:

- `frontend`: React single-page application
- `backend`: Express API service
- shared root scripts for development, quality checks, tests, and builds

Backend layering follows a clean flow:

- Routes -> Controllers -> Services -> Data/External providers
- Middleware handles cross-cutting concerns (auth, validation, monitoring, logging, errors)
- Utility modules handle focused concerns such as JWT and password hashing

## 2) Frontend Stack

### Core UI

- React 18 for component-based UI rendering
- TypeScript for static type safety and maintainability
- React Router v6 for route-based navigation and protected routes
- Tailwind CSS for utility-first styling

### State and Data Flow

- Zustand for global auth/session state
- Axios client for API communication
- Request/response interceptors for token handling and refresh flows
- Form management with react-hook-form
- Validation with zod + @hookform/resolvers

### Visualization

- Recharts for dashboard charts and market/portfolio visual components

### Frontend Testing

- Vitest as test runner
- React Testing Library for behavior-driven component tests
- jest-dom matchers for readable assertions

## 3) Backend Stack

### Core API

- Node.js + Express for HTTP APIs
- TypeScript for robust compile-time checks
- Zod for request validation in route middleware
- Error boundary middleware using a centralized AppError model

### Authentication and Security

- JSON Web Tokens (access + refresh)
- Refresh token rotation and revocation persistence
- bcryptjs for password hashing
- Cookie-based refresh handling with secure defaults

### Data Layer

- Prisma ORM as type-safe database access layer
- PostgreSQL as relational datastore
- Prisma migrations for schema evolution and reproducible deployments

### External Data / AI Integration

- Stock data providers integrated via dedicated service clients
- Claude API integration for AI analysis (stock, portfolio, sentiment)
- Structured prompt builders and schema-validated response parsers

## 4) Observability and Operations

### Logging

- pino for structured JSON logs
- pino-http for request logging middleware
- Sensitive request headers redacted from logs

### Monitoring

- prom-client for runtime and HTTP metrics
- `/api/monitoring/metrics` endpoint exposes Prometheus format metrics
- `/api/monitoring/healthz` endpoint for liveness checks
- Optional monitoring API key gate for metrics endpoint

## 5) Containerization and Deployment

### Docker

- Multi-stage Dockerfile for backend (install, build, run)
- Multi-stage Dockerfile for frontend (build React app, serve via Nginx)
- Nginx reverse proxy routes `/api` traffic to backend service

### Docker Compose

- Full service composition for:
  - frontend
  - backend
  - postgres
- Startup dependencies with health checks
- Runtime env-driven configuration and secrets

## 6) CI/CD

GitHub Actions workflow performs:

- Install dependencies
- Lint checks
- Backend + frontend tests
- Production builds
- On main branch push: Docker image build and publish to GHCR

## 7) Quality Tooling

- ESLint v9 flat config for frontend and backend
- Prettier for formatting
- TypeScript strict mode for reliability
- Jest + Supertest for backend route testing
- Cypress for end-to-end and API smoke tests

## 8) Why This Stack Fits a Financial Dashboard

- Type safety reduces regressions in financial calculations and API contracts
- Validation and layered services reduce runtime risk in critical flows
- Structured logging and metrics improve incident response and monitoring
- Containerized deployment ensures reproducible environments
- Multi-level testing (unit/integration/e2e) supports safer releases

## 9) Environment Configuration Model

Environment variables are split by concern:

- Frontend build/runtime API base URL
- Backend app config, auth secrets, provider keys
- Production compose env template (`.env.production.example`) for deploy reproducibility

Use env examples as baseline and inject real secrets via secure CI/CD or secret managers in production.
