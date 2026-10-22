import {
  colorById,
  CORNERS,
  FRAME_COLORS,
  GLASS_TYPES,
  LAMINATED,
  LOW_GLASS,
  type ColorId,
  type CornerId,
  type GlassId,
  type LaminatedId,
  type LowGlassId,
} from "./config";
import { getLayoutBySlug, type Layout } from "./layouts";

export const KOZIJN_STORAGE_KEY = "kg-kozijn-concept";

export type Side = "links" | "rechts";
export type Direction = "binnen" | "buiten";
export type Filling = "paneel" | "half" | "glas";
export type Vent = "geen" | "rooster";
export type Sill = "doorlopend" | "laag";
export type Rebate = "stomp" | "aanslag";
export type Hardware = "basis" | "zwaar";
export type Handle = "standaard" | "afsluitbaar";
export type Screen = "geen" | "inzet" | "plisse";

export type StepId =
  | "maten"
  | "indeling"
  | "hoek"
  | "kleur"
  | "glas"
  | "ventilatie"
  | "dorpel"
  | "beslag"
  | "extra"
  | "overzicht";

export const STEPS: { id: StepId; label: string; article: string; hint: string }[] = [
  {
    id: "maten",
    label: "Maten",
    article: "hoe-moet-je-meten",
    hint: "Buitenwerks, in millimeters. Drie keer meten, de kleinste aanhouden.",
  },
  {
    id: "indeling",
    label: "Indeling",
    article: "draairichting-en-aanslag",
    hint: "U staat buiten, met het gezicht naar de gevel. Links is dan links.",
  },
  {
    id: "hoek",
    label: "Hoek",
    article: "profielen-en-kleuren#hoekuitvoering",
    hint: "Verstek of HVL. De naad ziet u in de tekening.",
  },
  {
    id: "kleur",
    label: "Kleur",
    article: "profielen-en-kleuren",
    hint: "Binnen en buiten, kozijn en vleugel apart.",
  },
  {
    id: "glas",
    label: "Glas",
    article: "glas",
    hint: "Laag glas zetten we standaard gelaagd.",
  },
  {
    id: "ventilatie",
    label: "Ventilatie",
    article: "ventilatie",
    hint: "Een rooster in het kozijn, of geen.",
  },
  {
    id: "dorpel",
    label: "Dorpel",
    article: "draairichting-en-aanslag",
    hint: "Stomp of met aanslag, en de onderdorpel.",
  },
  {
    id: "beslag",
    label: "Beslag",
    article: "hang-en-sluitwerk",
    hint: "Standaard het zwaardere hang- en sluitwerk.",
  },
  {
    id: "extra",
    label: "Extra",
    article: "montage",
    hint: "Horren. Montage vraagt u apart.",
  },
  {
    id: "overzicht",
    label: "Overzicht",
    article: "levertijd-en-garantie",
    hint: "Deel de link of vraag de offerte aan.",
  },
];

export type KozijnConfig = {
  layout: string;
  width: number;
  height: number;
  side: Side;
  direction: Direction;
  active: Side;
  filling: Filling;
  lowGlass: LowGlassId;
  frameOut: ColorId;
  frameIn: ColorId;
  sashOut: ColorId;
  sashIn: ColorId;
  glass: GlassId;
  laminated: LaminatedId;
  laminatedTouched: boolean;
  vent: Vent;
  sill: Sill;
  rebate: Rebate;
  hardware: Hardware;
  handle: Handle;
  screen: Screen;
  corner: CornerId;
  step: StepId;
};

