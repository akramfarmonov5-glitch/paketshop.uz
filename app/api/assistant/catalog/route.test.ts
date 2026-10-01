import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock('@/lib/server/db', () => ({ db: { product: { findMany } } }));

import { GET } from './route';

const KEY = 'assistant-shared-secret-0123456789';

function productRow(sku: string) {
  return {
    sku,
    legacySku: null,
    slugUz: sku.toLowerCase(),
    slugRu: `${sku.toLowerCase()}-ru`,
    availabilityStatus: 'IN_STOCK',
    priceMode: 'PUBLIC_EXACT',
    baseUnit: 'PIECE',
    saleUnit: 'PACK',
    unitsPerPack: 50,
    packsPerCarton: 10,
    unitsPerCarton: 500,
    minimumOrderQuantity: 1,
    orderStep: 1,
    publicPrice: '12000',
    lengthCm: null,
    widthCm: null,
    heightCm: null,
    volumeMl: null,
    diameterMm: null,
    thicknessMicron: null,
    isNew: false,
    isBestSeller: false,
    updatedAt: new Date('2026-09-30T10:00:00.000Z'),
    category: { slugUz: 'paketlar', translations: [{ locale: 'uz', name: 'Paketlar' }] },
    translations: [{ locale: 'uz', name: `Mahsulot ${sku}`, shortDescription: null, description: null }],
    media: [],
    variants: [],
    priceTiers: [],
  };
}

function call(query = '', authorization: string | null = `Bearer ${KEY}`) {
  return GET(new NextRequest(`https://www.paketshop.uz/api/assistant/catalog${query}`, {
    headers: authorization ? { authorization } : {},
  }));
}

describe('GET /api/assistant/catalog', () => {
  beforeEach(() => {
    vi.stubEnv('ASSISTANT_API_KEY', KEY);
    findMany.mockReset();
    findMany.mockResolvedValue([productRow('A-1'), productRow('A-2')]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('answers 503 while the integration is not configured', async () => {
    vi.stubEnv('ASSISTANT_API_KEY', '');
    const response = await call();

    expect(response.status).toBe(503);
    expect(findMany).not.toHaveBeenCalled();
  });

  it.each([
    ['no credential', null],
    ['a wrong key', 'Bearer not-the-right-key-not-the-right-key'],
    ['a non-bearer scheme', `Basic ${KEY}`],
  ])('rejects %s without touching the database', async (_label, authorization) => {
    const response = await call('', authorization);

    expect(response.status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('returns the mapped active products, uncached', async () => {
    const response = await call();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body.products.map((product: { sku: string }) => product.sku)).toEqual(['A-1', 'A-2']);
    expect(body.products[0].url.uz).toBe('https://www.paketshop.uz/uz/product/a-1');
    expect(body.nextCursor).toBeNull();
    expect(typeof body.generatedAt).toBe('string');

    const query = findMany.mock.calls[0][0];
    expect(query.where).toEqual({ status: 'ACTIVE' });
    expect(query.take).toBe(101);
    expect(query.cursor).toBeUndefined();
  });

  it('pages through the catalogue with a SKU cursor', async () => {
    findMany.mockResolvedValue([productRow('A-1'), productRow('A-2'), productRow('A-3')]);
    const first = await (await call('?limit=2')).json();

    expect(first.products).toHaveLength(2);
    expect(first.nextCursor).toBe('A-2');

    await call('?limit=2&cursor=A-2');
    const query = findMany.mock.calls[1][0];
    expect(query.cursor).toEqual({ sku: 'A-2' });
    expect(query.skip).toBe(1);
  });

  it('clamps the page size and ignores an invalid updatedAfter', async () => {
    await call('?limit=9999&updatedAfter=not-a-date');
    expect(findMany.mock.calls[0][0].take).toBe(201);
    expect(findMany.mock.calls[0][0].where).toEqual({ status: 'ACTIVE' });

    await call('?limit=0');
    expect(findMany.mock.calls[1][0].take).toBe(2);

    await call('?limit=abc');
    expect(findMany.mock.calls[2][0].take).toBe(101);
  });

  it('filters by updatedAfter', async () => {
    await call('?updatedAfter=2026-09-30T00:00:00.000Z');

    expect(findMany.mock.calls[0][0].where).toEqual({
      status: 'ACTIVE',
      updatedAt: { gt: new Date('2026-09-30T00:00:00.000Z') },
    });
  });

  it('hides database errors from the caller', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    findMany.mockRejectedValue(new Error('connection string postgres://secret'));
    const response = await call();
    const text = await response.text();

    expect(response.status).toBe(500);
    expect(text).not.toContain('postgres://');
    consoleError.mockRestore();
  });
});
