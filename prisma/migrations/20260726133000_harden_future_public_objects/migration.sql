BEGIN;

-- Remove every remaining privilege bit (including TRUNCATE, REFERENCES,
-- TRIGGER, MAINTAIN and sequence UPDATE), not only CRUD.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON TABLES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON SEQUENCES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON FUNCTIONS FROM PUBLIC, anon, authenticated, service_role;

-- Run as the DDL issuer. This also hardens objects created by Supabase's
-- internal owner, whose default ACL cannot be altered by the postgres role.
CREATE OR REPLACE FUNCTION private.enable_rls_for_public_tables()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
DECLARE
  command record;
BEGIN
  FOR command IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE schema_name = 'public'
  LOOP
    IF command.object_type IN ('table', 'partitioned table') THEN
      EXECUTE format('ALTER TABLE IF EXISTS %s ENABLE ROW LEVEL SECURITY', command.object_identity);
      EXECUTE format(
        'REVOKE ALL PRIVILEGES ON TABLE %s FROM anon, authenticated, service_role',
        command.object_identity
      );
    ELSIF command.object_type = 'sequence' THEN
      EXECUTE format(
        'REVOKE ALL PRIVILEGES ON SEQUENCE %s FROM anon, authenticated, service_role',
        command.object_identity
      );
    ELSIF command.object_type IN ('function', 'procedure') THEN
      EXECUTE format(
        'REVOKE ALL PRIVILEGES ON FUNCTION %s FROM PUBLIC, anon, authenticated, service_role',
        command.object_identity
      );
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION private.enable_rls_for_public_tables()
  FROM PUBLIC, anon, authenticated, service_role;

DROP EVENT TRIGGER IF EXISTS paketshop_ensure_public_rls;
CREATE EVENT TRIGGER paketshop_ensure_public_rls
  ON ddl_command_end
  WHEN TAG IN (
    'CREATE TABLE',
    'CREATE TABLE AS',
    'SELECT INTO',
    'CREATE SEQUENCE',
    'CREATE FUNCTION',
    'CREATE PROCEDURE'
  )
  EXECUTE FUNCTION private.enable_rls_for_public_tables();

COMMIT;
