# PaketShop.uz implementation checklist

## Phase 1 — Foundation

- [x] Architecture boundaries documented
- [x] Prisma/PostgreSQL schema introduced
- [x] Environment template introduced
- [x] Zod and Vitest introduced
- [x] Server-authoritative order request endpoint
- [x] Auth.js credentials flow and RBAC session
- [x] Docker and CI
- [x] TypeScript strict mode with zero errors

## Phase 2 — Data model and admin

- [x] Create initial PostgreSQL migration
- [x] Apply migration to configured staging database (Supabase Postgres, session pooler)
- [x] Seed roles, settings and category tree
- [x] Authenticated category and product/variant/price-tier CRUD APIs
- [x] Auth.js admin category/product UI integration
- [x] Variant and price-tier admin editor (attribute editor still pending)
- [x] Cloudinary signed media adapter, server-side image inspection and upload validation
- [x] CSV/XLSX template, dry-run, row errors, commit and import log
- [x] Import rollback with per-row before-snapshots and admin import history (source-file retention still pending)
- [x] Verified 1000-product import (acceptance criterion 4): batched commit runs in ~9s
- [x] Audit trail foundation for category and product mutations
- [x] Order assignment and status history UI
- [x] Prisma lead pipeline: status/lost-reason, manager assignment, activity history UI and legacy lead migration

## Phase 3 — Public catalog

- [ ] Uzbek/Russian translation files; remove English MVP paths
- [x] Wholesale visual system and homepage
- [x] Paginated public catalog compatibility route
- [x] Prisma-backed category tree, public catalog and product detail cutover
- [x] URL-based MVP search, availability, category, sorting and pagination
- [x] PostgreSQL trigram search with uz/ru transliteration, typo tolerance, suggest API and search analytics
- [x] Prisma product detail page with variant selector, packaging, tier prices and Telegram deep link
- [x] Prisma catalog/detail add-to-cart with stable product IDs and sale-unit quantities
- [x] B2B landing pages and start bundles

## Phase 4 — Sales flow

- [x] Quote-oriented cart and customer-type forms
- [x] Telegram deep links on catalog, product and landing pages
- [x] First/last-touch UTM attribution
- [x] Organization, wholesale and product-request lead forms

## Phase 5/6 — Launch readiness

- [x] Admin-managed redirect manager (create/toggle/delete, 301/302/410, locale-aware catch-all resolution)
- [x] SEO schemas, localized sitemap/canonical/hreflang and noindex rules
- [x] Unit tests and Playwright E2E coverage (search, filters, product, cart, order request, admin pipeline, B2B landings, i18n, redirects, mobile)
- [x] Backup/restore runbook and production deployment guide
- [ ] Lighthouse and accessibility pass
