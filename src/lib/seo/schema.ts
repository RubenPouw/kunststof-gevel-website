import { getDefaultVariant } from "@/lib/catalog/helpers";
import type { Product } from "@/lib/catalog/types";
import { FREE_SHIPPING_FROM, SHIPPING_FLAT } from "@/lib/format";
import { site } from "@/lib/site";

export function absoluteUrl(path: string) {
  if (path === "/") return `${site.origin}/`;
  return `${site.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

const ORG_ID = `${site.origin}/#organization`;

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    legalName: site.company,
    url: `${site.origin}/`,
    telephone: site.phoneE164,
    email: site.email,
    vatID: site.btw,
    taxID: site.kvk,
    logo: `${site.origin}/brand/avatar.svg`,
    image: `${site.origin}/brand/avatar.svg`,
    description: site.description,
    sameAs: [site.instagram],
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${site.origin}/#website`,
    url: `${site.origin}/`,
    name: site.name,
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.origin}/zoeken?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function siteGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationJsonLd(), websiteJsonLd()],
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${site.origin}/#local`,
    name: site.name,
    url: `${site.origin}/`,
    telephone: site.phoneE164,
    email: site.email,
    image: `${site.origin}/brand/avatar.svg`,
    parentOrganization: { "@id": ORG_ID },
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

export function collectionJsonLd(name: string, path: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

function clipTitle(value: string, max: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const space = slice.lastIndexOf(" ");
  return (space >= Math.min(40, max - 8) ? slice.slice(0, space) : slice).trim();
}

/** Title string before the site template. At most 60 characters. */
export function productMetaTitle(name: string, extra?: string) {
  const suffix = extra?.replace(/\s+/g, " ").trim();
  if (!suffix) return clipTitle(name, 60);
  const room = 60 - suffix.length - 1;
  if (room < 12) return clipTitle(name, 60);
  return `${clipTitle(name, room)} ${suffix}`;
}

function shippingDetails() {
  const destination = { "@type": "DefinedRegion", addressCountry: "NL" };
  return [
    {
      "@type": "OfferShippingDetails",
      shippingDestination: destination,
      shippingRate: { "@type": "MonetaryAmount", value: SHIPPING_FLAT.toFixed(2), currency: "EUR" },
    },
    {
      "@type": "OfferShippingDetails",
      shippingDestination: destination,
      shippingRate: { "@type": "MonetaryAmount", value: "0.00", currency: "EUR" },
      eligibleTransactionVolume: {
        "@type": "PriceSpecification",
        minPrice: FREE_SHIPPING_FROM,
        priceCurrency: "EUR",
      },
    },
  ];
}

function returnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "NL",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    url: absoluteUrl("/herroepingsrecht"),
  };
}

export function productJsonLd(product: Product, categoryName: string) {
  const variant = getDefaultVariant(product);
  const url = absoluteUrl(`/producten/${product.slug}`);
  const images = product.images.map((image) => image.url).filter(Boolean);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: variant.sku,
    brand: { "@type": "Brand", name: product.brand },
    url,
    category: categoryName,
  };
  if (variant.sku) data.mpn = variant.sku;
  const ean = variant.ean?.replace(/\D/g, "");
  if (ean && [8, 12, 13, 14].includes(ean.length)) data.gtin = ean;
  if (images.length) data.image = images;
  if (product.saleUnit === "sheet") {
    data.additionalProperty = [
      { "@type": "PropertyValue", name: "Afmeting", value: "3050 × 1300 mm" },
      { "@type": "PropertyValue", name: "Dikte", value: "6 mm" },
      { "@type": "PropertyValue", name: "Oppervlak per plaat", value: "3,965 m²" },
      { "@type": "PropertyValue", name: "Zaagwerk", value: "Hele plaat" },
    ];
  }
  if (variant.price > 0) {
    data.offers = {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price: variant.price.toFixed(2),
      availability: variant.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: variant.price.toFixed(2),
        priceCurrency: "EUR",
        valueAddedTaxIncluded: true,
      },
      shippingDetails: shippingDetails(),
      hasMerchantReturnPolicy: returnPolicy(),
    };
  }
  return data;
}
