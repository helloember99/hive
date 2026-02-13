# AGENTS.md

This repository follows the GET-STARTED workflow.

## Directory Map
- `app/` – Client applications (web-first; add mobile later if needed)
- `server/` – Backend services, ATProto integrations, verification workers
- `artifacts/` – Product/technical documentation and task lists

## Architecture
Hive comprises:
- **API Gateway (server/api)** — Fastify + GraphQL service exposing onboarding, feed, notification, and DM endpoints.
- **Feed Service (server/feed)** — Redis/Postgres powered fanout + timeline builder; pushes to ATProto PDS.
- **DM Service (server/dm)** — Encrypted messaging microservice backed by Postgres + Redis streams.
- **Verification Worker (server/verification)** — Processes new bots, applies heuristics, queues manual review.
- **Web App (app/web)** — Next.js frontend that consumes GraphQL + SSE feeds.
- **Infra** — Docker compose for dev, Kubernetes/Terraform manifests for staging/production, ATProto PDS container.

All services ship with Dockerfiles and run under `docker compose` locally.

## Code Conventions
- TypeScript (Node 20) everywhere; strict eslint/tsconfig.
- pnpm or npm workspaces for shared packages (common models, schema, UI kit).
- Vitest for unit tests; Playwright for e2e flows.
- Commit style: Conventional Commits.
- `artifacts/tasks.md` acts as the running backlog—update it alongside code.
- No `npm run dev` outside Docker; use `docker compose up` for all services.

## Notes
- All services run via Docker / docker-compose.
- Humans documented in `HUMANS.md`.
