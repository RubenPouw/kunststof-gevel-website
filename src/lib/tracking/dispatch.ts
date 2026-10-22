import { sendAdsConversion } from "./ads";
import { isAdsConversion, isEventName, sanitizeParams, type EventName, type EventParams } from "./events";
import { sendGa4 } from "./ga4";
import { newClientId, type ClickIds } from "./identity";

export type TrackContext = ClickIds & {
  consent: boolean;
  clientId?: string;
  email?: string;
  phone?: string;
  orderId?: string;
};

/**
 * Stuurt één gebeurtenis door. Zonder toestemming of met de vlag uit gebeurt er niets.
 * Een fout bij Google blijft hier. De aanvraag of bestelling gaat gewoon door.
 */
export async function trackServerEvent(
  name: string,
  params: EventParams,
  ctx: TrackContext,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
) {
  if (!ctx.consent) return { forwarded: false as const, reason: "geen-toestemming" as const };
  if (!isEventName(name)) return { forwarded: false as const, reason: "onbekend" as const };
  const clean = sanitizeParams(name, params);
  const clientId = ctx.clientId || newClientId();
  try {
    let forwarded = false;
    if (env.TRACKING_GA4_ACTIEF === "true") {
      const ga = await sendGa4(clientId, name as EventName, clean, env, fetchImpl);
      if (ga.sent) forwarded = true;
    }
    if (env.TRACKING_ADS_ACTIEF === "true" && isAdsConversion(name)) {
      const ads = await sendAdsConversion(
        { name, params: clean, clicks: ctx, email: ctx.email, phone: ctx.phone, orderId: ctx.orderId },
        env,
        fetchImpl,
      );
      if (ads.sent) forwarded = true;
    }
    return { forwarded, reason: forwarded ? ("ok" as const) : ("uit" as const) };
  } catch (error) {
    console.error("[tracking]", name, error instanceof Error ? error.message : "mislukt");
    return { forwarded: false as const, reason: "mislukt" as const };
  }
}

/** Wacht kort op de doorstuur, maar laat de aanvraag niet hangen en niet falen. */
export async function settleTracking(work: Promise<unknown>, ms = 2000) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      work.catch((error) => {
        console.error("[tracking]", error instanceof Error ? error.message : "mislukt");
      }),
      new Promise((resolve) => {
        timer = setTimeout(resolve, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
