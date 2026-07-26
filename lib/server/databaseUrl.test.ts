import { describe, expect, it } from 'vitest';
import { normalizeRuntimeDatabaseUrl } from './databaseUrl';

describe('normalizeRuntimeDatabaseUrl', () => {
  it('switches Supabase session pooler URLs to transaction mode', () => {
    const input = 'postgresql://postgres.project:secret@aws-1.example.pooler.supabase.com:5432/postgres?schema=public';
    const result = new URL(normalizeRuntimeDatabaseUrl(input));

    expect(result.port).toBe('6543');
    expect(result.searchParams.get('pgbouncer')).toBe('true');
    expect(result.searchParams.get('schema')).toBe('public');
  });

  it('leaves direct and non-Supabase URLs unchanged', () => {
    const direct = 'postgresql://postgres:secret@db.project.supabase.co:5432/postgres';
    const local = 'postgresql://postgres:secret@localhost:5432/postgres';

    expect(normalizeRuntimeDatabaseUrl(direct)).toBe(direct);
    expect(normalizeRuntimeDatabaseUrl(local)).toBe(local);
  });

  it('leaves malformed values unchanged', () => {
    expect(normalizeRuntimeDatabaseUrl('not-a-database-url')).toBe('not-a-database-url');
  });
});
