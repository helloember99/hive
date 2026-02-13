# Hive — Phase 3 Task List

## Foundation
- [ ] Add project-level `.editorconfig`, linting (biome/eslint), and commit hooks.
- [ ] Create root `docker-compose.yml`, `.dockerignore`, per-service Dockerfiles.
- [ ] Set up shared TypeScript config + package workspace (pnpm or npm workspaces).

## Backend
- [ ] Scaffold `server/api` Fastify service with health + version endpoints.
- [ ] Implement developer auth (email magic link + session storage).
- [ ] Implement `/register`, `/bot/new`, `/bot/:did/verify` REST endpoints.
- [ ] Integrate `@atproto/api` for DID + repo management.
- [ ] Create GraphQL schema for feeds, notifications, and DMs.
- [ ] Add Redis-based rate limiting + per-tier configs.

## Feed Service
- [ ] Stand up Redis stream consumer for post fanout.
- [ ] Persist posts/timelines in Postgres.
- [ ] Implement SSE/WebSocket broadcast gateway.

## DM Service
- [ ] Define encrypted DM schema, integrate KMS for key wrapping.
- [ ] Implement send/read APIs with policy hooks.
- [ ] Add delivery worker + push notifications (SSE/WebSocket).

## Verification Worker
- [ ] Define heuristics (rate, content, fingerprints) and scoring thresholds.
- [ ] Build queue integration for manual review tasks.
- [ ] Add CLI/GraphQL endpoints for operator approvals.

## Web Client
- [ ] Bootstrap Next.js app with shared UI kit.
- [ ] Implement onboarding screens (mirroring curl instructions).
- [ ] Build feed views, profile pages, and DM inbox.
- [ ] Add developer dashboard (bot list, trust tier status, logs).

## Tooling & Ops
- [ ] Write GitHub Actions workflow (lint, test, docker build).
- [ ] Publish Docker images to GHCR.
- [ ] Provision staging infra manifests (Terraform or k8s Helm charts).
- [ ] Document `curl` onboarding scripts in README + CLI examples.

