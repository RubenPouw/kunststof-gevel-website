import { GLASS_TYPES, LAMINATED, LOW_GLASS, PROFILE } from "./config";
import { getLayoutBySlug } from "./layouts";
import { colorLabel, panesFor, sizeInRange, type KozijnConfig } from "./model";

const DIRECTION: Record<string, string> = {
  binnen: "naar binnen",
  buiten: "naar buiten",
};
const SIDE: Record<string, string> = { links: "links", rechts: "rechts" };
const FILLING: Record<string, string> = {
  paneel: "dicht paneel",
  half: "half glas",
  glas: "vol glas",
};
const VENT: Record<string, string> = { geen: "geen rooster", rooster: "zelfregulerend rooster" };
const SILL: Record<string, string> = { doorlopend: "doorlopend kunststof", laag: "lage dorpel" };
const REBATE: Record<string, string> = { stomp: "stomp", aanslag: "met aanslag" };
const HARDWARE: Record<string, string> = {
  basis: "basisbeslag",
  zwaar: "zwaarder beslag",
};
const CORNER: Record<string, string> = {
  verstek: "verstek, naad schuin over de hoek",
  hvl: "HVL, naad recht",
};
const HANDLE: Record<string, string> = { standaard: "standaard kruk", afsluitbaar: "afsluitbare kruk" };
const SCREEN: Record<string, string> = { geen: "geen hor", inzet: "inzethor", plisse: "plisséhor" };

export type SummaryLine = { label: string; value: string };

export function summaryLines(config: KozijnConfig): SummaryLine[] {
  const layout = getLayoutBySlug(config.layout);
  const title = layout?.title ?? config.layout;
  const inRange = layout ? sizeInRange(layout, config.width, config.height) : false;
  const glass = GLASS_TYPES.find((item) => item.id === config.glass)?.label ?? config.glass;
  const laminated = LAMINATED.find((item) => item.id === config.laminated)?.label ?? config.laminated;
  const low = LOW_GLASS.find((item) => item.id === config.lowGlass)?.label ?? config.lowGlass;
  const lines: SummaryLine[] = [
    { label: "Profiel", value: PROFILE.name },
    { label: "Indeling", value: title },
    { label: "Breedte", value: `${config.width} mm, buitenwerks` },
    { label: "Hoogte", value: `${config.height} mm, buitenwerks` },
    { label: "Maat", value: inRange ? "binnen de online grenzen" : "buiten de online grenzen, handmatig beoordelen" },
  ];
  if (layout?.chooseSide) lines.push({ label: "Scharnierzijde", value: `${SIDE[config.side]}, van buiten gezien` });
  if (layout?.chooseDirection) lines.push({ label: "Draairichting", value: DIRECTION[config.direction] });
  if (layout?.chooseActive) lines.push({ label: "Actief deel", value: SIDE[config.active] });
  if (layout && layout.fillings.length) lines.push({ label: "Vulling", value: FILLING[config.filling] });
  lines.push(
    { label: "Kozijn buiten", value: colorLabel(config.frameOut) },
    { label: "Kozijn binnen", value: colorLabel(config.frameIn) },
  );
  if (layout && panesFor(layout, config).some((pane) => pane.kind !== "vast")) {
    lines.push(
      { label: "Vleugel buiten", value: colorLabel(config.sashOut) },
      { label: "Vleugel binnen", value: colorLabel(config.sashIn) },
    );
  }
  lines.push(
    { label: "Glas", value: glass },
    { label: "Gelaagd", value: laminated },
    { label: "Onderkant glas", value: low },
    { label: "Ventilatie", value: VENT[config.vent] },
    { label: "Aanslag", value: REBATE[config.rebate] },
    { label: "Onderdorpel", value: SILL[config.sill] },
    { label: "Hoek", value: CORNER[config.corner] ?? config.corner },
    { label: "Beslag", value: HARDWARE[config.hardware] },
    { label: "Kruk", value: HANDLE[config.handle] },
    { label: "Hor", value: SCREEN[config.screen] },
  );
  return lines;
}

export function summaryText(config: KozijnConfig) {
  return summaryLines(config)
    .map((line) => `${line.label}: ${line.value}`)
    .join("\n");
}
