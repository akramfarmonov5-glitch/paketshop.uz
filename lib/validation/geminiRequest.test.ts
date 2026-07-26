import { describe, expect, it } from 'vitest';
import { geminiRequestSchema } from './geminiRequest';

describe('geminiRequestSchema', () => {
  it('accepts bounded storefront context', () => {
    const result = geminiRequestSchema.safeParse({
      message: 'Qog‘oz stakan narxi qancha?',
      history: [{ role: 'user', parts: [{ text: 'Salom' }] }],
      catalogContext: '- Kraft stakan: 50 000 so‘m',
      customerName: 'Akram',
      language: 'uz',
      voiceMode: false,
    });

    expect(result.success).toBe(true);
  });

  it('rejects oversized messages and extra client controls', () => {
    expect(geminiRequestSchema.safeParse({
      message: 'x'.repeat(2_001),
      arbitraryProviderOption: true,
    }).success).toBe(false);
  });

  it('caps history to prevent unbounded model cost', () => {
    const history = Array.from({ length: 13 }, () => ({
      role: 'user',
      parts: [{ text: 'salom' }],
    }));

    expect(geminiRequestSchema.safeParse({ message: 'test', history }).success).toBe(false);
  });
});
