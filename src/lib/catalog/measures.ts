import { formatLengthMm } from "@/lib/format";

import { extractPanelLength, parseLengthMeters } from "./text-rules";
import type { ProductGroup, Spec } from "./types";

/**
 * Gevel listing groups. Mapped in the front end from the product name.
 * Shopify product type and tags stay as they are.
 */
const ACCESSORY =
  /folie|loodvervanger|\blamina\b|schroef|kitspuit|\bkit\b|cleaner|ontvetter|\bschaar\b|maskingtape|\btape\b|lijm|spuitkop|plafondtegel|sealer|\breiniger\b/i;

const TRIM =
  /profiel|hoekstuk|\bhoek\b|stootvoeg|eindkap|verbind|buitenhoek|binnenhoek|afdeklijst|afdekgevel|tussenstuk|afwatering|\btrim\b|\bkraal\b|afdicht/i;

const PANEL =
  /rabat|sponningschroot|sponningdeel|\bsponning\b|potdeksel|rondkant|quattro|\bvario\b|platpaneel|wandpaneel|steenstrip|leisteen|unipanel|bouwpaneel|paneelvulling|paneelplus|foodcare|extra stabil|plafond\s*paneel|buitenplafond|binnenplafond|gevelpaneel|dakrand\s*paneel|wonderboard|\bpaneel\b/i;

const NUMBER = String.raw`(\d+(?:[.,]\d+)?)`;

export function inferProductGroup(name: string, productType?: string): ProductGroup {
  const text = `${name} ${productType ?? ""}`;
  if (ACCESSORY.test(text)) return "toebehoren";
  if (TRIM.test(text)) return "afwerkprofiel";
  if (PANEL.test(text)) return "gevelpaneel";
  return "toebehoren";
}

function asNumber(raw: string) {
  return Number(raw.replace(",", "."));
}

/** Widest cladding face in this catalogue is the 610 mm Unipanel. Sheets sit above that. */
const MAX_FACE_MM = 800;

/** Face width of a cladding panel. Thickness, profile size and roll width stay out. */
export function parseWorkingWidthMm(name: string, specs: Spec[] = []): number | undefined {
  const labelled = specs.find((spec) => /werkende breedte/i.test(spec.label));
  const fromSpec = labelled?.value.match(/(\d+(?:[.,]\d+)?)\s*mm/i);
  if (fromSpec) {
    const width = asNumber(fromSpec[1]);
    if (width >= 80 && width <= MAX_FACE_MM) return Math.round(width);
  }

  if (inferProductGroup(name) !== "gevelpaneel" || /wonderboard/i.test(name)) return undefined;

  const triple = name.match(
    new RegExp(`${NUMBER}\\s*[x×]\\s*${NUMBER}\\s*[x×]\\s*${NUMBER}\\s*mm`, "i"),
  );
  if (triple) {
    const face = asNumber(triple[1]);
    const thick = asNumber(triple[3]);
    if (face >= 80 && face <= MAX_FACE_MM && thick < 40) return Math.round(face);
    return undefined;
  }

  const pair = name.match(new RegExp(`${NUMBER}\\s*[x×]\\s*${NUMBER}\\s*mm`, "i"));
  if (pair) {
    const a = asNumber(pair[1]);
    const b = asNumber(pair[2]);
    const larger = Math.max(a, b);
    const smaller = Math.min(a, b);
    if (larger >= 500 && smaller >= 80 && smaller <= MAX_FACE_MM) return Math.round(smaller);
    if (larger >= 80 && larger <= MAX_FACE_MM && smaller < 80) return Math.round(larger);
    return undefined;
  }

  const singles = [...name.matchAll(/(\d+(?:[.,]\d+)?)\s*mm\b/gi)].map((match) => asNumber(match[1]));
  const faces = singles.filter((value) => value >= 80 && value <= MAX_FACE_MM);
  if (faces.length === 1) return Math.round(faces[0]);
  return undefined;
}

/** Longest side of a size chain, when it is a real piece length and not a face width. */
export function longestSpanMm(name: string): number | undefined {
  const chains = [
    ...name.matchAll(
      new RegExp(`${NUMBER}(?:\\s*[x×]\\s*${NUMBER}){1,3}(?:\\s*mm)?`, "gi"),
    ),
  ];
  let max = 0;
  for (const chain of chains) {
    const parts = chain[0].match(/\d+(?:[.,]\d+)?/g) ?? [];
    for (const part of parts) {
      const value = asNumber(part);
      if (value > max) max = value;
    }
  }
  return max >= 500 ? Math.round(max) : undefined;
}

export function isRealListedLength(length: string): boolean {
  if (parseLengthMeters(length)) return true;
  const mm = length.trim().match(/^(\d+(?:[.,]\d+)?)\s*mm$/i);
  if (!mm) return false;
  return asNumber(mm[1]) >= 500;
}

/** Length from a Shopify option or title. A bare 150 mm or 17 mm is not a length. */
export function initialLength(title: string, option?: string): string {
  const chosen = option?.trim();
  if (chosen && isRealListedLength(chosen)) return chosen;
  const fromOption = chosen ? extractPanelLength(chosen) : undefined;
  if (fromOption) return fromOption;
  const fromTitle = extractPanelLength(title);
  if (fromTitle) return fromTitle;
  const span = longestSpanMm(title);
  if (span) return `${span} mm`;
  return "stuk";
}

export type ListedMeasure = {
  label: "Lengte" | "Werkende breedte" | "Inwendig" | "Maat" | "Dikte";
  text: string;
};

function sectionMeasure(name: string): ListedMeasure | undefined {
  const inward = name.match(/(\d+(?:[.,]\d+)?)\s*mm\b[^.\n]{0,24}inwendig/i);
  if (inward) return { label: "Inwendig", text: `${inward[1].replace(".", ",")} mm` };

  const chain = name.match(
    new RegExp(`${NUMBER}(?:\\s*[x×]\\s*${NUMBER}){1,3}\\s*mm`, "i"),
  );
  if (chain) {
    const parts = chain[0]
      .replace(/\s*mm\s*$/i, "")
      .split(/\s*[x×]\s*/)
      .map((part) => part.replace(".", ","));
    const nums = parts.map((part) => asNumber(part));
    if (nums.length > 1 && Math.max(...nums) < 500) {
      return { label: "Maat", text: `${parts.join("×")} mm` };
    }
  }

  const single = name.match(/(\d+(?:[.,]\d+)?)\s*mm\b/i);
  if (!single) return undefined;
  const value = asNumber(single[1]);
  if (value <= 0 || value >= 500) return undefined;
  const text = `${single[1].replace(".", ",")} mm`;
  if (value < 8 && /plaat|board|tegel|paneel/i.test(name)) return { label: "Dikte", text };
  return { label: "Maat", text };
}

export function describeMeasure(name: string, length: string, workingWidthMm?: number): ListedMeasure {
  if (isRealListedLength(length)) return { label: "Lengte", text: formatLengthMm(length) };
  if (workingWidthMm && workingWidthMm >= 80) {
    return { label: "Werkende breedte", text: `${workingWidthMm} mm` };
  }
  return sectionMeasure(name) ?? { label: "Maat", text: "Stuk" };
}
