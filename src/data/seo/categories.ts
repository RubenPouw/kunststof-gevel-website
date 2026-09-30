import type { Metadata } from "next";

import type { CategorySlug } from "@/lib/catalog/types";

import type { SeoFaq, SeoLink, SeoSection } from "./brands";

export type CategoryStory = {
  slug: CategorySlug;
  metaTitle: string;
  description: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  links: SeoLink[];
};

export const categoryStories: Record<CategorySlug, CategoryStory> = {
  gevelbekleding: {
    slug: "gevelbekleding",
    metaTitle: "Kunststof gevelbekleding",
    description:
      "Kunststof gevelbekleding van Keralit, VinyPlus, Eurotexx en Kerrafront. Rabat, sponning en potdeksel, met m²-calculator en gratis kleurstalen.",
    sections: [
      {
        heading: "Kunststof gevelbekleding kopen",
        paragraphs: [
          "U kiest een merk, een profiel en een kleur. Rabat, sponning, potdeksel en rondkant dekken de meeste woningen. Steenstrips zijn een aparte familie voor plint en aanbouw.",
          "Materiaal ligt tussen € 65 en € 120 per m² excl. btw, afhankelijk van profiel, merk en kleur. Inclusief montage rekenen wij een band van € 95 tot € 140 per m² als eerste indicatie. De vaste prijs volgt na foto’s of een opname.",
          "De levensduur zit op 25 tot 35 jaar. Schilderen vervalt. Af en toe reinigen blijft.",
        ],
      },
      {
        heading: "Rekenen per gevelvlak",
        paragraphs: [
          "Op het product staat een m²-calculator: breedte, hoogte en openingen. Daar bovenop rekenen wij 10% snijverlies. Het aantal panelen kunt u meteen in de bestelling zetten.",
          "Hulpstukken — start, hoek, eind — staan onder montage. Zonder die profielen is de gevel niet af.",
        ],
      },
    ],
    faqs: [
      {
        q: "Welk merk voor een rechte zijgevel?",
        a: "Keralit als u stijf en fijn wilt. VinyPlus of Eurotexx als de prijs zwaarder weegt. Leg stalen buiten naast elkaar voor u bestelt.",
      },
    ],
    links: [
      { href: "/blog/wat-kost-kunststof-gevelbekleding", label: "Wat kost het per m²" },
      { href: "/blog/keralit-of-vinyplus", label: "Keralit of VinyPlus" },
      { href: "/offerte", label: "Offerte aanvragen" },
    ],
  },
  dakranden: {
    slug: "dakranden",
    metaTitle: "Kunststof dakranden",
    description:
      "Kunststof dakranden, boeidelen en hoeken in kleur bij de gevel. Milexx, VinyPlus en bijpassende aansluitprofielen.",
    sections: [
      {
        heading: "Dakrand mee met de gevel",
        paragraphs: [
          "Een nieuwe gevel met een houten boei die blijft schilferen is half werk. Kunststof boeidelen en hoeken dekken het overstek af en lopen in kleur mee.",
          "Reken hoeken per stuk. De m²-prijs van gevelpanelen geldt niet voor een dakrand. In de offerte nemen wij gevel en dakrand samen op.",
        ],
      },
    ],
    faqs: [
      {
        q: "Kan de dakrand een andere kleur dan de gevel?",
        a: "Ja. Donkere gevel met een lichte boei komt veel voor. Vraag van beide een staal.",
      },
    ],
    links: [
      { href: "/merken/milexx", label: "Milexx dakranden" },
      { href: "/offerte", label: "Gevel en dakrand laten rekenen" },
    ],
  },
  kozijnafwerking: {
    slug: "kozijnafwerking",
    metaTitle: "Kozijnafwerking",
    description:
      "Kunststof vensterbanken, eindkappen en aansluitprofielen. Milinboard overzetbanken en afwerking rond het kozijn.",
    sections: [
      {
        heading: "Rond het kozijn",
        paragraphs: [
          "Vensterbanken, eindkappen en aansluitprofielen maken de dagkant af als de gevel nieuw is. Een overzetbank dekt een bestaande bank als de maat het toelaat.",
          "Nieuwe kozijnen zelf configureert u apart. De afwerking op deze pagina is het materiaal rondom, niet het kozijn.",
        ],
      },
    ],
    faqs: [
      {
        q: "Hoort de vensterbank bij de gevelorder?",
        a: "U bestelt hem apart, per kozijn. In een offerte met montage zetten wij de banken op dezelfde lijst.",
      },
    ],
    links: [
      { href: "/merken/milinboard", label: "Milinboard banken" },
      { href: "/kozijnen", label: "Kozijnen configureren" },
    ],
  },
  montage: {
    slug: "montage",
    metaTitle: "Montagemateriaal",
    description:
      "Startprofielen, eindprofielen, hoeken, schroeven en verbinders voor kunststof gevelbekleding. Per merk, niet door elkaar.",
    sections: [
      {
        heading: "Hulpstukken per systeem",
        paragraphs: [
          "Elk merk heeft een eigen start, een eigen hoek en een eigen eind. Een aluminium VinyPlus-hoek past niet op een Keralit-sponning. Filter op merk en bestel de profielen in de lengte van het paneel.",
          "De uitgewerkte volgorde — regels, spouw, startprofiel, schroefmaat — staat in de montage-uitleg. Laten zetten kan via de offerte: een Caveman rekent plaatsing apart van het materiaal.",
        ],
      },
    ],
    faqs: [
      {
        q: "Zitten schroeven bij het paneel?",
        a: "Nee. Rvs-schroeven en montageprofielen zijn aparte regels. De productpagina noemt de maat; de artikelen staan in deze categorie.",
      },
    ],
    links: [
      { href: "/blog/montage-kunststof-gevelbekleding", label: "Montage-uitleg" },
      { href: "/offerte", label: "Montage laten uitvoeren" },
    ],
  },
};

export function getCategoryStory(slug: string) {
  if (slug in categoryStories) return categoryStories[slug as CategorySlug];
  return undefined;
}

export function categoryMetadata(slug: CategorySlug): Metadata {
  const story = categoryStories[slug];
  return {
    title: story.metaTitle,
    description: story.description,
    alternates: { canonical: `/${slug}` },
  };
}
