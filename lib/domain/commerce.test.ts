import { describe, expect, it } from 'vitest';
import {
  buildTelegramLeadMessage,
  buildTelegramOrderMessage,
  calculateUnitsPerCarton,
  escapeTelegramHtml,
  isValidOrderQuantity,
  normalizeUzbekPhone,
  selectTierPrice,
  summarizeAttribution,
} from './commerce';

describe('commerce domain rules', () => {
  it('normalizes supported Uzbek phone formats', () => {
    expect(normalizeUzbekPhone('90 123 45 67')).toBe('+998901234567');
    expect(normalizeUzbekPhone('+998 (90) 123-45-67')).toBe('+998901234567');
    expect(normalizeUzbekPhone('123')).toBeNull();
  });

  it('calculates carton quantity and honors an override', () => {
    expect(calculateUnitsPerCarton(50, 20)).toBe(1000);
    expect(calculateUnitsPerCarton(50, 20, 900)).toBe(900);
  });

  it('enforces minimum quantity and order step', () => {
    expect(isValidOrderQuantity(10, 10, 5)).toBe(true);
    expect(isValidOrderQuantity(15, 10, 5)).toBe(true);
    expect(isValidOrderQuantity(12, 10, 5)).toBe(false);
  });

  it('selects the most specific active quantity tier', () => {
    const tiers = [
      { minQuantity: 5, maxQuantity: 9, price: 900 },
      { minQuantity: 10, maxQuantity: null, price: 800 },
    ];
    expect(selectTierPrice(1000, 1, tiers)).toBe(1000);
    expect(selectTierPrice(1000, 7, tiers)).toBe(900);
    expect(selectTierPrice(1000, 50, tiers)).toBe(800);
  });

  it('escapes customer input in Telegram HTML messages', () => {
    expect(escapeTelegramHtml('<b>fake</b> & text')).toBe('&lt;b&gt;fake&lt;/b&gt; &amp; text');
    const message = buildTelegramOrderMessage({
      orderNumber: 'PS-1',
      customerName: '<Admin>',
      phone: '+998901234567',
      items: [{ sku: 'ST-250', name: 'Stakan', quantity: 5, saleUnit: 'qadoq' }],
    });
    expect(message).toContain('&lt;Admin&gt;');
    expect(message).toContain('ST-250');
  });

  it('includes escaped B2B customer and fulfillment details in an order notification', () => {
    const message = buildTelegramOrderMessage({
      orderNumber: 'PS-2',
      customerName: 'Test MChJ',
      phone: '+998901234567',
      customerType: 'Tashkilot',
      telegram: '@buyer',
      region: 'Toshkent',
      address: '<Ombor> 12',
      paymentMethod: 'Bank hisob raqami',
      note: '<tez> yetkazish',
      items: [{ sku: 'PK-1', name: 'Paket', quantity: 4, saleUnit: 'qadoq' }],
    });

    expect(message).toContain('Mijoz turi: Tashkilot');
    expect(message).toContain('Telegram: @buyer');
    expect(message).toContain('Hudud: Toshkent');
    expect(message).toContain('Manzil: &lt;Ombor&gt; 12');
    expect(message).toContain('Izoh: &lt;tez&gt; yetkazish');
    expect(message).toContain('4 qadoq');
  });

  it('summarizes first and last touch attribution', () => {
    expect(summarizeAttribution(null)).toBe('direct');
    expect(summarizeAttribution({ source: 'olx' })).toBe('olx');
    expect(summarizeAttribution({ first: { source: 'olx' }, last: { source: 'telegram' } })).toBe('olx → telegram');
    expect(summarizeAttribution({ first: { source: 'olx' }, last: { source: 'olx' } })).toBe('olx');
    expect(summarizeAttribution({ last: { source: 'google_ads' }, utm_campaign: 'winter' })).toBe('google_ads (winter)');
  });

  it('builds an escaped Telegram lead message with only filled details', () => {
    const message = buildTelegramLeadMessage({
      leadId: 'lead_1',
      type: 'organization',
      name: '<Org> MChJ',
      phone: '+998901234567',
      source: 'olx → telegram',
      details: [
        { label: 'STIR', value: '123456789' },
        { label: 'Izoh', value: '' },
        { label: 'Shahar', value: null },
      ],
    });

    expect(message).toContain('Tashkilot so‘rovi');
    expect(message).toContain('&lt;Org&gt; MChJ');
    expect(message).toContain('STIR: 123456789');
    expect(message).toContain('olx → telegram');
    expect(message).not.toContain('Izoh:');
    expect(message).not.toContain('Shahar:');
  });
});
