# PaketShop.uz architecture

PaketShop.uz is being migrated from a client-heavy retail storefront into a server-validated B2B catalog and order-request platform.

## Runtime boundaries

- `app/[lang]`: Uzbek and Russian public routes rendered with the App Router.
- `app/api`: thin HTTP adapters. Public mutations validate input, rate-limit requests and call domain/application services.
- `lib/domain`: framework-independent pricing, packaging, phone and message rules. These modules are unit tested.
- `lib/server`: server-only integrations such as notifications, persistence and authentication.
- `prisma`: PostgreSQL source-of-truth schema and migrations.
- `components/admin`: authenticated RBAC admin interface.

## Data and security rules

The browser never decides an authoritative price. It submits product or variant IDs and requested quantities. The server reloads active catalog records, applies minimum quantity/order-step and price-tier rules, and stores immutable order-item snapshots.

Public catalog queries expose an allow-listed projection. Supplier, purchase-price, margin and internal-note fields remain server/admin-only. Every admin mutation must be authenticated, authorized and audit logged.

Supabase remains temporarily as a compatibility persistence adapter while production data is migrated to Prisma/PostgreSQL. New domain contracts are database-independent so the adapter can be replaced without changing checkout UI.

## Scale strategy

Catalog, search and filters are server-side and paginated. PostgreSQL indexes and full-text/trigram search serve the MVP; a search adapter can switch to Meilisearch or Typesense above 10,000 products.
