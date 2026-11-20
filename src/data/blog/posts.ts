import type { SeoFaq, SeoLink, SeoSection } from "@/data/seo/brands";

import { migratedPosts } from "./migrated";

export type BlogPost = {
  slug: string;
  title: string;
  /** Zichtbare H1. Ontbreekt dit veld, dan is de title de H1. */
  h1?: string;
  description: string;
  date: string;
  kicker: string;
  image?: { src: string; alt: string };
  /** Opening onder de hero, vóór de eerste sectie. Inline links: [label](/pad). */
  intro?: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  links: SeoLink[];
  cta?: {
    heading: string;
    text: string;
    actions: SeoLink[];
    more?: SeoLink;
  };
};

const corePosts: BlogPost[] = [
  {
    slug: "dakkapel-renovatie",
    title: "Dakkapel renovatie met kunststof: aanpak en kosten",
    h1: "Dakkapel renovatie met kunststof: zo pak je het aan",
    description:
      "Dakkapel renovatie met kunststof bekleden? Zo pak je het aan, hoeveel lengtes Keralit je nodig hebt en wat je krijgt: 10 jaar garantie op materiaal.",
    date: "2026-11-20",
    kicker: "Dakkapel",
    image: {
      src: "/images/blog/dakkapel-rabat-2026-11-20.jpg",
      alt: "Dakkapel gerenoveerd met crème Keralit rabatdelen en nieuwe witte kozijnen",
    },
    intro:
      "Dakkapel renovatie met kunststof betekent dat de constructie blijft staan en de buitenkant helemaal nieuw wordt. Je bekleedt wangen, front en boeidelen met onderhoudsvrije [Keralit gevelbekleding](/keralit-gevelbekleding). Nooit meer schilderen, en je krijgt 10 jaar garantie op het materiaal. Wil je het niet zelf doen? Dan kunnen wij de montage voor je verzorgen.",
    sections: [
      {
        heading: "Wanneer is dakkapel renovatie slim?",
        paragraphs: [
          "Een renovatie van je dakkapel is slim als de constructie gezond is, maar de buitenkant er slecht aan toe is.",
        ],
      },
      {
        heading: "Signalen dat het tijd is",
        level: 3,
        paragraphs: [],
        list: {
          items: [
            "Rot of afbladderend hout.",
            "Je moet steeds opnieuw schilderen.",
            "Naden en aansluitingen lekken of zijn open gegaan.",
          ],
        },
      },
      {
        heading: "Renoveren of vervangen?",
        level: 3,
        paragraphs: [
          "Is het houtwerk onder de bekleding gezond, dan is renoveren meestal de slimste keuze. Is ook de constructie of de binnenkant slecht, dan kan vervangen verstandiger zijn. Laat dat eerst beoordelen voordat je materiaal bestelt.",
        ],
      },
      {
        heading: "Dakkapel bekleden met Keralit: gevel- en boeidelen",
        paragraphs: [],
      },
      {
        heading: "Wangen en front met gevelbekleding",
        level: 3,
        paragraphs: [
          "Voor de wangen en het front gebruik je horizontale panelen, bijvoorbeeld de Keralit potdeksel 177 mm of een [kunststof rabatdeel](/rabatdelen). Ze zijn licht, onderhoudsarm en te verwerken met gewoon houtgereedschap.",
        ],
      },
      {
        heading: "Boeidelen en dakrand",
        level: 3,
        paragraphs: [
          "De dakrand werk je af met [boeidelen](/boeidelen/keralit). Hoe dat werkt lees je in onze uitleg over het [afwerken van een dakrand met Keralit boeidelen](/blog/keralit-boeideel-dakrand-afwerken).",
        ],
      },
      {
        heading: "Houtlook of strak",
        level: 3,
        paragraphs: [
          "Keralit heb je in 22 kleuren, van strak antraciet en wit tot houtlook zoals natuur eiken. Op de [productpagina's](/keralit-gevelbekleding) zie je de kleuren. Twijfel je? [Vraag een staal aan](/staalaanvraag).",
          "Op het materiaal geven wij 10 jaar garantie.",
        ],
      },
      {
        heading: "Wat kost dakkapel renovatie met kunststof?",
        paragraphs: [
          "De kosten hangen af van de afmetingen van je dakkapel en van wat je vernieuwt. Onze panelen en boeidelen verkopen we per lengte van 6 m. De prijs op de productpagina is dus de prijs voor één volle lengte, geen prijs per m². Je rekent dus uit hoeveel lengtes je nodig hebt en vermenigvuldigt dat met de prijs per lengte. De actuele prijzen staan in de [Keralit-categorie](/keralit-gevelbekleding).",
          "Andere partijen noemen vaak dat renovatie 70 tot 80% kost van een nieuwe dakkapel. Dat is een richtlijn, geen offerte.",
        ],
      },
      {
        heading: "Zo reken je het uit",
        level: 3,
        paragraphs: [],
        list: {
          ordered: true,
          items: [
            "Aantal rijen per vlak = hoogte van het vlak gedeeld door de werkende breedte van het paneel, naar boven afgerond.",
            "Paneellengte per vlak = aantal rijen maal de breedte van het vlak.",
            "Tel alle vlakken (twee wangen en het front) bij elkaar op en tel er ruim 10% snijverlies bij.",
            "Aantal lengtes = totale paneellengte gedeeld door 6 m, naar boven afgerond.",
            "Kosten = aantal lengtes maal de prijs per lengte.",
          ],
        },
        after: [
          "De werkende breedte is de zichtbare breedte van één paneel nadat het in het vorige paneel valt. Je vindt die onder Specificaties op de [productpagina](/producten/keralit-potdeksel-177). Voor de Keralit potdeksel 177 mm is dat 177 mm (0,177 m).",
        ],
      },
      {
        heading: "Rekenvoorbeeld (maten ter illustratie)",
        level: 3,
        paragraphs: [
          "Een dakkapel met twee wangen van 1,2 m hoog en 0,9 m breed, en een front van 1,2 m hoog en 2,4 m breed. Je gebruikt Keralit potdeksel 177 mm (werkende breedte 0,177 m, lengtes van 6 m).",
        ],
        list: {
          items: [
            "Rijen per vlak: 1,2 ÷ 0,177 = 6,8, afgerond 7 rijen.",
            "Per wang: 7 × 0,9 m = 6,3 m. Twee wangen: 12,6 m.",
            "Front: 7 × 2,4 m = 16,8 m.",
            "Totaal: 12,6 + 16,8 = 29,4 m.",
            "Plus 10% snijverlies: 29,4 × 1,10 = 32,3 m.",
            "Aantal lengtes: 32,3 ÷ 6 = 5,4, afgerond 6 lengtes van 6 m.",
          ],
        },
        after: [
          "Dan vermenigvuldig je 6 met de prijs per lengte op de productpagina. Daar komen nog boeidelen, hoekprofielen en bevestigingsmateriaal bij. Het zijn voorbeeldmaten: meet je eigen dakkapel op en reken zo na. Kom je er niet uit, stuur ons de maten, dan helpen wij je graag.",
          "Let op: één wang van 6,3 m past niet op één lengte van 6 m. Verdeel je restlengtes dus slim over de vlakken.",
        ],
      },
      {
        heading: "Zo gaat de renovatie in z'n werk",
        paragraphs: [],
        list: {
          ordered: true,
          items: [
            "Opname: meet alle vlakken op en beoordeel het houtwerk.",
            "Oude bekleding eraf.",
            "Houtwerk controleren en zo nodig herstellen.",
            "Latwerk en ventilatie aanbrengen.",
            "Panelen en boeidelen monteren.",
            "Afwerken met hoek-, eind- en startprofielen.",
          ],
        },
        after: [
          "Is een vergunning nodig? Voor het bekleden van een bestaande dakkapel is vaak geen vergunning nodig. Check het wel bij je gemeente of via het Omgevingsloket, zeker bij een monument of beschermd stadsgezicht.",
        ],
      },
      {
        heading: "Montage door Cavemen",
        paragraphs: [
          "Liever niet zelf op de ladder? Wij monteren de bekleding aan je dakkapel. De prijs hangt af van je situatie, daarom werken wij met een offerte. [Vraag een offerte aan](/offerte) en stuur de maten en een paar foto's mee.",
        ],
      },
      {
        heading: "Levering",
        paragraphs: ["Producten worden binnen max. 3 werkdagen geleverd."],
      },
    ],
    faqs: [
      {
        q: "Wat kost dakkapel renovatie?",
        a: "Dat hangt af van de afmetingen en wat je vernieuwt. Onze Keralit-panelen en boeidelen verkopen we per lengte van 6 m. Reken uit hoeveel lengtes je nodig hebt (zie het rekenvoorbeeld hierboven) en bekijk de actuele prijzen in de [Keralit-categorie](/keralit-gevelbekleding). Anderen noemen 70 tot 80% van de prijs van een nieuwe dakkapel.",
      },
      {
        q: "Kun je een dakkapel renoveren met kunststof?",
        a: "Ja. De bestaande constructie blijft. Je bekleedt wangen, front en boeidelen met onderhoudsvrije kunststof panelen.",
      },
      {
        q: "Is een dakkapel renoveren goedkoper dan vervangen?",
        a: "Meestal wel, zolang de constructie gezond is. Is ook de binnenkant of het houtwerk slecht, dan kan vervangen slimmer zijn.",
      },
      {
        q: "Heb ik een vergunning nodig om mijn dakkapel te renoveren?",
        a: "Vaak is er geen vergunning nodig voor het bekleden van een bestaande dakkapel. Check bij je gemeente of via het Omgevingsloket of dat ook voor jou geldt, zeker bij een monument of beschermd stadsgezicht.",
      },
      {
        q: "Hoe lang gaat een gerenoveerde dakkapel mee?",
        a: "Kunststof bekleding hoeft niet geschilderd te worden. Op het materiaal geven wij 10 jaar garantie.",
      },
      {
        q: "Kan ik de dakkapel zelf bekleden?",
        a: "Ja, Keralit is met gewoon houtgereedschap te verwerken. Wij kunnen het ook voor je monteren, op [offerte](/offerte).",
      },
      {
        q: "Hoe snel krijg ik de materialen?",
        a: "Producten worden binnen max. 3 werkdagen geleverd.",
      },
    ],
    links: [
      { href: "/keralit-gevelbekleding", label: "Bekijk Keralit gevelbekleding" },
      { href: "/boeidelen/keralit", label: "Bekijk boeidelen" },
      { href: "/offerte", label: "Offerte aanvragen" },
      { href: "/blog/wat-kost-kunststof-gevelbekleding", label: "Zie ook: wat kost kunststof gevelbekleding" },
      { href: "/rabatdelen", label: "Rabatdelen" },
      { href: "/blog/keralit-boeideel-dakrand-afwerken", label: "Dakrand afwerken met Keralit boeidelen" },
      { href: "/staalaanvraag", label: "Staal aanvragen" },
      { href: "/producten/keralit-potdeksel-177", label: "Keralit potdeksel 177 mm" },
    ],
    cta: {
      heading: "Klaar om je dakkapel te renoveren?",
      text: "Bekijk onze Keralit gevelbekleding, kies de passende boeidelen en vraag een offerte aan. Wij monteren de bekleding ook voor je.",
      actions: [
        { href: "/keralit-gevelbekleding", label: "Bekijk Keralit gevelbekleding" },
        { href: "/boeidelen/keralit", label: "Bekijk boeidelen" },
        { href: "/offerte", label: "Offerte aanvragen" },
      ],
      more: {
        href: "/blog/wat-kost-kunststof-gevelbekleding",
        label: "Zie ook: wat kost kunststof gevelbekleding",
      },
    },
  },
  {
    slug: "wat-kost-kunststof-gevelbekleding",
    title: "Wat kost kunststof gevelbekleding per m²?",
    description:
      "Richtprijzen voor kunststof gevelbekleding: materiaal, montage en wat de prijs opdrijft. Indicatie, geen vaste offerte.",
    date: "2026-09-29",
    kicker: "Prijs",
    sections: [
      {
        heading: "De bandbreedte",
        paragraphs: [
          "Materiaal voor een gangbaar gevelpaneel ligt tussen € 65 en € 120 per m² excl. btw. Inclusief montage ligt de eerste indicatie tussen € 95 en € 140 per m². Beide banden zijn een start, geen opdracht.",
          "Een rechte zijgevel zonder veel hoeken zit onderin. Een woning met topgevels, veel dagkanten en een dakrand erbij zit bovenin. Kleur en merk schuiven de paneelprijs; de achterconstructie schuift de montage.",
        ],
      },
      {
        heading: "Wat niet in de m² zit",
        paragraphs: [
          "Start-, hoek- en eindprofielen zijn stuks of lengtes, geen vierkante meters. Steiger, afvoer van de oude gevel en herstel van zachte regels rekenen wij apart na de opname.",
          "Op de productpagina rekent de calculator uw vlak om naar panelen, met 10% snijverlies. Dat is het materiaal. De offerte dekt het werk eromheen.",
        ],
      },
      {
        heading: "Hoe u een vaste prijs krijgt",
        paragraphs: [
          "Stuur het oppervlak, de plaats en een paar foto’s via het offerteformulier. Op werkdagen reageren wij binnen 24 uur. De vaste prijs volgt als de opname of de foto’s de hoeken en de ondergrond laten zien.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is de prijs op de site inclusief btw?",
        a: "Productprijzen en de m²-indicatie op de productpagina zijn excl. btw. De band van € 95 tot € 140 is de montage-indicatie excl. btw, tot de offerte anders zegt.",
      },
    ],
    links: [
      { href: "/offerte", label: "Indicatie aanvragen" },
      { href: "/gevelbekleding", label: "Gevelbekleding bekijken" },
      { href: "/blog/keralit-of-vinyplus", label: "Welk merk" },
    ],
  },
  {
    slug: "keralit-of-vinyplus",
    title: "Keralit of VinyPlus: welk paneel kiest u?",
    description:
      "Het verschil tussen Keralit en VinyPlus: stijfheid, structuur, prijs en wanneer een staal de knoop doorhakt.",
    date: "2026-09-29",
    kicker: "Merken",
    sections: [
      {
        heading: "Twee systemen, één soort garantie",
        paragraphs: [
          "Keralit is een stijf paneel met een fijne houtstructuur. VinyPlus is volschuim, met een geborstelde huid en een V-naad. Beide voeren wij met 10 jaar garantie op kleur en vorm bij montage volgens voorschrift.",
          "De keuze is geen kwaliteitsladder. Het is een vraag over het beeld en over hoe strak de ondergrond is.",
        ],
      },
      {
        heading: "Wanneer welk paneel",
        paragraphs: [
          "Kies Keralit als de gevel lang is, de zon er vol op staat en u de nerf van dichtbij wilt zien. Het paneel vergeeft een lichte oneffenheid in de regel minder snel dan mensen denken, maar het oogt stijver.",
          "Kies VinyPlus als de prijs per m² zwaarder weegt en de achterconstructie recht is. Het paneel is lichter te hanteren. De aluminium hulpstukken bestelt u er los bij.",
          "Eurotexx en Kerrafront zijn de andere routes: Eurotexx voor een klassiek potdekselbeeld, Kerrafront voor een brede sponning met weinig naden.",
        ],
      },
      {
        heading: "Staaltjes, geen foto",
        paragraphs: [
          "Een scherm maakt antraciet en eiken vlakker dan de gevel. Vraag maximaal vier stalen, leg ze buiten en kijk op een bewolkte dag en in de zon. Daarna pas het aantal panelen.",
        ],
      },
    ],
    faqs: [
      {
        q: "Mag ik hulpstukken mengen?",
        a: "Nee. Hoek, start en eind blijven bij het merk van het paneel.",
      },
    ],
    links: [
      { href: "/merken/keralit", label: "Keralit" },
      { href: "/merken/vinyplus", label: "VinyPlus" },
      { href: "/staalaanvraag", label: "Stalen aanvragen" },
    ],
  },
  {
    slug: "levensduur-kunststof-gevel",
    title: "Hoe lang gaat een kunststof gevel mee?",
    description:
      "Levensduur van kunststof gevelbekleding, wat de garantie dekt en welk onderhoud overblijft.",
    date: "2026-09-29",
    kicker: "Onderhoud",
    sections: [
      {
        heading: "25 tot 35 jaar",
        paragraphs: [
          "Een goed gemonteerd kunststof paneel gaat doorgaans 25 tot 35 jaar mee. Vocht, vorst en verfwerk zijn de redenen waarom hout eerder vervangen wordt. Het paneel rot niet. Het kan wel vies worden, en het kan bol gaan staan als de ventilatie dicht zit.",
          "De fabrieksgarantie die wij noemen is 10 jaar op kleur- en vormvastheid. Dat is korter dan de technische levensduur, en het geldt bij montage volgens het voorschrift van het merk.",
        ],
      },
      {
        heading: "Onderhoud dat overblijft",
        paragraphs: [
          "Afspoelen, een zachte borstel, geen schuurmiddel en geen hogedruk vlak op de naad. Schilderen hoort er niet bij. Een jaarlijkse blik op de startlat en de spouw is genoeg: bladeren in de ventilatieopening zijn het enige echte risico.",
        ],
      },
    ],
    faqs: [
      {
        q: "Vervalt de garantie als ik zelf monteer?",
        a: "Niet automatisch. De montage moet het voorschrift volgen: spouw, regelafstand en schroefmaat. Wijzigen aan het systeem, zoals dichtkitten van de ventilatie, haalt de garantie onderuit.",
      },
    ],
    links: [
      { href: "/blog/montage-kunststof-gevelbekleding", label: "Montagevoorschrift in het kort" },
      { href: "/gevelbekleding", label: "Panelen bekijken" },
    ],
  },
  {
    slug: "montage-kunststof-gevelbekleding",
    title: "Montage van kunststof gevelbekleding",
    description:
      "Regels, ventilatiespouw, startprofiel en snijverlies. De vaste volgorde als u zelf zet of montage via de offerte laat rekenen.",
    date: "2026-09-29",
    kicker: "Montage",
    sections: [
      {
        heading: "Achterconstructie",
        paragraphs: [
          "Regels minstens 21 × 32 mm, hart op hart rond 300 mm, tenzij het merk een andere maat voorschrijft. De ventilatiespouw blijft minstens 20 mm open, onder en boven. Zonder die lucht werkt het paneel niet en trekt vocht in de regel.",
          "Zachte bestaande regels gaan eruit. Kunststof verbergt een slechte ondergrond een seizoen, daarna niet meer.",
        ],
      },
      {
        heading: "Profiel en schroef",
        paragraphs: [
          "Start onderaan met het aluminium of kunststof startprofiel van hetzelfde merk. Panelen in het profiel, rvs-schroef 4,5 × 40, gat ongeveer 1 mm ruimer dan de schroef zodat de lengte kan werken. Hoeken en eindes met het merkprofiel, niet met een lat van de bouwmarkt.",
          "Reken 10% snijverlies op het netto vlak, ná aftrek van ramen en deuren. De calculator op het product doet dat. Zaagresten van een topgevel vallen zelden in het volgende paneel.",
        ],
      },
      {
        heading: "Zelf of laten zetten",
        paragraphs: [
          "Zelf zetten kan met deze volgorde en de handleiding van het merk, die wij met de order meesturen. Liever laten zetten: vink montage aan op de offerte. U krijgt één prijs na opname, materiaal en werk apart zichtbaar.",
        ],
      },
    ],
    faqs: [
      {
        q: "Waar bestel ik de startprofielen?",
        a: "Onder montage, gefilterd op het merk van uw paneel. Ze zitten niet in de paneelprijs.",
      },
    ],
    links: [
      { href: "/montage", label: "Montagemateriaal" },
      { href: "/offerte", label: "Montage aanvragen" },
      { href: "/volgorde-kozijnen-en-gevel", label: "eerst kozijnen of eerst de gevel" },
      { href: "/blog/wat-kost-kunststof-gevelbekleding", label: "Prijs per m²" },
    ],
  },
  {
    slug: "kleurstalen-aanvragen",
    title: "Kleurstalen aanvragen voor u bestelt",
    description:
      "Waarom een kleurstaal de order bepaalt, hoeveel u er kunt aanvragen en hoe de aanvraag loopt.",
    date: "2026-09-29",
    kicker: "Stalen",
    sections: [
      {
        heading: "Vier stalen, buiten bekijken",
        paragraphs: [
          "U vraagt maximaal vier kleuren tegelijk aan. Dat is genoeg om twee merken in twee kleuren te vergelijken, of één merk in vier tinten. Meer dan vier vertroebelt de keuze en vertraagt de zending.",
          "Leg de stalen op de gevel, niet op de keukentafel. Antraciet naast bestaand metselwerk valt anders uit dan antraciet op een wit scherm. Kijk een keer met zon en een keer zonder.",
        ],
      },
      {
        heading: "Hoe de aanvraag loopt",
        paragraphs: [
          "Kies de kleuren in de tray op de site, vul adres en telefoon in en verstuur. U krijgt een referentie op het scherm. Bewaar die als u belt over de zending. De stalen gaan binnen twee werkdagen de deur uit. Een staal is geen order.",
        ],
      },
    ],
    faqs: [
      {
        q: "Kost een staal geld?",
        a: "Nee. De aanvraag op deze site is gratis, met een maximum van vier kleuren per keer.",
      },
    ],
    links: [
      { href: "/staalaanvraag", label: "Stalen aanvragen" },
      { href: "/blog/keralit-of-vinyplus", label: "Eerst het merk kiezen" },
    ],
  },
];

export const blogPosts: BlogPost[] = [...corePosts, ...migratedPosts];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
