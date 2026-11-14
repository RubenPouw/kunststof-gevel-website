import { kozijnProperties } from "./cart-line";
import { getLayoutBySlug } from "./layouts";
import { parseConfig } from "./model";
import { pricesFlagActive, type PriceResult } from "./prices";
import { priceLayoutConfig } from "./quote-price";
import { summaryText } from "./text";

export type DraftLine = {
  title: string;
  quantity: number;
  price: string;
  properties: { name: string; value: string }[];
};

/**
 * Winkelwagen-checkout voor een kozijn staat uit tot beide vlaggen aan staan
 * en de prijsengine een echt totaal teruggeeft.
 * Het bedrag komt altijd uit de prijsengine. Een meegestuurd bedrag telt niet.
 */
export function kozijnCheckoutEnabled(env: NodeJS.ProcessEnv = process.env) {
  return pricesFlagActive(env) && env.KOZIJNEN_CHECKOUT_ACTIEF === "true";
}

export type PricedKozijn = {
  title: string;
  properties: { name: string; value: string }[];
  unitExcl: number;
  unitIncl: number;
  summary: string;
};

/** Verkoopbedrag voor één samenstelling. `query` is de configuratie, geen prijs. */
export function priceKozijnOrder(
  layoutSlug: string,
  query: string,
  env: NodeJS.ProcessEnv = process.env,
): PricedKozijn | null {
  if (!kozijnCheckoutEnabled(env)) return null;
  const layout = getLayoutBySlug(layoutSlug);
  if (!layout || !query.trim()) return null;
  const config = parseConfig(new URLSearchParams(query), layout);
  const result = priceLayoutConfig(layout, config, true);
  if (!result.pricesActive) return null;
  return {
    title: `Kunststof kozijn op maat, ${layout.title}`,
    properties: kozijnProperties(config),
    unitExcl: result.totalExcl,
    unitIncl: result.totalIncl,
    summary: summaryText(config),
  };
}

export function clampKozijnQty(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(99, Math.max(1, Math.round(quantity)));
}

/** Het regelbedrag volgt de btw-instelling van de winkel, niet een keuze van de browser. */
export function kozijnUnitAmount(priced: { unitExcl: number; unitIncl: number }, taxesIncluded: boolean) {
  return taxesIncluded ? priced.unitIncl : priced.unitExcl;
}

export type MixedDraftInput = {
  catalog: { variantId: number; quantity: number }[];
  kozijnen: (PricedKozijn & { quantity: number })[];
  email: string;
  phone?: string;
  note: string;
  noteAttributes: { name: string; value: string }[];
  shippingAddress: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    zip: string;
    country: string;
    phone?: string;
    company?: string;
  };
  taxesIncluded: boolean;
};

export function buildMixedDraftOrder(input: MixedDraftInput) {
  if (!input.kozijnen.length) return null;
  return {
    draft_order: {
      line_items: [
        ...input.catalog.map((line) => ({
          variant_id: line.variantId,
          quantity: line.quantity,
        })),
        ...input.kozijnen.map((line) => ({
          title: line.title,
          quantity: clampKozijnQty(line.quantity),
          price: kozijnUnitAmount(line, input.taxesIncluded).toFixed(2),
          taxable: true,
          requires_shipping: true,
          properties: line.properties,
        })),
      ],
      email: input.email.trim(),
      phone: input.phone,
      note: input.note,
      note_attributes: input.noteAttributes,
      tags: "kunststof-gevel.nl,kozijn",
      taxes_included: input.taxesIncluded,
      shipping_address: input.shippingAddress,
    },
  };
}

export async function readShopTaxesIncluded(
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
) {
  const domain = env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  const version = env.SHOPIFY_API_VERSION?.trim() || "2025-01";
  if (!domain || !token) return null;
  const response = await fetchImpl(`https://${domain}/admin/api/${version}/shop.json?fields=taxes_included`, {
    method: "GET",
    headers: { "X-Shopify-Access-Token": token },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) return null;
  const json = (await response.json()) as { shop?: { taxes_included?: boolean } };
  return typeof json.shop?.taxes_included === "boolean" ? json.shop.taxes_included : null;
}

export async function createMixedDraftOrder(
  input: Omit<MixedDraftInput, "taxesIncluded">,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
) {
  if (!kozijnCheckoutEnabled(env)) return { ok: false as const, reason: "uit" as const };
  const taxesIncluded = await readShopTaxesIncluded(env, fetchImpl);
  if (taxesIncluded == null) return { ok: false as const, reason: "btw" as const };
  const body = buildMixedDraftOrder({ ...input, taxesIncluded });
  if (!body) return { ok: false as const, reason: "geen-prijs" as const };
  const domain = env.SHOPIFY_STORE_DOMAIN?.trim() ?? "";
  const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim() ?? "";
  const version = env.SHOPIFY_API_VERSION?.trim() || "2025-01";
  const response = await fetchImpl(`https://${domain}/admin/api/${version}/draft_orders.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) return { ok: false as const, reason: "shopify" as const };
  const json = (await response.json()) as { draft_order?: { invoice_url?: string } };
  const url = json.draft_order?.invoice_url ?? "";
  if (!url) return { ok: false as const, reason: "shopify" as const };
  return { ok: true as const, checkoutUrl: url, taxesIncluded };
}

/** Losse conceptbestelling met alleen een kozijn. De winkelwagen gebruikt buildMixedDraftOrder. */
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

