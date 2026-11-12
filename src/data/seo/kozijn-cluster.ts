import type { Metadata } from "next";

import type { SeoFaq, SeoLink, SeoSection } from "./brands";

/**
 * Titles and meta follow the Marketing review of 12 Nov 2026.
 * Absolute titles, no site suffix. Preview until Ruben confirms the before/after.
 */
export const clusterSlugs = [
  "gevel-en-kozijnen-renoveren",
  "aansluiting-kozijn-gevel",
  "kleur-kozijn-en-gevelbekleding",
  "boeidelen-en-kozijnen",
  "volgorde-kozijnen-en-gevel",
] as const;

export type ClusterSlug = (typeof clusterSlugs)[number];

export type ClusterPage = {
  slug: ClusterSlug;
  path: string;
  title: string;
  description: string;
  kicker: string;
  h1: string;
  subtitle?: string;
  intro: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  links: SeoLink[];
};

const offerte = "/offerte-montage?delen=Gevel,Kozijnen";
const pilaar = "/gevel-en-kozijnen-renoveren";
const montageArtikel = "/kunststof-kozijnen/kennisbank/montage";

export const clusterPages: Record<ClusterSlug, ClusterPage> = {
  "gevel-en-kozijnen-renoveren": {
    slug: "gevel-en-kozijnen-renoveren",
    path: pilaar,
    title: "Gevel en kozijnen tegelijk renoveren | Offerte",
    description:
      "Renoveer gevelbekleding en kozijnen in één ronde. Eén steiger, kleur en aansluiting in samenhang. Vraag een offerte aan, inclusief montage door Cavemen.",
    kicker: "Gevel en kozijnen",
    h1: "Gevel en kozijnen tegelijk renoveren",
    intro:
      "U pakt kunststof kozijnen en gevelbekleding in één ronde: één steiger, één planning en één aansluiting. De kleur legt u eerst naast elkaar, voordat u bestelt.",
    sections: [
      {
        heading: "Waarom één ronde",
        paragraphs: [
          "Een steiger voor de gevel en later nog eens voor de kozijnen kost twee planningen en twee keer overlast. Doet u het samen, dan blijft de sparing bereikbaar tot het kader staat en de bekleding aansluit.",
          "De aansluiting, de dakrand en de kleur horen bij dezelfde ronde. Wat u apart bestelt, past op de dag vaak nét niet op elkaar.",
        ],
      },
      {
        heading: "Wat Cavemen levert en monteert",
        paragraphs: [
          "Cavemen levert de gevelbekleding en de kozijnen, en kan beide monteren. U vraagt dat in één offerte. Het vinkje Montage door Cavemen geldt voor de gevel en de kozijnen, en voor de dakrand als u die meeneemt.",
          "U meet zelf met de meetinstructie. Inmeten ter plaatse is geen belofte. Of het oude kozijn wordt meegenomen, zetten we als vraag op de offerte, niet als standaard.",
        ],
      },
      {
        heading: "Configurator en gevelshop",
        paragraphs: [
          "Het kozijn stelt u samen in de configurator, op buitenwerkse maat. De gevel, de profielen en de dakrand bestelt u in de shop, of u laat ze meetellen in dezelfde offerte.",
          "Er is geen tweede configurator en geen aparte prijs voor het kader op deze pagina. De maatwerkofferte van het kozijn blijft de configurator. De combi-aanvraag loopt via het montageformulier.",
        ],
      },
      {
        heading: "Stalen naast elkaar",
        paragraphs: [
          "Folie op het kozijn en folie op de gevel delen zelden dezelfde code, ook als beide antraciet heten. Vraag kleurstalen aan en leg het gevelstaal naast de kozijnkleur.",
          "Twijfelt u over de volgorde, de dichting of de dakrand, dan staan die onderwerpen op de deelpagina's. Deze pagina blijft het overzicht.",
        ],
      },
      {
        heading: "Plaatsen",
        paragraphs: [
          "Zelf plaatsen blijft mogelijk. Montage door Cavemen kan ook, alleen of samen met de gevel. De uitleg staat bij kozijnen plaatsen. De aanvraag doet u via de offerte hieronder.",
        ],
      },
    ],
    faqs: [
      {
        q: "Monteren jullie gevel en kozijnen?",
        a: "Ja. Montage door Cavemen kan voor de gevel en de kozijnen, in één offerte. U kunt het vinkje uitzetten als u alleen materiaal wilt.",
      },
      {
        q: "Moet ik twee offertes doen?",
        a: "Nee. Eén aanvraag volstaat voor gevel en kozijnen. Het kader zelf stelt u daarnaast samen in de configurator als u de indeling al weet.",
      },
      {
        q: "Komen jullie inmeten?",
        a: "U meet zelf met de meetinstructie. Inmeten ter plaatse is geen onderdeel van deze aanvraag.",
      },
      {
        q: "Nemen jullie het oude kozijn mee?",
        a: "Dat is een vraag op de offerte, geen standaard. Op deze pagina staat geen tarief voor afvoer.",
      },
    ],
    links: [
      { href: "/aansluiting-kozijn-gevel", label: "aansluiting kozijn en gevelbekleding" },
      { href: "/kleur-kozijn-en-gevelbekleding", label: "kleur kozijn en gevelbekleding" },
      { href: "/boeidelen-en-kozijnen", label: "boeidelen en kozijnen" },
      { href: "/volgorde-kozijnen-en-gevel", label: "eerst kozijnen of eerst de gevel" },
      { href: "/kunststof-kozijnen", label: "Kozijnen samenstellen" },
      { href: "/gevelbekleding", label: "Gevelbekleding" },
      { href: "/boeidelen", label: "Dakranden" },
      { href: "/kozijnafwerking", label: "Kozijnafwerking" },
      { href: "/staalaanvraag", label: "Gratis kleurstalen" },
      { href: montageArtikel, label: "Kozijnen plaatsen" },
      { href: offerte, label: "Offerte gevel en kozijnen" },
    ],
  },
  "aansluiting-kozijn-gevel": {
    slug: "aansluiting-kozijn-gevel",
    path: "/aansluiting-kozijn-gevel",
    title: "Aansluiting kozijn en gevelbekleding | Waterdicht",
    description:
      "Hoe gevelbekleding aansluit op het kozijn: dichting, kit en band, waterdicht en damp-open. Offerte voor kader en bekleding, met montage door Cavemen.",
    kicker: "Aansluiting",
    h1: "Aansluiting kozijn en gevelbekleding",
    intro:
      "De bekleding stopt niet vanzelf strak tegen het kader. Water moet weg kunnen, de ventilatiespouw blijft open, en de dagkant sluit aan op het kozijn dat u plaatst.",
    sections: [
      {
        heading: "Volgorde bij de aansluiting",
        paragraphs: [
          "Eerst de sparing, dan het kozijn, dan de bekleding. Zit het paneel al dicht tot op de oude dagkant, dan zaagt u later alsnog open om het kader te stellen.",
          "Waarom het kozijn meestal eerder komt, staat bij de volgorde. Hier gaat het om de naad tussen kader en bekleding.",
        ],
      },
      {
        heading: "Dagkant en aansluitprofielen",
        paragraphs: [
          "De dagkant werkt u af met de profielen van hetzelfde systeem als de gevel. Een hoek of een aansluitprofiel van een ander merk past zelden op de sponning.",
          "De producten zelf, koplat en profiel, bestelt u bij kozijnafwerking. Deze pagina legt de aansluiting uit, ze is geen tweede winkel voor die artikelen.",
        ],
      },
      {
        heading: "Dichting zonder de spouw dicht te zetten",
        paragraphs: [
          "Comprimatieband of kit hoort in de naad tussen kozijn en muur, niet als prop in de ventilatiespouw. De spouw achter de bekleding blijft open, onder en boven.",
          "Een kier die u vol pur spuit voordat het kozijn te lood staat, stelt u niet meer bij. Eerst stellen, dan dichten.",
        ],
      },
      {
        heading: "Wanneer de bestaande aansluiting tekortschiet",
        paragraphs: [
          "Een houten dagkant die zacht is, een profiel dat niet meer op het nieuwe kader past, of een naad die water naar de spouw leidt: dan is afwerken op het oude werk geen plan.",
          "Stuur een foto mee bij de offerte. We zeggen dan of de bestaande aansluiting mee kan, of dat de dagkant nieuw moet.",
        ],
      },
      {
        heading: "Vensterbank, binnen",
        paragraphs: [
          "De vensterbank is binnenafwerking. Die kiest u apart, op de pagina voor vensterbanken. Ze hoort niet bij de gevel en niet bij de dichting van de dagkant.",
        ],
      },
      {
        heading: "Montage in één ronde",
        paragraphs: [
          "Cavemen kan het kader en de bekleding in één ronde monteren. Zelf plaatsen blijft mogelijk. De uitleg over plaatsen staat in de kennisbank. De aanvraag doet u via de offerte.",
        ],
      },
    ],
    faqs: [
      {
        q: "Kit ik de ventilatiespouw dicht?",
        a: "Nee. De spouw achter de bekleding blijft open. Dichten doet u in de naad van het kozijn, niet in de luchtlaag van de gevel.",
      },
      {
        q: "Waar bestel ik de profielen?",
        a: "Bij kozijnafwerking, in het systeem van uw gevel. Het kozijn zelf stelt u samen in de configurator.",
      },
      {
        q: "Hoort de vensterbank bij deze aansluiting?",
        a: "Nee. De vensterbank is binnenafwerking en staat op een eigen pagina.",
      },
    ],
    links: [
      { href: pilaar, label: "Gevel en kozijnen tegelijk renoveren" },
      { href: "/volgorde-kozijnen-en-gevel", label: "eerst kozijnen of eerst de gevel" },
      { href: "/kozijnafwerking", label: "Kozijnafwerking" },
      { href: "/kunststof-kozijnen", label: "Kozijnen samenstellen" },
      { href: "/kunststof-vensterbank", label: "Vensterbank voor binnen" },
      { href: "/kleur-kozijn-en-gevelbekleding", label: "kleur kozijn en gevelbekleding" },
      { href: montageArtikel, label: "Kozijnen plaatsen" },
      { href: offerte, label: "Offerte gevel en kozijnen" },
    ],
  },
  "kleur-kozijn-en-gevelbekleding": {
    slug: "kleur-kozijn-en-gevelbekleding",
    path: "/kleur-kozijn-en-gevelbekleding",
    title: "Kleur kozijn en gevelbekleding | Gratis kleurstalen",
    description:
      "Antraciet op het kozijn is niet vanzelf dezelfde folie als antraciet op de gevel. Vraag gratis kleurstalen aan en leg ze naast elkaar voor u bestelt.",
    kicker: "Kleur",
    h1: "Kleur kozijn en gevelbekleding",
    subtitle: "Dezelfde kleur, twee materialen.",
    intro:
      "Antraciet op het kozijn en antraciet op de gevel zijn twee folies. De code van het kader is niet de code van het paneel. Leg een staal naast het andere voor u bestelt.",
    sections: [
      {
        heading: "Foliecodes verschillen per merk",
        paragraphs: [
          "De gevel en het kozijn komen niet uit één folieboek. Een naam als antraciet, wit of eiken dekt per merk een andere tint en een andere nerf.",
          "Op de offerte bevestigen we de folie van het kozijn. Het paneel kiest u op artikelnummer en kleurstaal, niet op een woord dat op beide producten lijkt.",
        ],
      },
      {
        heading: "Binnen en buiten op het kozijn",
        paragraphs: [
          "Het kozijn mag binnen een andere kleur hebben dan buiten. De vleugel mag afwijken van het kader. Dat stelt u in de configurator, per zijde.",
          "De gevel heeft één zichtzijde. Die legt u naast de buitenzijde van het kozijn, niet naast de binnenzijde.",
        ],
      },
      {
        heading: "Staal naast het kader",
        paragraphs: [
          "Vraag gratis kleurstalen aan en leg het gevelstaal op de plek waar het kozijn komt, in daglicht. Een scherm maakt twee antracieten gelijk die op de gevel uit elkaar lopen.",
          "Dit is geen tweede staalaanvraag. De stalen bestelt u op de bestaande pagina. Hier leest u alleen waarom u ze naast het kozijn legt.",
        ],
      },
      {
        heading: "Plaatsen",
        paragraphs: [
          "Kleur en montage lopen via dezelfde offerte als u gevel en kozijnen samen laat doen. Zelf plaatsen kan. De uitleg staat bij kozijnen plaatsen.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is antraciet op de gevel hetzelfde als antraciet op het kozijn?",
        a: "Niet vanzelf. De foliecodes verschillen. Leg stalen naast elkaar voor u bestelt.",
      },
      {
        q: "Kan het kozijn binnen wit blijven?",
        a: "Ja. Binnen en buiten kiest u apart in de configurator. De gevel vergelijkt u met de buitenzijde.",
      },
      {
        q: "Waar vraag ik de stalen aan?",
        a: "Op de staalaanvraag. Deze pagina vervangt die aanvraag niet.",
      },
    ],
    links: [
      { href: pilaar, label: "Gevel en kozijnen tegelijk renoveren" },
      { href: "/staalaanvraag", label: "Gratis kleurstalen" },
      { href: "/kunststof-kozijnen", label: "Kleur in de configurator" },
      { href: "/gevelbekleding", label: "Gevelbekleding" },
      { href: "/boeidelen-en-kozijnen", label: "boeidelen en kozijnen" },
      { href: montageArtikel, label: "Kozijnen plaatsen" },
      { href: offerte, label: "Offerte gevel en kozijnen" },
    ],
  },
  "boeidelen-en-kozijnen": {
    slug: "boeidelen-en-kozijnen",
    path: "/boeidelen-en-kozijnen",
    title: "Boeidelen en kozijnen | Dakrand in één ronde",
    description:
      "Nieuwe kozijnen met een houten boei die blijft schilferen is half werk. Dakrand, gevel en kozijn in dezelfde ronde. Offerte inclusief montage door Cavemen.",
    kicker: "Dakrand",
    h1: "Boeidelen en kozijnen in één lijn",
    intro:
      "Nieuwe kozijnen onder een houten boei die blijft schilferen is half werk. Dakrand, gevel en kozijn horen in dezelfde ronde, met montage door Cavemen als u dat aanvinkt.",
    sections: [
      {
        heading: "Overstek en kader in aanzicht",
        paragraphs: [
          "Van de straat ziet u de dakrand, de gevel en de bovenkant van het kozijn in één blik. Een nieuwe folie onder een geschilferde boei blijft een oude lijn.",
          "De dakrand zelf, met breedtes en hoeken, staat bij de dakranden. Hier gaat het om de combinatie met het kozijn.",
        ],
      },
      {
        heading: "Kleur van de boei",
        paragraphs: [
          "De boei mag de gevel volgen of het kozijn. Donker kader met een lichte rand komt veel voor. Vraag van beide een staal, want de folies zijn niet dezelfde.",
          "Hoe u die twee materialen vergelijkt, staat bij de kleur van kozijn en gevel.",
        ],
      },
      {
        heading: "Hoek bij het bovenkader",
        paragraphs: [
          "De hoek van de dakrand en de bovenkant van het kozijn mogen elkaar niet in de weg zitten. Meet de hoogte van de boei en de positie van het kader voordat u de lengte vastzet.",
          "Een foto van de hoek, van voren en van opzij, is genoeg om de offerte te starten. We rekenen daar geen automatische prijs voor het kozijn op deze pagina.",
        ],
      },
      {
        heading: "Eén offerte",
        paragraphs: [
          "Gevel, dakrand en kozijn kunnen in één aanvraag. Montage door Cavemen geldt voor de gevel, de kozijnen en de dakrand als die chip aan staat.",
          "Zelf plaatsen blijft mogelijk. De uitleg over het kozijn staat bij kozijnen plaatsen, niet als tweede handleiding hier.",
        ],
      },
    ],
    faqs: [
      {
        q: "Kan de dakrand een andere kleur dan het kozijn?",
        a: "Ja. Leg wel stalen naast elkaar. Dezelfde kleurnaam is niet dezelfde folie.",
      },
      {
        q: "Waar bestel ik de dakrand?",
        a: "Bij de dakranden. Deze pagina is de combi met het kozijn, niet de categorie zelf.",
      },
      {
        q: "Zit montage van de dakrand erbij?",
        a: "Als u de chip dakrand aanzet en Montage door Cavemen aan laat staan, nemen we de dakrand mee in de offerte. Uitvinken kan als u alleen materiaal wilt.",
      },
    ],
    links: [
      { href: pilaar, label: "Gevel en kozijnen tegelijk renoveren" },
      { href: "/boeidelen", label: "Dakranden" },
      { href: "/kleur-kozijn-en-gevelbekleding", label: "kleur kozijn en gevelbekleding" },
      { href: "/gevelbekleding", label: "Gevelbekleding" },
      { href: "/kunststof-kozijnen", label: "Kozijnen samenstellen" },
      { href: montageArtikel, label: "Kozijnen plaatsen" },
      { href: offerte, label: "Offerte gevel en kozijnen" },
    ],
  },
  "volgorde-kozijnen-en-gevel": {
    slug: "volgorde-kozijnen-en-gevel",
    path: "/volgorde-kozijnen-en-gevel",
    title: "Eerst kozijnen of eerst de gevel? | Offerte",
    description:
      "Welke volgorde bij nieuwe kozijnen en gevelbekleding: eerst meten, dan plaatsen, dan bekleden. Offerte voor beide, inclusief montage door Cavemen.",
    kicker: "Volgorde",
    h1: "Eerst het kozijn, of eerst de gevel?",
    intro:
      "Bij nieuwe kozijnen en nieuwe gevelbekleding komt het kozijn meestal eerder dan het paneel. U meet de sparing, het kader gaat erin, daarna sluit de bekleding aan.",
    sections: [
      {
        heading: "Meten op de sparing",
        paragraphs: [
          "U meet de opening waar het nieuwe kozijn in komt: drie breedtes, drie hoogtes, de kleinste aanhouden, plus de diagonalen. De meetinstructie zet dat stap voor stap.",
          "U meet zelf. Inmeten ter plaatse is geen belofte op deze pagina. De bestelmaat is buitenwerks, de buitenkant van het nieuwe kader.",
        ],
      },
      {
        heading: "Waarom het kozijn meestal eerder komt",
        paragraphs: [
          "Het kader moet te stellen zijn. Zit de bekleding al tot in de dagkant, dan staat het paneel in de weg van de ankers, de wiggen en de band.",
          "Eerst het kozijn, dan de aansluiting, dan de gevel. De dakrand kan in dezelfde ronde, als de hoogte van de boei bekend is.",
        ],
      },
      {
        heading: "Als de gevel al dicht is",
        paragraphs: [
          "Dan zaagt u de bekleding terug om het kozijn te plaatsen, of u laat een naad die later niet meer waterdicht te krijgen is. Beide is duurder dan de bekleding even uitstellen.",
          "Een foto van de dichte dagkant helpt om te zien of er nog speling zit. We beloven daar geen opname bij.",
        ],
      },
      {
        heading: "Eén offerte, één steiger",
        paragraphs: [
          "Cavemen zet gevel en kozijnen in één offerte en, als u montage aanvinkt, op één steiger. U kunt het vinkje uitzetten als u alleen materiaal wilt.",
          "Het overzicht van die combi staat op de pilaar. Plaatsen, zelf of door Cavemen, staat in de kennisbank. Hier blijft de volgorde.",
        ],
      },
    ],
    faqs: [
      {
        q: "Kan de gevel eerder dan het kozijn?",
        a: "Alleen als u de dagkant open laat tot het kader staat. Dicht bekleden en daarna het kozijn wisselen geeft zaagwerk en een nieuwe aansluiting.",
      },
      {
        q: "Wie meet?",
        a: "U meet zelf, met de meetinstructie. We spreken hier geen opname af.",
      },
      {
        q: "Gaat het oude kozijn mee?",
        a: "Dat vragen we op de offerte. Afvoer is geen standaard en heeft hier geen tarief.",
      },
    ],
    links: [
      { href: pilaar, label: "Gevel en kozijnen tegelijk renoveren" },
      { href: "/aansluiting-kozijn-gevel", label: "aansluiting kozijn en gevelbekleding" },
      { href: "/kunststof-kozijnen/kennisbank/hoe-moet-je-meten", label: "Meetinstructie" },
      { href: "/kunststof-kozijnen", label: "Kozijnen samenstellen" },
      { href: "/gevelbekleding", label: "Gevelbekleding" },
      { href: montageArtikel, label: "Kozijnen plaatsen" },
      { href: offerte, label: "Offerte gevel en kozijnen" },
    ],
  },
};

export const clusterList = clusterSlugs.map((slug) => clusterPages[slug]);

export function clusterMetadata(slug: ClusterSlug): Metadata {
  const page = clusterPages[slug];
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: page.path,
    },
  };
}
