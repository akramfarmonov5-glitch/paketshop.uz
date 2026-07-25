# PaketShop.uz

PaketShop.uz is a mobile-first B2B wholesale catalog and order-request platform for packaging, disposable tableware and household consumables in Uzbekistan. Uzbek and Russian are the MVP languages.

The primary flow is catalog → cart/quote request → manager confirms price and stock → payment and delivery. Online payments are Phase 2 and disabled unless explicitly enabled.

## Stack

- Next.js App Router, React, TypeScript and Tailwind CSS
- PostgreSQL and Prisma
- Auth.js RBAC foundation
- Zod server validation and React Hook Form
- Vitest for unit tests and Playwright for end-to-end coverage
- Docker and GitHub Actions

See [architecture](docs/architecture.md), [implementation checklist](docs/implementation-checklist.md), and [backup/restore runbook](docs/backup-and-restore.md).

## Local setup

Requirements: Node.js 22+, npm and PostgreSQL 16+.

1. Copy `.env.example` to `.env.local` and replace secrets.
2. Install exact dependencies: `npm ci`.
3. Validate and generate the database client: `npm run db:validate` and `npm run db:generate`.
4. Apply migrations when a database is available: `npm run db:migrate`.
5. Set `SEED_ADMIN_EMAIL` and a 12+ character `SEED_ADMIN_PASSWORD`, then run `npm run db:seed`.
6. Start the app: `npm run dev`.

During the incremental migration, existing catalog data is read through Supabase. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are therefore required until the Prisma migration job is completed.

## Docker

Create `.env.local`, then run `docker compose up --build`. PostgreSQL is exposed on port 5432 and the application on [http://localhost:3000](http://localhost:3000).

## Verification

Run the complete gate with `npm run verify`, or individually:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run db:validate`

### End-to-end tests

`npm run test:e2e` (or `npm run test:e2e:ui`) runs the Playwright suite. It starts the dev server itself, provisions a temporary SUPER_ADMIN plus a test redirect, and removes every record it created afterwards.

The run sets `TELEGRAM_NOTIFICATIONS_DISABLED=true` so test orders never reach the manager Telegram group. A live `DATABASE_URL` and at least one `ACTIVE` product are required.

## Database connections

Supabase's **session pooler** (port 5432) caps a project at 15 clients, so `DATABASE_POOL_MAX` (default 3) bounds each instance's Prisma pool. Without it, parallel dev workers and migration scripts exhaust the pooler and the catalog silently falls back to the legacy adapter.

Use the session pooler for migrations and seeds. For serverless production deploys prefer the **transaction pooler** (port 6543), which is built for many short-lived connections.

## Security boundary

Public clients send product IDs and quantities only. `/api/orders` reloads catalog prices, calculates totals and stores an immutable item snapshot. The browser cannot set an authoritative total. Telegram notifications are composed and HTML-escaped on the server.

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, payment secrets, S3 secrets or bot tokens with a `NEXT_PUBLIC_` prefix.

## Product import

After signing in to `/{lang}/admin`, open “Import / eksport”. Download the CSV template, upload CSV/XLSX for a dry-run, fix every row error, then commit. Imports upsert by SKU and record an `ImportJob` plus an admin audit event.
