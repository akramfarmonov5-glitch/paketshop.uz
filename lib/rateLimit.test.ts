import { describe, expect, it } from 'vitest';
import { checkRateLimit, resetRateLimit } from './rateLimit';

describe('rateLimit', () => {
  it('blocks after the configured number of attempts', () => {
    const key = `test:block:${crypto.randomUUID()}`;

    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(false);
  });

  it('can reset a bucket after a successful trusted action', () => {
    const key = `test:reset:${crypto.randomUUID()}`;

    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(false);

    resetRateLimit(key);

    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(true);
  });
});
