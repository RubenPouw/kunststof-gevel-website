export const SHOPIFY_DEFAULT_API_VERSION = "2025-01";

export type ShopifyConfig = {
  domain: string;
  storefrontAccessToken: string;
  apiVersion: string;
};

export function getShopifyConfig(): ShopifyConfig | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  const apiVersion =
    process.env.SHOPIFY_API_VERSION?.trim() || SHOPIFY_DEFAULT_API_VERSION;

  if (!domain || !storefrontAccessToken) return null;

  return {
    domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    storefrontAccessToken,
    apiVersion,
  };
}

export function isShopifyConfigured() {
  return getShopifyConfig() !== null;
}
