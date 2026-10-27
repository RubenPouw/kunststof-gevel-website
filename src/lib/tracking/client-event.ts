import { clientIp } from "@/lib/kozijnen/rate-limit";

import { adsFromCookies, consentGranted } from "./consent";
import { settleTracking, trackServerEvent } from "./dispatch";
import { isClientEvent } from "./events";
import { rateLimitTracking } from "./rate-limit";

export async function acceptClientEvent(request: Request, env: NodeJS.ProcessEnv = process.env, fetchImpl: typeof fetch = fetch) {
  if (!rateLimitTracking(clientIp(request))) {
    return new Response(null, { status: 429, headers: { "Cache-Control": "no-store" } });
  }
  const raw = await request.text();
  if (raw.length > 2000) return new Response(null, { status: 400, headers: { "Cache-Control": "no-store" } });
  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return new Response(null, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const name = body && typeof body === "object" && "name" in body ? String((body as { name?: unknown }).name ?? "") : "";
  if (!isClientEvent(name)) return new Response(null, { status: 400, headers: { "Cache-Control": "no-store" } });
  const params =
    body && typeof body === "object" && "params" in body ? (body as { params?: unknown }).params : {};
  const header = request.headers.get("cookie");
  const ads = adsFromCookies(header);
  await settleTracking(
    trackServerEvent(
      name,
      (params ?? {}) as Record<string, string | number>,
      {
        consent: consentGranted(header),
        clientId: ads?.clientId,
        gclid: ads?.gclid,
        gbraid: ads?.gbraid,
        wbraid: ads?.wbraid,
      },
      env,
      fetchImpl,
    ),
  );
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
