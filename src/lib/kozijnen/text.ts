import { GLASS_TYPES, LAMINATED, LOW_GLASS, publicProfileName } from "./config";
import { getLayoutBySlug } from "./layouts";
import { colorLabel, panesFor, sizeInRange, type KozijnConfig } from "./model";
import { openingPhrase } from "./opening";

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
const VENT: Record<string, string> = {
  geen: "geen rooster",
  rooster: "ventilatierooster",
  duco: "Duco-klep",
};
const SPACER: Record<string, string> = {
  standaard: "standaard, alu of grijs",
  zwart: "zwart, warm edge",
};
const HANDLE_COLOR: Record<string, string> = {
  wit: "wit",
  aluminium: "aluminium (F9)",
  zwart: "zwart",
};
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
    { label: "Profiel", value: publicProfileName(config.layout) },
    { label: "Indeling", value: title },
    { label: "Opening", value: layout ? vakken(layout, config) : title },
    { label: "Buitenwerk", value: `${config.width} × ${config.height} mm` },
    { label: "Maat", value: inRange ? "binnen de online grenzen" : "buiten de online grenzen, handmatig beoordelen" },
  ];
  if (layout?.chooseSide) lines.push({ label: "Scharnierzijde", value: `${SIDE[config.side]}, van buiten gezien` });
  if (layout?.chooseDirection) lines.push({ label: "Draairichting", value: DIRECTION[config.direction] });
  if (layout?.chooseActive) lines.push({ label: "Actief deel", value: SIDE[config.active] });
  if (layout && layout.fillings.length) lines.push({ label: "Vulling", value: FILLING[config.filling] });
  lines.push(
    { label: "Kozijn buiten", value: paint(config.frameOut, config) },
    { label: "Kozijn binnen", value: paint(config.frameIn, config) },
  );
  if (layout && panesFor(layout, config).some((pane) => pane.kind !== "vast")) {
    lines.push(
      { label: "Vleugel buiten", value: paint(config.sashOut, config) },
      { label: "Vleugel binnen", value: paint(config.sashIn, config) },
    );
  }
  lines.push(
    { label: "Glas", value: glass },
    { label: "Gelaagd", value: laminated },
    { label: "Onderkant glas", value: low },
    { label: "Afstandhouder", value: SPACER[config.spacer] },
    { label: "Ventilatie", value: VENT[config.vent] },
    { label: "Aanslag", value: REBATE[config.rebate] },
    { label: "Onderdorpel", value: SILL[config.sill] },
    { label: "Hoek", value: CORNER[config.corner] ?? config.corner },
    { label: "Beslag", value: HARDWARE[config.hardware] },
    { label: "Kruk", value: HANDLE[config.handle] },
    { label: "Krukkleur", value: HANDLE_COLOR[config.handleColor] },
    { label: "Hor", value: SCREEN[config.screen] },
  );
  return lines;
}

function paint(id: string, config: KozijnConfig) {
  if (id !== "ral") return colorLabel(id);
  const code = config.ralCode.trim();
  return code ? `RAL naar keuze, op aanvraag (${code})` : "RAL naar keuze, op aanvraag";
}

function vakken(layout: NonNullable<ReturnType<typeof getLayoutBySlug>>, config: KozijnConfig) {
  const panes = panesFor(layout, config);
  return panes
    .map((pane, index) => {
      const place = panes.length === 1 ? "Het vak" : `Vak ${index + 1} ${seat(index, panes.length)}`;
      return `${place}: ${openingPhrase(layout, config, pane.kind, index, panes.length)}`;
    })
    .join(". ");
}

function seat(index: number, count: number) {
  if (count === 4) return ["links", "links van het midden", "rechts van het midden", "rechts"][index] ?? "";
  if (index === 0) return "links";
  if (index === count - 1) return "rechts";
  return "midden";
}

export function summaryText(config: KozijnConfig) {
  return summaryLines(config)
    .map((line) => `${line.label}: ${line.value}`)
    .join("\n");
}
