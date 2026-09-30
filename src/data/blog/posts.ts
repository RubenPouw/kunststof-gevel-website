import type { SeoFaq, SeoLink, SeoSection } from "@/data/seo/brands";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  kicker: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  links: SeoLink[];
};

export const blogPosts: BlogPost[] = [
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
          "Materiaal voor een gangbaar gevelpaneel ligt tussen € 65 en € 120 per m² excl. btw. Inclusief montage door een Caveman ligt de eerste indicatie tussen € 95 en € 140 per m². Beide banden zijn een start, geen opdracht.",
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
      { href: "/stalen", label: "Stalen aanvragen" },
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
      "Regels, ventilatiespouw, startprofiel en snijverlies. De vaste volgorde voor u zelf zet of een Caveman laat komen.",
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
        heading: "Zelf of een Caveman",
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
      { href: "/stalen", label: "Stalen aanvragen" },
      { href: "/blog/keralit-of-vinyplus", label: "Eerst het merk kiezen" },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
