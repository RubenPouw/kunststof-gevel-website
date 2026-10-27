import { labelColour } from "@/lib/catalog/colours";
import { slugKey } from "@/lib/catalog/derive";
import { normalizeProductName } from "@/lib/catalog/text-rules";
import { correctVariantImages } from "@/lib/catalog/variant-images";
import type { Product } from "@/lib/catalog/types";

export const STAAL_GROUP_QUESTION = "Kiest u eerst voor wat er nodig is, dakrand of een geveldeel?";
export const STAAL_MULTI_NOTE =
  "* Meerdere stalen zijn mogelijk doorloop het proces dan per staal of geef dit mee in de notities.";
export const STAAL_BOTH_NOTE = 'Mocht u beiden willen, klikt u dan op de laatste pagina "Bijbestellen"';
export const STAAL_PRICE_QUESTION =
  "Wil je alvast vrijblijvend een prijsindicatie of offerte ontvangen voor jouw project?";
export const STAAL_PRICE_YES = "Ja, ik wil graag een prijs indicatie";
export const STAAL_PRICE_NO = "Nee direct stalen ontvangen!";
export const STAAL_CONTACT_HINT = "Bijna daar. Laatste vragen";
export const STAAL_HEADING = "Gratis staalaanvraag";

export type StaalGroupId = "gevel" | "dakrand" | "vensterbank" | "hpl";

export type StaalColor = {
  id: string;
  name: string;
  image?: string;
  hex?: string;
};

export type StaalNode = {
  id: string;
  label: string;
  image?: string;
  question?: string;
  colorQuestion?: string;
  children?: StaalNode[];
  colors: StaalColor[];
  skipColor: boolean;
  productSlugs: string[];
};

export type StaalTree = {
  groups: StaalNode[];
};

export type StaalStep =
  | { type: "group" }
  | { type: "choose"; level: number; question: string; options: StaalNode[] }
  | { type: "color"; question: string; node: StaalNode }
  | { type: "price" }
  | { type: "contact" }
  | { type: "empty"; label: string };

const CATEGORY_GROUP: Record<string, StaalGroupId> = {
  gevelbekleding: "gevel",
  dakranden: "dakrand",
  "hpl-platen": "hpl",
  kozijnafwerking: "vensterbank",
};

const KIND_ORDER = ["potdeksel", "sponning", "multisponning", "steenstrip"] as const;
type GevelKind = (typeof KIND_ORDER)[number];

const KIND_META: Record<GevelKind, { label: string; question: string }> = {
  potdeksel: { label: "Potdeksel", question: "Merk Potdeksel" },
  sponning: { label: "Sponningsdeel", question: "Kies het soort paneel" },
  multisponning: { label: "Multisponning", question: "Kies het soort Multisponning" },
  steenstrip: { label: "Steenstrip", question: "Kies het soort Steenstrip Zierer" },
};

const DAKRAND_ORDER = ["dakrand", "boeiboord", "daktrim"] as const;
type DakrandKind = (typeof DAKRAND_ORDER)[number];

const DAKRAND_META: Record<DakrandKind, { label: string; question: string }> = {
  dakrand: { label: "Dakrand", question: "Kies de dakrand" },
  boeiboord: { label: "Boeiboord", question: "Kies het boeiboord" },
  daktrim: { label: "Daktrim", question: "Kies de daktrim" },
};

const HARDWARE =
  /schroef|eindkap|eindprofiel|startprofiel|hoekprofiel|hoekstuk|\bhoek\b|verbind|montage\s*profiel|reiniger|ventilatie|afdicht|stootvoeg|bevestiging|\bclip\b|\bkit\b/;

function blob(product: Product) {
  return `${product.name} ${product.brand} ${product.vendor} ${product.productType ?? ""}`.toLowerCase();
}

function isHardware(name: string) {
  return HARDWARE.test(name.toLowerCase());
}

function productImage(product: Product) {
  return (
    product.images.find((image) => image.url)?.url ??
    product.variants.find((variant) => variant.image?.url)?.image?.url
  );
}

function isPaleColor(name: string) {
  return /\b(wit|witte|white|snowwhite|creme|crème|ivoor|alaska)\b/i.test(name);
}

/** A colour photo you can actually see on a white card. Pale swatches look like an empty block. */
function visibleImage(products: Product[]) {
  for (const product of products) {
    for (const variant of product.variants) {
      if (variant.image?.url && !isPaleColor(variant.colorName)) return variant.image.url;
    }
  }
  return products.map(productImage).find(Boolean);
}

