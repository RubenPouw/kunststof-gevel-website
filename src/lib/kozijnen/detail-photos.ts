/**
 * Echte foto's voor de keuzekaarten.
 * src blijft leeg tot er een bruikbare foto is: Aluplast-persbeeld met toestemming
 * voor dealers, of een foto uit deze repo of de Shopify-catalogus.
 * Geen leveranciersfoto van een andere winkel, geen render.
 */
export type DetailPhoto = {
  id: string;
  title: string;
  alt: string;
  src: string | null;
  width: number;
  height: number;
  sourceUrl: string | null;
};

const empty = (id: string, title: string, alt: string): DetailPhoto => ({
  id,
  title,
  alt,
  src: null,
  width: 640,
  height: 480,
  sourceUrl: null,
});

export const DETAIL_PHOTOS = {
  profile: empty("profile", "Aluplast Ideal 7000 NL 64 mm", "Doorsnede van het Aluplast Ideal 7000 NL kader"),
  verstek: empty("verstek", "Verstek", "Hoek op verstek, de naad loopt schuin"),
  hvl: empty("hvl", "HVL", "HVL-hoek, de naad staat recht"),
  folie: empty("folie", "Kleuren en folies", "Kozijnfolie in wit, crème en antraciet"),
  hrpp: empty("hrpp", "HR++", "Dubbel isolatieglas"),
  triple: empty("triple", "Triple", "Drievoudig isolatieglas"),
  kruk: empty("kruk", "Standaard kruk", "Standaard raamkruk"),
  krukSlot: empty("kruk-slot", "Afsluitbare kruk", "Afsluitbare raamkruk"),
  rooster: empty("rooster", "Ventilatierooster", "Zelfregulerend ventilatierooster in het kader"),
  smartSlide: empty("smart-slide", "Aluplast Smart-Slide", "Aluplast Smart-Slide schuifpui"),
} as const satisfies Record<string, DetailPhoto>;
