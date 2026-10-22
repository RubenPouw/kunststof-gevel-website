/**
 * Prijzen blijven op de server. De client importeert dit bestand niet.
 * Inkoopbedragen zijn null tot de leverancier ze levert. Geen enkel bedrag verzinnen.
 *
 * Inkoop is excl. btw: basis plus toeslagen.
 * Verkoop excl. btw = inkoop × (1 + marginPercent / 100).
 * Bij 80 is dat × 1,80, ook over opties en toeslagen.
 * Incl. btw = verkoop excl. × 1,21.
 * Percentages van opties rekenen op de inkoopbasis, niet op elkaar.
 */

export type PriceMode = "fixed" | "per_m2" | "percent";

export type PriceSlot = {
  id: string;
  label: string;
  mode: PriceMode;
  /** Euro, exclusief btw. null = nog niet gevuld. */
  amount: number | null;
};

export type TypePrice = {
  /** Vaste basis, excl. btw. null = nog niet gevuld. */
  base: number | null;
  /** Euro per m², excl. btw. null = nog niet gevuld. */
  perM2: number | null;
};

export type PriceBook = {
  /**
   * Opslag in procenten op de hele inkoop (basis en opties).
   * 80 betekent verkoop = inkoop × 1,80.
   */
  marginPercent: number;
  types: Record<string, TypePrice>;
  options: PriceSlot[];
};

const TYPE_IDS = [
  "vast-raam",
  "draairaam",
  "draaikiepraam",
  "draaikiepraam-met-vast-raam",
  "vast-draaikiep-vast",
  "draaikiep-vast-draaikiep",
  "stolpraam",
  "schuifpui-2-delig",
  "schuifpui-4-delig",
  "achterdeur",
  "dubbele-achterdeur",
  "tuindeur",
  "openslaande-tuindeuren",
] as const;

function emptyTypes(): Record<string, TypePrice> {
  return Object.fromEntries(TYPE_IDS.map((id) => [id, { base: null, perM2: null }]));
}

function slot(id: string, label: string, mode: PriceMode): PriceSlot {
  return { id, label, mode, amount: null };
}

/** Productieboek. Opslag staat vast. Inkoopbedragen blijven null tot ze gevuld zijn. */
export const priceBook: PriceBook = {
  marginPercent: 80,
  types: emptyTypes(),
  options: [
    slot("glas.triple", "Triple glas", "per_m2"),
    slot("glas.gelaagd", "Gelaagd glas", "per_m2"),
    slot("glas.gelaagd.extra", "Gelaagd aan de tweede zijde", "per_m2"),
    slot("kleur.buiten", "Folie kozijn buiten", "percent"),
    slot("kleur.binnen", "Folie kozijn binnen", "percent"),
    slot("kleur.vleugel-buiten", "Folie vleugel buiten", "percent"),
    slot("kleur.vleugel-binnen", "Folie vleugel binnen", "percent"),
    slot("ventilatie.rooster", "Ventilatierooster", "fixed"),
    slot("dorpel.laag", "Lage dorpel", "fixed"),
    slot("aanslag", "Aanslag", "percent"),
    slot("beslag.zwaar", "Zwaarder beslag", "fixed"),
    slot("hoek.hvl", "HVL-hoek", "fixed"),
    slot("kruk.afsluitbaar", "Afsluitbare kruk", "fixed"),
    slot("hor.inzet", "Inzethor", "fixed"),
    slot("hor.plisse", "Plisséhor", "fixed"),
  ],
};

export type PriceInput = {
  layout: string;
  areaM2: number;
  optionIds: string[];
};

export type PriceLine = {
  id: string;
  label: string;
  amountExcl: number;
};

export type PriceResult =
  | { pricesActive: false }
  | { pricesActive: true; lines: PriceLine[]; totalExcl: number; totalIncl: number };

const VAT = 1.21;

export function pricesFlagActive(env: NodeJS.ProcessEnv = process.env) {
  return env.KOZIJNEN_PRIJZEN_ACTIEF === "true";
}

/**
 * Percentages rekenen op de basis (vast bedrag + m²), niet op elkaar.
 * Vaste bedragen en m²-toeslagen komen daarna. Marge als laatste.
 * Ontbreekt één gebruikt bedrag, dan is er geen prijs.
 */
export function calculatePrice(input: PriceInput, book: PriceBook, active: boolean): PriceResult {
  if (!active) return { pricesActive: false };
  const type = book.types[input.layout];
  if (!type || type.base == null || type.perM2 == null) {
    return { pricesActive: false };
  }
  const area = input.areaM2;
  if (!Number.isFinite(area) || area <= 0) return { pricesActive: false };
  const base = type.base + area * type.perM2;
  const purchase: PriceLine[] = [{ id: "basis", label: "Basis", amountExcl: base }];
  let extra = 0;
  for (const id of input.optionIds) {
    const option = book.options.find((item) => item.id === id);
    if (!option) return { pricesActive: false };
    if (option.amount == null) return { pricesActive: false };
    const amount =
      option.mode === "percent" ? (base * option.amount) / 100 : option.mode === "per_m2" ? option.amount * area : option.amount;
    extra += amount;
    purchase.push({ id, label: option.label, amountExcl: amount });
  }
  const factor = 1 + book.marginPercent / 100;
  const lines = purchase.map((line) => ({ ...line, amountExcl: round2(line.amountExcl * factor) }));
  const totalExcl = round2((base + extra) * factor);
  return {
    pricesActive: true,
    lines,
    totalExcl,
    totalIncl: round2(totalExcl * VAT),
  };
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function optionIdsFor(config: {
  layout: string;
  glass: string;
  laminated: string;
  frameOut: string;
  frameIn: string;
  sashOut: string;
  sashIn: string;
  vent: string;
  sill: string;
  rebate: string;
  hardware: string;
  handle: string;
  screen: string;
  corner: string;
  hasSash: boolean;
}) {
  const ids: string[] = [];
  if (config.glass === "triple") ids.push("glas.triple");
  if (config.laminated === "binnen" || config.laminated === "beide") ids.push("glas.gelaagd");
  if (config.laminated === "beide") ids.push("glas.gelaagd.extra");
  if (config.frameOut !== "9016") ids.push("kleur.buiten");
  if (config.frameIn !== "9016") ids.push("kleur.binnen");
  if (config.hasSash && config.sashOut !== config.frameOut) ids.push("kleur.vleugel-buiten");
  if (config.hasSash && config.sashIn !== config.frameIn) ids.push("kleur.vleugel-binnen");
  if (config.vent === "rooster") ids.push("ventilatie.rooster");
  if (config.sill === "laag") ids.push("dorpel.laag");
  if (config.rebate === "aanslag") ids.push("aanslag");
  if (config.hardware === "zwaar") ids.push("beslag.zwaar");
  if (config.corner === "hvl") ids.push("hoek.hvl");
  if (config.handle === "afsluitbaar") ids.push("kruk.afsluitbaar");
  if (config.screen === "inzet") ids.push("hor.inzet");
  if (config.screen === "plisse") ids.push("hor.plisse");
  return ids;
}
