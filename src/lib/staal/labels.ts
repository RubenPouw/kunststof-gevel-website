import { matchProductLine } from "@/lib/catalog/text-rules";

const LINE_LABEL: Record<string, string> = {
  novicell: "Novicell",
  milinboard: "Milinboard",
  vinytherm: "VinyTherm",
  vinyplus: "VinyPlus",
  kerrafront: "Kerrafront",
  keralit: "Keralit",
  eurotexx: "Eurotexx",
  zierer: "Zierer",
  milexx: "Milexx",
  unipanel: "Unipanel",
  florence: "Florence",
  fronto: "Fronto",
  werzalit: "Werzalit",
  thomdeck: "ThomDeck",
  multitexx: "Multitexx",
  heering: "Heering",
  milin: "Milin",
};

/** Drop the Shopify placeholder and a stray millimetre token from a sample name. */
export function tidySampleName(value: string) {
  return value
    .replace(/\bdefault\s+title\b/gi, " ")
    .replace(/\bmm\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** A name that is only the sheet line, with no colour left after tidying. */
export function isBlankSampleName(value: string) {
  const tidy = tidySampleName(value);
  return !tidy || /^(milyt|flexinplex|hpl|hpl plaat|standaard)$/i.test(tidy);
}

/**
 * Line under a swatch. Folie colours on a Milyt or Flexinplex sheet are that line,
 * not the generic shop brand HPL.
 */
export function sampleLineLabel(colorName: string, source: string, brand = "") {
  const haystack = `${brand} ${source}`;
  if (/folie/i.test(colorName)) {
    if (/\bflexinplex\b/i.test(haystack)) return "Flexinplex";
    if (/\bmilyt\b/i.test(haystack)) return "Milyt";
    return "Folie";
  }
  const named = tidySampleName(brand);
  if (named && !/^hpl$/i.test(named)) return named;
  if (/\bflexinplex\b/i.test(haystack)) return "Flexinplex";
  if (/\bmilyt\b/i.test(haystack)) return "Milyt";
  const slug = matchProductLine(haystack);
  if (slug && LINE_LABEL[slug]) return LINE_LABEL[slug];
  if (named) return "HPL";
  const tidy = tidySampleName(source);
  return tidy || source.trim();
}
