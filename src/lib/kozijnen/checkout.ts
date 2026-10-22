import { pricesFlagActive, type PriceResult } from "./prices";

export type DraftLine = {
  title: string;
  quantity: number;
  price: string;
  properties: { name: string; value: string }[];
};

/**
 * Shopify Draft Order staat klaar en is uit.
 * Alleen aan als KOZIJNEN_PRIJZEN_ACTIEF én KOZIJNEN_CHECKOUT_ACTIEF beide true zijn,
 * en de prijsengine een echt totaal teruggeeft.
 */
export function kozijnCheckoutEnabled(env: NodeJS.ProcessEnv = process.env) {
  return pricesFlagActive(env) && env.KOZIJNEN_CHECKOUT_ACTIEF === "true";
}

export function buildDraftOrderBody(input: {
  title: string;
  properties: { name: string; value: string }[];
  price: PriceResult;
  email: string;
}) {
  if (!input.price.pricesActive) return null;
  const line: DraftLine = {
    title: input.title,
    quantity: 1,
    price: input.price.totalExcl.toFixed(2),
    properties: input.properties,
  };
  return {
    draft_order: {
      line_items: [line],
      email: input.email,
      tags: "kunststof-gevel.nl,kozijn",
      note: input.properties.map((item) => `${item.name}: ${item.value}`).join("\n"),
    },
  };
}

export async function createKozijnDraftOrder(
  input: {
    title: string;
    properties: { name: string; value: string }[];
    price: PriceResult;
    email: string;
  },
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
) {
  if (!kozijnCheckoutEnabled(env)) return { ok: false as const, reason: "uit" as const };
  const body = buildDraftOrderBody(input);
  if (!body) return { ok: false as const, reason: "geen-prijs" as const };
  const domain = env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  const version = env.SHOPIFY_API_VERSION?.trim() || "2025-01";
  if (!domain || !token) return { ok: false as const, reason: "geen-token" as const };
  const response = await fetchImpl(`https://${domain}/admin/api/${version}/draft_orders.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) return { ok: false as const, reason: "shopify" as const };
  const json = (await response.json()) as { draft_order?: { invoice_url?: string } };
  const url = json.draft_order?.invoice_url ?? "";
  if (!url) return { ok: false as const, reason: "shopify" as const };
  return { ok: true as const, checkoutUrl: url };
}

