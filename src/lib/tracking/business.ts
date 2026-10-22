import type { KozijnConfig } from "@/lib/kozijnen/model";

import { adsFromCookies, consentGranted } from "./consent";
import { settleTracking, trackServerEvent, type TrackContext } from "./dispatch";
import { quoteTotalExcl } from "./quote-value";

function contextFrom(request: Request, email?: string, phone?: string): TrackContext {
  const header = request.headers.get("cookie");
  const ads = adsFromCookies(header);
  return {
    consent: consentGranted(header),
    clientId: ads?.clientId,
    gclid: ads?.gclid,
    gbraid: ads?.gbraid,
    wbraid: ads?.wbraid,
    email,
    phone,
  };
}

export async function trackOfferte(
  input: { request: Request; config: KozijnConfig; email: string; phone: string; layout: string; count?: number; types?: string },
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
) {
  const total = quoteTotalExcl(input.config, env);
  return trackServerEvent(
    "offertemand_verzonden",
    {
      aantal_kozijnen: input.count ?? 1,
      typen: input.types ?? input.layout,
      ...(total == null ? {} : { totaalwaarde: total }),
    },
    contextFrom(input.request, input.email, input.phone),
    env,
    fetchImpl,
  );
}

export async function trackStaal(
  input: { request: Request; count: number; email: string; phone: string },
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
) {
  return trackServerEvent(
    "staalaanvraag_verzonden",
    { aantal_stalen: input.count },
    contextFrom(input.request, input.email, input.phone),
    env,
    fetchImpl,
  );
}

export async function settleOfferte(
  input: { request: Request; config: KozijnConfig; email: string; phone: string; layout: string; count?: number; types?: string },
) {
  await settleTracking(trackOfferte(input));
}

export async function settleStaal(input: { request: Request; count: number; email: string; phone: string }) {
  await settleTracking(trackStaal(input));
}
