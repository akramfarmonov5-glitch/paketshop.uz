import { describe, expect, it } from 'vitest';
import { adminLeadUpdateSchema } from '@/lib/validation/adminLead';

describe('adminLeadUpdateSchema', () => {
  it('accepts a status change', () => {
    expect(adminLeadUpdateSchema.safeParse({ status: 'CONTACTED' }).success).toBe(true);
  });

  it('requires a lost reason when marking LOST', () => {
    expect(adminLeadUpdateSchema.safeParse({ status: 'LOST' }).success).toBe(false);
    expect(adminLeadUpdateSchema.safeParse({ status: 'LOST', lostReason: 'narx' }).success).toBe(true);
  });

  it('allows assigning and unassigning a manager', () => {
    expect(adminLeadUpdateSchema.safeParse({ assignedToId: 'user_1' }).success).toBe(true);
    expect(adminLeadUpdateSchema.safeParse({ assignedToId: null }).success).toBe(true);
  });

  it('rejects unknown statuses and fields', () => {
    expect(adminLeadUpdateSchema.safeParse({ status: 'DELETED' }).success).toBe(false);
    expect(adminLeadUpdateSchema.safeParse({ hack: true }).success).toBe(false);
  });
});
