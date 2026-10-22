const buckets = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;

export function rateLimitTracking(ip: string, maxHits = 40, now = Date.now()) {
  const key = ip.trim() || "onbekend";
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= maxHits) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

export function resetTrackingRateLimit() {
  buckets.clear();
}
