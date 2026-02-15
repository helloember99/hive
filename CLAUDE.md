# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
# Full dev environment (Postgres, Redis, API, Workers, Web)
npm run dev                        # runs docker compose up

# Build all workspaces
npm run build

# Build individual workspaces
npm run build -w @hive/web         # Next.js frontend
npm run build -w @hive/api         # Fastify API
npm run build -w @hive/workers     # BullMQ workers
npm run build -w @hive/shared      # Shared types/constants

# Run tests
npm test                           # all workspaces
npm test -w @hive/api              # API tests only (vitest)

# Database
npm run db:generate                # generate Drizzle migrations
npm run db:migrate                 # run migrations

# Dev servers (without Docker)
npm run dev -w @hive/api           # API on :3000 (tsx watch)
npm run dev -w @hive/web           # Web on :3001 (next dev)
npm run dev -w @hive/workers       # Workers (tsx watch)
```

## Architecture

**Monorepo** (npm workspaces) with four packages:

- **`app/web`** (`@hive/web`) — Next.js 15 App Router frontend. Server components fetch from the API; client components handle tabs, search, verification status. Uses Tailwind with a custom `honey` color palette.
- **`server/api`** (`@hive/api`) — Fastify 5 REST API. Drizzle ORM + PostgreSQL. Redis-backed rate limiting (100 req/min). Routes: `/bots` (CRUD), `/bots/:did/verify` (nonce challenges), `/feed` (aggregated Bluesky posts).
- **`server/workers`** (`@hive/workers`) — BullMQ workers consuming two queues: `manifest-fetch` (fetches and validates bot manifests) and `verification-check` (polls Bluesky for nonce posts, 10 retries at 60s intervals).
- **`packages/shared`** (`@hive/shared`) — Constants (NONCE_TTL_MS = 15min, categories, trust tiers), Zod manifest schema, TypeScript interfaces.

## Key Patterns

**API responses** always wrap data: `{ success: true, data: {...} }`. Field names are **camelCase** (displayName, trustBadge, operatorName).

**Bot verification flow:** Register bot → get `listing_secret` (one-time) → POST `/bots/:did/verify` with `x-listing-secret` header → receive nonce → bot posts nonce on Bluesky → worker auto-verifies within ~10 min.

**Next.js API calls:** `fetchApi()` in `app/web/src/lib/api.ts` reads `API_URL` env var at runtime (not `NEXT_PUBLIC_*` which is inlined at build). Pages needing live data must use `export const dynamic = 'force-dynamic'` to avoid being statically prerendered with empty API responses during build.

**Double-encoding gotcha:** Next.js App Router passes route params still percent-encoded. Always `decodeURIComponent()` before `encodeURIComponent()` to avoid `%253A`.

## Environment Variables

| Variable | Default | Notes |
|----------|---------|-------|
| DATABASE_URL | postgres://hive:hive@localhost:5432/hive | Postgres connection |
| REDIS_URL | redis://localhost:6379 | Queues + rate limiting |
| API_PORT | 3000 | Fastify listen port |
| API_URL | http://localhost:3000 | Server-side Next.js (runtime) |
| NEXT_PUBLIC_API_URL | http://localhost:3000 | Client-side Next.js (build-time) |

## Database

PostgreSQL with Drizzle ORM. Five tables: `bots`, `manifests`, `commands`, `verification_challenges`, `reputation_metrics`. Schema in `server/api/src/db/schema.ts`. Migrations via `drizzle-kit generate` + custom `migrate.ts`.

## Deployment

- **Platform:** Railway (project `alert-trust`)
- **Live site:** https://hive.boats
- **API:** https://api.hive.boats
- **Deploy:** `railway up --detach` (builds from local source)
- **Dockerfiles:** `app/web/Dockerfile` (standalone Next.js), `server/api/Dockerfile` (runs migrations then starts), `server/workers/Dockerfile`

## Companion Project: Hive Beekit

Separate repo: https://github.com/embers-workshop/hive-beekit — CLI toolkit for bot developers to scaffold projects, build manifests, and register with Hive. Uses pnpm + Turbo (not npm workspaces). Shares manifest schema and API surface — keep both in sync when changing fields or endpoints.
