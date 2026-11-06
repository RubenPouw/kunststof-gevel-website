import type { CategorySlug } from "@/lib/catalog/types";

/**
 * Public SEO for category pages. Ahrefs copy lands here.
 * Change `slug`, and put the old slug in `previousSlugs`: that old URL 301s to the new one.
 * `id` stays the catalog key. Do not rename it when the public URL changes.
 */
export type CategoryPageSeo = {
  id: CategorySlug;
  slug: string;
  title: string;
  h1: string;
  description: string;
  previousSlugs: readonly string[];
  /** Public URL is its own route. Do not rewrite it onto the catalog id. */
  direct?: boolean;
};

export const categoryPageSeo: Record<CategorySlug, CategoryPageSeo> = {
  gevelbekleding: {
    id: "gevelbekleding",
    slug: "gevelbekleding",
    title: "Gevelbekleding kopen | Kunststof rabat, Keralit en VinyPlus",
    h1: "Gevelbekleding",
    description:
      "Kunststof gevelbekleding van Keralit, VinyPlus, Eurotexx en Kerrafront. Rabat, sponning en potdeksel, met m²-calculator en gratis kleurstalen.",
    previousSlugs: [],
  },
  dakranden: {
    id: "dakranden",
    slug: "boeidelen",
    title: "Kunststof boeidelen en dakranden kopen | Keralit, VinyPlus, Milexx",
    h1: "Kunststof boeidelen en dakranden",
    description:
      "Kunststof dakranden, boeidelen en hoeken in kleur bij de gevel. Milexx, VinyPlus en bijpassende aansluitprofielen.",
    previousSlugs: ["dakranden"],
  },
  plafondpanelen: {
    id: "plafondpanelen",
    slug: "plafondpanelen",
    title: "Kunststof plafondpanelen kopen | Binnen en buiten, Florence",
    h1: "Kunststof plafondpanelen",
    description: "Florence plafondpanelen voor binnen en buiten, met profielen en plinten. Lengtes staan bij het artikel.",
    previousSlugs: [],
  },
  kozijnafwerking: {
    id: "kozijnafwerking",
    slug: "kozijnafwerking",
    title: "Kozijnafwerking en dagkantafwerking van kunststof",
    h1: "Kozijnafwerking",
    description: "Aansluitprofielen en afwerking rond het kozijn. De vensterbanken staan op een eigen pagina.",
    previousSlugs: [],
  },
  vensterbanken: {
    id: "vensterbanken",
    slug: "kunststof-vensterbank",
    title: "Kunststof vensterbank & overzet vensterbank buiten",
    h1: "Kunststof vensterbank en overzet vensterbank (binnen en buiten)",
    description:
      "Kunststof vensterbanken en overzetbanken. Per merk eerst de bank, dan eindkappen en profielen, dan de bevestiging.",
    previousSlugs: ["vensterbanken"],
    direct: true,
  },
  montage: {
    id: "montage",
    slug: "montage",
    title: "Montagemateriaal",
    h1: "Montage",
    description:
      "Startprofielen, eindprofielen, hoeken, schroeven en verbinders voor kunststof gevelbekleding. Per merk, niet door elkaar.",
    previousSlugs: [],
  },
  "hpl-platen": {
    id: "hpl-platen",
    slug: "hpl-plaat",
    title: "HPL plaat kopen | Milyt HPL voor gevel en dakkapel",
    h1: "HPL platen",
    description:
      "HPL platen van 3050 × 1300 × 6 mm. Hele plaat, 3,965 m². Compact exterieur, FR brandvertragend, Renolit eenzijdig en Abet. Filter op kleur en RAL.",
    previousSlugs: ["hpl-platen"],
    direct: true,
  },
};

/** Pages that are not a catalog id, but share this file so Ahrefs copy stays in one commit. */
export const pageSeo = {
  kozijnen: {
    path: "/kunststof-kozijnen",
    title: "Kunststof kozijnen op maat | Prijs direct berekenen",
    h1: "Kunststof kozijnen op maat",
  },
  keralit: {
    path: "/keralit-gevelbekleding",
    title: "Keralit gevelbekleding kopen | Keralit panelen en profielen",
    h1: "Keralit gevelbekleding",
  },
  rabatdelen: {
    path: "/rabatdelen",
    title: "Kunststof rabatdelen kopen | Enkel & dubbel rabat",
    h1: "Kunststof rabatdelen",
    description: "Enkel en dubbel rabat. De andere gevelprofielen staan bij gevelbekleding.",
  },
  plafondBadkamer: {
    path: "/plafondpanelen/badkamer",
    title: "Kunststof plafondpanelen voor de badkamer",
    h1: "Kunststof plafond voor de badkamer",
    description: "Florence binnenplafondpanelen voor een badkamer of een andere binnenruimte.",
  },
  plafondOverstek: {
    path: "/plafondpanelen/overstek",
    title: "Kunststof plafondpanelen voor overstek en buiten",
    h1: "Dakoverstek bekleden met kunststof",
    description: "Florence buitenplafondpanelen voor een overstek.",
  },
  boeiKeralit: {
    path: "/boeidelen/keralit",
    title: "Keralit boeidelen en dakranden",
    h1: "Keralit boeidelen",
    description: "Keralit dakrandpanelen en boeidelen. De breedte kiest u met het filter.",
    brand: "keralit",
  },
  boeiVinyplus: {
    path: "/boeidelen/vinyplus",
    title: "VinyPlus boeidelen en dakranden",
    h1: "VinyPlus boeidelen",
    description: "VinyPlus dakrandpanelen. De breedte kiest u met het filter.",
    brand: "vinyplus",
  },
  boeiMilexx: {
    path: "/boeidelen/milexx",
    title: "Milexx boeidelen en dakranden",
    h1: "Milexx boeidelen",
    description: "Milexx dakrandpanelen. De breedte kiest u met het filter.",
    brand: "milexx",
  },
} as const;

export const boeiBrandSlugs = ["keralit", "vinyplus", "milexx"] as const;

export function categoryPath(id: CategorySlug) {
  return `/${categoryPageSeo[id].slug}`;
}

export function categoryIdFromPublicPath(pathname: string): CategorySlug | null {
  const slug = pathname.replace(/\/$/, "").replace(/^\//, "");
  if (!slug || slug.includes("/")) return null;
  for (const page of Object.values(categoryPageSeo)) {
    if (page.slug === slug || page.id === slug) return page.id;
  }
  return null;
}

/** Old public slugs, and the catalog id once it is no longer the public URL. */
export function categoryRedirectTarget(
  pathname: string,
  pages: Iterable<Pick<CategoryPageSeo, "id" | "slug" | "previousSlugs">> = Object.values(categoryPageSeo),
): string | null {
  const slug = pathname.replace(/\/$/, "").replace(/^\//, "");
  if (!slug || slug.includes("/")) return null;
  for (const page of pages) {
    const current = `/${page.slug}`;
    if (page.previousSlugs.includes(slug) && slug !== page.slug) return current;
    if (slug === page.id && page.slug !== page.id) return current;
  }
  return null;
}

/** Browser URL stays the public slug. The app folder keeps the catalog id. */
export function categoryInternalRewrite(pathname: string): string | null {
  const slug = pathname.replace(/\/$/, "").replace(/^\//, "");
  if (!slug || slug.includes("/")) return null;
  for (const page of Object.values(categoryPageSeo)) {
    if (page.direct) continue;
    if (page.slug === slug && page.slug !== page.id) return `/${page.id}`;
  }
  return null;
}
