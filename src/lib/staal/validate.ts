import type { StaalNode, StaalTree } from "@/lib/staal/tree";

export type StaalLine = {
  path: string[];
  colorIds: string[];
};

export type StaalRequest = {
  companyWebsite: string;
  wantsQuote: boolean;
  name: string;
  email: string;
  phone: string;
  postcode: string;
  houseNumber: string;
  lines: StaalLine[];
};

export type StaalContactKey = "name" | "email" | "phone" | "postcode" | "houseNumber";

const POSTCODE = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function walk(tree: StaalTree, path: string[]): StaalNode | null {
  if (!path.length) return null;
  let node: StaalNode | undefined = tree.groups.find((group) => group.id === path[0]);
  if (!node) return null;
  for (const id of path.slice(1)) {
    const children: StaalNode[] = node.children ?? [];
    const child = children.find((item) => item.id === id);
    if (!child) return null;
    node = child;
  }
  if (node.children?.length) return null;
  return node;
}

export function staalContactErrors(input: Pick<StaalRequest, StaalContactKey>) {
  const errors: Partial<Record<StaalContactKey, string>> = {};
  if (!input.name.trim()) errors.name = "Dit veld is verplicht";
  else if (input.name.trim().length > 80) errors.name = "Dit veld is te lang";

  if (!input.email.trim()) errors.email = "Dit veld is verplicht";
  else if (!EMAIL.test(input.email.trim()) || input.email.trim().length > 120) {
    errors.email = "Vul een geldig e-mailadres in.";
  }

  const digits = input.phone.replace(/\D/g, "");
  if (!input.phone.trim()) errors.phone = "Dit veld is verplicht";
  else if (digits.length < 8 || input.phone.trim().length > 20) errors.phone = "Vul een geldig telefoonnummer in.";

  if (!input.postcode.trim()) errors.postcode = "Dit veld is verplicht";
  else if (!POSTCODE.test(input.postcode.trim())) errors.postcode = "Vul een geldige postcode in.";

  if (!input.houseNumber.trim()) errors.houseNumber = "Dit veld is verplicht";
  else if (input.houseNumber.trim().length > 12) errors.houseNumber = "Dit veld is te lang";

  return errors;
}

export function resolveStaalLine(
  tree: StaalTree,
  line: StaalLine,
): { node: StaalNode; colorIds: string[] } | { error: string } {
  const node = walk(tree, line.path);
  if (!node) return { error: "Kies een product uit de catalogus." };
  if (node.skipColor) return { node, colorIds: node.colors.map((color) => color.id) };
  const unique = [...new Set(line.colorIds.map((id) => id.trim()).filter(Boolean))];
  if (!unique.length) return { error: "Kies minstens één kleur." };
  if (unique.length > 40) return { error: "Kies minder kleuren." };
  if (unique.some((id) => !node.colors.some((color) => color.id === id))) {
    return { error: "Kies kleuren uit de catalogus." };
  }
  return { node, colorIds: unique };
}

export function validateStaalRequest(input: StaalRequest, tree: StaalTree): string | null {
  const contact = staalContactErrors(input);
  const first = Object.values(contact)[0];
  if (first) return first;
  if (typeof input.wantsQuote !== "boolean") return "Kies of u een prijsindicatie wilt.";
  if (!input.lines.length) return "Kies een product uit de catalogus.";
  if (input.lines.length > 8) return "U kunt maximaal 8 stalen in één aanvraag zetten.";
  for (const line of input.lines) {
    const resolved = resolveStaalLine(tree, line);
    if ("error" in resolved) return resolved.error;
  }
  return null;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function parseStaalRequest(body: unknown): StaalRequest | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  if (typeof raw.wantsQuote !== "boolean" || !Array.isArray(raw.lines)) return null;
  const lines: StaalLine[] = [];
  for (const line of raw.lines) {
    if (!line || typeof line !== "object") return null;
    const item = line as Record<string, unknown>;
    if (!Array.isArray(item.path) || !item.path.every((part) => typeof part === "string")) return null;
    if (!Array.isArray(item.colorIds) || !item.colorIds.every((part) => typeof part === "string")) return null;
    lines.push({ path: item.path, colorIds: item.colorIds });
  }
  return {
    companyWebsite: text(raw.companyWebsite),
    wantsQuote: raw.wantsQuote,
    name: text(raw.name),
    email: text(raw.email),
    phone: text(raw.phone),
    postcode: text(raw.postcode),
    houseNumber: text(raw.houseNumber),
    lines,
  };
}
