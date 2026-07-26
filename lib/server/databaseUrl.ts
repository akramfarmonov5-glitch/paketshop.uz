/**
 * Supabase's shared pooler uses port 5432 for session mode and 6543 for
 * transaction mode. Serverless runtimes must use transaction mode so that
 * short-lived function instances do not exhaust the session pool.
 */
export function normalizeRuntimeDatabaseUrl(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const isSupabaseSharedPooler = url.hostname.endsWith('.pooler.supabase.com');
    const isSessionMode = !url.port || url.port === '5432';

    if (!isSupabaseSharedPooler || !isSessionMode) return connectionString;

    url.port = '6543';
    url.searchParams.set('pgbouncer', 'true');
    return url.toString();
  } catch {
    return connectionString;
  }
}
