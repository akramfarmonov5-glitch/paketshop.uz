import { describe, expect, it } from 'vitest';
import { orderRequestSchema } from './orderRequest';

const base = {
  customerType: 'organization',
  customerName: 'Test MChJ',
  phone: '+998901234567',
  region: 'Toshkent',
  deliveryMethod: 'manager_confirmation',
  paymentMethod: 'bank',
  locale: 'uz',
};

describe('order request schema', () => {
  it('accepts stable Prisma product ids and sale-unit quantities', () => {
    const result = orderRequestSchema.safeParse({ ...base, items: [{ productId: 'cm123product', quantity: 5, saleUnit: 'PACK' }] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.items[0]).toEqual({ productId: 'cm123product', quantity: 5, saleUnit: 'PACK' });
  });

  it('normalizes a legacy numeric product id to a string', () => {
    const result = orderRequestSchema.parse({ ...base, items: [{ productId: 28, quantity: 1 }] });
    expect(result.items[0].productId).toBe('28');
  });

  it('rejects unknown sale units and client-controlled item fields', () => {
    expect(orderRequestSchema.safeParse({ ...base, items: [{ productId: 'p1', quantity: 1, saleUnit: 'BOX' }] }).success).toBe(false);
    expect(orderRequestSchema.safeParse({ ...base, items: [{ productId: 'p1', quantity: 1, price: 1 }] }).success).toBe(false);
  });
});
