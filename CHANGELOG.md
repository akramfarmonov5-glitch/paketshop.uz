# Changelog

## Unreleased — B2B rebuild

### Phase 1 foundation

- Added the Prisma/PostgreSQL domain schema, indexes and Prisma 7 adapter.
- Added Auth.js credentials authentication and RBAC session contracts.
- Enabled TypeScript strict mode and fixed strict compilation errors.
- Added Zod validation, Vitest and initial commerce-domain tests.
- Moved checkout, quick-buy and AI lead creation behind validated server endpoints.
- Made order totals server-authoritative and notifications server-composed/HTML-escaped.
- Disabled direct Telegram message forwarding and online payments by default.
- Added environment template, Docker setup, CI workflow and backup/restore runbook.

### Phase 2/3 incremental catalog work

- Added idempotent seeds for roles, public settings and the 17 initial B2B categories.
- Added a documented Supabase-to-Prisma cutover and validation sequence.
- Added a server-paginated Uzbek/Russian catalog with URL search, category, availability and sorting controls.
- Added SKU, pack/carton, availability and Telegram quote details to wholesale catalog cards.
- Updated desktop and mobile catalog navigation to use the new catalog route.

### Phase 2 admin data API

- Generated the initial PostgreSQL migration from the validated Prisma schema.
- Added RBAC-protected category CRUD with localized translations and soft archive.
- Added RBAC-protected product CRUD with variants, price tiers and internal pricing fields.
- Added immutable audit-log records for category/product create, update and archive mutations.
- Added server validation for packaging quantities, unique variant SKUs, public-price modes and non-overlapping tier ranges.

### Prisma lead pipeline (CRM)

- Added LeadStatus enum, lostReason field and status index to the Lead model with a deployed migration.
- Cut the public lead API over to Prisma: typed leads with structured payloads, first/last-touch source summary, utmCampaign and an initial CREATED activity.
- Added RBAC-protected admin lead APIs: filtered list with manager roster and status counts, status/assignment updates with mandatory lost reasons, note activities and audit logs.
- Replaced the Supabase admin leads screen with AdminLeadsV2: status filter chips, search, per-lead status/assignee controls, expandable request details and activity timeline with notes.
- Migrated legacy Supabase leads into Prisma idempotently and verified the full pipeline end-to-end (create → contact → lost with reason → assign → note → history).

### Redirect manager

- Added RBAC-protected admin redirect CRUD APIs with Zod path normalization, uniqueness handling and audit logs.
- Added an admin "Redirectlar" screen for creating, toggling and deleting 301/302/410 redirects.
- Added a locale-aware catch-all route that resolves admin-managed redirects (permanent 308 for 301 entries, locale prefix preserved) and falls back to 404; product pages also consult the redirect table for missing legacy products.
- Verified the full lifecycle in the browser: create via UI, 308 redirect on /uz and /ru old paths, delete, then clean 404.

### Trigram search and transliteration

- Added a pg_trgm migration with GIN trigram indexes on product names, search text and SKUs.
- Added Uzbek-Latin/Cyrillic transliteration so queries match across scripts ("стакан" finds "stakan" and vice versa).
- Upgraded catalog search to ranked trigram matching with typo tolerance and a contains-search fallback.
- Added a rate-limited `/api/search/suggest` autocomplete endpoint returning ranked products with URLs.
- Recorded catalog searches with locale and result counts into SearchQuery for admin analytics.
- Added a Telegram product-request CTA to the empty catalog search state.

### Prisma catalog cutover

- Applied the initial migration and seeds to the production Supabase PostgreSQL database (session pooler).
- Cut the public catalog over to Prisma with automatic legacy-Supabase fallback when the Prisma catalog is empty or unreachable.
- Added a server-rendered B2B product page for Prisma products: SKU, availability, pack/carton table, pack price with approximate per-piece price, tier-price table, spec-format Telegram deep link, breadcrumbs, related products and Product schema markup.
- Added an idempotent legacy-to-Prisma migration script that maps old categories, converts per-piece prices to pack totals, preserves legacy slugs/IDs for URL compatibility and migrates media references.
- Verified the full flow end-to-end: catalog filters/search/sorting on Prisma data, uz/ru product pages, lead API writing to Supabase and Telegram notifications.

### Phase 3/4 B2B landings and attribution

- Rebuilt the public homepage around wholesale search, categories, pack/SKU details, buyer segments, delivery and quote-first calls to action.
- Added Uzbek/Russian wholesale, organization and starter-kit landing pages with spec-aligned benefit blocks.
- Added a shared validated B2B lead form with consent, honeypot and organization/reseller fields (STIR, bank payment, contract, trade place, monthly volume).
- Extended the lead API with typed B2B fields, Zod validation errors and escaped Telegram lead notifications.
- Added persistent first/last-touch attribution (UTM, ref, olx_ad_id, gclid, referrer-based source detection) captured on every route change and attached to order and lead submissions.
- Added starter-kit Telegram deep links, B2B navbar links and uz/ru sitemap entries for the new pages.
- Added delivery, payment, about, contact, FAQ, privacy and terms pages with localized canonical/hreflang metadata.
- Removed English from the MVP locale switcher and permanently redirected legacy `/en` paths to Uzbek.
- Added robots.txt and route-level noindex rules for admin, checkout, profile, tracking and wishlist pages.
- Added Vitest coverage for attribution parsing, lead schema contracts and Telegram lead messages; aliased `@/` imports in Vitest.

### Admin console and bulk import

- Connected Prisma catalog and product-detail cards to the quote cart with stable product IDs, minimum quantities and order steps.
- Moved order persistence to a Prisma transaction creating/updating the customer plus order, item snapshots and initial status history.
- Added server-side Prisma availability, sale-unit, quantity-step, customer-price and active tier-price validation.
- Migrated the admin order CRM to Prisma with filters, item snapshots, assignment, full status history and audited mutations.
- Applied the order CRM migration to the configured PostgreSQL database and made Prisma 7 config load the local `.env` explicitly.
- Replaced the legacy retail checkout with a quote-first B2B order request flow including customer type, package quantities, preferred payment, consent and manager confirmation.
- Reworked the cart around package/carton information while retaining server-authoritative product pricing.
- Added Auth.js/RBAC-protected admin order and lead list APIs, audited order status changes and removed direct browser writes through the Supabase client.
- Expanded Telegram order notifications with customer type, region, address, preferred payment, note and package quantities.
- Switched admin login and session authorization from the Supabase client to Auth.js credentials and RBAC roles.
- Connected category and product admin screens to the authenticated Prisma APIs.
- Added CSV/XLSX templates, 10MB/5000-row limits, dry-run preview and row-level validation errors.
- Added SKU upsert import commits, localized product snapshots, primary remote media references, import jobs and audit logs.
- Pinned safe transitive `uuid`, `undici`, `ws` and Hono server versions; production audit now reports zero known vulnerabilities.
