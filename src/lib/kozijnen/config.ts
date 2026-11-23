/**
 * Aluplast Ideal 7000 NL. Eén profiel.
 * Onbevestigde cijfers blijven null en worden niet op de site getoond.
 * Maatgrenzen staan per type in limits/. Een ontbrekend veld is niet gepubliceerd.
 * Leveranciersnaam en keurmerkvlaggen staan in supplier.ts (alleen server).
 */

export const PROFILE = {
  id: "ideal-7000-nl",
  /** Klantzichtbare naam. */
  name: "Aluplast Ideal 7000 NL",
  /** Officiële systeemnaam. De 84 mm is de aanzichthoogte van het kader, niet de inbouwdiepte. */
  systemName: "Aluplast Ideal 7000 NL 84 mm",
  /** Kamers in het kader. */
  frameChambers: 3,
  /** Kamers in de vleugel. */
  sashChambers: 5,
  /** Aantal dichtingen. */
  gaskets: 2,
  /** Maximale glasdikte in mm. */
  glassMaxMm: 52,
  /** Inbouwdiepte van het kader in mm. De aanzichthoogte van 84 mm is dit niet. */
  depthMm: 120,
  /** Berekende Uw van het kozijn met dubbel glas, in W/m²K. */
  uwDouble: 1.3,
  /** Berekende Uw van het kozijn met triple, in W/m²K. */
  uwTriple: 1.1,
  /** Berekende Uw met een ventilatierooster, in W/m²K. */
  uwWithVent: 1.4,
  /** Geen certificaten publiceren. */
  certificates: [] as string[],
  /** Geen levertijd in werkdagen. De levertijd staat in weken. */
  leadTimeWorkdays: null as number | null,
  /** Levertijd van het kozijn, in weken. */
  leadTimeWeeks: 4,
  colorExtraWorkdays: null as number | null,
  /** Geen garantie publiceren. */
  warranty: null as {
    profileYears: number;
    glassYears: number;
    hardwareYears: number;
  } | null,
  cornerVariants: ["verstek", "hvl"] as const,
} as const;

/** Verkoopnaam van de 2-delige schuifpui. Een ander systeem dan het raamprofiel. */
export const SLIDING_NAME = "Aluplast Smart-Slide schuifpui";

export function publicProfileName(slug: string) {
  if (slug === "schuifpui-2-delig") return SLIDING_NAME;
  if (slug === "schuifpui-4-delig") return "Kunststof schuifpui";
  return PROFILE.systemName;
}

function decimalComma(value: number) {
  return value.toFixed(1).replace(".", ",");
}

/** Klantzichtbare specificatie. Geen certificaten of garantie. Wel de levertijd in weken. */
export function profileSpecSentence() {
  return `Kader ${PROFILE.frameChambers} kamers, vleugel ${PROFILE.sashChambers} kamers, ${PROFILE.gaskets} dichtingen, glas tot ${PROFILE.glassMaxMm} mm. Inbouwdiepte ${PROFILE.depthMm} mm. In de berekening komt dit profiel op Uw ${decimalComma(PROFILE.uwDouble)} met dubbel glas en Uw ${decimalComma(PROFILE.uwTriple)} met triple. Levertijd ${PROFILE.leadTimeWeeks} weken.`;
}

export { SIZE_LIMITS, sizeBox, type SizeBox } from "./limits";

/** Snelle keuzes, akkoord naast de AP-lijst. TODO(leverancier): foliecodes en de volledige AP-lijst. */
export const FRAME_COLORS = [
  { id: "9016", name: "Glad wit", code: "RAL 9016", hex: "#FFFFFF", foilCode: null as string | null, swatch: "/kozijnen/swatch-glad-wit.webp" },
  { id: "9001", name: "Glad crème", code: "RAL 9001", hex: "#DAD4C4", foilCode: null, swatch: "/kozijnen/swatch-glad-creme.webp" },
  { id: "9016-nerf", name: "Wit houtnerf", code: "RAL 9016 nerf", hex: "#E6E0D6", foilCode: null, swatch: null },
  { id: "7016", name: "Antraciet", code: "RAL 7016", hex: "#383E42", foilCode: null, swatch: null },
  { id: "7016-nerf", name: "Antraciet houtnerf", code: "RAL 7016 nerf", hex: "#3A3E3C", foilCode: null, swatch: null },
  { id: "9005", name: "Zwart", code: "RAL 9005", hex: "#1C1C1C", foilCode: null, swatch: null },
  { id: "7021", name: "Zwartgrijs", code: "RAL 7021", hex: "#2F3234", foilCode: null, swatch: null },
  { id: "ral", name: "RAL naar keuze, op aanvraag", code: "op aanvraag", hex: "#F4F2ED", foilCode: null, swatch: "/kozijnen/swatch-ral-k7.webp" },
] as const;

export type ColorId = (typeof FRAME_COLORS)[number]["id"];

export const GLASS_TYPES = [
  { id: "hrpp", label: "HR++", detail: "Dubbel isolatieglas. In de berekening Uw 1,3." },
  { id: "triple", label: "Triple", detail: "Drie ruiten. In de berekening Uw 1,1. Het profiel neemt glas tot 52 mm." },
] as const;

export type GlassId = (typeof GLASS_TYPES)[number]["id"];

export const LAMINATED = [
  { id: "geen", label: "Niet gelaagd" },
  { id: "binnen", label: "Gelaagd aan de binnenkant" },
  { id: "beide", label: "Gelaagd aan beide kanten" },
] as const;

export type LaminatedId = (typeof LAMINATED)[number]["id"];

export const LOW_GLASS = [
  { id: "nee", label: "Onderkant hoger dan 85 cm" },
  { id: "ja", label: "Onderkant lager dan 85 cm" },
  { id: "onbekend", label: "Weet ik nog niet" },
] as const;

export type LowGlassId = (typeof LOW_GLASS)[number]["id"];

export const CORNERS = [
  { id: "verstek", label: "Verstek" },
  { id: "hvl", label: "HVL" },
] as const;

export type CornerId = (typeof CORNERS)[number]["id"];

export function colorById(id: string) {
  return FRAME_COLORS.find((color) => color.id === id) ?? FRAME_COLORS[0];
}
