import { canonicalHandle } from "@/lib/catalog/text-rules";

type Photo = { url: string; alt: string };

type PhotoProduct = {
  slug: string;
  name: string;
  tags?: string[];
  images: Photo[];
  variants: { image?: Photo }[];
};

/**
 * Finer product types for /kozijnafwerking. Shopify product type stays
 * "Kozijnafwerking". The listing reads the title and the handle.
 */
export const kozijnTypes = [
  "afwerkprofiel-volschuim",
  "kwartrond",
  "paneelprofiel",
  "dagkantafwerking",
  "koplat",
  "eindkap",
  "zelfklevend-schuim",
  "reiniging",
] as const;

export type KozijnType = (typeof kozijnTypes)[number];

export const kozijnTypeLabels: Record<KozijnType, string> = {
  "afwerkprofiel-volschuim": "Afwerkprofielen volschuim",
  kwartrond: "Kwartrond",
  paneelprofiel: "Paneelprofielen",
  dagkantafwerking: "Dagkantafwerking",
  koplat: "Koplatten",
  eindkap: "Eindkappen",
  "zelfklevend-schuim": "Zelfklevend schuim",
  reiniging: "Reiniging en onderhoud",
};

/** Preferred packshot for the type tile. Staalversterking is a paneelprofiel, but the tile shows the profile. */
const TILE_NAME: Record<KozijnType, RegExp> = {
  "afwerkprofiel-volschuim": /afwerkprofiel/,
  kwartrond: /kwartrond/,
  paneelprofiel: /paneelprofiel/,
  dagkantafwerking: /dagkant/,
  koplat: /koplat/,
  eindkap: /eindkap/,
  "zelfklevend-schuim": /schuim/,
  reiniging: /reinig/,
};

export const eindkapSystems = ["keralit", "novaboard", "lignodur", "milinboard"] as const;

export type EindkapSystem = (typeof eindkapSystems)[number];

export const eindkapSystemLabels: Record<EindkapSystem, string> = {
  keralit: "Keralit",
  novaboard: "Novaboard",
  lignodur: "Lignodur",
  milinboard: "Milinboard",
};

export function isKozijnType(value: string): value is KozijnType {
  return (kozijnTypes as readonly string[]).includes(value);
}

export function isEindkapSystem(value: string): value is EindkapSystem {
  return (eindkapSystems as readonly string[]).includes(value);
}

function titleBlob(product: { name: string; slug: string }) {
  return `${product.name} ${product.slug.replace(/-/g, " ")}`.toLowerCase();
}

export function kozijnBlob(product: { name: string; slug: string; tags?: string[] }) {
  return `${titleBlob(product)} ${(product.tags ?? []).join(" ")}`.toLowerCase();
}

/** Sandwichpanelen and the loose PVC plaat are sheets, not kozijnafwerking. */
export function isKozijnSheet(text: string) {
  const value = text.toLowerCase();
  if (/sandwichpaneel/.test(value)) return true;
  return /\bpvc[\s-]*plaat\b/.test(value);
}

export function kozijnTypeOf(product: { name: string; slug: string; tags?: string[] }): KozijnType | undefined {
  // Title and handle decide the type. A Shopify tag can name a parent group
  // (koplaten sit under dagkantafwerking) and must not swallow the title.
  const text = titleBlob(product);
  if (isKozijnSheet(text)) return undefined;
  if (/kwartrond/.test(text)) return "kwartrond";
  if (/reinig/.test(text)) return "reiniging";
  if (/paneelprofiel|staalversterking/.test(text)) return "paneelprofiel";
  if (/dagkant/.test(text)) return "dagkantafwerking";
  if (/koplat/.test(text)) return "koplat";
  if (/eindkap/.test(text)) return "eindkap";
  if (/zelfklevend[\s-]*schuim/.test(text)) return "zelfklevend-schuim";
  if (/afwerkprofiel/.test(text)) return "afwerkprofiel-volschuim";
  return undefined;
}

/**
 * Eindkap systems. Connector caps for 2814, 2815, 2817 and 2819 are Keralit
 * sponning caps. The title does not always repeat the system name.
 */
