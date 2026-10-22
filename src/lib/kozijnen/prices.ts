/**
 * Prijzen blijven op de server. De client importeert dit bestand niet.
 * De API geeft alleen het berekende verkoopbedrag terug, excl. en incl. btw.
 *
 * Inkoop is excl. btw. Verkoop excl. btw = inkoop × (1 + opslag / 100).
 * De standaardopslag is priceBook.marginPercent (80).
 * Een optie mag een eigen opslag hebben.
 * Het ventilatierooster en de Duco-klep gebruiken 50 procent.
 * De overige toeslagen volgen de standaard.
 * Incl. btw = verkoop excl. × 1,21.
 *
 * Meetpunt opties: één draaikiepraam, één vak, 1000×1200 mm, wit, HR++,
 * standaard afstandhouder, verstek, geen rooster. De gemeten inkoop van dat
 * raam is 253.54. De basisformule hieronder is de eerdere kromme en is op dit
 * meetpunt niet herijkt. Het bedrag op een optieregel is de gemeten netto
 * meerprijs op die maat. De mode rekent die om naar een andere maat.
 * Dit is één meetpunt. Meer prijspunten volgen.
 *
 * Schaal vanaf dat meetpunt:
 * - triple: per m² glas (glass_m2)
 * - zwarte afstandhouder: per m omtrek glas (glass_m)
 * - HVL: per vak. Een hoekverbinding is nog geen aparte maat (pane)
 * - Duco-klep: per m breedte (width_m)
 * - ventilatierooster: per stuk, uit een eerder meetpunt rond 1000 mm (piece)
 * - krukkleur en afsluitbare kruk: per vleugel (sash). Wit is 0
 * - crème in de massa en antraciet: per m omtrek van het kozijn (frame_m)
 * - RAL naar keuze: geen prijs. Er is geen lakprijs, alleen folie. Blijft op aanvraag
 *
 * Het glasoppervlak is de opening binnen het kadervooraanzicht van 64 mm, per vak.
 * De sponning van de vleugel en een tussenstijl zijn nog niet gemeten.
 * Bij een schuifpui hoort dat vooraanzicht niet bij dit profiel. Daar telt het vakvlak.
 * Antraciet en antraciet houtnerf delen dit ene antracietbedrag tot er een apart punt is.
 *
 * TODO(kalibratie): combinaties van twee of drie vakken zijn de som van de
 * vakformules. Een koppel- of middenstijl heeft nog geen nettobedrag.
 * TODO(kalibratie): een draairaam zonder kiep is niet apart gemeten en volgt
 * voorlopig de draaikiepformule.
 * TODO(kalibratie): de schuifpui is gemeten op hoogte 2100. Andere hoogtes
 * gebruiken dezelfde breedtelijn tot er een hoogteterm is.
 * TODO(kalibratie): gelaagd en zwaarder beslag zijn nog een vast bedrag van
 * één samenstelling. Het rooster schaalt nog niet met de breedte.
 */

import { frameFaceMm } from "./drawing";

export type PriceMode =
  | "fixed"
  | "per_m2"
  | "percent"
  | "glass_m2"
  | "glass_m"
  | "frame_m"
  | "width_m"
  | "pane"
  | "sash"
  | "piece";

