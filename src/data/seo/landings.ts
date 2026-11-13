import type { Metadata } from "next";

import { categoryPageSeo, pageSeo } from "@/data/seo/category-pages";

import type { SeoFaq, SeoLink, SeoSection } from "./brands";

export const landingSlugs = [
  "keralit-gevelbekleding",
  "zierer-steenstrips",
  "kunststof-vensterbank",
] as const;

export type LandingSlug = (typeof landingSlugs)[number];

export type LandingStory = {
  slug: LandingSlug;
  kicker: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  sampleHref: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  links: SeoLink[];
};

type LandingProduct = {
  brandSlug: string;
  category: string;
  profileType: string;
  name: string;
};

export function isLandingSlug(slug: string): slug is LandingSlug {
  return (landingSlugs as readonly string[]).includes(slug);
}

/** Products that belong on the ranking page, not the whole shop. */
export function landingMatches(slug: LandingSlug, product: LandingProduct) {
  if (slug === "keralit-gevelbekleding") {
    return product.brandSlug === "keralit" && product.category === "gevelbekleding";
  }
  if (slug === "zierer-steenstrips") {
    return product.brandSlug === "zierer" || product.profileType === "steenstrip";
  }
  return product.profileType === "vensterbank" || /vensterbank/i.test(product.name);
}

