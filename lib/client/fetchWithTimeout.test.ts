import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWithTimeout } from './fetchWithTimeout';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('fetchWithTimeout', () => {
  it('returns the response when the request finishes in time', async () => {
    const response = new Response(JSON.stringify({ ok: true }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    await expect(fetchWithTimeout('/api/example')).resolves.toBe(response);
  });

  it('aborts and gives an understandable error when the server hangs', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_input: RequestInfo | URL, init?: RequestInit) => (
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        }, { once: true });
      })
    )));

    const request = fetchWithTimeout('/api/slow', {}, 1_000);
    const rejection = expect(request).rejects.toThrow('Server javobi kutilganidan uzoq davom etdi');
    await vi.advanceTimersByTimeAsync(1_000);

    await rejection;
  });
});