export type PriceSlot = {
  id: string;
  label: string;
  mode: PriceMode;
  /**
   * Euro, exclusief btw, op de referentiemaat, tenzij mode percent is
   * (dan een percentage van de inkoopbasis) of per_m2 (dan euro per m² buitenwerk).
   * null = nog niet gevuld.
   */
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

function slot(
  id: string,
  label: string,
  mode: PriceMode,
  amount: number | null,
  options?: { marginPercent?: number },
): PriceSlot {
  return {
    id,
    label,
    mode,
    amount,
    ...(options?.marginPercent == null ? {} : { marginPercent: options.marginPercent }),
  };
}

/** De maat waarop de optiebedragen hieronder gemeten zijn. */
const OPTION_REFERENCE: PriceInput = {
  layout: "draaikiepraam",
  widthMm: 1000,
  heightMm: 1200,
  panes: [{ kind: "draaikiep", flex: 1 }],
  optionIds: [],
};

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
    slot("glas.triple", "Triple glas", "glass_m2", 19.37),
    slot("glas.gelaagd", "Gelaagd glas", "fixed", 53),
    slot("glas.gelaagd.extra", "Gelaagd aan de tweede zijde", "fixed", null),
    slot("kleur.creme", "Crème in de massa", "frame_m", 22.56),
    slot("kleur.antraciet.buiten", "Antraciet buiten", "frame_m", 43.02),
    slot("kleur.antraciet.binnen", "Antraciet binnen", "frame_m", 53.95),
    slot("kleur.antraciet.beide", "Antraciet twee zijden", "frame_m", 77.97),
    slot("kleur.ontbreekt", "Kleur op aanvraag", "fixed", null),
    slot("kleur.vleugel", "Afwijkende vleugelkleur", "fixed", null),
    slot("kleur.ral", "RAL naar keuze", "fixed", null),
    slot("ventilatie.rooster", "Ventilatierooster", "piece", 211, { marginPercent: 50 }),
    slot("ventilatie.duco", "Duco-klep", "width_m", 188.81, { marginPercent: 50 }),
    slot("afstandhouder.zwart", "Zwarte afstandhouder", "glass_m", 6.04),
    slot("kruk.aluminium", "Kruk aluminium", "sash", 0.51),
    slot("kruk.zwart", "Kruk zwart", "sash", 0.04),
    slot("dorpel.laag", "Lage dorpel", "fixed", null),
    slot("aanslag", "Aanslag", "fixed", null),
    slot("beslag.zwaar", "Zwaarder beslag", "fixed", 61.49),
    slot("hoek.hvl", "HVL-hoek", "pane", 49.04),
    slot("kruk.afsluitbaar", "Afsluitbare kruk", "sash", 4.24),
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
    const extra = extraPurchase(option, input, purchase);
    if (extra == null) return { pricesActive: false };
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

/** Netto meerprijs van één optie op deze maat. Ook als de optie nog niet verkocht wordt. */
export function optionNet(id: string, input: PriceInput, book: PriceBook = priceBook): number | null {
  const option = book.options.find((item) => item.id === id);
  if (!option) return null;
  const purchase = unitPurchase(input, book) ?? 0;
  return extraPurchase(option, input, purchase);
}

function extraPurchase(option: PriceSlot, input: PriceInput, purchase: number): number | null {
  if (option.amount == null) return null;
  const measured = option.amount;
  if (option.mode === "percent") return (purchase * measured) / 100;
  if (option.mode === "per_m2") return measured * ((input.widthMm * input.heightMm) / 1_000_000);
  if (option.mode === "fixed" || option.mode === "piece") return measured;
  if (option.mode === "width_m") return measured * (input.widthMm / OPTION_REFERENCE.widthMm);
  if (option.mode === "frame_m") {
    const ref = framePerimeterM(OPTION_REFERENCE);
    if (ref === 0) return null;
    return measured * (framePerimeterM(input) / ref);
  }
  if (option.mode === "pane") {
    if (input.panes.length === 0 || OPTION_REFERENCE.panes.length === 0) return null;
    return measured * (input.panes.length / OPTION_REFERENCE.panes.length);
  }
  if (option.mode === "sash") {
    const ref = sashCount(OPTION_REFERENCE);
    if (ref === 0) return null;
    return measured * (sashCount(input) / ref);
  }
  if (option.mode !== "glass_m2" && option.mode !== "glass_m") return null;
  const now = option.mode === "glass_m2" ? glassAreaM2(input) : glassPerimeterM(input);
  const ref = option.mode === "glass_m2" ? glassAreaM2(OPTION_REFERENCE) : glassPerimeterM(OPTION_REFERENCE);
  if (now == null || ref == null || ref === 0) return null;
  return measured * (now / ref);
}

function sashCount(input: PriceInput) {
  return input.panes.filter((pane) => pane.kind !== "vast").length;
}

function framePerimeterM(input: PriceInput) {
  return (2 * (input.widthMm + input.heightMm)) / 1000;
}

function glassSpans(input: PriceInput) {
  const flex = input.panes.reduce((sum, pane) => sum + pane.flex, 0);
  if (flex <= 0 || input.panes.length === 0) return null;
  const face = frameFaceMm(input.layout) ?? 0;
  const spans: { widthMm: number; heightMm: number }[] = [];
  for (const pane of input.panes) {
    const widthMm = (input.widthMm * pane.flex) / flex - 2 * face;
    const heightMm = input.heightMm - 2 * face;
    if (!(widthMm > 0 && heightMm > 0)) return null;
    spans.push({ widthMm, heightMm });
  }
  return spans;
}

function glassAreaM2(input: PriceInput) {
  const spans = glassSpans(input);
  if (!spans) return null;
  return spans.reduce((sum, span) => sum + (span.widthMm / 1000) * (span.heightMm / 1000), 0);
}

function glassPerimeterM(input: PriceInput) {
  const spans = glassSpans(input);
  if (!spans) return null;
  return spans.reduce((sum, span) => sum + (2 * (span.widthMm + span.heightMm)) / 1000, 0);
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
  spacer: string;
  sill: string;
  rebate: string;
  hardware: string;
  handle: string;
  handleColor: string;
  screen: string;
  corner: string;
  hasSash: boolean;
}) {
  const ids: string[] = [];
  if (config.glass === "triple") ids.push("glas.triple");
  if (config.laminated === "binnen" || config.laminated === "beide") ids.push("glas.gelaagd");
  if (config.laminated === "beide") ids.push("glas.gelaagd.extra");
  const surfaces = [config.frameOut, config.frameIn, config.sashOut, config.sashIn];
  if (surfaces.includes("ral")) ids.push("kleur.ral");
  else {
    const frame = frameColourOption(config.frameOut, config.frameIn);
    if (frame) ids.push(frame);
    if (config.hasSash && (config.sashOut !== config.frameOut || config.sashIn !== config.frameIn)) ids.push("kleur.vleugel");
  }
  if (config.vent === "rooster") ids.push("ventilatie.rooster");
  if (config.vent === "duco") ids.push("ventilatie.duco");
  if (config.spacer === "zwart") ids.push("afstandhouder.zwart");
  if (config.sill === "laag") ids.push("dorpel.laag");
  if (config.rebate === "aanslag") ids.push("aanslag");
  if (config.hardware === "zwaar") ids.push("beslag.zwaar");
  if (config.corner === "hvl") ids.push("hoek.hvl");
  if (config.handle === "afsluitbaar") ids.push("kruk.afsluitbaar");
  if (config.handleColor === "aluminium") ids.push("kruk.aluminium");
  if (config.handleColor === "zwart") ids.push("kruk.zwart");
  if (config.screen === "inzet") ids.push("hor.inzet");
  if (config.screen === "plisse") ids.push("hor.plisse");
  return ids;
}

function anthracite(id: string) {
  return id === "7016" || id === "7016-nerf";
}

/** Kleurtoeslag van het kader. Een ongemeten combinatie blijft een offerte. */
function frameColourOption(out: string, inn: string) {
  if (out === "9016" && inn === "9016") return null;
  if (out === "9001" && inn === "9001") return "kleur.creme";
  if (anthracite(out) && anthracite(inn)) return "kleur.antraciet.beide";
  if (anthracite(out) && inn === "9016") return "kleur.antraciet.buiten";
  if (out === "9016" && anthracite(inn)) return "kleur.antraciet.binnen";
  return "kleur.ontbreekt";
}
