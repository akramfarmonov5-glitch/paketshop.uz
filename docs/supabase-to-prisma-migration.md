# Supabase to Prisma migration plan

The migration is incremental so the live catalog can continue serving traffic.

1. Create a PostgreSQL staging database and run `npm run db:deploy`, then `npm run db:seed`.
2. Export Supabase categories, products, orders, leads and media references as UTF-8 CSV/JSON.
3. Normalize localized JSON, generate missing SKU values, split piece/pack/carton quantities and map availability values.
4. Import categories first, then products/variants/media, then customers/orders/leads.
5. Store old IDs and URLs in mapping tables/import logs; generate `Redirect` records for public legacy routes.
6. Compare row counts, totals and 100 sampled records. Reject products without SKU, sale unit or packaging information into an import error report.
7. Run the public application against staging and complete catalog/search/order E2E tests.
8. Freeze legacy writes briefly, replay the delta, switch read adapters to Prisma and retain Supabase read-only during the rollback window.

Internal supplier and purchase-price fields must never be included in public projections or browser payloads.
