/**
 * EKO NL Profiel. Eén profiel, leverancier EKO.
 * Onbevestigde cijfers blijven null en worden niet op de site getoond.
 * Maatgrenzen zijn voorlopige online aanvraaggrenzen, geen fabriekscertificaat.
 */

export const PROFILE = {
  id: "eko-nl",
  name: "EKO NL Profiel",
  supplier: "EKO",
  /** TODO(EKO): publieke leverancierspagina. Nog niet als bron op de site gebruiken. */
  supplierSite: "https://eko4u.com",
  /** TODO(EKO): exacte systeemnaam. */
  systemName: null as string | null,
  /** TODO(EKO): Uw van het complete raam bij HR++, in W/m²K. */
  uwHrpp: null as number | null,
  /** TODO(EKO): Uw van het complete raam bij triple, in W/m²K. */
  uwTriple: null as number | null,
  /** TODO(EKO): Ug van het glas, HR++ en triple apart. */
  ugHrpp: null as number | null,
  ugTriple: null as number | null,
  /** TODO(EKO): aantal kamers in het profiel. */
  chambers: null as number | null,
  /** TODO(EKO): inbouwdiepte in mm. */
  depthMm: null as number | null,
  /** TODO(EKO): sponning en maximale glasdikte in mm. */
  rebateMm: null as number | null,
  glassThicknessMm: null as string | null,
  /** TODO(EKO): alleen vullen als KOMO, SKG of PKVW voor dit NL-profiel gelden. */
  certificates: [] as string[],
  /** TODO(EKO): productietijd in werkdagen, en de extra dagen per folie. */
  leadTimeWorkdays: null as number | null,
  colorExtraWorkdays: null as number | null,
  /** TODO(EKO): garantie in jaren, per onderdeel. */
  warranty: null as {
    profileYears: number;
    glassYears: number;
    hardwareYears: number;
  } | null,
  /** TODO(EKO): of HVL-hoekverbinding leverbaar is, en of vlak/verdiept een keuze is. */
  cornerVariants: [] as string[],
} as const;

export type SizeBox = {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
};

/**
 * Veilige defaults om een aanvraag te begrenzen.
 * TODO(EKO): vervangen door de productietabel. De max hoogte kan daar
 * meelopen met de breedte. Die koppeling verzinnen we niet.
 * Herkomst van de getallen: openbare categoriegrenzen van vergelijkbare
 * indelingen, afgerond naar een band waarin een offerte nog zinvol is.
 */
export const SIZE_LIMITS: Record<string, SizeBox> = {
  "vast-raam": { minWidth: 400, maxWidth: 2400, minHeight: 400, maxHeight: 2400 },
  draairaam: { minWidth: 602, maxWidth: 1384, minHeight: 614, maxHeight: 2600 },
  draaikiepraam: { minWidth: 602, maxWidth: 1384, minHeight: 614, maxHeight: 2600 },
  "draaikiepraam-met-vast-raam": { minWidth: 770, maxWidth: 2500, minHeight: 600, maxHeight: 2200 },
  "vast-draaikiep-vast": { minWidth: 1290, maxWidth: 3000, minHeight: 600, maxHeight: 2200 },
  "draaikiep-vast-draaikiep": { minWidth: 1290, maxWidth: 3300, minHeight: 600, maxHeight: 2200 },
  stolpraam: { minWidth: 1166, maxWidth: 2926, minHeight: 968, maxHeight: 2284 },
  "schuifpui-2-delig": { minWidth: 1600, maxWidth: 4000, minHeight: 1142, maxHeight: 2400 },
  "schuifpui-4-delig": { minWidth: 2000, maxWidth: 6000, minHeight: 1142, maxHeight: 2400 },
  achterdeur: { minWidth: 722, maxWidth: 1200, minHeight: 1849, maxHeight: 2500 },
  "dubbele-achterdeur": { minWidth: 1272, maxWidth: 2312, minHeight: 1849, maxHeight: 2500 },
  tuindeur: { minWidth: 722, maxWidth: 1200, minHeight: 1849, maxHeight: 2772 },
  "openslaande-tuindeuren": { minWidth: 1272, maxWidth: 2312, minHeight: 1960, maxHeight: 2774 },
};

/** TODO(EKO): foliecodes. Dit is een voorlopige keuze, geen officiële kaart. */
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
  { id: "hrpp", label: "HR++", detail: "Standaard isolatieglas." },
  { id: "triple", label: "Triple", detail: "Een extra ruit. Of het profiel de dikte pakt, bevestigen we." },
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

export function colorById(id: string) {
  return FRAME_COLORS.find((color) => color.id === id) ?? FRAME_COLORS[0];
}

export function sizeBox(slug: string): SizeBox {
  return SIZE_LIMITS[slug] ?? SIZE_LIMITS["draaikiepraam"];
}
