import type { Metadata } from "next";

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
    title: "Keralit gevelbekleding",
    metaTitle: "Keralit gevelbekleding kopen",
    description:
      "Keralit gevelbekleding kopen: panelen in sponning 143, 167 en 190 mm en potdeksel 177 mm, plus alle profielen. Gratis kleurstaal. Voorraad in max. 4 werkdagen.",
    intro:
      "Keralit gevelbekleding geeft de gevel de uitstraling van hout, zonder schilderwerk of houtrot. U bestelt het complete systeem: de panelen, de montageprofielen, de schroeven en de reiniger. Alles in één bestelling.",
    sampleHref: "/staalaanvraag?groep=gevel",
    sections: [
      {
        heading: "Keralit panelen in vier modellen",
        paragraphs: [
          "Keralit sponning 143 mm is het meest gekozen profiel, met een strak en rustig lijnenspel. Sponning 167 mm is een breder deel voor woningen, dakkapellen en topgevels, per lengte van 600 cm. Sponning 190 mm heeft een smalle sponning, voor een moderne gevel. Potdeksel 177 mm overlapt en geeft zachte schaduwlijnen, voor een klassieke uitstraling.",
          "Twijfelt u tussen horizontaal en verticaal, dan staat de uitleg bij de rabatdelen.",
        ],
      },
      {
        heading: "Waar is Keralit van gemaakt?",
        paragraphs: [
          "De basis is Fiberyl, een mix van duurzame, deels gerecyclede kunststoffen. Daardoor blijven krimp en uitzetting beperkt. Een UV-bestendige toplaag houdt de kleur vast. Keralit rot, barst en schilfert niet zoals hout. Schoonmaken doet u af en toe met water en een mild schoonmaakmiddel.",
        ],
      },
      {
        heading: "Profielen voor een strakke afwerking",
        paragraphs: [
          "Een gevel is pas af met de juiste profielen. U begint met een startprofiel met ventilatie van 22 of 50 mm. Hoeken werkt u af met inwendige en uitwendige hoekprofielen, de bovenkant met een eindprofiel. Monteert u verticaal, dan gebruikt u het Keralit omrandingsprofiel als onderrand. Het profiel is 4 meter lang en heeft stansgaten, zodat er geen water in blijft staan.",
          "Maak de gevel af met een dakrand in dezelfde stijl. Die staat bij de Keralit dakranden en boeidelen.",
        ],
      },
      {
        heading: "Kleur kiezen en bestellen",
        paragraphs: [
          "Keralit is er in tientallen kleuren, van houtnerf zoals natuur eiken en vergrijsd ceder tot RAL-kleuren zoals antraciet (RAL 7016). Twijfelt u, vraag een gratis kleurstaal aan. Op de kunststof zit 10 jaar garantie. Producten op voorraad heeft u binnen maximaal 4 werkdagen in huis en vanaf € 499 is de verzending gratis. Een groot project vraagt u aan als offerte.",
        ],
      },
    ],
    faqs: [
      {
        q: "Welke Keralit panelen kan ik bestellen?",
        a: "Vier modellen: sponning 143 mm, sponning 167 mm, sponning 190 mm en potdeksel 177 mm. De sponning 143 mm is het meest gekozen profiel. De potdeksel 177 mm geeft een klassieke uitstraling met overlappende delen.",
      },
      {
        q: "Waar is Keralit gevelbekleding van gemaakt?",
        a: "Van Fiberyl, een mix van duurzame, deels gerecyclede kunststoffen, met een UV-bestendige toplaag. Het paneel is bestand tegen regen, wind, zon en vorst, en u hoeft niet te schilderen.",
      },
      {
        q: "Waarvoor gebruik ik het omrandingsprofiel van Keralit?",
        a: "Als onderrand bij verticale montage, bijvoorbeeld met de sponning 143 mm. U verjongt het houten regelwerk eerst 2 mm, monteert het omrandingsprofiel en plaatst daarna de geveldelen erin. Het profiel is 4 meter lang en heeft stansgaten voor de afvoer van water.",
      },
      {
        q: "Kan ik de kleur eerst in het echt zien?",
        a: "Ja. U vraagt gratis een kleurstaal aan. Keralit is er in tientallen kleuren, van houtnerf tot RAL.",
      },
      {
        q: "Hoe snel heb ik mijn Keralit in huis?",
        a: "Producten op voorraad heeft u binnen maximaal 4 werkdagen. Vanaf € 499 is de verzending gratis. Op de kunststof zit 10 jaar garantie.",
      },
    ],
    links: [
      { href: "/blog/keralit-of-vinyplus", label: "Keralit of VinyPlus" },
      { href: "/montage?merk=keralit", label: "Montageprofielen Keralit" },
      { href: "/dakranden?merk=keralit", label: "Keralit dakranden" },
      { href: "/staalaanvraag?groep=gevel", label: "Gratis kleurstaal" },
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
    title: "Kunststof vensterbank en overzet vensterbank (binnen en buiten)",
    metaTitle: "Kunststof vensterbank en overzet vensterbank",
    description:
      "Kunststof vensterbank of overzet vensterbank buiten? Milinboard 380 mm in wit of creme, met eindkappen. Over de oude bank, in 1 dagdeel geplaatst.",
    intro:
      "Met een overzet vensterbank van Milinboard werkt u de oude vensterbank strak af zonder breekwerk. De overzetvensterbank van 380 mm in wit of crème plaatst u direct over de oude bank en werkt u af met bijpassende eindkappen. Het materiaal is stevig en vlak, waterbestendig en krasvast. Zo heeft u in 1 dagdeel een nieuwe, onderhoudsarme vensterbank, binnen of buiten.",
    sampleHref: "/staalaanvraag?groep=vensterbank",
    sections: [
      {
        heading: "Kunststof vensterbank: overzet of vast",
        paragraphs: [
          "Op deze pagina vindt u de overzet vensterbank van Milinboard, plus vaste vensterbanken en eindkappen. Een overzet vensterbank plaatst u over de bestaande bank. De oude bank hoeft er niet uit en er komt geen breekwerk aan te pas. Daarom past dit bij renovatie, buiten en binnen.",
        ],
      },
      {
        heading: "Overzet vensterbank buiten",
        paragraphs: [
          "Buiten krijgt een vensterbank regen en zon te verduren. De Milinboard overzet vensterbank 380 mm is waterafstotend, UV-bestendig en krasvast. Hout moet u schuren en schilderen. Deze vensterbank niet: een vochtige doek met een mild schoonmaakmiddel is genoeg.",
          "De bank is 380 mm diep en komt per lengte van 600 cm. U zaagt hem zelf op maat. Kies uit wit of crème. De spitse ronde neus geeft een strakke voorkant. De zijkanten werkt u af met de bijpassende eindkap.",
        ],
      },
      {
        heading: "Meten en monteren in het kort",
        paragraphs: [
          "Meet de lengte op drie plekken en bestel op de langste maat. Meet de diepte vanaf het kozijn tot de voorkant van de bank, inclusief de neus. Maak de oude bank schoon en droog, pas de vensterbank eerst droog, zaag op maat en zet hem vast met een lijm die geschikt is voor kunststof. Reken op ongeveer 1 dagdeel.",
        ],
      },
      {
        heading: "Wanneer een vaste vensterbank",
        paragraphs: [
          "Is de oude bank rot, hol of sterk scheef, dan is overzetten geen goed idee. Kies dan een vaste kunststof vensterbank, zoals de Milinboard vensterbank type B in 200 tot 400 mm diep, de Novaboard kunststof vensterbank in wit of crème, of de Milinboard steenlook vensterbank in natuursteenkleuren.",
        ],
      },
      {
        heading: "Bestellen",
        paragraphs: [
          "Producten op voorraad heeft u binnen maximaal 4 werkdagen in huis. Vanaf € 499 is de verzending gratis en op de kunststof zit 10 jaar garantie. Wilt u de kleur eerst zien, vraag een staal aan. Een groot project vraagt u aan als prijs op maat.",
        ],
      },
    ],
    faqs: [
      {
        q: "Wat is een overzet vensterbank?",
        a: "Een kunststof vensterbank die u over de bestaande vensterbank plaatst. De oude bank hoeft er niet uit, dus u heeft geen sloop- of breekwerk.",
      },
      {
        q: "Kan ik een overzet vensterbank buiten gebruiken?",
        a: "Ja. De Milinboard overzet vensterbank is waterafstotend, UV-bestendig en krasvast, en daarmee geschikt voor buiten. Schilderen is niet nodig.",
      },
      {
        q: "Welke maat en kleuren zijn er?",
        a: "De Milinboard overzet vensterbank is 380 mm diep en 600 cm lang per stuk. U kiest uit wit of crème en zaagt hem zelf op maat.",
      },
      {
        q: "Hoe werk ik de zijkanten af?",
        a: "Met de bijpassende eindkap, in wit of crème. Zonder eindkap blijft de zijkant open.",
      },
      {
        q: "Hoe lang duurt de montage?",
        a: "Gemiddeld 1 dagdeel. U plaatst de vensterbank direct over de oude bank. Is die bank rot, hol of sterk scheef, kies dan een vaste kunststof vensterbank.",
      },
    ],
    links: [
      { href: "/blog/overzet-vensterbank-meten", label: "Overzet vensterbank meten en monteren" },
      { href: "/kozijnafwerking", label: "Kozijnafwerking" },
      { href: "/staalaanvraag?groep=vensterbank", label: "Gratis staal" },
    ],
  },
};

export function getLandingStory(slug: string) {
  return isLandingSlug(slug) ? landingStories[slug] : undefined;
}

export function landingMetadata(slug: LandingSlug): Metadata {
  const story = landingStories[slug];
  return {
    title: story.metaTitle,
    description: story.description,
    alternates: { canonical: `/${slug}` },
  };
}
