import type { Product } from "@/lib/catalog/types";

export const dakrandMerken = [
  { slug: "keralit", label: "Keralit" },
  { slug: "vinyplus", label: "VinyPlus" },
  { slug: "milexx", label: "Milexx" },
  { slug: "unipanel", label: "Unipanel" },
] as const;

export const montageMerken = [
  { slug: "keralit", label: "Keralit" },
  { slug: "vinyplus", label: "VinyPlus" },
  { slug: "eurotexx", label: "Eurotexx" },
  { slug: "kerrafront", label: "Kerrafront" },
  { slug: "milexx", label: "Milexx" },
  { slug: "profex", label: "Profex" },
  { slug: "unipanel", label: "Unipanel" },
  { slug: "zierer", label: "Zierer" },
] as const;

export const gevelTypes = [
  {
    slug: "rabat",
    profile: "rabat",
    title: "Kunststof rabatdelen",
    h1: "Kunststof rabatdelen",
    intro:
      "Rabatdelen uit het gevelassortiment. De werkende breedte en de prijs per m² staan op het artikel.",
  },
  {
    slug: "sponning",
    profile: "sponning",
    title: "Kunststof sponningdelen",
    h1: "Kunststof sponningdelen",
    intro:
      "Sponningdelen uit het gevelassortiment. De werkende breedte en de prijs per m² staan op het artikel.",
  },
  {
    slug: "potdeksel",
    profile: "potdeksel",
    title: "Kunststof potdeksel",
    h1: "Kunststof potdeksel",
    intro:
      "Potdekseldelen uit het gevelassortiment. De werkende breedte en de prijs per m² staan op het artikel.",
  },
] as const;

export const vensterbankKleuren = [
  "carrara-marmer",
  "creme",
  "donkergrijs",
  "freestone-light",
  "freestone-mat",
  "lichtgrijs",
  "marmer",
  "parelgrijs",
  "wit",
  "zwart",
] as const;

export const ziererKleuren = [
  "antraciet",
  "geel",
  "geel-gevlamd",
  "rood",
  "rood-gevlamd",
  "wit",
] as const;

export const hplFinishes = [
  {
    slug: "glad",
    title: "HPL plaat glad",
    h1: "HPL plaat glad",
    intro:
      "Gladde HPL platen uit de shopcollectie. Een plaat gaat de deur uit als hele plaat, 3050 × 1300 × 6 mm. Wij zagen niet op maat.",
  },
  {
    slug: "1-zijdig-structuur-folie",
    title: "HPL plaat 1-zijdig structuurfolie",
    h1: "HPL plaat met 1-zijdige structuurfolie",
    intro:
      "HPL met een structuurfolie aan één zijde, uit de shopcollectie. De plaat gaat eruit als hele plaat, 3050 × 1300 × 6 mm. Wij zagen niet op maat.",
  },
] as const;

const KLEUR_SPELLING: Record<string, string> = {
  creme: "Crème",
};

export function dutchKleurLabel(slug: string) {
  if (KLEUR_SPELLING[slug]) return KLEUR_SPELLING[slug];
  const ral = slug.match(/ral-(\d{4})/i);
  const name = slug
    .replace(/-ral-\d{4}$/i, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return ral ? `${name} RAL ${ral[1]}` : name;
}

export function dakrandCopy(label: string) {
  return {
    title: `${label} dakranden en boeidelen`,
    h1: `${label} dakranden en boeidelen`,
    intro: `${label} dakranden en boeidelen uit het assortiment. Hoeken en eindprofielen horen bij hetzelfde merk. Een kleurstaal legt u buiten, niet alleen op een scherm.`,
  };
}

export function montageCopy(label: string) {
  return {
    title: `Montagemateriaal ${label}`,
    h1: `Montagemateriaal voor ${label}`,
    intro: `Startprofielen, hoeken, eindprofielen en schroeven voor ${label}. Een hulpstuk van een ander merk past niet op dit systeem.`,
  };
}

export function vensterbankKleurCopy(slug: string) {
  const label = dutchKleurLabel(slug);
  return {
    title: `Kunststof vensterbank ${label}`,
    h1: `Kunststof vensterbank in ${label}`,
    intro: `Vensterbanken in ${label} uit het assortiment. Diepte en lengte kiest u op het artikel. Een kleur op een scherm is geen staal.`,
  };
}

export function ziererKleurCopy(slug: string) {
  const label = dutchKleurLabel(slug);
  return {
    title: `Zierer steenstrips ${label}`,
    h1: `Zierer steenstrips in ${label}`,
    intro: `Steenstrips van Zierer in ${label}. De strip is gevelbekleding, geen metselsteen. Vraag een staal als de tint naast de bestaande gevel moet.`,
  };
}

export function isVensterbankProduct(product: Pick<Product, "name" | "profileType">) {
  return product.profileType === "vensterbank" || /vensterbank/i.test(product.name);
}

export function isZiererStrip(product: Pick<Product, "brandSlug" | "profileType">) {
  return product.brandSlug === "zierer" || product.profileType === "steenstrip";
}

export function hplFinishMatch(
  product: Pick<Product, "name" | "description" | "meta" | "category" | "brandSlug">,
  slug: string,
) {
  if (product.category !== "hpl-platen") return false;
  const blob = `${product.name} ${product.description} ${product.meta}`.toLowerCase();
  if (slug === "glad") return /\bglad\b/.test(blob) && !/structuur/.test(blob);
  if (slug === "1-zijdig-structuur-folie") {
    return (
      product.brandSlug === "renolit" || /1[\s-]?zijdig|eenzijdig|structuurfolie|structuur[-\s]folie/.test(blob)
    );
  }
  return false;
}

export function indexableSlicePaths() {
  return [
    ...dakrandMerken.map((merk) => `/dakranden/${merk.slug}`),
    ...montageMerken.map((merk) => `/montage/${merk.slug}`),
    ...gevelTypes.map((type) => `/gevelbekleding/${type.slug}`),
    ...vensterbankKleuren.map((kleur) => `/kunststof-vensterbank/kleuren/${kleur}`),
    ...ziererKleuren.map((kleur) => `/zierer-steenstrips/kleuren/${kleur}`),
    ...hplFinishes.map((finish) => `/hpl-plaat/${finish.slug}`),
  ];
}
