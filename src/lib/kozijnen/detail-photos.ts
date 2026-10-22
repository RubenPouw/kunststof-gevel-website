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

const WIT_NERF =
  "https://images.fillout.com/orgid-276098/flowpublicid-skf34nbCp4us/widgetid-jtFN/jge6bmmmGWGbQvssH8YM7C/Wit.jpg";
const ANTRACIET_NERF =
  "https://images.fillout.com/orgid-276098/flowpublicid-skf34nbCp4us/widgetid-jtFN/bL17XLU4LZw7HhzbMXBXJG/Antraciet.jpg";
const HVL_FOTO =
  "https://images.fillout.com/orgid-276098/flowpublicid-skf34nbCp4us/widgetid-9FWf/3xGtqjmQkBVXARqakiERvd/Schermafbeelding-2025-10-06-om-22.21.39.png";

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
  smartSlide: empty("smart-slide", "Aluplast Smart-Slide", "Aluplast Smart-Slide schuifpui"),
} as const satisfies Record<string, DetailPhoto>;
