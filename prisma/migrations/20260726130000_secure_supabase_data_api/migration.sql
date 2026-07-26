-- Supabase exposes the public schema through PostgREST. Prisma migrations created
-- these tables outside the Dashboard, so they did not receive RLS automatically.
-- Lock down the entire schema first, then opt in only the legacy browser reads and
-- user-owned operations that the storefront still needs.

BEGIN;

-- Future objects created by the application owner must not inherit Data API access.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE USAGE, SELECT ON SEQUENCES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated, service_role;

-- Existing objects were broadly granted to Data API roles. Start from zero.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- Every table in an exposed schema needs RLS, including Prisma's migration table.
DO $$
DECLARE
  target record;
BEGIN
  FOR target IN
    SELECT format('%I.%I', namespace.nspname, relation.relname) AS qualified_name
    FROM pg_class AS relation
    JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
    WHERE namespace.nspname = 'public'
      AND relation.relkind IN ('r', 'p')
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', target.qualified_name);
  END LOOP;
END;
$$;

-- Remove unsafe legacy policies before installing least-privilege replacements.
DROP POLICY IF EXISTS "Allow users to read own admin status" ON public.admin_users;
DROP POLICY IF EXISTS admin_select ON public.admin_users;
DROP POLICY IF EXISTS hero_read ON public.hero_content;
DROP POLICY IF EXISTS "Admins manage leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all access" ON public.leads;
DROP POLICY IF EXISTS nav_read ON public.navigation_settings;
DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert access" ON public.product_reviews;
DROP POLICY IF EXISTS "Allow public read access" ON public.product_reviews;

-- Public legacy catalogue/content remains read-only while the Prisma cutover is
-- completed. Mutations now have to pass through authenticated server routes.
GRANT SELECT ON TABLE
  public.products,
  public.categories,
  public.blog_posts,
  public.hero_content,
  public.navigation_settings,
  public.product_reviews
TO anon, authenticated;

CREATE POLICY legacy_products_public_read
  ON public.products FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY legacy_categories_public_read
  ON public.categories FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY legacy_blog_posts_public_read
  ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY legacy_hero_content_public_read
  ON public.hero_content FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY legacy_navigation_public_read
  ON public.navigation_settings FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY product_reviews_public_read
  ON public.product_reviews FOR SELECT TO anon, authenticated
  USING (true);

-- Reviews are the only anonymous browser write still supported. RLS constrains
-- the accepted shape and prevents update/delete access.
GRANT INSERT ON TABLE public.product_reviews TO anon, authenticated;
CREATE POLICY product_reviews_public_insert
  ON public.product_reviews FOR INSERT TO anon, authenticated
  WITH CHECK (
    rating BETWEEN 1 AND 5
    AND char_length(btrim(product_id)) BETWEEN 1 AND 120
    AND char_length(btrim(user_name)) BETWEEN 1 AND 120
    AND char_length(btrim(comment)) BETWEEN 1 AND 2000
  );

-- Supabase-authenticated storefront users may only manage their own wishlist.
GRANT SELECT, INSERT, DELETE ON TABLE public.wishlists TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.wishlists_id_seq TO authenticated;
CREATE POLICY wishlists_owner_select
  ON public.wishlists FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
CREATE POLICY wishlists_owner_insert
  ON public.wishlists FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY wishlists_owner_delete
  ON public.wishlists FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Legacy profile reads are owner-scoped. Order creation and payment mutations
-- remain server-only through service_role/Prisma.
GRANT SELECT ON TABLE public.orders TO authenticated;
CREATE POLICY legacy_orders_owner_select
  ON public.orders FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT SELECT ON TABLE public.admin_users TO authenticated;
CREATE POLICY admin_users_owner_select
  ON public.admin_users FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Supabase's internal role can create public objects with its own default ACLs.
-- An event trigger supplies defense in depth by enabling RLS on every future
-- public table regardless of which owner created it.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.enable_rls_for_public_tables()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  command record;
BEGIN
  FOR command IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table', 'partitioned table')
  LOOP
    IF command.schema_name = 'public' THEN
      EXECUTE format('ALTER TABLE IF EXISTS %s ENABLE ROW LEVEL SECURITY', command.object_identity);
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION private.enable_rls_for_public_tables()
  FROM PUBLIC, anon, authenticated, service_role;

DROP EVENT TRIGGER IF EXISTS paketshop_ensure_public_rls;
CREATE EVENT TRIGGER paketshop_ensure_public_rls
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION private.enable_rls_for_public_tables();

COMMIT;
