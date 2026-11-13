import filloutColors from "@/data/staal/fillout-colors.json" with { type: "json" };

import { isBannedSampleText } from "./banned";
import type { StaalNode, StaalTree } from "./tree";

type FilloutColor = { label: string; image: string };
type FilloutStep = {
  section: string;
  step: string;
  groupTitle: string;
  needles: string[];
  colors: FilloutColor[];
};

const STEPS = filloutColors.steps as FilloutStep[];

/** Live Fillout colours Ruben kept off Kerrafront Trend on purpose. */
export const TREND_EXCLUDED = ["Antraciet", "Parelgrijs"] as const;

const GENERIC_NEEDLES = new Set(["dakrand"]);

type Leaf = { node: StaalNode; parent: StaalNode | null; labels: string[] };

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** "sponningdeel" and "sponning" are the same line in the shop and in Fillout. */
function loose(value: string) {
  return norm(value)
    .replace(/deel\b/g, " ")
    .replace(/\bmm\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value: string) {
  const cleaned = norm(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return cleaned.slice(0, 48) || "groep";
}

function collect(node: StaalNode, parent: StaalNode | null, labels: string[], out: Leaf[]) {
  const next = [...labels, node.label];
  if (!node.children?.length) {
    out.push({ node, parent, labels: next });
    return;
  }
  for (const child of node.children) collect(child, node, next, out);
}

function leavesOf(group: StaalNode) {
  const out: Leaf[] = [];
  collect(group, null, [], out);
  return out;
}

function specificNeedles(needles: string[]) {
  const specific = needles.filter((needle) => !GENERIC_NEEDLES.has(needle.trim().toLowerCase()));
  return specific.length ? specific : needles;
}

function matchScore(labels: string[], needles: string[]) {
  const text = loose(labels.join(" "));
  let best = 0;
  for (const needle of specificNeedles(needles)) {
    const token = loose(needle);
    if (token && text.includes(token)) best = Math.max(best, token.length);
  }
  return best;
}

function ensureChild(group: StaalNode, id: string, label: string) {
  group.children ??= [];
  const existing = group.children.find((child) => child.id === id);
  if (existing) return existing;
  const child: StaalNode = { id, label, colors: [], skipColor: false, productSlugs: [] };
  group.children.push(child);
  return child;
}

function isTrendExcluded(name: string) {
  return TREND_EXCLUDED.some((label) => norm(name) === norm(label) || norm(name).startsWith(`${norm(label)} `));
}

/** One colour list per dakrand line, the way Fillout shows it, not once per height. */
function collapseDakrandLine(tree: StaalTree, brand: string, label: string) {
  const group = tree.groups.find((item) => item.id === "dakrand");
  if (!group) return;
  const hits = leavesOf(group).filter((leaf) => {
    const text = norm(leaf.labels.join(" "));
    return text.includes(brand) && text.includes("dakrand");
  });
  if (!hits.length) return;
  const keep = hits[0];
  keep.node.label = label;
  for (const extra of hits.slice(1)) {
    for (const productSlug of extra.node.productSlugs) {
      if (!keep.node.productSlugs.includes(productSlug)) keep.node.productSlugs.push(productSlug);
    }
    if (extra.parent?.children) {
      extra.parent.children = extra.parent.children.filter((child) => child !== extra.node);
    }
  }
}

function placeColor(node: StaalNode, step: string, color: FilloutColor) {
  const existing = node.colors.find((item) => norm(item.name) === norm(color.label));
  if (existing) {
    existing.name = color.label;
    existing.image = color.image;
    existing.verbatim = true;
    return;
  }
  node.colors.push({
    id: `fillout-${slug(step)}-${slug(color.label)}`,
    name: color.label,
    image: color.image,
    verbatim: true,
  });
}

/**
 * Adds every Fillout colour, with its downloaded photo, onto the staal tree.
 * Vensterbanken and HPL stay as the catalog built them.
 */
export function applyFillout(tree: StaalTree): StaalTree {
  const next = structuredClone(tree);
  collapseDakrandLine(next, "keralit", "Keralit dakrand");
  collapseDakrandLine(next, "vinyplus", "VinyPlus dakrand");
  for (const step of STEPS) {
    if (isBannedSampleText(`${step.section} ${step.step} ${step.groupTitle} ${step.needles.join(" ")}`)) continue;
    const sectionId = step.section === "Dakrand" ? "dakrand" : "gevel";
    const group = next.groups.find((item) => item.id === sectionId);
    if (!group) continue;
    let best: Leaf | null = null;
    let bestScore = 0;
    for (const leaf of leavesOf(group)) {
      const score = matchScore(leaf.labels, step.needles);
      if (score > bestScore) {
        best = leaf;
        bestScore = score;
      }
    }
    const node =
      best && bestScore >= 4 ? best.node : ensureChild(group, slug(step.groupTitle), step.groupTitle);
    if (step.step === "Trend Kleur") {
      node.colors = node.colors.filter((color) => !isTrendExcluded(color.name));
    }
    node.skipColor = false;
    for (const color of step.colors) placeColor(node, step.step, color);
  }
  return next;
}

export function filloutSteps() {
  return STEPS;
}
