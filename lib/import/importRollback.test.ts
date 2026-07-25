import { describe, expect, it } from 'vitest';
import {
  buildProductSnapshot,
  buildRollbackPlan,
  rollbackSummary,
  snapshotToUpdateData,
  type RollbackEntry,
} from '@/lib/import/importRollback';

/** Prisma Decimal'ni taqlid qiladi: toFixed'i bor obyekt. */
class FakeDecimal {
  constructor(private readonly value: string) {}
  toFixed() { return this.value; }
  toString() { return this.value; }
}

describe('buildProductSnapshot', () => {
  it('separates scalars from relations and strips relation ids', () => {
    const snapshot = buildProductSnapshot({
      id: 'product_1',
      sku: 'PS-1',
      publicPrice: new FakeDecimal('55000.00'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      translations: [{ id: 't1', productId: 'product_1', locale: 'uz', name: 'Stakan' }],
      variants: [{ id: 'v1', productId: 'product_1', sku: 'PS-1-A', price: new FakeDecimal('1000.00') }],
      priceTiers: [{ id: 'pt1', productId: 'product_1', minQuantity: 10, maxQuantity: null, price: new FakeDecimal('48000.00') }],
    });

    expect(snapshot.scalars.sku).toBe('PS-1');
    expect(snapshot.scalars.publicPrice).toBe('55000.00');
    expect(snapshot.scalars.createdAt).toBe('2026-01-01T00:00:00.000Z');

    expect(snapshot.translations).toEqual([{ locale: 'uz', name: 'Stakan' }]);
    expect(snapshot.variants).toEqual([{ sku: 'PS-1-A', price: '1000.00' }]);
    expect(snapshot.priceTiers).toEqual([{ minQuantity: 10, maxQuantity: null, price: '48000.00' }]);
  });

  it('survives a product with no relations', () => {
    const snapshot = buildProductSnapshot({ id: 'p', sku: 'PS-2', translations: [], variants: [], priceTiers: [] });
    expect(snapshot.translations).toEqual([]);
    expect(snapshot.variants).toEqual([]);
    expect(snapshot.priceTiers).toEqual([]);
  });

  it('produces JSON-safe output', () => {
    const snapshot = buildProductSnapshot({
      id: 'p', sku: 'PS-3', publicPrice: new FakeDecimal('1.50'), updatedAt: new Date('2026-02-02T10:00:00.000Z'),
      translations: [], variants: [], priceTiers: [],
    });
    expect(() => JSON.stringify(snapshot)).not.toThrow();
    expect(JSON.parse(JSON.stringify(snapshot)).scalars.publicPrice).toBe('1.50');
  });
});

describe('buildRollbackPlan', () => {
  const entries: RollbackEntry[] = [
    { sku: 'NEW-1', productId: 'p1', created: true },
    { sku: 'OLD-1', productId: 'p2', created: false, before: { scalars: { sku: 'OLD-1' }, translations: [], variants: [], priceTiers: [] } },
    { sku: 'NEW-2', productId: 'p3', created: true },
  ];

  it('splits created products from updated ones', () => {
    const plan = buildRollbackPlan(entries);
    expect(plan.deleteProductIds).toEqual(['p1', 'p3']);
    expect(plan.restore.map((item) => item.sku)).toEqual(['OLD-1']);
  });

  it('skips updated entries that have no snapshot', () => {
    const plan = buildRollbackPlan([{ sku: 'X', productId: 'p9', created: false }]);
    expect(plan.deleteProductIds).toEqual([]);
    expect(plan.restore).toEqual([]);
  });

  it('tolerates missing or malformed rollback data', () => {
    expect(buildRollbackPlan(null)).toEqual({ deleteProductIds: [], restore: [] });
    expect(buildRollbackPlan('nonsense')).toEqual({ deleteProductIds: [], restore: [] });
    expect(buildRollbackPlan([{ created: true }])).toEqual({ deleteProductIds: [], restore: [] });
  });

  it('summarizes the plan for the admin confirmation', () => {
    expect(rollbackSummary(buildRollbackPlan(entries))).toBe('2 ta yaratilgan mahsulot o‘chiriladi, 1 ta mahsulot oldingi holatiga qaytariladi');
  });
});

describe('snapshotToUpdateData', () => {
  it('drops immutable columns so the update is accepted', () => {
    const data = snapshotToUpdateData({
      scalars: { id: 'p1', sku: 'PS-1', createdAt: '2026-01-01', updatedAt: '2026-01-02', publicPrice: '100' },
      translations: [], variants: [], priceTiers: [],
    });

    expect(data).toEqual({ sku: 'PS-1', publicPrice: '100' });
  });
});
