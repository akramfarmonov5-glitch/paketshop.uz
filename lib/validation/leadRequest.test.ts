import { describe, expect, it } from 'vitest';
import { leadRequestSchema } from '@/lib/validation/leadRequest';

describe('leadRequestSchema', () => {
  it('accepts the legacy AI-chat payload', () => {
    const result = leadRequestSchema.safeParse({
      type: 'chat',
      name: 'Aziz',
      phone: '+998901234567',
      note: 'Mijoz AI chat yordamchisi bilan suhbat boshladi',
      website: '',
      startedAt: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  it('accepts a full organization request with attribution', () => {
    const result = leadRequestSchema.safeParse({
      type: 'organization',
      name: 'Dilshod Karimov',
      phone: '998901234567',
      organizationName: 'Test MChJ',
      tin: '123456789',
      email: 'buyer@example.uz',
      bankPayment: true,
      contractNeeded: true,
      products: 'Kraft paket, stakan',
      monthlyVolume: '100 korobka',
      locale: 'ru',
      attribution: {
        source: 'olx',
        first: { source: 'direct', landing_page: '/uz', at: 1 },
        last: { source: 'olx', utm_source: 'olx', olx_ad_id: '555', at: 2 },
      },
      website: '',
      startedAt: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  it('rejects a non-numeric STIR', () => {
    const result = leadRequestSchema.safeParse({
      type: 'organization',
      name: 'Test MChJ',
      phone: '+998901234567',
      tin: '12345678a',
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields', () => {
    const result = leadRequestSchema.safeParse({
      type: 'contact',
      name: 'Aziz',
      phone: '+998901234567',
      isAdmin: true,
    });
    expect(result.success).toBe(false);
  });
});
