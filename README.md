# PaketShop.uz

PaketShop.uz is a mobile-first B2B wholesale catalog and order-request platform for packaging, disposable tableware and household consumables in Uzbekistan. Uzbek and Russian are the MVP languages.

The primary flow is catalog → cart/quote request → manager confirms price and stock → payment and delivery. Online payments are Phase 2 and disabled unless explicitly enabled.

## Stack

- Next.js App Router, React, TypeScript and Tailwind CSS
- PostgreSQL and Prisma
- Auth.js RBAC foundation
- Zod server validation and React Hook Form
- Vitest; Playwright is added with the catalog E2E phase
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

## Security boundary

Public clients send product IDs and quantities only. `/api/orders` reloads catalog prices, calculates totals and stores an immutable item snapshot. The browser cannot set an authoritative total. Telegram notifications are composed and HTML-escaped on the server.

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, payment secrets, S3 secrets or bot tokens with a `NEXT_PUBLIC_` prefix.

## Product import

After signing in to `/{lang}/admin`, open “Import / eksport”. Download the CSV template, upload CSV/XLSX for a dry-run, fix every row error, then commit. Imports upsert by SKU and record an `ImportJob` plus an admin audit event.
