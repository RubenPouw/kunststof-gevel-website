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
};

export const categoryPageSeo: Record<CategorySlug, CategoryPageSeo> = {
  gevelbekleding: {
    id: "gevelbekleding",
    slug: "gevelbekleding",
    title: "Kunststof gevelbekleding",
    h1: "Gevelbekleding",
    description:
      "Kunststof gevelbekleding van Keralit, VinyPlus, Eurotexx en Kerrafront. Rabat, sponning en potdeksel, met m²-calculator en gratis kleurstalen.",
    previousSlugs: [],
  },
  dakranden: {
    id: "dakranden",
    slug: "dakranden",
    title: "Kunststof dakranden",
    h1: "Dakranden",
    description:
      "Kunststof dakranden, boeidelen en hoeken in kleur bij de gevel. Milexx, VinyPlus en bijpassende aansluitprofielen.",
    previousSlugs: [],
  },
  plafondpanelen: {
    id: "plafondpanelen",
    slug: "plafondpanelen",
    title: "Plafondpanelen",
    h1: "Plafondpanelen",
    description: "Florence plafondpanelen voor binnen en buiten, met profielen en plinten. Lengtes staan bij het artikel.",
    previousSlugs: [],
  },
  kozijnafwerking: {
    id: "kozijnafwerking",
    slug: "kozijnafwerking",
    title: "Kozijnafwerking",
    h1: "Kozijnafwerking",
    description: "Aansluitprofielen en afwerking rond het kozijn. De vensterbanken staan op een eigen pagina.",
    previousSlugs: [],
  },
  vensterbanken: {
    id: "vensterbanken",
    slug: "vensterbanken",
    title: "Vensterbanken",
    h1: "Vensterbanken",
    description:
      "Kunststof vensterbanken en overzetbanken. Per merk eerst de bank, dan eindkappen en profielen, dan de bevestiging.",
    previousSlugs: [],
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
    slug: "hpl-platen",
    title: "HPL platen",
    h1: "HPL platen",
    description:
      "HPL platen van 3050 × 1300 × 6 mm. Hele plaat, 3,965 m². Compact exterieur, FR brandvertragend, Renolit eenzijdig en Abet. Filter op kleur en RAL.",
    previousSlugs: [],
  },
};

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
    if (page.slug === slug && page.slug !== page.id) return `/${page.id}`;
  }
  return null;
}
