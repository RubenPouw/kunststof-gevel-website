import { getDefaultVariant } from "@/lib/catalog/helpers";
import type { Product } from "@/lib/catalog/types";
import { site } from "@/lib/site";

export function absoluteUrl(path: string) {
  if (path === "/") return `${site.origin}/`;
  return `${site.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["HomeAndConstructionBusiness", "LocalBusiness"],
    "@id": `${site.origin}/#organization`,
    name: site.name,
    legalName: site.company,
    url: `${site.origin}/`,
    telephone: site.phoneE164,
    email: site.email,
    vatID: site.btw,
    taxID: site.kvk,
    image: `${site.origin}/brand/avatar.svg`,
    description: site.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.street,
      postalCode: site.postalCode,
      addressLocality: site.city,
      addressCountry: "NL",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
    ],
    areaServed: "NL",
    sameAs: [site.instagram],
  };
}

export function collectionPageJsonLd(input: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: `${site.origin}/`,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: readonly { q: string; a: string }[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

function offerJsonLd(price: number, inStock: boolean, url: string) {
  const amount = price.toFixed(2);
  return {
    "@type": "Offer",
    url,
    priceCurrency: "EUR",
    price: amount,
    availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: amount,
      priceCurrency: "EUR",
      valueAddedTaxIncluded: true,
    },
  };
}

export function productJsonLd(
  product: Product,
  categoryName: string,
  options?: { name?: string; description?: string; properties?: { name: string; value: string }[] },
) {
  const variant = getDefaultVariant(product);
  const url = absoluteUrl(`/producten/${product.slug}`);
  const images = product.images.map((image) => image.url).filter(Boolean);
  const priced = product.variants.filter((item) => item.price > 0);
  const name = (options?.name ?? product.name).replace(/\s*\|.*$/, "").trim();
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": priced.length > 1 ? "ProductGroup" : "Product",
    name,
    description: options?.description ?? product.description,
    sku: variant.sku,
    brand: { "@type": "Brand", name: product.brand },
    url,
    category: categoryName,
  };
  if (images.length) data.image = images;
  const properties = [...(options?.properties ?? [])];
  if (product.saleUnit === "sheet") {
    for (const row of [
      { name: "Afmeting", value: "3050 × 1300 mm" },
      { name: "Dikte", value: "6 mm" },
      { name: "Oppervlak per plaat", value: "3,965 m²" },
      { name: "Zaagwerk", value: "Hele plaat" },
    ]) {
      if (!properties.some((item) => item.name === row.name)) properties.push(row);
    }
  }
  const material = properties.find((item) => item.name === "Materiaal");
  if (material) data.material = material.value;
  if (properties.length) {
    data.additionalProperty = properties.map((item) => ({
      "@type": "PropertyValue",
      name: item.name,
      value: item.value,
    }));
  }
  if (variant.price > 0) data.offers = offerJsonLd(variant.price, variant.inStock, url);
  if (priced.length > 1) {
    data.hasVariant = priced.map((item) => ({
      "@type": "Product",
      name: `${name}, ${item.colorName}`,
      sku: item.sku,
      image: item.image?.url || images[0],
      offers: offerJsonLd(item.price, item.inStock, url),
    }));
  }
  return data;
}

/** Structurele check op de verplichte Product-velden. Geen netwerk. */
export function productSchemaErrors(data: Record<string, unknown>, canonicalPath: string) {
  const errors: string[] = [];
  const type = data["@type"];
  if (type !== "Product" && type !== "ProductGroup") errors.push("@type");
  if (typeof data.name !== "string" || !data.name || data.name.includes("|")) errors.push("name");
  const brand = data.brand as { name?: string } | undefined;
  if (!brand?.name) errors.push("brand");
  if (typeof data.sku !== "string" || !data.sku) errors.push("sku");
  if (typeof data.description !== "string" || !data.description) errors.push("description");
  if ("aggregateRating" in data || "review" in data) errors.push("rating");
  const canonical = absoluteUrl(canonicalPath);
  if (data.url !== canonical || canonical.includes("?")) errors.push("url");
  const offers = data.offers as { "@type"?: string; url?: string; price?: string; priceCurrency?: string; itemCondition?: string } | undefined;
  if (offers) {
    if (offers["@type"] !== "Offer") errors.push("offers.type");
    if (offers.url !== canonical || offers.url?.includes("?")) errors.push("offers.url");
    if (!offers.price || Number(offers.price) <= 0) errors.push("offers.price");
    if (offers.priceCurrency !== "EUR") errors.push("offers.currency");
    if (offers.itemCondition !== "https://schema.org/NewCondition") errors.push("offers.condition");
  }
  if (type === "ProductGroup") {
    const variants = data.hasVariant;
    if (!Array.isArray(variants) || variants.length < 2) errors.push("hasVariant");
    for (const item of Array.isArray(variants) ? variants : []) {
      const row = item as { sku?: string; offers?: { url?: string } };
      if (!row.sku) errors.push("variant.sku");
      if (row.offers?.url !== canonical) errors.push("variant.offers.url");
    }
  }
  return errors;
}
