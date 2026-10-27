/**
 * Echte foto's voor de keuzekaarten.
 * Bronnen zijn foto's uit het eigen Fillout-formulier (skf34nbCp4us).
 * Een lege src blijft "Foto volgt" tot er een passende foto is.
 * Geen foto van een andere winkel, geen render, geen doorsnede van een ander profiel.
 */
export type DetailPhoto = {
  id: string;
  title: string;
  alt: string;
  src: string | null;
  width: number;
  height: number;
  /** Bron-URL van de gebruikte Fillout-foto. Meerdere URL's staan gescheiden door een spatie. */
  sourceUrl: string | null;
};

const W = 960;
const H = 720;

const empty = (id: string, title: string, alt: string): DetailPhoto => ({
  id,
  title,
  alt,
  src: null,
  width: W,
  height: H,
  sourceUrl: null,
});

const photo = (id: string, title: string, alt: string, src: string, sourceUrl: string): DetailPhoto => ({
  id,
  title,
  alt,
  src,
  width: W,
  height: H,
  sourceUrl,
});

const FILL = "https://images.fillout.com/orgid-276098/flowpublicid-skf34nbCp4us";
const WIT_NERF = `${FILL}/widgetid-jtFN/jge6bmmmGWGbQvssH8YM7C/Wit.jpg`;
const ANTRACIET_NERF = `${FILL}/widgetid-jtFN/bL17XLU4LZw7HhzbMXBXJG/Antraciet.jpg`;
const HVL_FOTO = `${FILL}/widgetid-9FWf/3xGtqjmQkBVXARqakiERvd/Schermafbeelding-2025-10-06-om-22.21.39.png`;
const SPACER_ZWART = `${FILL}/widgetid-qq7Y/xmFkh1U4QgKAz11VeYNcUh/Zwarte-afstandhouders-1.jpg`;
const DUCO = `${FILL}/widgetid-pjAX/6joTFA8kaDeTBmqo8igWGL/ducoklep.png`;
const KRUK_WIT = `${FILL}/widgetid-rLsk/jM8meahKkP4U4HwyiaUSkJ/Schermafbeelding-2025-10-13-om-10.29.39.png`;
const KRUK_ALU = `${FILL}/widgetid-rLsk/cnxKXByXKizyjaPxj1e1bD/Schermafbeelding-2025-10-13-om-10.28.56.png`;
const KRUK_ZWART = `${FILL}/widgetid-rLsk/gxbKjxbVjz5C7DJnruNbpz/Schermafbeelding-2025-10-13-om-10.30.32.png`;
const RAL = `${FILL}/widgetid-jtFN/eWmmddTcpBJw1puCnCpm23/ral-kleurenwaaier-k7.png`;
const AANSLAG_ZONDER = `${FILL}/widgetid-8JHa/28CiSPNtMwvZhJ9NJ8xzn8/Schermafbeelding-2025-10-06-om-22.17.03.png`;
const AANSLAG_MET = `${FILL}/widgetid-8JHa/5UMJQzn9B5YuDYqcVmvn28/Schermafbeelding-2025-10-06-om-22.16.54.png`;

export const DETAIL_PHOTOS = {
  profile: empty("profile", "Aluplast Ideal 7000 NL 64 mm", "Doorsnede van het Aluplast Ideal 7000 NL kader"),
  verstek: empty("verstek", "Verstek", "Hoek op verstek, de naad loopt schuin"),
  hvl: photo("hvl", "HVL", "HVL-hoek, de naad staat recht", "/kozijnen/hvl.webp", HVL_FOTO),
  folie: photo(
    "folie",
    "Kleuren en folies",
    "Kozijnfolie in wit nerf en antraciet nerf",
    "/kozijnen/folie-wit-antraciet.webp",
    `${WIT_NERF} ${ANTRACIET_NERF}`,
  ),
  hrpp: empty("hrpp", "HR++", "Dubbel isolatieglas"),
  triple: empty("triple", "Triple", "Drievoudig isolatieglas"),
  kruk: empty("kruk", "Standaard kruk", "Standaard raamkruk"),
  krukSlot: empty("kruk-slot", "Afsluitbare kruk", "Afsluitbare raamkruk"),
  rooster: empty("rooster", "Ventilatierooster", "Zelfregulerend ventilatierooster in het kader"),
  duco: photo("duco", "Duco-klep", "Duco-klep voor het kozijn", "/kozijnen/duco-klep.webp", DUCO),
  spacerZwart: photo(
    "spacer-zwart",
    "Zwart (warm edge)",
    "Zwarte afstandhouder in het glas",
    "/kozijnen/afstandhouder-zwart.webp",
    SPACER_ZWART,
  ),
  krukWit: photo("kruk-wit", "Wit", "Witte raamkruk", "/kozijnen/kruk-wit.webp", KRUK_WIT),
  krukAlu: photo("kruk-alu", "Aluminium (F9)", "Aluminium raamkruk", "/kozijnen/kruk-aluminium.webp", KRUK_ALU),
  krukZwart: photo("kruk-zwart", "Zwart", "Zwarte raamkruk", "/kozijnen/kruk-zwart.webp", KRUK_ZWART),
  ral: photo("ral", "RAL naar keuze, op aanvraag", "RAL K7 kleurenwaaier", "/kozijnen/ral-k7.webp", RAL),
  stomp: photo("stomp", "Stomp", "Kader zonder aanslag", "/kozijnen/aanslag-zonder.webp", AANSLAG_ZONDER),
  aanslag: photo("aanslag", "Met aanslag", "Kader met aanslag", "/kozijnen/aanslag-met.webp", AANSLAG_MET),
  smartSlide: empty("smart-slide", "Aluplast Smart-Slide", "Aluplast Smart-Slide schuifpui"),
} as const satisfies Record<string, DetailPhoto>;
