import { createHash, timingSafeEqual } from 'node:crypto';

// Shared secret between paketshop.uz and the AI assistant (paketshop-asistent). Both projects hold the same
// ASSISTANT_API_KEY; without it (or with a short one) every assistant-only endpoint stays closed.
const MIN_KEY_LENGTH = 24;

export function assistantApiKey(): string | null {
  const key = process.env.ASSISTANT_API_KEY?.trim();
  return key && key.length >= MIN_KEY_LENGTH ? key : null;
}

const digest = (value: string) => createHash('sha256').update(value).digest();

/** True only for a request that carries `Authorization: Bearer <ASSISTANT_API_KEY>`. */
export function isAssistantRequest(request: Request): boolean {
  const key = assistantApiKey();
  if (!key) return false;
  const match = /^Bearer\s+(\S+)$/i.exec(request.headers.get('authorization') || '');
  if (!match) return false;
  // Hashing first gives both sides the same length, so the comparison leaks nothing about the key.
  return timingSafeEqual(digest(match[1]), digest(key));
}
