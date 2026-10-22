import colourCodes from "../../data/catalog/colour-codes.json";

import type { ColorFamily } from "./types";

export type ColourHit = {
  name: string;
  hex: string;
  family: ColorFamily;
};

/**
 * Milin article codes, confirmed on the supplier shop (same code, same name, no conflicts).
 * Applied only outside HPL sheets. HPL decor codes such as F39 stay the code.
 */
const CODES: Record<string, string> = Object.fromEntries(
  Object.entries(colourCodes).map(([code, name]) => [code.toLowerCase(), name]),
);

/** Neutral chip when the hue is not published. Not a guessed wood tone. */
export const UNKNOWN_COLOUR_HEX = "#C5C1B8";

const RULES: { test: RegExp; family: ColorFamily; hex: string; label: string }[] = [
  { test: /smokey shadow/, family: "houtlook", hex: UNKNOWN_COLOUR_HEX, label: "Smokey shadow" },
  { test: /vergrijsd/, family: "houtlook", hex: "#A39480", label: "Vergrijsd eiken" },
  { test: /golden\s*oak|golden/, family: "houtlook", hex: "#C4A36A", label: "Golden oak" },
  { test: /california redwood|mahonie|chocolade|mocca|cappuccino/, family: "houtlook", hex: "#6B3A2A", label: "Houtlook" },
  { test: /meranti/, family: "houtlook", hex: "#6B3A2A", label: "Meranti" },
  { test: /noten|walnoot/, family: "houtlook", hex: "#5C4033", label: "Noten" },
  { test: /eiken|\beik\b|\boak\b/, family: "houtlook", hex: "#8B5E3C", label: "Eiken" },
  { test: /oregon|ceder|cedar|naturel/, family: "houtlook", hex: "#A67C52", label: "Houtlook" },
  { test: /antraciet|grafiet|leisteen|diepzwart|zwartgrijs|nightblack|\bblack\b/, family: "donker", hex: "#3A3D41", label: "Antraciet" },
  { test: /ral\s*7016|ral\s*7021|ral\s*7022|ral\s*9005/, family: "donker", hex: "#3A3D41", label: "Antraciet" },
  { test: /bruingrijs/, family: "donker", hex: "#6B6E72", label: "Bruingrijs" },
  { test: /parelgrijs|lichtgrijs|zilvergrijs/, family: "licht", hex: "#D5D3CE", label: "Lichtgrijs" },
  { test: /zwart/, family: "donker", hex: "#1A1A1A", label: "Zwart" },
  { test: /grijs|gray|grey|aluminium|\bmetaal\b/, family: "donker", hex: "#6B6E72", label: "Grijs" },
  { test: /cr[eè]me|cremi|cream|ivoor|ivory|ral\s*9001/, family: "licht", hex: "#E8DCC8", label: "Crème" },
  { test: /zand|beige|sahara|\bsand\b|\bklei\b|claystone|carrara|marmer|freestone|dolomit/, family: "licht", hex: "#C4B496", label: "Zand" },
  { test: /ral\s*9010|ral\s*9016|bianco|wit\b|traffic white|snowwhite|\bwhite\b/, family: "licht", hex: "#F4F1EA", label: "Wit" },
  { test: /monumentengroen|mosgroen|olijf|groen|\bgreen\b/, family: "groen", hex: "#3F5344", label: "Groen" },
  { test: /lichtblauw/, family: "blauw", hex: "#8AA4C4", label: "Lichtblauw" },
  { test: /staalblauw|monumentenblauw|blauw|\bblue\b/, family: "blauw", hex: "#2C4A6E", label: "Blauw" },
  { test: /terracotta|wijnrood|rood\b/, family: "rood", hex: "#8B3A32", label: "Rood" },
  { test: /lichtbruin/, family: "bruin", hex: "#A67C52", label: "Lichtbruin" },
  { test: /donkerbruin|bruin/, family: "bruin", hex: "#6B4A32", label: "Bruin" },
  { test: /\bgeel\b/, family: "geel", hex: "#E6C229", label: "Geel" },
  { test: /\brvs\b|\bstaal\b|metallo/, family: "metaal", hex: "#C5C7C4", label: "RVS" },
  { test: /\b(alpin|elba|helios|tirol)\b|steenlook/, family: "steen", hex: UNKNOWN_COLOUR_HEX, label: "Steen" },
  { test: /nerf/, family: "houtlook", hex: "#8B5E3C", label: "Houtlook" },
];

const GENERIC = /^(standaard|default title|titel|stuk|hpl plaat|variant|default)$/i;

function norm(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchWords(text: string) {
  const key = norm(text);
  return RULES.find((rule) => rule.test.test(key)) ?? null;
}

export function resolveColour(name: string, context = "", options?: { codes?: boolean }): ColourHit {
  const key = norm(name);
  if (options?.codes) {
    const label = CODES[key.replace(/\s+/g, "")];
    if (label) {
      const words = matchWords(label);
      return {
        name: label,
        hex: words?.hex ?? UNKNOWN_COLOUR_HEX,
        family: words?.family ?? "overig",
      };
    }
  }

  const direct = matchWords(name);
  if (direct && !GENERIC.test(key)) {
    return { name: name.trim(), hex: direct.hex, family: direct.family };
  }

  const fromContext = matchWords(context);
  if ((GENERIC.test(key) || !direct) && fromContext && GENERIC.test(key)) {
    return { name: fromContext.label, hex: fromContext.hex, family: fromContext.family };
  }

  if (direct) return { name: name.trim() || fromContext?.label || "Standaard", hex: direct.hex, family: direct.family };

  return {
    name: name.trim() || "Standaard",
    hex: UNKNOWN_COLOUR_HEX,
    family: "overig",
  };
}

export function colorFamilyFromName(colorName: string, context = ""): ColourHit["family"] {
  return resolveColour(colorName, context).family;
}
