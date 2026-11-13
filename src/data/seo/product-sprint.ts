import type { Product } from "@/lib/catalog/types";

/** Bevestigde levertijd. Geen andere termijn in sprintteksten. */
export const SPRINT_DELIVERY = "max. 3 werkdagen";

export const SPRINT_DELIVERY_SENTENCE = `Op voorraad leveren we in ${SPRINT_DELIVERY}.`;

export const SPRINT_SAMPLE_SENTENCE = "Kleurstalen zijn binnen 3 werkdagen thuis.";

export type SprintSpec = {
  label: string;
  value: string;
  /** Waar de waarde vandaan komt. Niet zichtbaar op de pagina. */
  source: string;
};

export type SprintLink = {
  label: string;
  href?: string;
  slugs?: string[];
};

export type SprintCrumb = { name: string; path: string };

export type SprintStory = {
  id: string;
  slugs: string[];
  title: string;
  h1: string;
  description: string;
  crumbs: SprintCrumb[];
  intro: string[];
  introBySlug?: Record<string, string>;
  specs: SprintSpec[];
  needIntro: string;
  need: SprintLink[];
  montage: string[];
  montageLinks: SprintLink[];
  faqs: { q: string; a: string }[];
  links: SprintLink[];
};

const home: SprintCrumb = { name: "Home", path: "/" };
const gevel: SprintCrumb = { name: "Gevelbekleding", path: "/gevelbekleding" };
const boei: SprintCrumb = { name: "Dakranden", path: "/boeidelen" };
const boeiKeralit: SprintCrumb = { name: "Keralit boeidelen", path: "/boeidelen/keralit" };
const bank: SprintCrumb = { name: "Kunststof vensterbank", path: "/kunststof-vensterbank" };
const hpl: SprintCrumb = { name: "HPL plaat", path: "/hpl-plaat" };

const deliveryTail = `Levering in ${SPRINT_DELIVERY}.`;

