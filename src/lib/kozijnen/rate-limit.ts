const buckets = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "onbekend";
  return request.headers.get("x-real-ip")?.trim() || "onbekend";
}

/** Per serverproces. Eén web-instance deelt deze teller. */
export function rateLimitKozijn(ip: string, maxHits: number, now = Date.now()) {
  const key = `${maxHits}:${ip.trim() || "onbekend"}`;
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= maxHits) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

export function resetKozijnRateLimit() {
  buckets.clear();
}
