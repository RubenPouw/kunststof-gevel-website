import type { AdsState } from "./identity";

/** Verborgen winkelwagenattributen. Shopify neemt ze mee naar de bestelling. */
export function adsCheckoutAttributes(ads: AdsState | null | undefined) {
  if (!ads?.clientId) return [];
  const rows: [string, string][] = [
    ["_kg_consent", "granted"],
    ["_kg_client", ads.clientId],
  ];
  if (ads.gclid) rows.push(["_kg_gclid", ads.gclid]);
  if (ads.gbraid) rows.push(["_kg_gbraid", ads.gbraid]);
  if (ads.wbraid) rows.push(["_kg_wbraid", ads.wbraid]);
  return rows.map(([key, value]) => ({ key, value }));
}
