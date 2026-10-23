import { site } from "@/lib/site";
import type { StaalNode, StaalTree } from "@/lib/staal/tree";

function oneLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function describeStaalLine(node: StaalNode, colorIds: string[]) {
  const names = colorIds
    .map((id) => node.colors.find((color) => color.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  if (!names.length) return node.label;
  return `${node.label}: ${names.join(", ")}`;
}

export function staalGroupLabel(tree: StaalTree, path: string[]) {
  return tree.groups.find((group) => group.id === path[0])?.label ?? path[0] ?? "";
}

export function customerStaalText(input: {
  reference: string;
  lines: string[];
  name: string;
  phone: string;
  postcode: string;
  houseNumber: string;
  wantsQuote: boolean;
}) {
  return [
    "Bedankt. Je staal wordt binnen een dag verstuurd.",
    "",
    `Referentie: ${oneLine(input.reference)}`,
    "",
    "Stalen:",
    ...input.lines.map((line) => `- ${oneLine(line)}`),
    "",
    `Naam: ${oneLine(input.name)}`,
    `Telefoon: ${oneLine(input.phone)}`,
    `Postcode: ${oneLine(input.postcode)}`,
    `Huisnummer: ${oneLine(input.houseNumber)}`,
    `Prijsindicatie: ${input.wantsQuote ? "ja" : "nee"}`,
    "",
    `Vragen? Bel ${site.phone} of WhatsApp ${site.mobileDisplay}.`,
    site.name,
    site.company,
  ].join("\n");
}

export function shopStaalText(input: {
  reference: string;
  lines: string[];
  name: string;
  email: string;
  phone: string;
  postcode: string;
  houseNumber: string;
  wantsQuote: boolean;
}) {
  return [
    `Nieuwe staalaanvraag ${oneLine(input.reference)}`,
    `Naam: ${oneLine(input.name)}`,
    `E-mail: ${oneLine(input.email)}`,
    `Telefoon: ${oneLine(input.phone)}`,
    `Postcode: ${oneLine(input.postcode)}`,
    `Huisnummer: ${oneLine(input.houseNumber)}`,
    `Prijsindicatie: ${input.wantsQuote ? "ja" : "nee"}`,
    "Stalen:",
    ...input.lines.map((line) => `- ${oneLine(line)}`),
  ].join("\n");
}
