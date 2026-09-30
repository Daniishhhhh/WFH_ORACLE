type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

export function takeRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const current = buckets.get(ip);
  if (!current || current.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }
  if (current.count >= MAX_REQUESTS) return { allowed: false, remaining: 0 };
  current.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - current.count };
}