function brandPhoto(items: Product[], all: Product[], brandSlug: string) {
  const siblings = all.filter((product) => product.brandSlug === brandSlug && !isHardware(product.name));
  return (
    visibleImage(items) ??
    visibleImage(siblings.filter((product) => product.category === "gevelbekleding")) ??
    visibleImage(siblings)
  );
}

function thicknessMm(text: string) {
  const values = [...text.matchAll(/(\d+(?:[.,]\d+)?)\s*mm/g)].map((match) =>
    Number(match[1].replace(",", ".")),
  );
  if (!values.length) return undefined;
  return Math.min(...values);
}

function gevelKind(name: string): GevelKind | null {
  const text = name.toLowerCase();
  if (/steenstrip|leisteen|wildverband/.test(text)) return "steenstrip";
  if (/quattro|vario|multisponning|multi[\s-]*sponning|dubbel[\s-]*sponning|dubbel[\s-]*rabat/.test(text)) {
    return "multisponning";
  }
  if (/potdeksel/.test(text)) return "potdeksel";
  if (/sponning|rondkant|rabat|trend|shadow/.test(text)) return "sponning";
  return null;
}

function dakrandKind(name: string): DakrandKind {
  const text = name.toLowerCase();
  if (/daktrim/.test(text)) return "daktrim";
  if (/boeiboord|boeideel/.test(text)) return "boeiboord";
  return "dakrand";
}

function choiceRank(name: string) {
  const text = name.toLowerCase();
  const rules: [RegExp, number][] = [
    [/dubbel[\s-]*rabat/, 50],
    [/dubbel[\s-]*sponning/, 40],
    [/quattro/, 10],
    [/vario/, 20],
    [/multi/, 30],
    [/143/, 10],
    [/shadow/, 30],
    [/rondkant/, 20],
    [/167/, 50],
    [/190/, 60],
    [/trend/, 70],
    [/rabat/, 40],
    [/leisteen/, 30],
    [/wildverband/, 20],
    [/grof/, 10],
  ];
  for (const [rule, rank] of rules) {
    if (rule.test(text)) return rank;
  }
  return 80;
}

function byProduct(a: Product, b: Product) {
  const rank = choiceRank(a.name) - choiceRank(b.name);
  if (rank) return rank;
  return a.name.localeCompare(b.name, "nl");
}

function brandRank(slug: string) {
  if (slug === "keralit") return 0;
  if (slug === "eurotexx") return 1;
  if (slug === "vinyplus") return 2;
  return 10;
}

function isGenericColor(name: string) {
  return /^(default title|default|standaard)$/i.test(name.trim());
}

function isSampleColor(name: string | undefined) {
  const value = name?.trim() ?? "";
  if (!value || isGenericColor(value)) return false;
  if (/default title/i.test(value)) return false;
  if (/^(milyt|flexinplex|hpl|hpl plaat)(\s+mm)*$/i.test(value)) return false;
  return true;
}

export function collectColors(products: Product[]): StaalColor[] {
  const map = new Map<string, StaalColor>();
  for (const product of products) {
    for (const variant of product.variants) {
      const name = labelColour(variant.colorName?.trim() ?? "");
      if (!isSampleColor(name)) continue;
      const id = slugKey(name);
      if (!id) continue;
      const image = variant.image?.url;
      const existing = map.get(id);
      if (!existing) {
        map.set(id, { id, name, image, hex: variant.hex || undefined });
      } else if (!existing.image && image) {
        existing.image = image;
      }
    }
    for (const color of product.colors) {
      const name = labelColour(color.name?.trim() ?? "");
      if (!isSampleColor(name)) continue;
      const id = slugKey(name);
      if (!id || map.has(id)) continue;
      map.set(id, { id, name, hex: color.hex || undefined });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "nl"));
}

function leaf(id: string, label: string, products: Product[], colorQuestion: string): StaalNode {
  const colors = collectColors(products);
  return {
    id,
    label,
    image: products.map(productImage).find(Boolean),
    colorQuestion,
    colors,
    skipColor: colors.length <= 1,
    productSlugs: products.map((product) => product.slug),
  };
}

function parent(id: string, label: string, question: string, children: StaalNode[]): StaalNode {
  return {
    id,
    label,
    question,
    image: children.find((child) => child.image)?.image,
    children,
    colors: [],
    skipColor: true,
    productSlugs: children.flatMap((child) => child.productSlugs),
  };
}

function emptyGroup(id: StaalGroupId, label: string, question: string): StaalNode {
  return { id, label, question, children: [], colors: [], skipColor: true, productSlugs: [] };
}