const SIDES = new Set<Side>(["links", "rechts"]);
const DIRECTIONS = new Set<Direction>(["binnen", "buiten"]);
const FILLINGS = new Set<Filling>(["paneel", "half", "glas"]);
const VENTS = new Set<Vent>(["geen", "rooster"]);
const SILLS = new Set<Sill>(["doorlopend", "laag"]);
const REBATES = new Set<Rebate>(["stomp", "aanslag"]);
const HARDWARE = new Set<Hardware>(["basis", "zwaar"]);
const CORNER_IDS = new Set(CORNERS.map((item) => item.id));
const HANDLES = new Set<Handle>(["standaard", "afsluitbaar"]);
const SCREENS = new Set<Screen>(["geen", "inzet", "plisse"]);
const COLOR_IDS = new Set(FRAME_COLORS.map((color) => color.id));
const GLASS_IDS = new Set(GLASS_TYPES.map((item) => item.id));
const LAMINATED_IDS = new Set(LAMINATED.map((item) => item.id));
const LOW_IDS = new Set(LOW_GLASS.map((item) => item.id));
const STEP_IDS = new Set(STEPS.map((step) => step.id));

function oneOf<T extends string>(value: string | null, allowed: Set<T>, fallback: T): T {
  if (value && allowed.has(value as T)) return value as T;
  return fallback;
}

function colorOf(value: string | null, fallback: ColorId): ColorId {
  if (value && COLOR_IDS.has(value as ColorId)) return value as ColorId;
  return fallback;
}

function intOf(value: string | null, fallback: number) {
  if (!value) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(n);
}

export function defaultLaminated(layout: Layout, lowGlass: LowGlassId): LaminatedId {
  if (layout.group === "deuren" || layout.group === "schuifpuien") return "beide";
  if (lowGlass === "ja") return "binnen";
  return "geen";
}

export function defaultConfig(layout: Layout): KozijnConfig {
  const lowGlass: LowGlassId = layout.group === "ramen" ? "nee" : "ja";
  return {
    layout: layout.slug,
    width: layout.defaultWidth,
    height: layout.defaultHeight,
    side: "rechts",
    direction: layout.defaultDirection,
    active: "rechts",
    filling: layout.fillings[0] ?? "glas",
    lowGlass,
    frameOut: "9016",
    frameIn: "9016",
    sashOut: "9016",
    sashIn: "9016",
    glass: "hrpp",
    laminated: defaultLaminated(layout, lowGlass),
    laminatedTouched: false,
    vent: "geen",
    sill: layout.group === "ramen" ? "doorlopend" : "laag",
    rebate: "stomp",
    hardware: "zwaar",
    handle: "standaard",
    screen: "geen",
    corner: "verstek",
    step: STEPS[0].id,
  };
}

export function sizeInRange(layout: Layout, width: number, height: number) {
  const box = layout.limits;
  return width >= box.minWidth && width <= box.maxWidth && height >= box.minHeight && height <= box.maxHeight;
}

export function applyLaminatedDefault(config: KozijnConfig, layout: Layout): KozijnConfig {
  if (config.laminatedTouched) return config;
  return { ...config, laminated: defaultLaminated(layout, config.lowGlass) };
}

export function parseConfig(params: URLSearchParams, layout: Layout): KozijnConfig {
  const base = defaultConfig(layout);
  const laminatedTouched = params.get("gelvast") === "1";
  const next: KozijnConfig = {
    ...base,
    width: intOf(params.get("b"), base.width),
    height: intOf(params.get("h"), base.height),
    side: oneOf(params.get("zijde"), SIDES, base.side),
    direction: oneOf(params.get("draai"), DIRECTIONS, base.direction),
    active: oneOf(params.get("actief"), SIDES, base.active),
    filling: oneOf(params.get("vulling"), FILLINGS, base.filling),
    lowGlass: oneOf(params.get("onder"), LOW_IDS, base.lowGlass),
    frameOut: colorOf(params.get("kb"), base.frameOut),
    frameIn: colorOf(params.get("ki"), base.frameIn),
    sashOut: colorOf(params.get("vb"), base.sashOut),
    sashIn: colorOf(params.get("vi"), base.sashIn),
    glass: oneOf(params.get("glas"), GLASS_IDS, base.glass),
    laminated: oneOf(params.get("gel"), LAMINATED_IDS, base.laminated),
    laminatedTouched,
    vent: oneOf(params.get("vent"), VENTS, base.vent),
    sill: oneOf(params.get("dorpel"), SILLS, base.sill),
    rebate: oneOf(params.get("aanslag"), REBATES, base.rebate),
    hardware: oneOf(params.get("beslag"), HARDWARE, base.hardware),
    handle: oneOf(params.get("kruk"), HANDLES, base.handle),
    screen: oneOf(params.get("hor"), SCREENS, base.screen),
    corner: oneOf(params.get("hoek"), CORNER_IDS, base.corner),
    step: oneOf(params.get("stap"), STEP_IDS, STEPS[0].id),
  };
  if (!laminatedTouched) next.laminated = defaultLaminated(layout, next.lowGlass);
  if (!layout.fillings.includes(next.filling)) next.filling = base.filling;
  if (!layout.chooseDirection) next.direction = layout.defaultDirection;
  return next;
}

