import type { CategorySlug } from "@/lib/catalog/types";

import type { SeoFaq, SeoLink, SeoSection } from "./brands";

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
    title: "Overzet vensterbank binnen | Kunststof vensterbank",
    h1: "Kunststof overzet vensterbank voor binnen",
    description:
      "Overzet vensterbank voor binnen: Milinboard 380 mm schuif je over je oude bank. Met eindkappen. Voorraad in max. 3 werkdagen.",
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
    title: "HPL plaat kopen | Voor gevel en dakkapel",
    h1: "HPL plaat voor gevel, dakkapel en boeiboord",
    description:
      "HPL plaat 3050 x 1300 x 6 mm. Hele plaat, ongeveer 3,965 m². Compact exterieur, FR brandvertragend, Renolit eenzijdig en Abet. Levering in max. 3 werkdagen.",
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
    title: "Keralit gevelbekleding kopen | Planken, panelen, profielen",
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
    title: "Kunststof plafond badkamer kopen | Plafondpanelen",
    h1: "Kunststof plafond voor de badkamer",
    description:
      "Kunststof plafondpanelen voor de badkamer: vochtbestendig, strak en onderhoudsarm. Prijs per paneel staat bij het product. Gratis verzending vanaf €499.",
  },
  plafondOverstek: {
    path: "/plafondpanelen/overstek",
    title: "Kunststof plafondpanelen voor overstek en buiten",
    h1: "Dakoverstek bekleden met kunststof",
    description: "Florence buitenplafondpanelen voor een overstek.",
  },
  boeiKeralit: {
    path: "/boeidelen/keralit",
    title: "Keralit boeideel en dakranden kopen | 200 tot 350 mm",
    h1: "Keralit boeideel en dakranden",
    description:
      "Keralit boeideel in 200, 250, 300 of 350 mm, met profielen en hoekstukken. Zelfde kleur als je gevel. Op voorraad in max. 3 werkdagen.",
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

export const boeiKeralitArticle: {
  intro: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  links: SeoLink[];
} = {
  intro:
    "Deze pagina is de eigenaar van de term Keralit boeideel. Een boeideel is het dakrandpaneel waarmee je de dakrand afwerkt. Het losse paneel, bijvoorbeeld 250 mm, heeft een eigen productpagina.",
  sections: [
    {
      heading: "Welke breedte kies je?",
      paragraphs: [
        "Keralit dakrandpanelen zijn er in 200, 250, 300 en 350 mm. Meet de hoogte van de boei en kies de breedte die het vlak volledig afdekt. 250 mm is de maat als 200 mm te smal is en 300 mm te breed.",
        "Op voorraad leveren we in max. 3 werkdagen. Kleurstalen zijn binnen 3 werkdagen thuis.",
      ],
    },
    {
      heading: "Profielen en hoeken",
      paragraphs: [
        "Naast het paneel heb je een montageprofiel, een eindprofiel en een trim of kraal nodig. Hoek- en tussenstukken horen bij de breedte. Bestel ze in dezelfde kleur.",
      ],
    },
    {
      heading: "Gevel en dakrand samen",
      paragraphs: [
        "Werk gevel en dakrand in één systeem af. De Keralit gevelbekleding staat op de Keralit-landingspagina. Twijfel je over de kleur, vraag eerst een staal aan.",
        "Past u de dakrand samen met nieuwe kozijnen aan, lees dan hoe die twee in één lijn komen.",
      ],
    },
  ],
  faqs: [
    {
      q: "Wat is een Keralit boeideel?",
      a: "Hetzelfde als een Keralit dakrandpaneel. Boeideel is de gebruikelijke term. Deze pagina verzamelt de breedtes. Elk paneel heeft een eigen URL.",
    },
    {
      q: "Welke breedte heb ik nodig?",
      a: "De breedte die de dakrand afdekt: 200, 250, 300 of 350 mm. Dekking die net tekort komt, laat een strook zien. Neem dan de bredere maat.",
    },
    {
      q: "Kan ik de dakrand over mijn oude boeideel heen?",
      a: "Vaak wel, als de ondergrond recht en droog is en je de juiste montageprofielen gebruikt. Twijfel je, stuur een foto mee bij de offerte.",
    },
    {
      q: "Kan ik Keralit dakranden zelf monteren?",
      a: "Ja, met de bijpassende profielen en de montagevoorschriften van Keralit. Liever laten plaatsen? Vraag een offerte aan.",
    },
  ],
  links: [
    { href: "/keralit-gevelbekleding", label: "Keralit gevelbekleding" },
    { href: "/boeidelen", label: "Alle boeidelen" },
    { href: "/boeidelen-en-kozijnen", label: "dakrand in lijn met het kozijn" },
    { href: "/offerte-montage?delen=Gevel,Kozijnen", label: "Offerte gevel en kozijnen" },
    { href: "/staalaanvraag", label: "Gratis kleurstaal" },
    { href: "/offerte", label: "Offerte aanvragen" },
  ],
};

export const plafondBadkamerArticle: {
  intro: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  links: SeoLink[];
} = {
  intro:
    "Een kunststof plafond in de badkamer is vochtbestendig, strak en onderhoudsarm. Je kiest binnenplafondpanelen die tegen vocht kunnen, met de bijpassende profielen en plinten.",
  sections: [
    {
      heading: "Waarom kunststof in de badkamer?",
      paragraphs: [
        "Vocht en temperatuurschommelingen horen bij een badkamer. Kunststof plafondpanelen nemen geen vocht op zoals sommige plaatmaterialen en je hoeft niet te schilderen.",
      ],
    },
    {
      heading: "Wat heb je nodig?",
      paragraphs: [
        "Panelen, omrandings- of H-profielen, en waar nodig een plint of ventilatierooster. De exacte set hangt af van het merk en de afmeting van je plafond. Prijs en lengte staan op de productkaart.",
      ],
    },
    {
      heading: "Binnen of overstek?",
      paragraphs: [
        "Deze pagina is voor binnen, zoals de badkamer. Voor een overstek of buitenplafond kies je de overstek-pagina bij plafondpanelen.",
      ],
    },
  ],
  faqs: [
    {
      q: "Kan ik een kunststof plafond in de badkamer plaatsen?",
      a: "Ja, met binnenplafondpanelen die tegen vocht kunnen, plus de juiste profielen. Volg de montagevoorschriften van het merk.",
    },
    {
      q: "Wat is het verschil met een buitenplafond?",
      a: "Binnenpanelen horen binnen. Voor een overstek gebruik je buitenplafondpanelen. Die staan onder plafondpanelen overstek.",
    },
  ],
  links: [
    { href: "/plafondpanelen", label: "Alle plafondpanelen" },
    { href: "/plafondpanelen/overstek", label: "Overstek en buiten" },
    { href: "/merken/florence", label: "Florence" },
    { href: "/staalaanvraag", label: "Staal aanvragen" },
    { href: "/offerte", label: "Offerte" },
  ],
};
