import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { create, sendTelegramHtml } = vi.hoisted(() => ({ create: vi.fn(), sendTelegramHtml: vi.fn() }));
vi.mock('@/lib/server/db', () => ({ db: { lead: { create } } }));
vi.mock('@/lib/server/telegram', () => ({ sendTelegramHtml }));

import { POST } from './route';

const KEY = 'assistant-shared-secret-0123456789';

const assistantLead = {
  type: 'chat',
  name: 'Akram',
  phone: '90 123 45 67',
  city: 'Toshkent',
  note: "So'rov #A1B2C3. Taxminiy jami: 3 850 000 so'm",
  products: 'Kraft paket 20x30 — 10 qadoq',
  locale: 'uz',
  attribution: { source: 'AI yordamchi (Telegram)', utm_source: 'ai_assistant', utm_medium: 'chat' },
};

function post(body: unknown, options: { ip: string; authorization?: string }) {
  return POST(new NextRequest('https://www.paketshop.uz/api/leads', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-real-ip': options.ip,
      ...(options.authorization ? { authorization: options.authorization } : {}),
    },
    body: JSON.stringify(body),
  }));
}

describe('POST /api/leads', () => {
  beforeEach(() => {
    vi.stubEnv('ASSISTANT_API_KEY', KEY);
    create.mockReset();
    create.mockResolvedValue({ id: 'lead-1' });
    sendTelegramHtml.mockReset();
    sendTelegramHtml.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('keeps the per-IP limit of 6 for the public form', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 7; i += 1) {
      statuses.push((await post(assistantLead, { ip: '203.0.113.10' })).status);
    }

    expect(statuses).toEqual([201, 201, 201, 201, 201, 201, 429]);
  });

  it('does not add assistant-only fields to the public response', async () => {
    const response = await post(assistantLead, { ip: '203.0.113.11' });

    expect(await response.json()).toEqual({ success: true, id: 'lead-1' });
  });

  it('lets the assistant submit many requests from one server address', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 12; i += 1) {
      statuses.push((await post(assistantLead, { ip: '203.0.113.12', authorization: `Bearer ${KEY}` })).status);
    }

    expect(statuses.every((status) => status === 201)).toBe(true);
  });

  it('reports whether the manager was alerted, so the assistant can do it itself otherwise', async () => {
    const sent = await post(assistantLead, { ip: '203.0.113.13', authorization: `Bearer ${KEY}` });
    expect(await sent.json()).toEqual({ success: true, id: 'lead-1', notified: true });

    sendTelegramHtml.mockResolvedValue(false);
    const skipped = await post(assistantLead, { ip: '203.0.113.13', authorization: `Bearer ${KEY}` });
    expect(await skipped.json()).toEqual({ success: true, id: 'lead-1', notified: false });

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sendTelegramHtml.mockRejectedValue(new Error('Telegram down'));
    const failed = await post(assistantLead, { ip: '203.0.113.13', authorization: `Bearer ${KEY}` });
    expect(await failed.json()).toEqual({ success: true, id: 'lead-1', notified: false });
    consoleError.mockRestore();
  });

  it('gives a wrong key no extra allowance', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 7; i += 1) {
      statuses.push((await post(assistantLead, { ip: '203.0.113.14', authorization: 'Bearer wrong-key-wrong-key-wrong-key' })).status);
    }

    expect(statuses.at(-1)).toBe(429);
  });

  it('stores the assistant lead with its source and normalised phone', async () => {
    await post(assistantLead, { ip: '203.0.113.15', authorization: `Bearer ${KEY}` });

    const data = create.mock.calls[0][0].data;
    expect(data.type).toBe('CONTACT');
    expect(data.phone).toBe('+998901234567');
    expect(data.source).toBe('AI yordamchi (Telegram)');
    expect(data.payload.products).toBe('Kraft paket 20x30 — 10 qadoq');
    expect(sendTelegramHtml.mock.calls[0][0]).toContain('AI chat');
  });

  it('still validates the payload for the assistant', async () => {
    const response = await post({ ...assistantLead, phone: '12345' }, { ip: '203.0.113.16', authorization: `Bearer ${KEY}` });

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});