function gevelGroup(products: Product[]): StaalNode {
  const panels = products.filter(
    (product) => product.category === "gevelbekleding" && !isHardware(product.name) && gevelKind(product.name),
  );
  const byKind = new Map<GevelKind, Product[]>();
  for (const product of panels) {
    const kind = gevelKind(product.name);
    if (!kind) continue;
    const list = byKind.get(kind) ?? [];
    list.push(product);
    byKind.set(kind, list);
  }
  const children: StaalNode[] = [];
  for (const kind of KIND_ORDER) {
    const list = byKind.get(kind);
    if (!list?.length) continue;
    const meta = KIND_META[kind];
    if (kind === "potdeksel") {
      const brands = new Map<string, Product[]>();
      for (const product of list) {
        const bucket = brands.get(product.brandSlug) ?? [];
        bucket.push(product);
        brands.set(product.brandSlug, bucket);
      }
      const nodes = [...brands.entries()]
        .sort((a, b) => brandRank(a[0]) - brandRank(b[0]) || a[1][0].brand.localeCompare(b[1][0].brand, "nl"))
        .map(([slug, items]) => {
          const sorted = [...items].sort(byProduct);
          const brand = sorted[0]?.brand ?? slug;
          const node = leaf(
            `merk:${slug}`,
            brand,
            sorted,
            sorted.length === 1 ? `Kleur ${sorted[0].name}` : `Kleur ${brand}`,
          );
          const photo = brandPhoto(sorted, products, slug);
          if (photo) node.image = photo;
          return node;
        });
      children.push(parent(kind, meta.label, meta.question, nodes));
    } else {
      const nodes = [...list].sort(byProduct).map((product) => leaf(product.slug, product.name, [product], `Kleur ${product.name}`));
      children.push(parent(kind, meta.label, meta.question, nodes));
    }
  }
  if (!children.length) return emptyGroup("gevel", "Gevel paneel", "Kies het soort paneel");
  return parent("gevel", "Gevel paneel", "Kies het soort paneel", children);
}

function dakrandGroup(products: Product[]): StaalNode {
  const panels = products.filter((product) => {
    if (product.category !== "dakranden" || isHardware(product.name)) return false;
    return /dakrand|boeiboord|boeideel|daktrim/.test(product.name.toLowerCase());
  });
  const byKind = new Map<DakrandKind, Product[]>();
  for (const product of panels) {
    const kind = dakrandKind(product.name);
    const list = byKind.get(kind) ?? [];
    list.push(product);
    byKind.set(kind, list);
  }
  const kinds = DAKRAND_ORDER.filter((kind) => byKind.get(kind)?.length);
  if (!kinds.length) return emptyGroup("dakrand", "Dakrand", "Kies de dakrand");
  const nodesFor = (kind: DakrandKind) =>
    [...(byKind.get(kind) ?? [])]
      .sort(byProduct)
      .map((product) => leaf(product.slug, product.name, [product], `Kleur ${product.name}`));
  if (kinds.length === 1) {
    return parent("dakrand", "Dakrand", DAKRAND_META[kinds[0]].question, nodesFor(kinds[0]));
  }
  return parent(
    "dakrand",
    "Dakrand",
    "Kies het soort dakrand",
    kinds.map((kind) => parent(kind, DAKRAND_META[kind].label, DAKRAND_META[kind].question, nodesFor(kind))),
  );
}

function namedGroup(
  id: StaalGroupId,
  label: string,
  question: string,
  products: Product[],
): StaalNode {
  if (!products.length) return emptyGroup(id, label, question);
  const children = [...products]
    .sort(byProduct)
    .map((product) => leaf(product.slug, product.name, [product], `Kleur ${product.name}`));
  return parent(id, label, question, children);
}

function isVensterbank(product: Product) {
  if (isHardware(product.name)) return false;
  const text = product.name.toLowerCase();
  if (!/vensterbank|overzetbank|overzet\s*vensterbank/.test(text)) return false;
  return product.category === "kozijnafwerking" || /vensterbank|overzetbank/.test(text);
}

function isHplSample(product: Product) {
  if (product.category !== "hpl-platen" || isHardware(product.name)) return false;
  const text = `${blob(product)} ${product.description ?? ""}`.toLowerCase();
  if (/sandwich|reiniger|compact|renolit|\babet\b|brandvertragend/.test(text)) return false;
  if (/\b(?:2|24)\s*mm\b/.test(text)) return false;
  if (/\bhpl[-\s]?fr\b/.test(text)) return false;
  const flex =
    /flexinplex|milyt/.test(text) || product.variants.some((variant) => /^mpf/i.test(variant.sku.trim()));
  if (!flex) return false;
  const thickness = thicknessMm(text);
  if (thickness !== undefined && thickness !== 6) return false;
  return product.variants.some((variant) => isSampleColor(variant.colorName));
}