export const productSprints: SprintStory[] = [
  {
    id: "keralit-143",
    slugs: ["keralit-sponningdeel-143mm", "keralit-sponning-143"],
    title: "Keralit sponningdeel 143 mm kopen | 6 meter paneel | Kunststof-gevel.nl",
    h1: "Keralit sponningdeel 143 mm",
    description: `Keralit sponningdeel 143 mm (artikel 2814) kopen. Werkende breedte 143 mm, lengte 6 m. Inclusief hulpstukken en advies. ${deliveryTail}`,
    crumbs: [home, gevel],
    intro: [
      "Dit is het meest toegepaste Keralit sponningdeel: een brede sponning die u horizontaal of verticaal monteert. Alle kleuren staan op deze ene pagina. U kiest de kleur in de kiezer, niet via een aparte landingspagina.",
      "De hoofdterm Keralit gevelbekleding hoort op de Keralit-pagina. Deze URL is van dit ene deel, 143 mm werkend.",
      SPRINT_DELIVERY_SENTENCE,
      SPRINT_SAMPLE_SENTENCE,
    ],
    specs: [
      {
        label: "Werkende breedte",
        value: "143 mm",
        source: "productnaam en spec in src/data/catalog/products.json; Shopify-titel Keralit sponningdeel 143mm, beschrijving Afmeting 143mm (13 nov 2026)",
      },
      {
        label: "Lengte",
        value: "6 m",
        source: "products.json spec Lengte 6 m; Shopify-varianttitels eindigen op / 600 cm (13 nov 2026)",
      },
      {
        label: "Artikelgroep",
        value: "2814",
        source: "Shopify-afbeelding PR3067…_2814_Keralit_sponningdeel_143mm en SKU-prefix 2814 (bijv. 28140360), 13 nov 2026",
      },
      {
        label: "Garantie",
        value: "10 jaar kleurvast",
        source: "products.json spec Garantie; merktekst in src/data/catalog/brands.json (Keralit, 10 jaar kleurvastheid)",
      },
    ],
    needIntro:
      "Bij dit 143 mm-deel horen het verbindingsstuk, de eindkappen links en rechts, een startprofiel, het eindprofiel van 17 mm en de schroeven. Reken ze mee in dezelfde order.",
    need: [
      { label: "Keralit verbindingstuk 143 mm", slugs: ["keralit-verbindingstuk-voor-2814", "keralit-verbindstuk-143"] },
      { label: "eindkap links 143 mm", slugs: ["eindkap-connector-links-voor-2814-5st"] },
      { label: "eindkap rechts 143 mm", slugs: ["eindkap-connector-rechts-voor-2814-5st"] },
      {
        label: "inhaak startprofiel",
        slugs: ["inhaak-startprofiel-22mm-ventilatie", "inhaakstartprofiel-aluminium", "keralit-startprofiel-horizontaal-22"],
      },
      { label: "eindprofiel 17 mm", slugs: ["eindprofiel-17mm-keralit", "keralit-eindprofiel-17"] },
      { label: "basis aluminium eindprofiel", slugs: ["basis-aluminium-eindprofiel"] },
      { label: "Keralit schroeven 30 mm", slugs: ["keralit-schroef-4x30mm-rvs-200-stuks", "keralit-schroeven-30"] },
    ],
    montage: [
      "Begin met het startprofiel en zet de panelen daarna in het profiel. Werkt u verticaal, dan gebruikt u het omrandingsprofiel als onderrand. Koppel lengtes met het verbindingstuk voor 143 mm en sluit de kopse kant af met de eindkap links of rechts.",
      "Schroef met de Keralit-schroeven. Boor het gat ruimer zodat het paneel kan werken. De volgorde van regels en spouw staat bij Keralit montage.",
    ],
    montageLinks: [
      { label: "Keralit montage", href: "/montage?merk=keralit" },
      { label: "omrandingsprofiel", slugs: ["omrandingprof-met-ontwatering-keralit"] },
    ],
    faqs: [
      {
        q: "Wat is de werkende breedte?",
        a: "143 mm. Dat is de maat die meetelt zodra de delen in elkaar haken.",
      },
      {
        q: "Kan ik dit paneel verticaal monteren?",
        a: "Ja. Horizontaal begint u met het startprofiel. Verticaal gebruikt u het omrandingsprofiel als onderrand.",
      },
      {
        q: "Welke hulpstukken horen bij 143 mm?",
        a: "Verbindingstuk voor 143 mm, eindkap links en rechts, startprofiel, eindprofiel 17 mm en de Keralit-schroeven. Die staan hieronder gelinkt.",
      },
      {
        q: "Hoeveel panelen heb ik per m² nodig?",
        a: "Bij 143 mm werkende breedte is 1 meter paneel 0,143 m², dus ongeveer 7 strekkende meter per m². Een lengte van 6 m dekt 0,86 m². Reken ongeveer 1,2 paneel per m².",
      },
    ],
    links: [
      { label: "Keralit gevelbekleding", href: "/keralit-gevelbekleding" },
      { label: "kunststof rabatdelen", href: "/rabatdelen" },
      { label: "Keralit montage", href: "/montage?merk=keralit" },
      { label: "kleurstalen", href: "/staalaanvraag?groep=gevel" },
    ],
  },
  {
    id: "vinyplus-rabat",
    slugs: ["vinyplus-rabatdeel-150-mm", "vinyplus-rabatdeel-150-mm-1"],
    title: "Vinyplus rabat 150 mm kopen | Kunststof-gevel.nl",
    h1: "Vinyplus rabat 150 mm",
    description: `Vinyplus rabat 150 mm werkend. Alle kleuren op één pagina. Bestel het paneel en de bijpassende profielen. ${deliveryTail}`,
    crumbs: [home, gevel],
    intro: [
      "VinyPlus rabat 150 mm is het smalle rabatdeel. Alle kleuren staan op deze URL. U kiest de kleur in de kiezer. Er is geen aparte pagina per kleur.",
      SPRINT_DELIVERY_SENTENCE,
      SPRINT_SAMPLE_SENTENCE,
    ],
    specs: [
      {
        label: "Werkende breedte",
        value: "150 mm",
        source: "Shopify-producttitel VinyPlus rabatdeel 150 mm, handle vinyplus-rabatdeel-150-mm-1 (13 nov 2026)",
      },
    ],
    needIntro:
      "Bij het rabat horen een startprofiel, een eindprofiel, een hoekprofiel en schroeven. Voor een verticale gevel is er een apart startprofiel.",
    need: [
      { label: "startprofiel horizontaal", slugs: ["startprofiel-voor-horizontale-bekleding"] },
      { label: "startprofiel verticale bekleding", slugs: ["vinyplus-startpr-verticale-bekleding"] },
      { label: "eindprofiel", slugs: ["eindprofiel-18-mm-inwendig", "vinyplus-montage-eindprofiel-3m"] },
      { label: "hoekprofiel", slugs: ["buitenhoek-18-mm-inwendig"] },
      { label: "stootvoegverbinding", slugs: ["vinyplus-rabat-stootvoegverbinding"] },
      { label: "schroeven", slugs: ["schroef-t15-3-5x30-mm-250-stuks", "vinyplus-schroeven-35x30"] },
    ],
    montage: [
      "Zet het startprofiel dat bij de richting hoort: horizontaal of verticaal. Plaats de rabatdelen daarna in het profiel en werk hoeken en kopse kanten af met het hoek- en eindprofiel.",
      "De lengte van dit rabat staat niet als vaste maat op het artikel. Reken met de lengte die bij de gekozen variant staat, zodra die er is.",
    ],
    montageLinks: [{ label: "VinyPlus gevelbekleding", href: "/merken/vinyplus" }],
    faqs: [
      {
        q: "Past dit rabat alleen horizontaal?",
        a: "Nee. Er is een startprofiel voor horizontale bekleding en een startprofiel voor verticale bekleding. Kies het profiel dat bij de richting hoort.",
      },
      {
        q: "Hoeveel m² dekt één lengte?",
        a: "De werkende breedte is 150 mm. De lengte staat niet vast op het artikel. Deel de lengte van de variant (in meters) door 1 en vermenigvuldig met 0,15. Dat is het aantal m² per lengte.",
      },
      {
        q: "Welke profielen horen erbij?",
        a: "Startprofiel, eindprofiel, hoekprofiel en schroeven. Een stootvoegverbinding koppelt twee lengtes. Die artikelen staan op deze pagina gelinkt.",
      },
    ],
    links: [
      { label: "kunststof rabatdelen", href: "/rabatdelen" },
      { label: "Vinyplus gevelbekleding", href: "/merken/vinyplus" },
      { label: "kleurstalen", href: "/staalaanvraag?groep=gevel" },
    ],
  },
  {
    id: "vinyplus-vario",
    slugs: ["vinyplus-vario-299mm", "vinyplus-vario-299mm-1"],
    title: "Vinyplus Vario 299 mm gevelpaneel kopen | Kunststof-gevel.nl",
    h1: "Vinyplus Vario 299 mm gevelpaneel",
    description: `Vinyplus Vario 299 mm: extra breed kunststof gevelpaneel. Geschikt voor nieuwbouw en renovatie. Inclusief bijpassende profielen. ${deliveryTail}`,
    crumbs: [home, gevel],
    intro: [
      "VinyPlus Vario is het extra brede gevelpaneel, 299 mm werkend. U dekt een vlak met minder naden dan met het rabat van 150 mm. De kleuren kiest u op deze pagina.",
      "Nieuwbouw en renovatie gebruiken hetzelfde paneel. Het verschil zit in de achterconstructie, niet in een ander artikel.",
      SPRINT_DELIVERY_SENTENCE,
      SPRINT_SAMPLE_SENTENCE,
    ],
    specs: [
      {
        label: "Werkende breedte",
        value: "299 mm",
        source: "Shopify-producttitel VinyPlus Vario 299mm, handle vinyplus-vario-299mm-1 (13 nov 2026)",
      },
      {
        label: "Artikelgroep",
        value: "0432",
        source: "Shopify-SKU's beginnen met 0432 (bijv. 04325560) en de afbeelding FM7383…_04325560 (13 nov 2026)",
      },
    ],
    needIntro:
      "Voor verticale bekleding is er een startprofiel in de VinyPlus-lijn. Gebruik het als het op dit paneel past. Het smalle rabat heeft een eigen pagina.",
    need: [
      { label: "Vinyplus rabat", slugs: ["vinyplus-rabatdeel-150-mm", "vinyplus-rabatdeel-150-mm-1"] },
      { label: "startprofiel verticale bekleding", slugs: ["vinyplus-startpr-verticale-bekleding"] },
      { label: "startprofiel horizontaal", slugs: ["startprofiel-voor-horizontale-bekleding"] },
    ],
    montage: [
      "Het brede paneel legt u in het startprofiel en schroeft u vast volgens het VinyPlus-voorschrift. Hoeken en einden komen uit dezelfde lijn als het rabat, mits het profiel op 299 mm past.",
      "Twijfelt u of het verticale startprofiel op de Vario hoort, bel dan even. Op het artikel zelf staat die combinatie niet uitgeschreven.",
    ],
    montageLinks: [{ label: "VinyPlus gevelbekleding", href: "/merken/vinyplus" }],
    faqs: [
      {
        q: "Wat is het verschil met het standaard rabat?",
        a: "Het rabat is 150 mm werkend. De Vario is 299 mm werkend. Hetzelfde vlak heeft daardoor minder naden.",
      },
      {
        q: "Welke kleuren zijn er?",
        a: "De kleuren staan in de kiezer op deze pagina. Er is geen aparte URL per kleur.",
      },
      {
        q: "Kan ik de Vario horizontaal en verticaal monteren?",
        a: "Er is een startprofiel voor horizontale bekleding en een startprofiel voor verticale bekleding. Of het verticale profiel op dit 299 mm-paneel past, staat niet op het artikel. Vraag het na als u verticaal wilt.",
      },
    ],
    links: [
      { label: "Vinyplus gevelbekleding", href: "/merken/vinyplus" },
      { label: "Vinyplus rabat", slugs: ["vinyplus-rabatdeel-150-mm", "vinyplus-rabatdeel-150-mm-1"] },
      { label: "kleurstalen", href: "/staalaanvraag?groep=gevel" },
    ],
  },
  {
    id: "keralit-dakrand-250",
    slugs: ["keralit-dakrandpaneel-250mm", "keralit-dakrand-paneel-250"],
    title: "Keralit boeideel 250 mm kopen | Dakrandpaneel 6 m | Kunststof-gevel.nl",
    h1: "Keralit boeideel 250 mm (dakrandpaneel)",
    description: `Keralit boeideel 250 mm (artikel 2825), ook wel dakrandpaneel. Lengte 6 m. Kies 250 mm als die breedte uw dakrand dekt. ${deliveryTail}`,
    crumbs: [home, boei, boeiKeralit],
    intro: [
      "Kies 250 mm als die breedte uw bestaande dakrand dekt. Smaller is 200 mm. Bredere dakranden pakt u met 300 of 350 mm. Meet de hoogte van de boei en neem de maat die het vlak volledig afdekt.",
      "Boeideel en dakrandpaneel zijn dezelfde productlijn. Boeideel is de gebruikelijke term. De overzichtsnaam Keralit boeidelen hoort op de hub, niet op dit ene paneel.",
      SPRINT_DELIVERY_SENTENCE,
      SPRINT_SAMPLE_SENTENCE,
    ],
    specs: [
      {
        label: "Breedte",
        value: "250 mm",
        source: "products.json spec Breedte 250 mm; Shopify-titel Keralit dakrandpaneel 250mm (13 nov 2026)",
      },
      {
        label: "Lengte",
        value: "6 m",
        source: "products.json spec Lengte 6 m; Shopify-varianttitels eindigen op / 600 cm (13 nov 2026)",
      },
      {
        label: "Artikelgroep",
        value: "2825",
        source: "Shopify-SKU's beginnen met 2825 (bijv. 28250460), 13 nov 2026",
      },
      {
        label: "Garantie",
        value: "10 jaar kleurvast",
        source: "products.json spec Garantie bij keralit-dakrand-paneel-250; merktekst brands.json",
      },
    ],
    needIntro:
      "Bij de dakrand horen montageprofielen, een boeiboordmontageprofiel, een eindprofiel en een trim of kraal. Hoek- en tussenstukken kiest u bij de breedte. Voor 250 mm staat er geen apart hoekstuk in de shop.",
    need: [
      { label: "montageprofiel 10 mm", slugs: ["keralit-dakrandmontageprofiel-10mm", "keralit-dakrand-montage-profiel-10mm"] },
      { label: "montageprofiel 17 mm", slugs: ["keralit-dakrandmontageprofiel-17mm"] },
      { label: "boeiboordmontageprofiel", slugs: ["keralit-dakrand-boeiboordmontageprofiel"] },
      { label: "eindprofiel dakrand", slugs: ["eindprofiel-10mm-voor-keralit-dakrand", "keralit-dakrand-eindprofiel-10mm"] },
      { label: "trim kraal", slugs: ["trim-kraal-aansluitpr-10mm-keralit-dakr", "keralit-dakrand-trim-kraal-aansluitprofiel"] },
    ],
    montage: [
      "Het paneel klikt op het montageprofiel, zodat u aan de voorzijde geen schroef ziet. Kies het profiel dat bij de dikte van dit paneel hoort. Die dikte staat niet als los getal op het artikel.",
      "Werk de kopse kant af met het eindprofiel en de aansluiting met de trim of kraal. De andere breedtes staan bij Keralit boeidelen.",
    ],
    montageLinks: [{ label: "Keralit boeidelen", href: "/boeidelen/keralit" }],
    faqs: [
      {
        q: "Wat is het verschil tussen boeideel en dakrandpaneel?",
        a: "Hetzelfde product. Dakrandpaneel is de naam op het artikel. Boeideel is de term die u in de zoekopdracht tegenkomt.",
      },
      {
        q: "Welke breedte heb ik nodig?",
        a: "De breedte die uw dakrand afdekt. Dit paneel is 250 mm. Smaller is 200 mm, breder is 300 of 350 mm.",
      },
      {
        q: "Welke profielen horen bij 250 mm?",
        a: "Montageprofiel 10 mm of 17 mm, het boeiboordmontageprofiel, het eindprofiel en de trim of kraal. Een hoekstuk dat alleen bij 250 mm hoort, staat niet in de shop.",
      },
    ],
    links: [
      { label: "Keralit boeidelen", href: "/boeidelen/keralit" },
      { label: "Keralit dakranden", href: "/boeidelen/keralit" },
      { label: "dakrandpaneel 200 mm", slugs: ["keralit-dakrandpaneel-200mm", "keralit-dakrand-paneel-200"] },
      { label: "dakrandpaneel 350 mm", slugs: ["keralit-dakrandpaneel-350mm"] },
      { label: "kleurstalen", href: "/staalaanvraag?groep=gevel" },
    ],
  },
  {
    id: "overzet-380",
    slugs: ["milinboard-overzetvensterbank-380-mm", "milinboard-overzetvensterbank-380", "milinboard-overzetvensterbank-380-mm-1"],
    title: "Overzet vensterbank 380 mm kopen | Kunststof-gevel.nl",
    h1: "Overzet vensterbank 380 mm",
    description: `Overzet vensterbank 380 mm. Plaats je over de bestaande vensterbank, zonder sloop. Inclusief bijpassende eindkappen. ${deliveryTail}`,
    crumbs: [home, bank],
    intro: [
      "Een overzet vensterbank is een dun profiel dat u over de bestaande bank verlijmt. De oude bank blijft zitten. U hoeft niet te hakken of te breken. Dat past bij renovatie in huis.",
      "De hoofdterm overzet vensterbank hoort op de pagina kunststof vensterbank. Deze URL is alleen de uitvoering van 380 mm.",
      SPRINT_DELIVERY_SENTENCE,
    ],
    specs: [
      {
        label: "Breedte",
        value: "380 mm",
        source: "products.json spec Breedte 380 mm; Shopify-titel en beschrijving Afmeting 380 mm (13 nov 2026)",
      },
      {
        label: "Type",
        value: "Overzet",
        source: "products.json spec Type Overzet; productnaam overzetvensterbank",
      },
      {
        label: "Materiaal",
        value: "Kunststof",
        source: "products.json spec Materiaal Kunststof; Shopify-beschrijving noemt een kunststof vensterbank (13 nov 2026)",
      },
      {
        label: "Artikelgroep",
        value: "0755",
        source: "Shopify-afbeelding PR4831…_0755_Milinboard_overzetvensterbank_380_mm en SKU-prefix 0755 (13 nov 2026)",
      },
    ],
    needIntro: "De zijkant werkt u af met de eindkap. Zonder eindkap blijft de kop open.",
    need: [
      {
        label: "eindkap overzet vensterbank",
        slugs: ["milinboard-overzetvensterbank-eindkap", "milinboard-eindkap-400"],
      },
    ],
    montage: [
      "Maak de bestaande bank schoon en droog. Pas de nieuwe bank eerst droog. Zaag alleen als het artikel langer is dan de dagmaat.",
      "Zet de bank vast met lijm of kit die geschikt is voor kunststof. Druk hem aan, plaats de eindkappen en laat de lijm uitharden voordat u de bank belast.",
    ],
    montageLinks: [{ label: "overzet vensterbank meten", href: "/blog/overzet-vensterbank-meten" }],
    faqs: [
      {
        q: "Past 380 mm op mijn bestaande bank?",
        a: "Dit artikel is 380 mm diep. Meet de bestaande bank, inclusief de neus. Dekking die 380 mm te boven gaat, vraagt een andere maat.",
      },
      {
        q: "Heb ik eindkappen nodig?",
        a: "Ja, als de zijkant in het zicht komt. De eindkap sluit de kop. Zonder eindkap blijft die open.",
      },
      {
        q: "Kan ik de bank zelf op maat zagen?",
        a: "Alleen als de lengte van het artikel langer is dan de opening. De lengte staat bij de variant, niet als vaste zin op deze pagina.",
      },
    ],
    links: [
      { label: "overzet vensterbank", href: "/kunststof-vensterbank" },
      { label: "kunststof vensterbank", href: "/kunststof-vensterbank" },
      {
        label: "eindkap overzet vensterbank",
        slugs: ["milinboard-overzetvensterbank-eindkap", "milinboard-eindkap-400"],
      },
    ],
  },
  {
    id: "hpl-3050",
    slugs: [
      "milyt-hpl-plaat-3050-x-1300-x-6-mm",
      "milyt-hpl-plaat-3050-x-1300-x-6-mm-1",
      "milyt-hpl-plaat-3050-x-1300-x-6-mm-2",
    ],
    title: "HPL plaat 3050 x 1300 x 6 mm kopen | Kunststof-gevel.nl",
    h1: "HPL plaat 3050 x 1300 x 6 mm",
    description: `HPL plaat 3050 x 1300 x 6 mm, materiaal HPL. Hele plaat, ongeveer 3,965 m². Voor gevels en dakranden. ${deliveryTail}`,
    crumbs: [home, hpl],
    intro: [
      "De hoofdterm HPL plaat hoort op de HPL-pagina. Deze URL is de plaat van 3050 x 1300 x 6 mm. U bestelt de plaat heel. Wij zagen niet op maat.",
      SPRINT_DELIVERY_SENTENCE,
      SPRINT_SAMPLE_SENTENCE,
    ],
    introBySlug: {
      "milyt-hpl-plaat-3050-x-1300-x-6-mm-1":
        "Dit Milyt-artikel gebruikt de codes die met mpf beginnen. De plaatmaat is 3050 x 1300 x 6 mm.",
      "milyt-hpl-plaat-3050-x-1300-x-6-mm-2":
        "Dit Milyt-artikel gebruikt de codes die met mp beginnen. De plaatmaat is 3050 x 1300 x 6 mm.",
    },
    specs: [
      {
        label: "Plaatmaat",
        value: "3050 × 1300 × 6 mm",
        source: "Shopify-beschrijving Afmeting 3050 x 1300 x 6 mm (13 nov 2026); constante HPL_SHEET_SIZE in src/lib/catalog/derive.ts",
      },
      {
        label: "Materiaal",
        value: "HPL",
        source: "Shopify-beschrijving Materiaal: HPL (13 nov 2026)",
      },
      {
        label: "Oppervlak per plaat",
        value: "3,965 m²",
        source: "berekend uit 3050 × 1300 mm, constante HPL_SHEET_M2 in src/lib/area.ts",
      },
      {
        label: "Zaagwerk",
        value: "Hele plaat, wij zagen niet",
        source: "bestaande HPL-hub en productpagina: hele plaat, geen zaagwerk op maat",
      },
    ],
    needIntro:
      "Bevestiging gaat met Torx-schroeven op een achterconstructie. Dit is geen volledige constructiehandleiding. De lijn schrijft de h.o.h.-afstand voor.",
    need: [
      { label: "Torx-schroeven", slugs: ["torx-schroef-32mm-rvs-v2a-100st", "torx-schroef-4-8x38-mm-100-stuks"] },
      { label: "kunststof dakranden", href: "/boeidelen" },
    ],
    montage: [
      "De plaat komt op een geventileerde achterconstructie. Kit de spouw niet dicht. Schroef volgens het voorschrift van de lijn.",
      "Wij leveren de plaat heel, 3050 × 1300 × 6 mm. Zaagwerk op de bouw is van u. Een reststuk blijft van u.",
    ],
    montageLinks: [{ label: "HPL plaat", href: "/hpl-plaat" }],
    faqs: [
      {
        q: "Wat is HPL?",
        a: "HPL is het materiaal dat op het artikel staat. Deze plaat meet 3050 x 1300 x 6 mm.",
      },
      {
        q: "Wat is het verschil tussen glad en structuur?",
        a: "Op het artikel staat niet of de plaat glad is of een structuurfolie heeft. Er zijn twee Milyt-artikelen in deze maat, met codes mp en mpf. Kleur en prijs staan bij de variant.",
      },
      {
        q: "Waar is 6 mm voor bedoeld?",
        a: "6 mm is de dikte op het artikel. De plaat past als gevelplaat of dakrandbekleding op een achterconstructie. Dit is geen constructieberekening.",
      },
    ],
    links: [
      { label: "HPL platen", href: "/hpl-plaat" },
      { label: "HPL gevelplaten", href: "/hpl-plaat" },
      { label: "kunststof dakranden", href: "/boeidelen" },
      { label: "kleurstalen", href: "/staalaanvraag?groep=hpl" },
    ],
  },
];

