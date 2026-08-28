const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function consumeLoginAttempt(key: string) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (current.count >= MAX_ATTEMPTS) {
    return { ok: false, remaining: 0, retryAt: current.resetAt };
  }

  current.count += 1;
  return { ok: true, remaining: MAX_ATTEMPTS - current.count };
}
