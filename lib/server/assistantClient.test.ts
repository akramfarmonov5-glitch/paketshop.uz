import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { askAssistant, assistantBaseUrl, isChatProxyEnabled } from '@/lib/server/assistantClient';

const KEY = 'assistant-shared-secret-0123456789';
const PAGE = 'https://www.paketshop.uz/uz/product/kraft-paket-12';

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

const input = {
  message: 'Kraft paket narxi?',
  history: [{ role: 'user' as const, parts: [{ text: 'Salom' }] }, { role: 'model' as const, parts: [{ text: 'Assalomu alaykum' }] }],
  sessionId: 'abcdef12-3456',
  language: 'uz' as const,
  customerName: 'Akram',
  voiceMode: false,
  clientIp: '203.0.113.7',
};

describe('assistant client', () => {
  beforeEach(() => {
    vi.stubEnv('ASSISTANT_API_KEY', KEY);
    vi.stubEnv('ASSISTANT_URL', 'https://assistant.example/');
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('isChatProxyEnabled', () => {
    it('needs both the flag and a valid key', () => {
      vi.stubEnv('ASSISTANT_CHAT_PROXY', 'true');
      expect(isChatProxyEnabled()).toBe(true);

      vi.stubEnv('ASSISTANT_CHAT_PROXY', 'false');
      expect(isChatProxyEnabled()).toBe(false);

      vi.stubEnv('ASSISTANT_CHAT_PROXY', '1');
      expect(isChatProxyEnabled()).toBe(false);

      vi.stubEnv('ASSISTANT_CHAT_PROXY', 'true');
      vi.stubEnv('ASSISTANT_API_KEY', 'too-short');
      expect(isChatProxyEnabled()).toBe(false);
    });
  });

  it('uses the production assistant when no URL is configured and trims trailing slashes', () => {
    expect(assistantBaseUrl()).toBe('https://assistant.example');
    vi.stubEnv('ASSISTANT_URL', '');
    expect(assistantBaseUrl()).toBe('https://paketshop-asistent.vercel.app');
  });

  it('forwards the conversation with the shared key and the customer address', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ reply: '**Kraft paket** 85 000 so\'m. [BUYURTMA: 12]', product: { url: PAGE } }));

    const result = await askAssistant(input);

    expect(result).toEqual({ text: `Kraft paket 85 000 so'm.\n\nMahsulot sahifasi: ${PAGE}`, audioBase64: null });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://assistant.example/api/chat');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      Authorization: `Bearer ${KEY}`,
      'X-Client-IP': '203.0.113.7',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(init.body)).toEqual({
      message: 'Kraft paket narxi?',
      history: [{ role: 'user', content: 'Salom' }, { role: 'model', content: 'Assalomu alaykum' }],
      webSessionId: 'site_abcdef12-3456',
      language: 'uz',
      customerName: 'Akram',
    });
  });

  it('omits the session id and customer name when the widget has none', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ reply: 'Salom!' }));

    await askAssistant({ ...input, sessionId: undefined, customerName: undefined });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).not.toHaveProperty('webSessionId');
    expect(body).not.toHaveProperty('customerName');
  });

  it('adds spoken audio, read without the page link, for voice mode', async () => {
    const pcm = Buffer.from([1, 0, 2, 0]).toString('base64');
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ reply: 'Kraft paket bor.', product: { url: PAGE } }))
      .mockResolvedValueOnce(jsonResponse({ audio: pcm, model: 'tts' }));

    const result = await askAssistant({ ...input, voiceMode: true });

    expect(fetchMock.mock.calls[1][0]).toBe('https://assistant.example/api/tts');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ text: 'Kraft paket bor.' });
    const wav = Buffer.from(result!.audioBase64!, 'base64');
    expect(wav.subarray(0, 4).toString()).toBe('RIFF');
    expect(wav.subarray(44)).toEqual(Buffer.from([1, 0, 2, 0]));
    expect(result!.text).toContain(PAGE);
  });

  it('still answers in text when the voice cannot be produced', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ reply: 'Kraft paket bor.' }))
      .mockResolvedValueOnce(jsonResponse({ error: 'quota' }, 500));

    expect(await askAssistant({ ...input, voiceMode: true })).toEqual({ text: 'Kraft paket bor.', audioBase64: null });
  });

  it.each([
    ['an error status', () => jsonResponse({ error: 'boom' }, 500)],
    ['a rate limit', () => jsonResponse({ error: 'slow down' }, 429)],
    ['an empty reply', () => jsonResponse({ reply: '  [BUYURTMA: 3] ' })],
    ['a reply of the wrong type', () => jsonResponse({ reply: 42 })],
  ])('returns null on %s so the caller can use its own reply', async (_label, makeResponse) => {
    fetchMock.mockResolvedValue(makeResponse());

    expect(await askAssistant(input)).toBeNull();
  });

  it('returns null when the assistant cannot be reached', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    expect(await askAssistant(input)).toBeNull();
  });

  it('never links to a page outside paketshop.uz', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ reply: 'Mana.', product: { url: 'https://evil.example/uz/product/x' } }));

    expect(await askAssistant(input)).toEqual({ text: 'Mana.', audioBase64: null });
  });
});
