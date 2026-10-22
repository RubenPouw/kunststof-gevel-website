/**
 * Prijzen blijven op de server. De client importeert dit bestand niet.
 * De API geeft alleen het berekende verkoopbedrag terug, excl. en incl. btw.
 *
 * Inkoop is excl. btw. Verkoop excl. btw = inkoop × (1 + opslag / 100).
 * De standaardopslag is priceBook.marginPercent (80).
 * Een optie mag een eigen opslag hebben. In dit boek volgt elke toeslag de standaard.
 * Incl. btw = verkoop excl. × 1,21.
 *
 * TODO(kalibratie): combinaties van twee of drie vakken zijn de som van de
 * vakformules. Een koppel- of middenstijl heeft nog geen nettobedrag.
 * TODO(kalibratie): een draairaam zonder kiep is niet apart gemeten en volgt
 * voorlopig de draaikiepformule.
 * TODO(kalibratie): de schuifpui is gemeten op hoogte 2100. Andere hoogtes
 * gebruiken dezelfde breedtelijn tot er een hoogteterm is.
 * TODO(kalibratie): folie, triple, gelaagd, zwaarder beslag, rooster en HVL
 * zijn vaste nettobedragen van één gemeten samenstelling. Ze schalen nog niet
 * met de maat. De HVL-toeslag is gemeten op 1000×1200.
 */

export type PriceMode = "fixed" | "per_m2" | "percent";

export type PriceSlot = {
  id: string;
  label: string;
  mode: PriceMode;
  /** Euro, exclusief btw, tenzij mode percent is (dan een percentage van de inkoopbasis). null = nog niet gevuld. */
  amount: number | null;
  /**
   * Opslag in procenten op de inkoop van deze optie.
   * Ontbreekt dit, dan geldt priceBook.marginPercent.
   */
  marginPercent?: number;
};

export type FrameCurve = {
  base: number;
  perMeter: number;
  perM2: number;
};

export type LayoutPrice =
  | { mode: "rect"; curve: FrameCurve }
  | { mode: "perimeter"; curve: { base: number; perMeter: number } }
  | { mode: "width"; curve: { base: number; perMeterWidth: number } }
  | { mode: "panes" }
  | { mode: "quote" };

export type PricePane = {
  kind: "vast" | "draai" | "draaikiep" | "schuif" | "deur";
  flex: number;
};

export type PriceBook = {
  /**
   * Standaardopslag in procenten op de inkoop.
   * 80 betekent verkoop = inkoop × 1,80.
   * Een optie met een eigen marginPercent gaat daarvoor.
   */
  marginPercent: number;
  paneVast: FrameCurve;
  paneTurnTilt: FrameCurve;
  layouts: Record<string, LayoutPrice>;
  options: PriceSlot[];
};

const VAST: FrameCurve = { base: 38.54, perMeter: 14.52, perM2: 67.64 };
const TURN_TILT: FrameCurve = { base: 75.67, perMeter: 22.97, perM2: 66.27 };

function slot(id: string, label: string, mode: PriceMode, amount: number | null, marginPercent?: number): PriceSlot {
  return { id, label, mode, amount, ...(marginPercent == null ? {} : { marginPercent }) };
}

/** Productieboek. Standaardopslag 80. Bedragen zijn netto inkoop, excl. btw. */
export const priceBook: PriceBook = {
  marginPercent: 80,
  paneVast: VAST,
  paneTurnTilt: TURN_TILT,
  layouts: {
    "vast-raam": { mode: "rect", curve: VAST },
    draairaam: { mode: "rect", curve: TURN_TILT },
    draaikiepraam: { mode: "rect", curve: TURN_TILT },
    "draaikiepraam-met-vast-raam": { mode: "panes" },
    "vast-draaikiep-vast": { mode: "panes" },
    "draaikiep-vast-draaikiep": { mode: "panes" },
    stolpraam: { mode: "panes" },
    "schuifpui-2-delig": { mode: "width", curve: { base: 967.83, perMeterWidth: 283.77 } },
    "schuifpui-4-delig": { mode: "quote" },
    achterdeur: { mode: "quote" },
    "dubbele-achterdeur": { mode: "quote" },
    tuindeur: { mode: "perimeter", curve: { base: 139.81, perMeter: 111.61 } },
    "openslaande-tuindeuren": { mode: "quote" },
  },
  options: [
    slot("glas.triple", "Triple glas", "fixed", 34.31),
    slot("glas.gelaagd", "Gelaagd glas", "fixed", 53),
    slot("glas.gelaagd.extra", "Gelaagd aan de tweede zijde", "fixed", null),
    slot("kleur.buiten", "Folie kozijn buiten", "fixed", 43.02),
    slot("kleur.binnen", "Folie kozijn binnen", "fixed", null),
    slot("kleur.vleugel-buiten", "Folie vleugel buiten", "fixed", null),
    slot("kleur.vleugel-binnen", "Folie vleugel binnen", "fixed", null),
    slot("ventilatie.rooster", "Ventilatierooster", "fixed", 211.01),
    slot("dorpel.laag", "Lage dorpel", "fixed", null),
    slot("aanslag", "Aanslag", "fixed", null),
    slot("beslag.zwaar", "Zwaarder beslag", "fixed", 61.49),
    slot("hoek.hvl", "HVL-hoek", "fixed", 50.78),
    slot("kruk.afsluitbaar", "Afsluitbare kruk", "fixed", null),
    slot("hor.inzet", "Inzethor", "fixed", null),
    slot("hor.plisse", "Plisséhor", "fixed", null),
  ],
};

