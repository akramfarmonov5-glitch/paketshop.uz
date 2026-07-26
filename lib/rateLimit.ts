interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();
const MAX_BUCKETS = 10_000;
const SWEEP_INTERVAL_MS = 60_000;
let lastSweepAt = 0;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Checks rate limiting for a specific key (e.g. IP address).
 * 
 * @param key Unique key to identify the client bucket (e.g. IP)
 * @param limit Maximum number of allowed requests in the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  if (now - lastSweepAt >= SWEEP_INTERVAL_MS || buckets.size >= MAX_BUCKETS) {
    for (const [bucketKey, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(bucketKey);
    }
    lastSweepAt = now;

    // Bound memory even during a burst of unique spoofed keys. Map iteration is
    // insertion ordered, so the oldest live buckets are evicted first.
    while (buckets.size >= MAX_BUCKETS) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey === undefined) break;
      buckets.delete(oldestKey);
    }
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const newEntry = { count: 1, resetAt: now + windowMs };
    buckets.set(key, newEntry);
    return { allowed: true, remaining: limit - 1, resetAt: newEntry.resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}
