const buckets = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

/** Per serverproces. Eén web-instance deelt deze teller. */
export function rateLimitStaal(ip: string, now = Date.now()) {
  const key = ip.trim() || "onbekend";
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

export function resetStaalRateLimit() {
  buckets.clear();
}