export const landingStories: Record<LandingSlug, LandingStory> = {
  "keralit-gevelbekleding": {
    slug: "keralit-gevelbekleding",
    kicker: "Keralit",
    title: pageSeo.keralit.h1,
    metaTitle: pageSeo.keralit.title,
    description:
      "Keralit planken en panelen: sponning 143, 167, 190 mm en potdeksel 177 mm, plus profielen. Gratis kleurstaal, op voorraad in max. 3 werkdagen.",
    intro:
      "Keralit gevelbekleding bestel je bij ons als Keralit planken van 600 cm, met de prijs direct bij elk paneel. Kies uit vier modellen: sponning 143, 167 of 190 mm en potdeksel 177 mm, in tientallen kleuren. Alle montageprofielen, schroeven en reiniger bestel je in dezelfde order. Vraag eerst gratis een kleurstaal aan. Op voorraad heb je het binnen max. 3 werkdagen in huis.  Liever inclusief montage? Vraag een offerte aan.",
    sampleHref: "/staalaanvraag?groep=gevel",
    sections: [
      {
        heading: "Keralit panelen in vier modellen",
        paragraphs: [
          "Keralit sponning 143 mm is het meest gekozen profiel, met een strak en rustig lijnenspel. Sponning 167 mm is een breder deel voor woningen, dakkapellen en topgevels, per lengte van 600 cm. Sponning 190 mm heeft een smalle sponning, voor een moderne gevel. Potdeksel 177 mm overlapt en geeft zachte schaduwlijnen, voor een klassieke uitstraling.",
          "Twijfel je tussen horizontaal en verticaal, lees dan de uitleg bij kunststof rabatdelen horizontaal of verticaal.",
        ],
      },
      {
        heading: "Keralit planken: zo bestel je ze",
        paragraphs: [
          "Zoekers die Keralit planken intoetsen, bedoelen dezelfde sponning- en potdekselpanelen. Je koopt per plank van 600 cm. Reken je gevel om met werkende breedte x 6 meter = m2 per plank, en tel daarna startprofiel, hoeken, eindprofiel, verbindstukken en RVS-schroeven mee.",
          "Prijzen per plank (live 9 nov 2026): sponning 143 mm €90,49, sponning 167 mm €106,15, potdeksel 177 mm €107,93, sponning 190 mm €116,14. Controleer de actuele prijs op de productkaart bij bestellen.",
        ],
      },
      {
        heading: "Waar is Keralit van gemaakt?",
        paragraphs: [
          "De basis is Fiberyl, een mix van duurzame, deels gerecyclede kunststoffen. Daardoor blijven krimp en uitzetting beperkt. Een UV-bestendige toplaag houdt de kleur vast. Keralit rot, barst en schilfert niet zoals hout. Schoonmaken doe je af en toe met water en een mild schoonmaakmiddel.",
        ],
      },
      {
        heading: "Profielen voor een strakke afwerking",
        paragraphs: [
          "Je begint met een startprofiel met ventilatie van 22 of 50 mm. Hoeken werk je af met inwendige en uitwendige hoekprofielen, de bovenkant met een eindprofiel. Monteer je verticaal, dan gebruik je het Keralit omrandingsprofiel als onderrand. Het profiel is 4 meter lang en heeft stansgaten, zodat er geen water in blijft staan.",
          "Maak de gevel af met een dakrand in dezelfde stijl bij de Keralit boeidelen.",
        ],
      },
      {
        heading: "Kleur kiezen en bestellen",
        paragraphs: [
          "Keralit is er in tientallen kleuren, van houtnerf zoals natuur eiken en vergrijsd ceder tot RAL-kleuren zoals antraciet (RAL 7016). Twijfel je? Vraag een gratis kleurstaal aan. Op de kunststof zit 10 jaar garantie. Producten op voorraad heb je binnen max. 3 werkdagen in huis en vanaf €499 is de verzending gratis.  Groot project? Vraag een offerte aan.",
        ],
      },
    ],
    faqs: [
      {
        q: "Welke Keralit panelen kan ik bestellen?",
        a: "Vier modellen: sponning 143 mm, sponning 167 mm, sponning 190 mm en potdeksel 177 mm. De sponning 143 mm is het meest gekozen profiel. De potdeksel 177 mm geeft een klassieke uitstraling met overlappende delen.",
      },
      {
        q: "Wat kosten Keralit planken?",
        a: "Je betaalt per plank van 600 cm. Sponning 143 mm kost €90,49, sponning 167 mm €106,15, potdeksel 177 mm €107,93 en sponning 190 mm €116,14 (prijzen live 9 nov 2026). Profielen en schroeven komen erbij. Vanaf €499 is de verzending gratis.",
      },
      {
        q: "Zijn Keralit planken hetzelfde als Keralit panelen?",
        a: "Ja. Planken, panelen en geveldelen zijn gangbare namen voor dezelfde Keralit sponning- en potdekselmodellen. In de shop zie je ze als Keralit panelen, met alle bijpassende profielen erbij.",
      },
      {
        q: "Waar is Keralit gevelbekleding van gemaakt?",
        a: "Van Fiberyl, een mix van duurzame, deels gerecyclede kunststoffen, met een UV-bestendige toplaag. Het paneel is bestand tegen regen, wind, zon en vorst, en je hoeft niet te schilderen.",
      },
      {
        q: "Waarvoor gebruik ik het omrandingsprofiel van Keralit?",
        a: "Als onderrand bij verticale montage, bijvoorbeeld met de sponning 143 mm. Je verjongt het houten regelwerk eerst 2 mm, monteert het omrandingsprofiel en plaatst daarna de geveldelen erin. Het profiel is 4 meter lang en heeft stansgaten voor de afvoer van water.",
      },
      {
        q: "Kan ik de kleur eerst in het echt zien?",
        a: "Ja. Je vraagt gratis een kleurstaal aan. Keralit is er in tientallen kleuren, van houtnerf tot RAL.",
      },
      {
        q: "Hoe snel heb ik mijn Keralit in huis?",
        a: "Producten op voorraad heb je binnen max. 3 werkdagen. Vanaf €499 is de verzending gratis. Op de kunststof zit 10 jaar garantie.",
      },
    ],
    links: [
      { href: "/blog/rabat-horizontaal-of-verticaal", label: "Rabatdelen horizontaal of verticaal" },
      { href: "/montage?merk=keralit", label: "Montageprofielen Keralit" },
      { href: "/boeidelen/keralit", label: "Keralit boeidelen" },
      { href: "/staalaanvraag?groep=gevel", label: "Gratis kleurstaal" },
      { href: "/kleur-kozijn-en-gevelbekleding", label: "kleur kozijn en gevelbekleding" },
      { href: "/offerte", label: "Offerte aanvragen" },
    ],
  },
  "zierer-steenstrips": {
    slug: "zierer-steenstrips",
    kicker: "Zierer",
    title: "Kunststof steenstrips (Zierer)",
    metaTitle: "Kunststof steenstrips kopen",
    description:
      "Kunststof steenstrips van Zierer: wildverband en grof, 3,4 m2 per pak. Ideaal als afwerking onder chalet of woonwagen.",
    intro:
      "De kunststof steenstrips van Zierer geven de gevel, plint of onderbouw de uitstraling van baksteen, zonder metselwerk en zonder zwaar gewicht. Ze passen als afwerking onder een chalet, woonwagen of tuinhuis, en ook op een schuur of als gemetselde look aan de binnenkant.",
    sampleHref: "/staalaanvraag?groep=gevel",
    sections: [
      {
        heading: "Wildverband of grof",
        paragraphs: [
          "U kiest uit twee uitvoeringen. Zierer steenstrips wildverband geven een levendig, natuurlijk patroon. Zierer steenstrip grof geeft een robuuste, grove steenstructuur. Elk pak dekt 3,4 m², zodat u uitrekent hoeveel pakken de gevel nodig heeft.",
          "De panelen zijn licht, snel te monteren en bestand tegen weersinvloeden. Hoekstukken, startprofiel en ventilatieprofiel horen bij het systeem en staan in dezelfde lijst.",
        ],
      },
      {
        heading: "Afwerking onder chalet of woonwagen",
        paragraphs: [
          "Onder een chalet of woonwagen dekt de strip de plint af zonder een gemetselde voet. De kleur kiest u bij het pak: antraciet, geel, rood, wit en de gevlamde varianten, afhankelijk van de uitvoering.",
          "Twijfelt u over de hoeveelheid of de montage, bel of mail. Dan rekenen we het aantal pakken en de profielen mee.",
        ],
      },
    ],
    faqs: [
      {
        q: "Hoeveel dekt een pak Zierer steenstrips?",
        a: "Elk pak dekt 3,4 m², zowel wildverband als grof.",
      },
      {
        q: "Wat is het verschil tussen wildverband en grof?",
        a: "Wildverband heeft een levendig, natuurlijk patroon. Grof heeft een robuuste steenstructuur. Beide zijn kunststof strips van Zierer.",
      },
      {
        q: "Welke profielen horen erbij?",
        a: "Hoekstukken, een startprofiel en ventilatieprofielen. Die bestelt u in dezelfde order als de pakken.",
      },
    ],
    links: [
      { href: "/merken/zierer", label: "Alles van Zierer" },
      { href: "/gevelbekleding", label: "Gevelbekleding" },
      { href: "/staalaanvraag?groep=gevel", label: "Gratis kleurstaal" },
    ],
  },
  "kunststof-vensterbank": {
    slug: "kunststof-vensterbank",
    kicker: "Vensterbank",
    title: categoryPageSeo.vensterbanken.h1,
    metaTitle: categoryPageSeo.vensterbanken.title,
    description:
      "Overzet vensterbank voor binnen: schuif je over de bestaande bank, zonder sloop. Met eindkappen. Levering in max. 3 werkdagen.",
    intro:
      "Zoek je een overzet vensterbank voor binnen? Deze pagina is de eigenaar van die term. Met een overzet vensterbank van Milinboard werk je de oude vensterbank af zonder breekwerk. De uitvoering van 380 mm staat op een eigen productpagina. Op voorraad leveren we in max. 3 werkdagen.",
    sampleHref: "/staalaanvraag?groep=vensterbank",
    sections: [
      {
        heading: "Kunststof vensterbank: overzet of vast",
        paragraphs: [
          "Op deze pagina vind je de overzet vensterbank van Milinboard, plus vaste vensterbanken en eindkappen. Een overzet vensterbank plaats je over de bestaande bank. De oude bank hoeft er niet uit en er komt geen breekwerk aan te pas. Daarom past dit bij renovatie binnen.",
        ],
      },
      {
        heading: "Waarom kunststof voor binnen?",
        paragraphs: [
          "Een vensterbank krijgt binnen zon en condens te verduren. De Milinboard overzet vensterbank is 380 mm diep. De kleur en de lengte staan bij het artikel. De zijkant werk je af met de bijpassende eindkap.",
        ],
      },
      {
        heading: "Meten en monteren in het kort",
        paragraphs: [
          "Maak de oude bank schoon en droog. Pas de vensterbank eerst droog. Zaag alleen als het artikel langer is dan de opening. Zet hem vast met lijm of kit die geschikt is voor kunststof, plaats de eindkappen en laat de lijm uitharden. Het meetverhaal staat in het blog over meten en monteren.",
        ],
      },
      {
        heading: "Wanneer kies je een vaste vensterbank?",
        paragraphs: [
          "Is de oude bank rot, hol of sterk scheef, dan is overzetten geen goed idee. Kies dan een vaste kunststof vensterbank, zoals de Milinboard vensterbank type B in 200 tot 400 mm diep, de Novaboard kunststof vensterbank in wit of crème, of de Milinboard steenlook vensterbank in natuursteenkleuren.",
        ],
      },
      {
        heading: "Bestellen",
        paragraphs: [
          "Op voorraad leveren we in max. 3 werkdagen. Kleurstalen zijn binnen 3 werkdagen thuis. Wil je de kleur eerst zien, vraag een staal aan. Groot project? Vraag een offerte aan.",
        ],
      },
    ],
    faqs: [
      {
        q: "Wat is een overzet vensterbank?",
        a: "Een kunststof vensterbank die je over de bestaande vensterbank plaatst. De oude bank hoeft er niet uit, dus je hebt geen sloop- of breekwerk.",
      },
      {
        q: "Welke maat en kleuren zijn er?",
        a: "De Milinboard overzet vensterbank op deze pagina is 380 mm diep. De lengte en de kleur staan bij het artikel.",
      },
      {
        q: "Hoe werk ik de zijkanten af?",
        a: "Met de bijpassende eindkap. Zonder eindkap blijft de zijkant open.",
      },
      {
        q: "Wanneer kies ik geen overzetbank?",
        a: "Als de oude bank rot, hol of sterk scheef is. Dan is een vaste kunststof vensterbank de betere keuze. Die staat op dezelfde pagina.",
      },
    ],
    links: [
      { href: "/blog/overzet-vensterbank-meten", label: "Overzet vensterbank meten en monteren" },
      {
        href: "/producten/milinboard-overzetvensterbank-380-mm",
        label: "Overzet vensterbank 380 mm",
        slugs: ["milinboard-overzetvensterbank-380-mm", "milinboard-overzetvensterbank-380"],
      },
      { href: "/kunststof-vensterbank", label: "Kunststof vensterbank" },
      { href: "/staalaanvraag?groep=vensterbank", label: "Gratis staal" },
      { href: "/offerte", label: "Offerte aanvragen" },
    ],
  },
};

export function getLandingStory(slug: string) {
  return isLandingSlug(slug) ? landingStories[slug] : undefined;
}

export function landingMetadata(slug: LandingSlug): Metadata {
  const story = landingStories[slug];
  return {
    title: { absolute: story.metaTitle },
    description: story.description,
    alternates: { canonical: `/${slug}` },
  };
}
