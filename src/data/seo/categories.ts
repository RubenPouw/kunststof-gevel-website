import type { Metadata } from "next";

import { categoryPageSeo, categoryPath } from "@/data/seo/category-pages";
import { getProductsByCategory } from "@/lib/catalog";
import { hasActiveFilters } from "@/lib/catalog/helpers";
import { CATEGORY_PAGE_SIZE, listingPageHref } from "@/lib/catalog/listing";
import type { CategorySlug, ListingFilters } from "@/lib/catalog/types";

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
    metaTitle: categoryPageSeo.gevelbekleding.title,
    description: categoryPageSeo.gevelbekleding.description,
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
          "Hulpstukken (start, hoek, eind) staan onder montage. Zonder die profielen is de gevel niet af.",
        ],
      },
      {
        heading: "Waar het paneel past",
        paragraphs: [
          "Een rechte zijgevel, een dakkapel, een schuur of een chalet gebruiken hetzelfde systeem. Het verschil zit in de hoeken, de dagkanten en of de ondergrond nog recht is.",
          "Voor een schuur of tuinhuis volstaat vaak een lichter rabat. Een woning in de zon, met een lange gevel, heeft meer aan een stijf paneel zoals Keralit. Leg daar een staal op de bestaande muur, niet alleen op een foto.",
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
      { href: "/aansluiting-kozijn-gevel", label: "aansluiting kozijn en gevelbekleding" },
      { href: "/offerte", label: "Offerte aanvragen" },
    ],
  },
  dakranden: {
    slug: "dakranden",
    metaTitle: categoryPageSeo.dakranden.title,
    description: categoryPageSeo.dakranden.description,
    sections: [
      {
        heading: "Dakrand mee met de gevel",
        paragraphs: [
          "Een nieuwe gevel met een houten boei die blijft schilferen is half werk. Kunststof boeidelen en hoeken dekken het overstek af en lopen in kleur mee.",
          "Reken hoeken per stuk. De m²-prijs van gevelpanelen geldt niet voor een dakrand. In de offerte nemen wij gevel en dakrand samen op.",
          "Nieuwe kozijnen onder een houten boei pakt u in dezelfde ronde. Lees hoe dakrand en kader in één lijn komen, en vraag gevel, dakrand en kozijnen desgewenst samen aan.",
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
      { href: "/boeidelen-en-kozijnen", label: "boeidelen en kozijnen" },
      { href: "/offerte-montage?delen=Gevel,Kozijnen", label: "Offerte gevel en kozijnen" },
      { href: "/offerte", label: "Gevel en dakrand laten rekenen" },
    ],
  },
  plafondpanelen: {
    slug: "plafondpanelen",
    metaTitle: categoryPageSeo.plafondpanelen.title,
    description: categoryPageSeo.plafondpanelen.description,
    sections: [
      {
        heading: "Plafond, geen gevel",
        paragraphs: [
          "Een plafond of overstek vraagt een vlak paneel. Florence is daarvoor. De gevel zelf blijft een rabat, sponning of potdeksel.",
          "Profielen, plinten en verbindingen van dezelfde lijn bestelt u op deze pagina, niet tussen de gevelpanelen.",
        ],
      },
    ],
    faqs: [
      {
        q: "Kan ik Florence buiten gebruiken?",
        a: "Er is een buitenplafondpaneel. Gebruik dat voor een overstek. Een binnenpaneel hoort binnen.",
      },
    ],
    links: [
      { href: "/merken/florence", label: "Florence" },
      { href: categoryPath("dakranden"), label: "Dakranden" },
      { href: "/offerte", label: "Plafond laten rekenen" },
    ],
  },
  kozijnafwerking: {
    slug: "kozijnafwerking",
    metaTitle: categoryPageSeo.kozijnafwerking.title,
    description: categoryPageSeo.kozijnafwerking.description,
    sections: [
      {
        heading: "Rond het kozijn",
        paragraphs: [
          "Dagstukken, koplatten en aansluitprofielen maken de dagkant af. De vensterbank zelf kiest u bij Vensterbanken.",
          "Nieuwe kozijnen zelf configureert u apart. De afwerking op deze pagina is het materiaal rondom, niet het kozijn.",
        ],
      },
    ],
    faqs: [
      {
        q: "Waar bestel ik de vensterbank?",
        a: "Op de pagina Vensterbanken. Hier blijft de afwerking rond het kozijn, zoals aansluitprofielen.",
      },
    ],
    links: [
      { href: categoryPath("vensterbanken"), label: "Vensterbanken" },
      { href: "/kunststof-kozijnen", label: "Kozijnen configureren" },
      { href: "/aansluiting-kozijn-gevel", label: "aansluiting kozijn en gevelbekleding" },
      { href: "/offerte-montage?delen=Gevel,Kozijnen", label: "Offerte gevel en kozijnen" },
    ],
  },
  vensterbanken: {
    slug: "vensterbanken",
    metaTitle: categoryPageSeo.vensterbanken.title,
    description: categoryPageSeo.vensterbanken.description,
    sections: [
      {
        heading: "Eerst de bank",
        paragraphs: [
          "Per merk staan de vensterbanken eerst. Eindkappen en profielen volgen, en daarna de bevestiging.",
          "Een overzetbank dekt een bestaande bank als de maat het toelaat. Een vaste bank vervangt het blad. Kozijnen stelt u apart samen.",
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
      { href: categoryPath("kozijnafwerking"), label: "Kozijnafwerking" },
      { href: "/kunststof-kozijnen", label: "Kozijnen" },
    ],
  },
  montage: {
    slug: "montage",
    metaTitle: categoryPageSeo.montage.title,
    description: categoryPageSeo.montage.description,
    sections: [
      {
        heading: "Hulpstukken per systeem",
        paragraphs: [
          "Elk merk heeft een eigen start, een eigen hoek en een eigen eind. Een aluminium VinyPlus-hoek past niet op een Keralit-sponning. Filter op merk en bestel de profielen in de lengte van het paneel.",
          "De uitgewerkte volgorde (regels, spouw, startprofiel, schroefmaat) staat in de montage-uitleg. Laten zetten kan via de offerte. Plaatsing rekenen we apart van het materiaal.",
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
  "hpl-platen": {
    slug: "hpl-platen",
    metaTitle: categoryPageSeo["hpl-platen"].title,
    description: categoryPageSeo["hpl-platen"].description,
    sections: [
      {
        heading: "HPL plaat kopen",
        paragraphs: [
          "Een HPL plaat (ook: HPL platen) is een compacte plaat: lagen papier en hars, geperst onder hoge druk. Het oppervlak is hard en bestand tegen vocht. Je bestelt de plaat heel. Wij zagen niet op maat.",
          "De lijnen in deze categorie zijn HPL Compact Exterieur, FR brandvertragend, Renolit eenzijdig en Abet. Filter op kleur of op RAL. Een staal leg je buiten tegen de gevel, niet alleen op een scherm.",
        ],
      },
      {
        heading: "Maat van de plaat",
        paragraphs: [
          "Elke plaat is 3050 × 1300 mm en 6 mm dik. Dat is 3,965 m². De teller deelt uw vlak door die maat en rondt naar boven af op hele platen. Een reststuk blijft van u.",
          "Een gevelpaneel rekent anders. Daar telt de werkende breedte, plus 10% snijverlies. Die calculator staat op rabat en sponning, niet op deze plaat.",
        ],
      },
      {
        heading: "Welke lijn",
        paragraphs: [
          "HPL Compact Exterieur is de plaat voor buiten, op een geventileerde achterconstructie. FR brandvertragend kiest u als het bestek een brandvertragende plaat vraagt. Op het artikel staat geen brandklasse die wij er zelf bij verzinnen.",
          "Renolit eenzijdig heeft de decorlaag aan één kant. Abet is een decorlijn in vaste kleuren. De plaatmaat is bij alle vier gelijk.",
        ],
      },
      {
        heading: "Waar de plaat past",
        paragraphs: [
          "Een vlakke gevel, een boeideel, een dagkant of een binnenwand. Geen rabatnaad. Voor een gevel die het naadbeeld van een sponning of rabat moet hebben, neemt u een gevelpaneel.",
          "Buiten houdt u een spouw aan en kit u die niet dicht. Bevestig volgens het voorschrift van de lijn.",
        ],
      },
      {
        heading: "Onderhoud",
        paragraphs: [
          "Niet schilderen. Afspoelen met water en een mild middel is genoeg. Geen schuurmiddel en geen hogedruk op korte afstand.",
        ],
      },
    ],
    faqs: [
      {
        q: "Zagen jullie de plaat op maat?",
        a: "Nee. U bestelt hele platen van 3050 × 1300 mm. Zaagwerk op de bouw is van u.",
      },
      {
        q: "Hoeveel m² is één plaat?",
        a: "3,965 m². De teller Platen nodig deelt het netto vlak door die maat en rondt naar boven af.",
      },
      {
        q: "Welke lijn gebruik ik buiten?",
        a: "HPL Compact Exterieur, op een geventileerde achterconstructie. FR als het bestek brandvertragend vraagt. Renolit eenzijdig en Abet kiest u op de afwerking die op de plaat staat.",
      },
    ],
    links: [
      { href: "/hpl-plaat", label: "Kleur en structuur" },
      { href: "/merken/hpl-compact-exterieur", label: "HPL Compact Exterieur" },
      { href: "/merken/hpl-fr", label: "FR brandvertragend" },
      { href: "/merken/renolit", label: "Renolit eenzijdig" },
      { href: "/merken/abet", label: "Abet" },
      { href: "/blog/hpl-plaat", label: "Plaat of gevelpaneel" },
      { href: categoryPath("gevelbekleding"), label: "Gevelpanelen" },
      { href: "/staalaanvraag", label: "Gratis staal" },
      { href: "/offerte", label: "Offerte" },
    ],
  },
};

export async function categoryRouteMetadata(slug: CategorySlug): Promise<Metadata> {
  const products = await getProductsByCategory(slug);
  const pages = Math.ceil(products.length / CATEGORY_PAGE_SIZE);
  return {
    ...categoryMetadata(slug),
    ...(pages > 1 ? { pagination: { next: `/${slug}?pagina=2` } } : {}),
  };
}

export function categoryViewMetadata(
  slug: CategorySlug,
  filters: ListingFilters,
  pagina: number,
  pages: number,
): Metadata {
  const base = categoryMetadata(slug);
  const path = categoryPath(slug);
  const filtered = hasActiveFilters(filters);
  const canonical = !filtered && pagina > 1 ? listingPageHref(path, {}, pagina) : path;
  return {
    ...base,
    alternates: { canonical },
    robots: filtered ? { index: false, follow: true } : undefined,
    pagination: {
      previous: pagina > 1 ? listingPageHref(path, filters, pagina - 1) : undefined,
      next: pagina < pages ? listingPageHref(path, filters, pagina + 1) : undefined,
    },
  };
}

export function getCategoryStory(slug: string) {
  if (slug in categoryStories) return categoryStories[slug as CategorySlug];
  return undefined;
}

export function categoryMetadata(slug: CategorySlug): Metadata {
  const seo = categoryPageSeo[slug];
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: categoryPath(slug) },
  };
}
