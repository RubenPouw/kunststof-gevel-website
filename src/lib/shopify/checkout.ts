import { getCatalog } from "@/lib/catalog";
import { findListedProduct } from "@/lib/catalog/dedupe";
import { hasPurchasePrice } from "@/lib/catalog/text-rules";
import type { ProductVariant } from "@/lib/catalog/types";
import { site } from "@/lib/site";

import { storefrontFetch } from "./client";
import { getShopifyConfig } from "./config";

export type CheckoutLineInput = {
  productSlug: string;
  variantSku: string;
  quantity: number;
  shopifyVariantId?: string;
  kind?: "product" | "kozijn";
};

export type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  company?: string;
};

export type CheckoutResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; error: string };

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type CartCreateData = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: { field: string[] | null; message: string }[];
  };
};

function failure(message: string): CheckoutResult {
  return { ok: false, error: message };
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "Klant", lastName: parts.slice(1).join(" ") || "-" };
}

export function toE164(phone: string) {
  const compact = phone.replace(/[^\d+]/g, "");
  if (compact.startsWith("+") && compact.length >= 10) return compact;
  if (compact.startsWith("00") && compact.length >= 11) return `+${compact.slice(2)}`;
  if (compact.startsWith("0") && compact.length >= 10) return `+31${compact.slice(1)}`;
  return undefined;
}

export function isShopifyCheckoutUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return /(^|\.)myshopify\.com$|(^|\.)shopify\.com$|(^|\.)shopifycheckout\.com$/.test(url.hostname);
  } catch {
    return false;
  }
}

function findVariant(
  lines: CheckoutLineInput[],
  products: { slug: string; name?: string; aliasSlugs?: string[]; variants: ProductVariant[] }[],
) {
  return lines.map((line) => {
    const product = findListedProduct(products, line.productSlug);
    const variant =
      product?.variants.find((item) => item.shopifyVariantId && item.shopifyVariantId === line.shopifyVariantId) ??
      product?.variants.find((item) => item.sku === line.variantSku);
    return { line, product, variant };
  });
}

async function createStorefrontCart(input: {
  lines: { merchandiseId: string; quantity: number }[];
  customer: CheckoutCustomer;
  note: string;
}) {
  const phone = toE164(input.customer.phone);
  const data = await storefrontFetch<CartCreateData>(CART_CREATE, {
    input: {
      lines: input.lines.map((line) => ({
        merchandiseId: line.merchandiseId,
        quantity: line.quantity,
      })),
      note: input.note,
      buyerIdentity: {
        email: input.customer.email.trim(),
        countryCode: "NL",
        ...(phone ? { phone } : {}),
      },
      attributes: [
        { key: "Naam", value: input.customer.name.trim() },
        { key: "Telefoon", value: input.customer.phone.trim() },
        { key: "Adres", value: input.customer.address.trim() },
        { key: "Postcode", value: input.customer.postcode.trim() },
        { key: "Plaats", value: input.customer.city.trim() },
        ...(input.customer.company?.trim()
          ? [{ key: "Bedrijf", value: input.customer.company.trim() }]
          : []),
        { key: "Bron", value: "kunststof-gevel.nl" },
      ],
    },
  });

  const errors = data.cartCreate.userErrors.map((error) => error.message).filter(Boolean);
  const checkoutUrl = data.cartCreate.cart?.checkoutUrl ?? "";
  if (!checkoutUrl || !isShopifyCheckoutUrl(checkoutUrl)) {
    return failure(errors[0] || "Shopify gaf geen betaallink terug.");
  }
  return { ok: true as const, checkoutUrl };
}

function variantNumericId(gid: string) {
  const id = gid.split("/").pop() ?? "";
  return /^\d+$/.test(id) ? id : "";
}

