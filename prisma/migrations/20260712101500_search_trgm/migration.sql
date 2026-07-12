-- Trigram/fuzzy qidiruv uchun pg_trgm kengaytmasi va GIN indekslar (spec §13).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "ProductTranslation_name_trgm_idx"
  ON "ProductTranslation" USING GIN (lower("name") gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "ProductTranslation_searchText_trgm_idx"
  ON "ProductTranslation" USING GIN (lower(coalesce("searchText", '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Product_sku_trgm_idx"
  ON "Product" USING GIN (lower("sku") gin_trgm_ops);