function hplGroup(products: Product[]): StaalNode {
  const samples = products.filter(isHplSample);
  const buckets = new Map<string, Product[]>();
  for (const product of samples) {
    const key = normalizeProductName(product.name);
    const list = buckets.get(key) ?? [];
    list.push(product);
    buckets.set(key, list);
  }
  const fallback = products
    .filter((product) => product.category === "hpl-platen" && !isHardware(product.name))
    .map(productImage)
    .find(Boolean);
  const children = [...buckets.values()]
    .sort((a, b) => byProduct(a[0], b[0]))
    .map((items) => {
      const label = items[0]?.name ?? "HPL plaat";
      const node = leaf(items[0].slug, label, items, `Kleur ${label}`);
      if (!node.image && fallback) node.image = fallback;
      return node;
    });
  if (!children.length) return emptyGroup("hpl", "HPL platen", "Kies de HPL plaat");
  const node = parent("hpl", "HPL platen", "Kies de HPL plaat", children);
  if (!node.image && fallback) node.image = fallback;
  return node;
}

export function categoryStaalGroup(category: string): StaalGroupId | null {
  return CATEGORY_GROUP[category] ?? null;
}

export function buildStaalTree(products: Product[]): StaalTree {
  const ready = products.map(correctVariantImages);
  return {
    groups: [
      gevelGroup(ready),
      dakrandGroup(ready),
      namedGroup(
        "vensterbank",
        "Vensterbanken",
        "Kies de vensterbank",
        ready.filter(isVensterbank),
      ),
      hplGroup(ready),
    ],
  };
}

export function staalTarget(product: Product): { groupId: StaalGroupId } | null {
  const tree = buildStaalTree([product]);
  const group = tree.groups.find((item) => item.productSlugs.includes(product.slug));
  if (!group) return null;
  return { groupId: group.id as StaalGroupId };
}

export function pathForProduct(tree: StaalTree, slug: string): { groupId: string; choiceIds: string[] } | null {
  function walk(node: StaalNode, choiceIds: string[]): string[] | null {
    if (!node.children?.length) {
      return node.productSlugs.includes(slug) ? choiceIds : null;
    }
    for (const child of node.children) {
      const nextIds = node.children.length === 1 ? choiceIds : [...choiceIds, child.id];
      const found = walk(child, nextIds);
      if (found) return found;
    }
    return null;
  }
  for (const group of tree.groups) {
    const choiceIds = walk(group, []);
    if (choiceIds) return { groupId: group.id, choiceIds };
  }
  return null;
}

export function staalSteps(
  tree: StaalTree,
  input: { groupId?: string | null; choiceIds: string[]; extraLine: boolean },
): { steps: StaalStep[]; expandedPath: string[]; leaf: StaalNode | null } {
  const steps: StaalStep[] = [{ type: "group" }];
  if (!input.groupId) return { steps, expandedPath: [], leaf: null };
  const group = tree.groups.find((item) => item.id === input.groupId);
  if (!group) return { steps, expandedPath: [], leaf: null };
  if (!group.children?.length) {
    steps.push({ type: "empty", label: group.label });
    return { steps, expandedPath: [group.id], leaf: null };
  }

  let node = group;
  const expanded = [group.id];
  let level = 0;
  let choiceAt = 0;
  while (node.children?.length) {
    if (node.children.length === 1) {
      node = node.children[0];
      expanded.push(node.id);
      continue;
    }
    steps.push({
      type: "choose",
      level,
      question: node.question || "Kies",
      options: node.children,
    });
    const id = input.choiceIds[choiceAt];
    level += 1;
    if (!id) return { steps, expandedPath: expanded, leaf: null };
    const next = node.children.find((child) => child.id === id);
    if (!next) return { steps, expandedPath: expanded, leaf: null };
    choiceAt += 1;
    node = next;
    expanded.push(node.id);
  }

  if (!node.skipColor) {
    steps.push({ type: "color", question: node.colorQuestion || `Kleur ${node.label}`, node });
  }
  if (!input.extraLine) steps.push({ type: "price" });
  steps.push({ type: "contact" });
  return { steps, expandedPath: expanded, leaf: node };
}
