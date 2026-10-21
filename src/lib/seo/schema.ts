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
  if (images.length) data.image = images;
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
    };
  }
  return data;
}
