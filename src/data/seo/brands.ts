export type SeoSection = {
  heading: string;
  paragraphs: string[];
};

export type SeoFaq = {
  q: string;
  a: string;
};

export type SeoLink = {
  href: string;
  label: string;
};

export type BrandStory = {
  slug: string;
  metaTitle: string;
  description: string;
  lead: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  links: SeoLink[];
};

export const brandStories: BrandStory[] = [
  {
    slug: "keralit",
    metaTitle: "Keralit gevelbekleding",
    description:
      "Keralit kunststof gevelbekleding: stijve panelen, houtstructuur en 10 jaar kleurvastheid. Sponning, potdeksel en hulpstukken uit voorraad.",
    lead: "Keralit is een stijf gevelpaneel met een fijne houtstructuur. U kiest het als de gevel strak moet blijven en de nerf van dichtbij klopt.",
    sections: [
      {
        heading: "Wanneer Keralit",
        paragraphs: [
          "Keralit blijft vlakker dan volschuim. Dat ziet u op lange gevels en op topgevels waar zon op staat. De structuur is fijner dan bij de meeste volschuimpanelen.",
          "De kleurvastheid zit in dezelfde orde als de andere systemen die wij voeren: 10 jaar op kleur en vorm, mits de ventilatiespouw en de regels volgens voorschrift zitten.",
        ],
      },
      {
        heading: "Profielen die wij voeren",
        paragraphs: [
          "Sponning en potdeksel zijn de gangbare Keralit-profielen, plus hoekstukken, verbinders en startprofielen in dezelfde kleur. Werkende breedte staat per artikel bij het product, zodat de m²-calculator het paneelaantal kan uitrekenen.",
          "Hulpstukken bestelt u in dezelfde order. Een gevel zonder eind- en hoekprofiel is geen afgewerkt systeem.",
        ],
      },
    ],
    faqs: [
      {
        q: "Keralit of VinyPlus?",
        a: "Keralit is stijver en fijner van structuur. VinyPlus is volschuim en scherper in prijs, met dezelfde garantie-orde. Vraag van beide een staal aan en leg ze buiten naast elkaar.",
      },
      {
        q: "Moet Keralit geschilderd worden?",
        a: "Nee. Reinigen met water en een zachte borstel is het onderhoud. Schilderen hoort er niet bij.",
      },
    ],
    links: [
      { href: "/blog/keralit-of-vinyplus", label: "Vergelijk Keralit en VinyPlus" },
      { href: "/stalen", label: "Kleurstalen aanvragen" },
      { href: "/offerte", label: "Offerte met montage" },
    ],
  },
  {
    slug: "vinyplus",
    metaTitle: "VinyPlus gevelbekleding",
    description:
      "VinyPlus volschuim gevelpanelen en dakranden. Geborstelde structuur, V-naad en bijpassende aluminium montageprofielen.",
    lead: "VinyPlus is volschuim bekleding met een geborstelde structuur en een V-naad. De paneelprijs ligt scherper dan bij de stijve systemen, de garantie-orde is dezelfde.",
    sections: [
      {
        heading: "Wat u aan VinyPlus heeft",
        paragraphs: [
          "De panelen zijn licht, UV-bestendig en gesloten van oppervlak. De V-naad houdt de naad strak bij horizontale montage. Aluminium start-, eind- en hoekprofielen horen bij het systeem, niet bij het paneel zelf.",
          "Rabat en rondkant zijn de profielen die het meest meegaan. Dakranden van VinyPlus sluiten in kleur aan op de gevel, zodat overstek en wand één familie blijven.",
        ],
      },
      {
        heading: "Montage",
        paragraphs: [
          "Regels, een vrije ventilatiespouw en een startprofiel onderaan. Schroefgaten iets ruimer boren, want het paneel werkt in de lengte. De uitgewerkte volgorde staat in de montage-uitleg.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is VinyPlus minder sterk dan Keralit?",
        a: "Het paneel is volschuim en daardoor minder stijf. Op een regelmatige achterconstructie is dat geen probleem. Op een oneffen ondergrond ziet u het eerder dan bij een stijf paneel.",
      },
      {
        q: "Zitten de montageprofielen bij de prijs?",
        a: "Nee. Start-, hoek- en eindprofielen zijn aparte artikelen. De offerte telt ze mee; in de winkelwagen voegt u ze zelf toe.",
      },
    ],
    links: [
      { href: "/blog/montage-kunststof-gevelbekleding", label: "Montage-uitleg" },
      { href: "/blog/keralit-of-vinyplus", label: "Keralit of VinyPlus" },
      { href: "/gevelbekleding?merk=vinyplus", label: "VinyPlus in het assortiment" },
    ],
  },
  {
    slug: "eurotexx",
    metaTitle: "Eurotexx gevelbekleding",
    description:
      "Eurotexx potdeksel en rabat voor renovatie, met eindprofielen en hulpstukken in dezelfde kleuren.",
    lead: "Eurotexx is het renovatieprofiel: potdeksel en rabat met een houtlook, en eindprofielen die in dezelfde kleur meelopen.",
    sections: [
      {
        heading: "Potdeksel en rabat",
        paragraphs: [
          "Potdeksel geeft een overlap die lijkt op klassiek hout. Dubbel rabat dekt breder per paneel en is daarmee vlotter te zetten op een lange wand. Beide horen bij dezelfde kleurfamilie, zodat hoeken en dagkanten niet afwijken.",
          "Het tweedelige eindprofiel sluit de zijkant af. Bestel het in de kleur van het paneel, niet in een benaderende RAL van een ander merk.",
        ],
      },
      {
        heading: "Renovatie",
        paragraphs: [
          "Eurotexx komt vaak in de plaats van verweerd houten potdeksel. De achterconstructie moet recht en geventileerd zijn. Rotte regels vervangt u; het kunststof paneel verbergt een zachte regel niet.",
        ],
      },
    ],
    faqs: [
      {
        q: "Kan Eurotexx over bestaand hout?",
        a: "Alleen als de regels nog hard zijn en u een ventilatiespouw houdt. Zacht hout eronder haalt u weg.",
      },
    ],
    links: [
      { href: "/gevelbekleding?merk=eurotexx", label: "Eurotexx-panelen" },
      { href: "/offerte", label: "Renovatie laten rekenen" },
    ],
  },
  {
    slug: "kerrafront",
    metaTitle: "Kerrafront gevelpanelen",
    description:
      "Kerrafront brede sponningdelen voor een rustig gevelbeeld. Uni- en steenkleuren, met ruimte voor werking in de lengte.",
    lead: "Kerrafront is een brede sponning. Minder naden op de gevel, wel opletten dat het paneel in de lengte kan werken.",
    sections: [
      {
        heading: "Breed paneel",
        paragraphs: [
          "Een werkende breedte rond de 300 mm dekt een wand in minder lagen dan een smalle sponning. Het beeld is rustiger. Op een topgevel met veel schuine kanten zaagt u meer, en dat zit in het snijverlies van de calculator.",
          "Uni-kleuren en steenkleuren lopen naast elkaar. Een steenkleur vraagt een staal: op een foto valt de nerf vlakker uit dan op de gevel.",
        ],
      },
      {
        heading: "Uitzetting",
        paragraphs: [
          "Lange lengtes zetten uit in de zon. Houd de voeg aan die het montagevoorschrift noemt, en schroef niet vast in een te krap gat. Een te strakke montage is de gebruikelijke oorzaak van een bollend paneel.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Kerrafront hetzelfde als Keralit?",
        a: "Nee. Het zijn twee systemen. Meng geen hoekprofiel van het ene merk met een paneel van het andere.",
      },
    ],
    links: [
      { href: "/blog/montage-kunststof-gevelbekleding", label: "Montage en ventilatie" },
      { href: "/stalen", label: "Staal van de steenkleur" },
    ],
  },
  {
    slug: "zierer",
    metaTitle: "Zierer steenstrips",
    description:
      "Zierer steenstrips en hoekstukken voor plint, aanbouw en latei. Geen gesloten rabatgevel, wel een steenbeeld in kunststof.",
    lead: "Zierer is steenstrip, geen rabat. U gebruikt het op een plint, een aanbouw of een latei waar metselwerk te zwaar of te laat is.",
    sections: [
      {
        heading: "Waar het past",
        paragraphs: [
          "De strip bootst een steenverband na, inclusief hoekstukken zodat de hoek niet een gezaagde zijkant toont. Het is lichter dan echte steen en vraagt een vlakke, dragende plaat of regel.",
          "Een hele woning in rabat en alleen de plint in Zierer is een gangbare combinatie. Houd een knip tussen de twee systemen; ze delen geen profiel.",
        ],
      },
    ],
    faqs: [
      {
        q: "Telt de m²-calculator ook voor steenstrips?",
        a: "De calculator op het paneel rekent met werkende breedte van gevelpanelen. Voor strips rekent u het vlak en de hoekstukken apart, of u vraagt een offerte.",
      },
    ],
    links: [
      { href: "/offerte", label: "Offerte voor plint en gevel" },
      { href: "/gevelbekleding", label: "Naar gevelbekleding" },
    ],
  },
  {
    slug: "profex",
    metaTitle: "Profex Duafort rabat",
    description:
      "Profex Duafort rabat als lichte, onderhoudsarme vervanger van Canexel-achtige bekleding.",
    lead: "Profex Duafort is een licht rabat. Het komt in de plaats van oudere Canexel-achtige platen die zacht zijn geworden.",
    sections: [
      {
        heading: "Vervangen zonder schilderbeurt",
        paragraphs: [
          "Het paneel is onderhoudsarm: geen beits, geen jaarlijkse lak. De achterconstructie maakt of breekt het resultaat. Haal zachte platen en zachte regels weg, zet een geventileerde regelmaat terug en start onderaan met het startprofiel.",
          "Kleuren vallen het best te beoordelen met een staal op de bestaande gevel, niet op een beeldscherm.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Duafort een Keralit-paneel?",
        a: "Nee. Het is een eigen systeem. Hulpstukken van Profex horen bij Profex.",
      },
    ],
    links: [
      { href: "/blog/levensduur-kunststof-gevel", label: "Levensduur en onderhoud" },
      { href: "/stalen", label: "Staal aanvragen" },
    ],
  },
  {
    slug: "milexx",
    metaTitle: "Milexx dakranden",
    description:
      "Milexx volschuim dakranden en hoeken voor een kunststof overstek, in kleur afgestemd op de gevel.",
    lead: "Milexx is de dakrand: volschuim boeidelen en hoeken die een kunststof overstek afmaken.",
    sections: [
      {
        heading: "Overstek en gevel",
        paragraphs: [
          "Een nieuwe gevel met een verweerde houten boei blijft een half werk. Milexx dekt de dakrand af in een kleur die bij het gevelmerk past. Hoeken zijn aparte stukken; reken ze per hoek, niet per m² paneel.",
          "De montage volgt de dakrand, niet de gevelregel. Houd de ventilatie van de gevel vrij waar de boei eroverheen komt.",
        ],
      },
    ],
    faqs: [
      {
        q: "Hoort Milexx bij één gevelmerk?",
        a: "Nee. U stemt de kleur af. Het blijft een eigen artikelgroep onder dakranden.",
      },
    ],
    links: [
      { href: "/dakranden", label: "Dakranden bekijken" },
      { href: "/offerte", label: "Gevel en dakrand in één offerte" },
    ],
  },
  {
    slug: "milinboard",
    metaTitle: "Milinboard vensterbanken",
    description:
      "Milinboard kunststof vensterbanken en overzetbanken, inclusief eindkappen, voor kozijnafwerking.",
    lead: "Milinboard is de vensterbank: kunststof banken en overzetbanken, met eindkappen zodat de zijkant dicht is.",
    sections: [
      {
        heading: "Kozijnafwerking",
        paragraphs: [
          "Een overzetbank schuift over een bestaande bank heen als die nog vast zit en de maat klopt. Een nieuwe bank vervangt het blad. Eindkappen en aansluitprofielen bestelt u per kozijn, niet per strekkende meter gevel.",
          "De kleur hoeft niet gelijk te zijn aan de gevel. Veel woningen houden een lichte bank bij een donker paneel. Een staal naast het kozijn scheelt een miskleur.",
        ],
      },
    ],
    faqs: [
      {
        q: "Zit de vensterbank in de m²-prijs van de gevel?",
        a: "Nee. De indicatie per m² geldt voor gevelbekleding. Banken rekent u per stuk of via de offerte.",
      },
    ],
    links: [
      { href: "/kozijnafwerking", label: "Kozijnafwerking" },
      { href: "/kozijnen", label: "Kunststof kozijnen" },
    ],
  },
];

export function getBrandStory(slug: string) {
  return brandStories.find((story) => story.slug === slug);
}
