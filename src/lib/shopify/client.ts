import { getShopifyConfig, type ShopifyConfig } from "./config";

export class ShopifyStorefrontError extends Error {
  readonly status?: number;
  readonly graphqlErrors?: unknown;

  constructor(message: string, status?: number, graphqlErrors?: unknown) {
    super(message);
    this.name = "ShopifyStorefrontError";
    this.status = status;
    this.graphqlErrors = graphqlErrors;
  }
}

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  config: ShopifyConfig | null = getShopifyConfig(),
  fresh = false,
): Promise<T> {
  if (!config) {
    throw new ShopifyStorefrontError(
      "Shopify Storefront is niet geconfigureerd. Zet SHOPIFY_STORE_DOMAIN en SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
    );
  }

  const endpoint = `https://${config.domain}/api/${config.apiVersion}/graphql.json`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": config.storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(60_000),
    ...(fresh
      ? { cache: "no-store" as const }
      : { next: { revalidate: 3600, tags: ["shopify-catalog"] } }),
  });

  if (!response.ok) {
    throw new ShopifyStorefrontError(
      `Shopify Storefront HTTP ${response.status}`,
      response.status,
    );
  }

  const json = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new ShopifyStorefrontError(
      json.errors.map((error) => error.message).join("; "),
      response.status,
      json.errors,
    );
  }

  if (!json.data) {
    throw new ShopifyStorefrontError("Shopify Storefront gaf geen data terug.");
  }

  return json.data;
}
