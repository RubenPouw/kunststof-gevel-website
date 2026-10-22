/**
 * Aluplast Ideal 7000 NL. Eén profiel.
 * Onbevestigde cijfers blijven null en worden niet op de site getoond.
 * Maatgrenzen zijn voorlopige online aanvraaggrenzen, geen fabriekscertificaat.
 * Leveranciersnaam en keurmerkvlaggen staan in supplier.ts (alleen server).
 */

export const PROFILE = {
  id: "ideal-7000-nl",
  /** Klantzichtbare naam. */
  name: "Aluplast Ideal 7000 NL",
  /** Officiële systeemnaam. De 64 mm is de aanzichthoogte van het kader, niet de inbouwdiepte. */
  systemName: "Aluplast Ideal 7000 NL 64 mm",
  /** Kamers in het kader. */
  frameChambers: 3,
  /** Kamers in de vleugel. */
  sashChambers: 5,
  /** Aantal dichtingen. */
  gaskets: 2,
  /** Maximale glasdikte in mm. */
  glassMaxMm: 52,
  /** Inbouwdiepte van het kader in mm. De aanzichthoogte van 64 mm is dit niet. */
  depthMm: 120,
  /** Berekende Uw van het kozijn met dubbel glas, in W/m²K. */
  uwDouble: 1.3,
  /** Berekende Uw van het kozijn met triple, in W/m²K. */
  uwTriple: 1.1,
  /** Berekende Uw met een ventilatierooster, in W/m²K. */
  uwWithVent: 1.4,
  /** Geen certificaten publiceren. */
  certificates: [] as string[],
  /** Geen levertijd publiceren. */
  leadTimeWorkdays: null as number | null,
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
  return PROFILE.name;
}

function decimalComma(value: number) {
  return value.toFixed(1).replace(".", ",");
}

/** Klantzichtbare specificatie. Geen certificaten, garantie of levertijd. */
export function profileSpecSentence() {
  return `Kader ${PROFILE.frameChambers} kamers, vleugel ${PROFILE.sashChambers} kamers, ${PROFILE.gaskets} dichtingen, glas tot ${PROFILE.glassMaxMm} mm. Inbouwdiepte ${PROFILE.depthMm} mm. In de berekening komt dit profiel op Uw ${decimalComma(PROFILE.uwDouble)} met dubbel glas en Uw ${decimalComma(PROFILE.uwTriple)} met triple.`;
}

export type SizeBox = {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  /** Maximaal glasoppervlak in m². Alleen gezet waar dat de grens is. */
  maxAreaM2?: number;
  /** Maximale breedte van één draaiende vleugel, in mm. */
  maxSashWidth?: number;
};

/**
 * Draaikiep: maximaal ongeveer 1512 mm breed per vleugel.
 * Vast glas: maximaal 3,35 m².
 * 600×600 is getest. Overige grenzen blijven de online aanvraagband.
 * De maximale hoogte van een draaikiepraam loopt hier nog niet mee met de breedte.
 */
export const SIZE_LIMITS: Record<string, SizeBox> = {
  "vast-raam": { minWidth: 600, maxWidth: 3350, minHeight: 600, maxHeight: 3350, maxAreaM2: 3.35 },
  draairaam: { minWidth: 600, maxWidth: 1512, minHeight: 600, maxHeight: 2600, maxSashWidth: 1512 },
  draaikiepraam: { minWidth: 600, maxWidth: 1512, minHeight: 600, maxHeight: 2600, maxSashWidth: 1512 },
  "draaikiepraam-met-vast-raam": { minWidth: 770, maxWidth: 2500, minHeight: 600, maxHeight: 2200, maxSashWidth: 1512 },
  "vast-draaikiep-vast": { minWidth: 1290, maxWidth: 3000, minHeight: 600, maxHeight: 2200, maxSashWidth: 1512 },
  "draaikiep-vast-draaikiep": { minWidth: 1290, maxWidth: 3300, minHeight: 600, maxHeight: 2200, maxSashWidth: 1512 },
  stolpraam: { minWidth: 1166, maxWidth: 2926, minHeight: 968, maxHeight: 2284, maxSashWidth: 1512 },
  "schuifpui-2-delig": { minWidth: 1600, maxWidth: 4000, minHeight: 1142, maxHeight: 2400 },
  "schuifpui-4-delig": { minWidth: 2000, maxWidth: 6000, minHeight: 1142, maxHeight: 2400 },
  achterdeur: { minWidth: 722, maxWidth: 1200, minHeight: 1849, maxHeight: 2500 },
  "dubbele-achterdeur": { minWidth: 1272, maxWidth: 2312, minHeight: 1849, maxHeight: 2500 },
  tuindeur: { minWidth: 722, maxWidth: 1200, minHeight: 1849, maxHeight: 2772 },
  "openslaande-tuindeuren": { minWidth: 1272, maxWidth: 2312, minHeight: 1960, maxHeight: 2774 },
};

/** Snelle keuzes, akkoord naast de AP-lijst. TODO(leverancier): foliecodes en de volledige AP-lijst. */
export const FRAME_COLORS = [
  { id: "9016", name: "Wit", code: "RAL 9016", hex: "#F4F4F1", foilCode: null as string | null },
  { id: "9001", name: "Crème", code: "RAL 9001", hex: "#E7DDC8", foilCode: null },
  { id: "9016-nerf", name: "Wit houtnerf", code: "RAL 9016 nerf", hex: "#E6E0D6", foilCode: null },
  { id: "7016", name: "Antraciet", code: "RAL 7016", hex: "#383E42", foilCode: null },
  { id: "7016-nerf", name: "Antraciet houtnerf", code: "RAL 7016 nerf", hex: "#3A3E3C", foilCode: null },
  { id: "9005", name: "Zwart", code: "RAL 9005", hex: "#1C1C1C", foilCode: null },
  { id: "7021", name: "Zwartgrijs", code: "RAL 7021", hex: "#2F3234", foilCode: null },
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

export function sizeBox(slug: string): SizeBox {
  return SIZE_LIMITS[slug] ?? SIZE_LIMITS["draaikiepraam"];
}