export function sprintForProduct(product: Pick<Product, "slug" | "aliasSlugs">) {
  return productSprints.find(
    (story) => story.slugs.includes(product.slug) || product.aliasSlugs?.some((alias) => story.slugs.includes(alias)),
  );
}

export function sprintIntro(story: SprintStory, slug: string) {
  const lead = story.introBySlug?.[slug];
  return lead ? [lead, ...story.intro] : story.intro;
}

export function sprintSpecRows(product: Product, story: SprintStory) {
  const rows: { label: string; value: string }[] = [];
  const seen = new Set<string>();
  function add(label: string, value: string) {
    const key = label.trim().toLowerCase();
    const clean = value.trim();
    if (!clean || seen.has(key)) return;
    if (/werkdagen|levertijd/i.test(`${label} ${clean}`)) return;
    seen.add(key);
    rows.push({ label, value: clean });
  }
  for (const spec of story.specs) add(spec.label, spec.value);
  for (const spec of product.specs) add(spec.label, spec.value);
  if (product.colors.length > 0) add("Kleuren in de shop", String(product.colors.length));
  return rows;
}

export function resolveSprintLink(
  link: SprintLink,
  products: Pick<Product, "slug" | "aliasSlugs">[],
): { label: string; href: string } | null {
  if (link.slugs?.length) {
    for (const slug of link.slugs) {
      const found = products.find((product) => product.slug === slug || product.aliasSlugs?.includes(slug));
      if (found) return { label: link.label, href: `/producten/${found.slug}` };
    }
    return link.href ? { label: link.label, href: link.href } : null;
  }
  return { label: link.label, href: link.href ?? "/" };
}

export function productQueryRobots(search: Record<string, string | string[] | undefined>) {
  const hasQuery = Object.values(search).some((value) => (Array.isArray(value) ? value.some(Boolean) : Boolean(value)));
  return hasQuery ? ({ index: false, follow: true } as const) : undefined;
}
