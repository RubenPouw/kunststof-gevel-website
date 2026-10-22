/**
 * Namen en parameters die we naar buiten sturen.
 * De client mag alleen de twee configuratorgebeurtenissen posten.
 * Offerte, staal en bestelling komen uit de server zelf.
 */

export const CLIENT_EVENTS = ["configurator_gestart", "configurator_afgerond"] as const;

export const SERVER_EVENTS = ["offertemand_verzonden", "staalaanvraag_verzonden", "bestelling"] as const;

export const EVENT_NAMES = [...CLIENT_EVENTS, ...SERVER_EVENTS] as const;

export type EventName = (typeof EVENT_NAMES)[number];

const PARAMS: Record<EventName, readonly string[]> = {
  configurator_gestart: ["type"],
  configurator_afgerond: ["type", "waarde_excl"],
  offertemand_verzonden: ["aantal_kozijnen", "typen", "totaalwaarde"],
  staalaanvraag_verzonden: ["aantal_stalen"],
  bestelling: ["order_id", "waarde"],
};

const NUMBER_PARAMS = new Set(["waarde_excl", "aantal_kozijnen", "totaalwaarde", "aantal_stalen", "waarde"]);

export type EventParams = Record<string, string | number>;

export function isEventName(value: string): value is EventName {
  return (EVENT_NAMES as readonly string[]).includes(value);
}

export function isClientEvent(value: string): value is (typeof CLIENT_EVENTS)[number] {
  return (CLIENT_EVENTS as readonly string[]).includes(value);
}

/** Google Ads krijgt alleen de zakelijke conversies. De configurator blijft in GA4. */
export function isAdsConversion(name: EventName) {
  return name === "offertemand_verzonden" || name === "staalaanvraag_verzonden" || name === "bestelling";
}

export function sanitizeParams(name: EventName, raw: unknown): EventParams {
  const allowed = new Set(PARAMS[name]);
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const params: EventParams = {};
  for (const key of allowed) {
    const value = source[key];
    if (typeof value === "number" && NUMBER_PARAMS.has(key) && Number.isFinite(value) && value >= 0 && value < 1_000_000_000) {
      params[key] = Math.round(value * 100) / 100;
      continue;
    }
    if (typeof value === "string") {
      const clean = value.replace(/[^\w,.-]/g, "").slice(0, 100);
      if (clean) params[key] = clean;
    }
  }
  return params;
}