export function hasConfigParams(params: URLSearchParams) {
  return ["b", "h", "stap", "kb", "glas"].some((key) => params.has(key));
}

export function serializeConfig(config: KozijnConfig) {
  const params = new URLSearchParams();
  params.set("b", String(config.width));
  params.set("h", String(config.height));
  params.set("zijde", config.side);
  params.set("draai", config.direction);
  params.set("actief", config.active);
  params.set("vulling", config.filling);
  params.set("onder", config.lowGlass);
  params.set("kb", config.frameOut);
  params.set("ki", config.frameIn);
  params.set("vb", config.sashOut);
  params.set("vi", config.sashIn);
  params.set("glas", config.glass);
  params.set("gel", config.laminated);
  if (config.laminatedTouched) params.set("gelvast", "1");
  params.set("vent", config.vent);
  params.set("dorpel", config.sill);
  params.set("aanslag", config.rebate);
  params.set("beslag", config.hardware);
  params.set("kruk", config.handle);
  params.set("hor", config.screen);
  params.set("hoek", config.corner);
  params.set("stap", config.step);
  return params.toString();
}

export function configFromUnknown(value: unknown): KozijnConfig | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const layout = getLayoutBySlug(String(raw.layout ?? ""));
  if (!layout) return null;
  const params = new URLSearchParams();
  for (const [key, item] of Object.entries(raw)) {
    if (item == null) continue;
    params.set(key, String(item));
  }
  if (typeof raw.width === "number") params.set("b", String(raw.width));
  if (typeof raw.height === "number") params.set("h", String(raw.height));
  return parseConfig(params, layout);
}

export function panesFor(layout: Layout, config: KozijnConfig) {
  const panes = layout.panes.map((pane) => ({ ...pane }));
  if (layout.slug === "draaikiepraam-met-vast-raam") {
    const open = panes.find((pane) => pane.kind !== "vast");
    const fixed = panes.find((pane) => pane.kind === "vast");
    if (open && fixed) {
      return config.side === "links" ? [open, fixed] : [fixed, open];
    }
  }
  if (layout.slug === "schuifpui-2-delig") {
    const slide = { kind: "schuif" as const, flex: 1 };
    const fixed = { kind: "vast" as const, flex: 1 };
    return config.active === "links" ? [slide, fixed] : [fixed, slide];
  }
  if (layout.slug === "schuifpui-4-delig" && config.active === "links") {
    return [
      { kind: "schuif" as const, flex: 1 },
      { kind: "schuif" as const, flex: 1 },
      { kind: "vast" as const, flex: 1 },
      { kind: "vast" as const, flex: 1 },
    ];
  }
  return panes;
}

/** Het herstelblok hoort alleen op de eerste stap, zolang de bezoeker het niet sluit. */
export function resumeVisible(step: StepId, pending: boolean) {
  return pending && step === STEPS[0].id;
}

export function colorLabel(id: string) {
  const color = colorById(id);
  return `${color.name} (${color.code})`;
}
