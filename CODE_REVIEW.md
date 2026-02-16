# Code Review: Hive — ATProto Bot Registry

**Reviewer:** Staff Engineer (automated)
**Date:** 2026-02-16
**Commit:** 57615cf

## Overall Assessment

Well-structured monorepo with clean separation of concerns across four packages. The code is readable and the architecture is sound for an early-stage project. There are several security vulnerabilities, correctness issues, and reliability gaps that need attention before this is production-ready.

---

## Critical: Security

### 1. LIKE-pattern injection in search endpoint

**File:** `server/api/src/routes/bots.ts:46-49`

The `search` query parameter is interpolated into the `ilike` pattern without escaping LIKE metacharacters (`%`, `_`, `\`). While Drizzle parameterizes the value, a user sending `search=%` matches everything, and `_` acts as a single-character wildcard.

**Fix:** Escape LIKE metacharacters in user input:

```typescript
function escapeLike(s: string): string {
  return s.replace(/[%_\\]/g, '\\$&');
}
const escaped = escapeLike(search);
conditions.push(
  sql`(${ilike(bots.displayName, `%${escaped}%`)} OR ${ilike(bots.description, `%${escaped}%`)})`,
);
```

### 2. Plaintext listing secret with timing-vulnerable comparison

**File:** `server/api/src/lib/auth.ts:9`

The listing secret is stored in plaintext and compared with `!==`, which is vulnerable to timing attacks. Hash the secret (SHA-256 or bcrypt) at creation time and use `crypto.timingSafeEqual()` for comparison.

### 3. No input validation on POST /bots

**File:** `server/api/src/routes/bots.ts:99-130`

The endpoint directly destructures `request.body` with no schema validation. Attackers can send arbitrary JSON in `categories`, extremely long strings, or omit required fields (leaking DB error details). Add Zod validation using the existing `BOT_CATEGORIES` from the shared package.

### 4. No input validation on PATCH /bots/:did

Same issue. The `listing_status` field can be set to any string, allowing a user to self-assign admin-only statuses like `suspended`.

### 5. Open bot registration with no abuse prevention

`POST /bots` has no authentication and shares the global 100 req/min rate limit. An attacker can register thousands of spam bots from rotating IPs. Consider CAPTCHA, DID verification, or stricter per-IP rate limits on this endpoint.

### 6. SSRF via manifest_url

**File:** `server/workers/src/manifest-fetcher.ts:23-28`

The manifest fetcher blindly fetches any user-provided URL. An attacker can register a bot with `manifest_url` pointing to cloud metadata endpoints (`http://169.254.169.254/`), internal services, or `file://` URLs.

**Fix:** Restrict to HTTPS, block private/reserved IP ranges, and block cloud metadata endpoints.

---

## High: Correctness Bugs

### 7. Missing `force-dynamic` on bots pages

**Files:** `app/web/src/app/bots/page.tsx`, `app/web/src/app/bots/[did]/page.tsx`

The CLAUDE.md warns that pages needing live data must use `export const dynamic = 'force-dynamic'`. The home page has it, but the bots directory and bot detail pages do not. During `next build`, these pages will be statically prerendered with empty API responses.

### 8. Workers use raw SQL while API uses Drizzle ORM

**Files:** `server/workers/src/db.ts` vs `server/api/src/db/index.ts`

Creates two separate connection pools and divergent query patterns. The inconsistency increases maintenance burden and bug surface area.

### 9. Health endpoint hardcodes version

**File:** `server/api/src/routes/health.ts:6`

Returns `version: '0.1.0'` while root `package.json` is at `0.6.0`. Will always be out of sync.

### 10. Inconsistent field naming between API and frontend

The API maps `operatorName` to `operator_name` in responses, but frontend `BotDetail` expects `operatorName`. The shared `Bot` type uses `display_name` (snake_case). The CLAUDE.md says "camelCase" but the API returns a mix. This creates fragile mapping and potential `undefined` values.

### 11. trust_badge default mismatch

DB schema defaults to `'unverified'` but `TRUST_BADGE_TIERS` in shared constants defines `'none'`, `'verified'`, `'gold'`. The value `'unverified'` doesn't exist in the constant.

---

## Medium: Reliability

### 12. No transaction in manifest-fetcher command replacement

**File:** `server/workers/src/manifest-fetcher.ts:97-119`

Commands are deleted then re-inserted one-by-one without a transaction. A crash between DELETE and INSERT loses all commands. Also, inserting in a loop is inefficient — use a bulk insert inside a transaction.

### 13. Redis connection not closed on API shutdown

**File:** `server/api/src/index.ts:26-28`

A Redis instance is created for rate limiting but never closed in the shutdown handler. This can cause the process to hang.

### 14. Verification checker marks retry exhaustion as "expired"

**File:** `server/workers/src/verification-checker.ts:104-107`

When the nonce is never found after MAX_RETRIES, the status is set to `'expired'`. This should be `'failed'` to distinguish from time-based expiration.

### 15. Feed endpoint has no caching and creates a thundering herd

**File:** `server/api/src/routes/feed.ts`

Fetches all active bots from DB then hits Bluesky API for each in parallel. With 100+ bots, this becomes a thundering herd. No caching, no circuit breaker, no cursor-based pagination.

### 16. BullMQ queues connect at module load time

**File:** `server/api/src/lib/queue.ts`

Queue instances connect to Redis at import time. If Redis is unavailable, the entire API crashes — even for endpoints that don't use queues.

---

## Medium: Architecture & Design

### 17. No CI/CD pipeline

No GitHub Actions, no linting config, no automated tests on push/PR.

### 18. Mixed package manager configuration

Root has both `package-lock.json` (npm) and `pnpm-workspace.yaml` (pnpm). Remove the unused one.

### 19. Shared types disconnected from DB schema

`packages/shared/src/types.ts` and `server/api/src/db/schema.ts` aren't generated from the same source. They use different naming conventions and can drift apart.

### 20. No API test coverage

No `vitest.config.ts` in the API package, no test files. The only tests are for the manifest schema in `packages/shared`.

### 21. Docker web build doesn't consume NEXT_PUBLIC_API_URL build arg

**File:** `docker-compose.yml:53-54`

The build arg is passed but the Dockerfile doesn't declare `ARG NEXT_PUBLIC_API_URL` or set it as `ENV` before `next build`. Client components won't have access to it.

---

## Low: Code Quality

### 22. Raw `<img>` tags instead of `next/image`

**File:** `app/web/src/components/post-card.tsx:46,60`

Bypasses Next.js image optimization. Use `next/image` with `remotePatterns`.

### 23. Duplicate search/filter logic

`directory-view.tsx` reimplements client-side filtering that already exists server-side in `/bots`. Pick one pattern.

### 24. Client-side API call may use unreachable internal URL

**File:** `app/web/src/components/verification-status.tsx`

The `apiUrl` prop comes from `process.env.API_URL`, which may be an internal Docker hostname unreachable from the browser. Should use `NEXT_PUBLIC_API_URL` or a Next.js API route proxy.

### 25. No React error boundaries

No `error.tsx` files anywhere. If a server component throws, the entire page crashes with no recovery.

---

## Priority Summary

| Priority | Count | Key Items |
|----------|-------|-----------|
| Critical | 6 | LIKE injection, timing attack, no input validation, SSRF, open registration |
| High | 5 | Missing force-dynamic, inconsistent naming, trust_badge mismatch |
| Medium | 10 | No transactions, no caching, no CI, no API tests |
| Low | 4 | Raw img tags, duplicate logic, unreachable API URL, no error boundaries |

## Recommended Immediate Actions

1. Add Zod input validation on all API mutation endpoints
2. Add `export const dynamic = 'force-dynamic'` to bots pages
3. Hash listing secrets and use `crypto.timingSafeEqual()`
4. Add SSRF protection to manifest fetcher (URL allowlist, block private ranges)
5. Set up CI with at minimum: build, lint, and test steps