async function createAdminDraft(input: {
  lines: { merchandiseId: string; quantity: number; name: string }[];
  customer: CheckoutCustomer;
  note: string;
}) {
  const config = getShopifyConfig();
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  if (!config || !token) return failure("Geen Admin-token.");

  const { firstName, lastName } = splitName(input.customer.name);
  const phone = toE164(input.customer.phone);
  const response = await fetch(`https://${config.domain}/admin/api/${config.apiVersion}/draft_orders.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({
      draft_order: {
        line_items: input.lines.map((line) => ({
          variant_id: Number(variantNumericId(line.merchandiseId)),
          quantity: line.quantity,
        })),
        email: input.customer.email.trim(),
        phone,
        note: input.note,
        tags: "kunststof-gevel.nl",
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address1: input.customer.address.trim(),
          city: input.customer.city.trim(),
          zip: input.customer.postcode.trim(),
          country: "Netherlands",
          phone,
          company: input.customer.company?.trim() || undefined,
        },
      },
    }),
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) return failure(`Shopify conceptbestelling HTTP ${response.status}`);
  const json = (await response.json()) as {
    draft_order?: { name?: string; invoice_url?: string; id?: number };
  };
  const invoice = json.draft_order?.invoice_url ?? "";
  if (!invoice || !isShopifyCheckoutUrl(invoice)) {
    return failure("Shopify maakte geen betaallink bij de conceptbestelling.");
  }
  return { ok: true as const, checkoutUrl: invoice };
}

export async function createShopifyCheckout(input: {
  lines: CheckoutLineInput[];
  customer: CheckoutCustomer;
  montage: boolean;
}): Promise<CheckoutResult> {
  if (!input.lines.length) {
    return failure("De winkelwagen is leeg.");
  }
  if (input.lines.some((line) => line.kind === "kozijn")) {
    return failure(
      `Kozijnen op maat lopen via de offerte, niet via deze betaling. Bel ${site.phone} of haal het kozijn uit de winkelwagen.`,
    );
  }

  if (!getShopifyConfig()) {
    return failure(`Betalen is nog niet gekoppeld. Bel ${site.phone} of mail ${site.email}. Er is niets besteld.`);
  }

  const catalog = await getCatalog();
  const resolved = findVariant(input.lines, catalog.products);
  const missing = resolved.filter((item) => !item.variant?.shopifyVariantId);
  if (missing.length) {
    return failure(
      `Deze artikelen kunnen niet naar de betaalpagina. Bel ${site.phone}, dan zetten we de bestelling klaar.`,
    );
  }
  const unpaid = resolved.filter((item) => !item.variant || !hasPurchasePrice(item.variant.price));
  if (unpaid.length) {
    return failure("Een artikel zonder prijs kan niet besteld worden. Vraag een offerte voor de prijs op aanvraag.");
  }

  const lines = resolved.map((item) => ({
    merchandiseId: item.variant!.shopifyVariantId!,
    quantity: Math.min(999, Math.max(1, Math.round(item.line.quantity))),
    name: item.product?.name ?? item.line.variantSku,
  }));
  const note = [
    "Bestelling via kunststof-gevel.nl",
    input.montage ? "Klant wil montage meerekenen. Montage zit niet in deze betaling en loopt via de offerte." : "",
    `${input.customer.name}, ${input.customer.phone}, ${input.customer.address}, ${input.customer.postcode} ${input.customer.city}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const cart = await createStorefrontCart({ lines, customer: input.customer, note });
    if (cart.ok) return cart;
    console.error("[checkout] Storefront", cart.error);
  } catch (error) {
    console.error("[checkout] Storefront", error instanceof Error ? error.message : error);
  }

  if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim()) {
    try {
      const draft = await createAdminDraft({ lines, customer: input.customer, note });
      if (draft.ok) return draft;
      console.error("[checkout] Admin draft", draft.error);
    } catch (error) {
      console.error("[checkout] Admin draft", error instanceof Error ? error.message : error);
    }
  }

  return failure(
    `De betaling is niet gestart en er is geen bestelling geplaatst. Bel ${site.phone} of WhatsApp ${site.mobileDisplay}.`,
  );
}