export type PriceInput = {
  layout: string;
  widthMm: number;
  heightMm: number;
  panes: PricePane[];
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

/** Wat de browser mag zien: het eindbedrag, zonder opbouw of inkoop. */
export function publicPrice(result: PriceResult) {
  if (!result.pricesActive) return { pricesActive: false as const };
  return { pricesActive: true as const, totalExcl: result.totalExcl, totalIncl: result.totalIncl };
}

/**
 * Percentages rekenen op de inkoop van het element, niet op elkaar.
 * Elke regel krijgt daarna zijn eigen opslag. De basis gebruikt de standaard.
 * Ontbreekt één gebruikt bedrag, of heeft het type geen formule, dan is er geen prijs.
 */
export function calculatePrice(input: PriceInput, book: PriceBook, active: boolean): PriceResult {
  if (!active) return { pricesActive: false };
  const purchase = unitPurchase(input, book);
  if (purchase == null) return { pricesActive: false };
  const lines: PriceLine[] = [{ id: "basis", label: "Basis", amountExcl: round2(purchase * factorFor(book.marginPercent)) }];
  let total = purchase * factorFor(book.marginPercent);
  for (const id of input.optionIds) {
    const option = book.options.find((item) => item.id === id);
    if (!option || option.amount == null) return { pricesActive: false };
    const extra =
      option.mode === "percent"
        ? (purchase * option.amount) / 100
        : option.mode === "per_m2"
          ? option.amount * ((input.widthMm * input.heightMm) / 1_000_000)
          : option.amount;
    const selling = extra * factorFor(option.marginPercent ?? book.marginPercent);
    total += selling;
    lines.push({ id, label: option.label, amountExcl: round2(selling) });
  }
  const totalExcl = round2(total);
  return {
    pricesActive: true,
    lines,
    totalExcl,
    totalIncl: round2(totalExcl * VAT),
  };
}

function unitPurchase(input: PriceInput, book: PriceBook) {
  if (!Number.isFinite(input.widthMm) || !Number.isFinite(input.heightMm) || input.widthMm <= 0 || input.heightMm <= 0) {
    return null;
  }
  const row = book.layouts[input.layout];
  if (!row || row.mode === "quote") return null;
  if (row.mode === "rect") return rectNet(row.curve, input.widthMm, input.heightMm);
  if (row.mode === "perimeter") {
    const width = input.widthMm / 1000;
    const height = input.heightMm / 1000;
    return row.curve.base + row.curve.perMeter * 2 * (width + height);
  }
  if (row.mode === "width") return row.curve.base + row.curve.perMeterWidth * (input.widthMm / 1000);
  return panesPurchase(input, book);
}

function panesPurchase(input: PriceInput, book: PriceBook) {
  const flex = input.panes.reduce((sum, pane) => sum + pane.flex, 0);
  if (flex <= 0) return null;
  let net = 0;
  for (const pane of input.panes) {
    const curve = pane.kind === "vast" ? book.paneVast : pane.kind === "draai" || pane.kind === "draaikiep" ? book.paneTurnTilt : null;
    if (!curve || pane.flex <= 0) return null;
    net += rectNet(curve, (input.widthMm * pane.flex) / flex, input.heightMm);
  }
  return net;
}

function rectNet(curve: FrameCurve, widthMm: number, heightMm: number) {
  const width = widthMm / 1000;
  const height = heightMm / 1000;
  return curve.base + curve.perMeter * 2 * (width + height) + curve.perM2 * width * height;
}

function factorFor(marginPercent: number) {
  return 1 + marginPercent / 100;
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
