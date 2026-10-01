import { afterEach, describe, expect, it, vi } from 'vitest';
import { assistantApiKey, isAssistantRequest } from '@/lib/server/assistantAuth';

const KEY = 'assistant-shared-secret-0123456789';

function requestWith(authorization?: string) {
  return new Request('https://www.paketshop.uz/api/leads', {
    method: 'POST',
    headers: authorization ? { authorization } : {},
  });
}

describe('isAssistantRequest', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('accepts the configured key as a bearer token', () => {
    vi.stubEnv('ASSISTANT_API_KEY', KEY);
    expect(isAssistantRequest(requestWith(`Bearer ${KEY}`))).toBe(true);
    expect(isAssistantRequest(requestWith(`bearer ${KEY}`))).toBe(true);
  });

  it('rejects a wrong, empty, missing or non-bearer credential', () => {
    vi.stubEnv('ASSISTANT_API_KEY', KEY);
    expect(isAssistantRequest(requestWith(`Bearer ${KEY}x`))).toBe(false);
    expect(isAssistantRequest(requestWith(`Bearer ${KEY.slice(0, -1)}`))).toBe(false);
    expect(isAssistantRequest(requestWith('Bearer '))).toBe(false);
    expect(isAssistantRequest(requestWith(KEY))).toBe(false);
    expect(isAssistantRequest(requestWith(`Basic ${KEY}`))).toBe(false);
    expect(isAssistantRequest(requestWith())).toBe(false);
  });

  it('stays closed while no key is configured', () => {
    vi.stubEnv('ASSISTANT_API_KEY', '');
    expect(assistantApiKey()).toBeNull();
    expect(isAssistantRequest(requestWith('Bearer '))).toBe(false);
    expect(isAssistantRequest(requestWith('Bearer undefined'))).toBe(false);
  });

  it('refuses keys shorter than 24 characters even when they match', () => {
    vi.stubEnv('ASSISTANT_API_KEY', 'short-key');
    expect(assistantApiKey()).toBeNull();
    expect(isAssistantRequest(requestWith('Bearer short-key'))).toBe(false);
  });
});