export function eindkapSystemOf(product: { name: string; slug: string; tags?: string[] }): EindkapSystem | undefined {
  if (kozijnTypeOf(product) !== "eindkap") return undefined;
  const text = kozijnBlob(product);
  if (/milinboard|subgroep-261|subgroep-265/.test(text)) return "milinboard";
  if (/novaboard|subgroep-030|subgroep-031/.test(text)) return "novaboard";
  if (/lignodur|subgroep-032|subgroep-034/.test(text)) return "lignodur";
  if (/keralit|subgroep-010|eindkap\s*\+\s*connector|eindkap connector|\b2814\b|\b2815\b|\b2817\b|\b2819\b|\b2827\b|\b2828\b/.test(text)) {
    return "keralit";
  }
  return undefined;
}

export function productPhoto(product: {
  images?: Photo[];
  variants?: { image?: Photo }[];
}): Photo | undefined {
  const fromGallery = product.images?.find((image) => image?.url);
  if (fromGallery) return fromGallery;
  return product.variants?.find((variant) => variant.image?.url)?.image;
}

/**
 * Same Milin articles, photographed in Shopify, where this shop's row has no file.
 * Paneelprofiel, zelfklevend schuim and the PVC plaat ship without a gallery image.
 */
const PHOTO_FALLBACK: Record<string, string> = {
  "paneelprofiel-100x24-mm":
    "https://cdn.shopify.com/s/files/1/0432/1148/9446/products/paneelprofieltotaal.jpg?v=1748204000",
  "paneelprofiel-100x24-mm-wit":
    "https://cdn.shopify.com/s/files/1/0432/1148/9446/products/paneelprofieltotaal_4fc53f96-bc95-4268-aca3-b0210f0a47a6.jpg?v=1748204005",
  "zelfklevend-schuim-3000-x-1000-x-17-mm":
    "https://cdn.shopify.com/s/files/1/0432/1148/9446/products/sks0.jpg?v=1748203941",
  "zelfklevend-schuim-3000-x-1000-x-20-mm":
    "https://cdn.shopify.com/s/files/1/0432/1148/9446/products/sks0.jpg?v=1748203941",
  "zelfklevend-schuim-3000-x-1000-x-21-mm":
    "https://cdn.shopify.com/s/files/1/0432/1148/9446/products/sks0.jpg?v=1748203941",
  "zelfklevend-schuim-3000-x-1000-x-22-mm":
    "https://cdn.shopify.com/s/files/1/0432/1148/9446/products/sks0.jpg?v=1748203941",
  "pvc-plaat-3000-x-1500-x-1-5-mm":
    "https://cdn.shopify.com/s/files/1/0432/1148/9446/products/pvc0.jpg?v=1748203942",
};

function fallbackUrl(slug: string) {
  return PHOTO_FALLBACK[slug] ?? PHOTO_FALLBACK[canonicalHandle(slug)];
}

function tokens(value: string) {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter((part) => part.length > 2);
}

function overlap(left: string, right: string) {
  const wanted = new Set(tokens(left));
  return tokens(right).filter((part) => wanted.has(part)).length;
}

function stamp<T extends PhotoProduct>(product: T, image: Photo): T {
  return {
    ...product,
    images: [image, ...product.images.filter((item) => item.url !== image.url)],
    variants: product.variants.map((variant) => (variant.image?.url ? variant : { ...variant, image })),
  };
}

function familyKey(product: PhotoProduct) {
  const type = kozijnTypeOf(product);
  if (type) return `type:${type}`;
  if (isKozijnSheet(kozijnBlob(product))) return "sheet";
  return undefined;
}

/** Fill listing and product photos from a real Shopify file when the row has none. */
export function withKozijnPhotos<T extends PhotoProduct>(products: T[]): T[] {
  const pool = new Map<string, { name: string; image: Photo }[]>();
  for (const product of products) {
    const image = productPhoto(product);
    const key = familyKey(product);
    if (!image || !key) continue;
    const list = pool.get(key) ?? [];
    list.push({ name: product.name, image });
    pool.set(key, list);
  }

  return products.map((product) => {
    if (productPhoto(product)) return product;
    const key = familyKey(product);
    if (!key) return product;
    const known = fallbackUrl(product.slug);
    if (known) return stamp(product, { url: known, alt: product.name });
    let best: { name: string; image: Photo; score: number } | undefined;
    for (const candidate of pool.get(key) ?? []) {
      const score = overlap(product.name, candidate.name);
      if (score < 2) continue;
      if (!best || score > best.score) best = { ...candidate, score };
    }
    if (!best) return product;
    return stamp(product, { url: best.image.url, alt: product.name });
  });
}

export function kozijnTilePrefers(type: KozijnType, name: string) {
  return TILE_NAME[type].test(name.toLowerCase()) && (type !== "paneelprofiel" || !/staalversterking/.test(name.toLowerCase()));
}
