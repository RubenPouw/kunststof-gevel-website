import { PROFILE, publicProfileName } from "./config";
import { getLayoutBySlug } from "./layouts";
import { colorLabel, panesFor, serializeConfig, type KozijnConfig } from "./model";
import { summaryLines } from "./text";

/** Sleutel zonder de open stap, zodat dezelfde samenstelling één winkelwagenregel blijft. */
export function kozijnConfigQuery(config: KozijnConfig) {
  const params = new URLSearchParams(serializeConfig(config));
  params.delete("stap");
  return params.toString();
}

export function kozijnLineSku(layout: string, query: string) {
  return `kozijn:${layout}:${query}`;
}

export function describeKozijn(config: KozijnConfig) {
  const layout = getLayoutBySlug(config.layout);
  const title = layout?.title ?? "Kunststof kozijn";
  const size = `${config.width} × ${config.height} mm`;
  const lines = summaryLines(config);
  const value = (label: string) => lines.find((line) => line.label === label)?.value ?? "";
  const color = colourPhrase(config);
  const options = [
    value("Glas"),
    value("Gelaagd") === "Niet gelaagd" ? "" : value("Gelaagd"),
    value("Ventilatie"),
    value("Afstandhouder"),
    value("Kruk"),
    value("Krukkleur") === "wit" ? "" : value("Krukkleur") ? `kruk ${value("Krukkleur")}` : "",
    value("Hoek"),
    value("Beslag"),
    value("Onderdorpel"),
    value("Aanslag") === "stomp" ? "" : value("Aanslag"),
    value("Hor") === "geen hor" ? "" : value("Hor"),
  ]
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
  return {
    title,
    size,
    color,
    options,
    lead: `${PROFILE.leadTimeWeeks} weken`,
    profile: publicProfileName(config.layout),
  };
}

export function kozijnProperties(config: KozijnConfig) {
  const described = describeKozijn(config);
  return [
    { name: "Type", value: described.title },
    { name: "Buitenwerk", value: described.size },
    { name: "Kleur", value: described.color },
    { name: "Opties", value: described.options },
    { name: "Levertijd", value: described.lead },
  ];
}

/** Weergave in de lokale winkelwagen. `totalExcl` is alleen het getoonde bedrag. Afrekenen rekent opnieuw. */
export function kozijnCartLine(config: KozijnConfig, totalExcl: number) {
  const query = kozijnConfigQuery(config);
  const described = describeKozijn(config);
  return {
    productSlug: "kozijn" as const,
    variantSku: kozijnLineSku(config.layout, query),
    qty: 1,
    name: described.title,
    brand: described.profile,
    colorName: described.color,
    price: totalExcl,
    kind: "kozijn" as const,
    skuLabel: `${described.size} · ${described.options}`,
    kozijnLayout: config.layout,
    kozijnQuery: query,
  };
}

function colourPhrase(config: KozijnConfig) {
  const frameOut = colorLabel(config.frameOut);
  const frameIn = colorLabel(config.frameIn);
  const frame = frameOut === frameIn ? frameOut : `buiten ${frameOut}, binnen ${frameIn}`;
  const layout = getLayoutBySlug(config.layout);
  const hasSash = layout ? panesFor(layout, config).some((pane) => pane.kind !== "vast") : false;
  if (!hasSash) return frame;
  const sashOut = colorLabel(config.sashOut);
  const sashIn = colorLabel(config.sashIn);
  if (sashOut === frameOut && sashIn === frameIn) return frame;
  const sash = sashOut === sashIn ? sashOut : `buiten ${sashOut}, binnen ${sashIn}`;
  return `${frame}, vleugel ${sash}`;
}
