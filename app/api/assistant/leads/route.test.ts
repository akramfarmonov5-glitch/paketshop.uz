import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock('@/lib/server/db', () => ({ db: { lead: { findMany } } }));

import { GET } from './route';

const KEY = 'assistant-shared-secret-0123456789';

function call(query: string, authorization: string | null = `Bearer ${KEY}`) {
  return GET(new NextRequest(`https://www.paketshop.uz/api/assistant/leads${query}`, {
    headers: authorization ? { authorization } : {},
  }));
}

describe('GET /api/assistant/leads', () => {
  beforeEach(() => {
    vi.stubEnv('ASSISTANT_API_KEY', KEY);
    findMany.mockReset();
    findMany.mockResolvedValue([{
      id: 'cmlead0000000001',
      status: 'CONTACTED',
      lostReason: null,
      createdAt: new Date('2026-10-01T14:25:00.000Z'),
      updatedAt: new Date('2026-10-02T05:00:00.000Z'),
    }]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('answers 503 while the integration is not configured', async () => {
    vi.stubEnv('ASSISTANT_API_KEY', '');
    expect((await call('?ids=cmlead0000000001')).status).toBe(503);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('rejects calls without the shared key', async () => {
    expect((await call('?ids=cmlead0000000001', null)).status).toBe(401);
    expect((await call('?ids=cmlead0000000001', 'Bearer wrong-wrong-wrong-wrong-wrong')).status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('returns status fields only, for leads the assistant created', async () => {
    const response = await call('?ids=cmlead0000000001,cmlead0000000002');
    const body = await response.json();

    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body.leads).toEqual([{
      id: 'cmlead0000000001',
      status: 'CONTACTED',
      lostReason: null,
      createdAt: '2026-10-01T14:25:00.000Z',
      updatedAt: '2026-10-02T05:00:00.000Z',
    }]);
    const query = findMany.mock.calls[0][0];
    expect(query.where).toEqual({ id: { in: ['cmlead0000000001', 'cmlead0000000002'] }, source: { startsWith: 'AI yordamchi' } });
    expect(Object.keys(query.select).sort()).toEqual(['createdAt', 'id', 'lostReason', 'status', 'updatedAt']);
  });

  it('ignores malformed ids and caps the list', async () => {
    const many = Array.from({ length: 80 }, (_, i) => `cmlead${String(i).padStart(10, '0')}`);
    await call(`?ids=${["x';drop", '', ...many].join(',')}`);
    const ids = findMany.mock.calls[0][0].where.id.in;

    expect(ids).toHaveLength(50);
    expect(ids).not.toContain("x';drop");
  });

  it('answers an empty list without touching the database when no id is usable', async () => {
    const body = await (await call('?ids=,,')).json();

    expect(body).toEqual({ leads: [] });
    expect(findMany).not.toHaveBeenCalled();
  });

  it('hides database errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    findMany.mockRejectedValue(new Error('postgres://secret'));
    const response = await call('?ids=cmlead0000000001');

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('postgres://');
    consoleError.mockRestore();
  });
});
