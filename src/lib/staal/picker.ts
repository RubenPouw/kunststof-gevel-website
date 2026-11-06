import { colourParts, labelColour } from "@/lib/catalog/colours";
import type { SampleColor } from "@/lib/catalog/types";

import { isBlankSampleName, sampleLineLabel, tidySampleName } from "./labels";
import type { StaalNode, StaalTree } from "./tree";
import type { StaalLine } from "./validate";

export const STAAL_PICK_LIMIT = 4;

export type StaalSwatch = {
  id: string;
  path: string[];
  colorId: string;
  name: string;
  code?: string;
  lineLabel: string;
  hex?: string;
  productSlugs: string[];
};

export type StaalPickerGroup = {
  id: string;
  title: string;
  swatches: StaalSwatch[];
};

export type StaalPickerSection = {
  id: string;
  title: string;
  groups: StaalPickerGroup[];
};

function leaves(
  node: StaalNode,
  path: string[],
  labels: string[],
): { node: StaalNode; path: string[]; labels: string[] }[] {
  if (!node.children?.length) return [{ node, path, labels }];
  return node.children.flatMap((child) => leaves(child, [...path, child.id], [...labels, child.label]));
}

function swatchName(raw: string) {
  const tidy = tidySampleName(raw);
  if (!tidy || isBlankSampleName(tidy)) return null;
  const labeled = labelColour(tidy);
  const parts = colourParts(labeled);
  return { name: parts.name, code: parts.code, labeled };
}

export function staalPickerSections(tree: StaalTree): StaalPickerSection[] {
  const sections: StaalPickerSection[] = [];
  for (const group of tree.groups) {
    const groups: StaalPickerGroup[] = [];
    for (const leaf of leaves(group, [group.id], [group.label])) {
      const lineSource = leaf.labels.join(" ");
      const swatches: StaalSwatch[] = [];
      const usable = leaf.node.colors.flatMap((color) => {
        const parsed = swatchName(color.name);
        return parsed ? [{ color, parsed }] : [];
      });
      if (usable.length) {
        for (const { color, parsed } of usable) {
          swatches.push({
            id: `${leaf.path.join("/")}:${color.id}`,
            path: leaf.path,
            colorId: color.id,
            name: parsed.name,
            code: parsed.code,
            lineLabel: sampleLineLabel(parsed.labeled, lineSource),
            hex: color.hex,
            productSlugs: leaf.node.productSlugs,
          });
        }
      } else if (leaf.node.skipColor && leaf.node.productSlugs.length) {
        const parsed = swatchName(leaf.node.label);
        if (parsed) {
          swatches.push({
            id: `${leaf.path.join("/")}:product`,
            path: leaf.path,
            colorId: "",
            name: parsed.name,
            code: parsed.code,
            lineLabel: sampleLineLabel(parsed.labeled, group.label),
            productSlugs: leaf.node.productSlugs,
          });
        }
      }
      if (!swatches.length) continue;
      const title = leaf.labels.slice(1).join(" · ") || leaf.node.label;
      groups.push({ id: leaf.path.join("/"), title, swatches });
    }
    if (groups.length) sections.push({ id: group.id, title: group.label, groups });
  }
  return sections;
}

export function sampleFromStaal(swatch: StaalSwatch): SampleColor {
  return {
    id: swatch.id,
    brandSlug: swatch.lineLabel.toLowerCase().replace(/\s+/g, "-"),
    brandName: swatch.lineLabel,
    colorName: swatch.code ? `${swatch.name} (${swatch.code})` : swatch.name,
    hex: swatch.hex || "#C5C1B8",
    path: swatch.path,
    colorId: swatch.colorId,
    lineLabel: swatch.lineLabel,
    code: swatch.code,
    productSlugs: swatch.productSlugs,
  };
}

export function swatchFromSample(item: SampleColor): StaalSwatch {
  return {
    id: item.id,
    path: item.path ?? [],
    colorId: item.colorId ?? "",
    name: item.colorName,
    code: item.code,
    lineLabel: item.lineLabel || item.brandName,
    hex: item.hex,
    productSlugs: item.productSlugs ?? [],
  };
}

export function addStaalPick<T extends { id: string }>(slots: T[], pick: T, limit = STAAL_PICK_LIMIT): T[] {
  if (slots.some((slot) => slot.id === pick.id)) return slots;
  if (slots.length >= limit) return slots;
  return [...slots, pick];
}

export function removeStaalPick<T extends { id: string }>(slots: T[], id: string): T[] {
  return slots.filter((slot) => slot.id !== id);
}

export function picksToLines(slots: Pick<StaalSwatch, "path" | "colorId">[]): StaalLine[] {
  const grouped = new Map<string, StaalLine>();
  for (const slot of slots) {
    const key = slot.path.join("\0");
    const line = grouped.get(key) ?? { path: slot.path, colorIds: [] };
    if (slot.colorId && !line.colorIds.includes(slot.colorId)) line.colorIds.push(slot.colorId);
    grouped.set(key, line);
  }
  return [...grouped.values()];
}
