BEGIN;

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
    ELSIF command.object_type = 'function' THEN
      EXECUTE format(
        'REVOKE ALL PRIVILEGES ON FUNCTION %s FROM PUBLIC, anon, authenticated, service_role',
        command.object_identity
      );
    ELSIF command.object_type = 'procedure' THEN
      EXECUTE format(
        'REVOKE ALL PRIVILEGES ON PROCEDURE %s FROM PUBLIC, anon, authenticated, service_role',
        command.object_identity
      );
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION private.enable_rls_for_public_tables()
  FROM PUBLIC, anon, authenticated, service_role;

COMMIT;
