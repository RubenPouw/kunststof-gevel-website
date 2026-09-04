export const brands = [
  {
    slug: "keralit",
    name: "Keralit",
    summary: "Houtlook geveldelen met 10 jaar kleurvastheid.",
  },
  {
    slug: "vinyplus",
    name: "VinyPlus",
    summary: "Dakranden en boeidelen, uit voorraad in 8 kleuren.",
  },
  {
    slug: "eurotexx",
    name: "Eurotexx",
    summary: "Rabat en sponning voor renovatie en nieuwbouw.",
  },
  {
    slug: "wooddesign",
    name: "Wooddesign",
    summary: "Potdeksel met diepe nerf, populair bij boerderijen.",
  },
] as const;

export const categories = [
  {
    slug: "gevelbekleding",
    name: "Gevelbekleding",
    summary: "Rabat, sponning, potdeksel en Zweeds rabat. Compleet met hoeken.",
  },
  {
    slug: "dakranden",
    name: "Dakranden",
    summary: "Boeidelen, dakrandpanelen en overhangen in matching kleuren.",
  },
  {
    slug: "kozijnafwerking",
    name: "Kozijnafwerking",
    summary: "Waterslagen, lateien en afdekprofielen rondom het kozijn.",
  },
] as const;

export type ProductColor = {
  name: string;
  hex: string;
  ral?: string;
  popular?: boolean;
};

export type Product = {
  slug: string;
  brand: string;
  brandSlug: string;
  name: string;
  category: (typeof categories)[number]["slug"];
  meta: string;
  price: number;
  inStock: boolean;
  stockText?: string;
  badge?: "Bestseller" | "Nieuw" | "Actie";
  colors: ProductColor[];
  length: string;
  description: string;
  specs: { label: string; value: string }[];
  palette: string[];
};

const wood = [
  { name: "Vergrijsd eiken", hex: "#A39480", ral: "RAL 7032", popular: true },
  { name: "Eiken", hex: "#8B5E3C", ral: "RAL 8003" },
  { name: "Meranti", hex: "#6B3A2A", ral: "RAL 8015" },
  { name: "Antraciet", hex: "#3A3D41", ral: "RAL 7016" },
] satisfies ProductColor[];

const slate = [
  { name: "Antraciet", hex: "#3A3D41", ral: "RAL 7016", popular: true },
  { name: "Diepzwart", hex: "#1A1B1C", ral: "RAL 9005" },
  { name: "Kiezelgrijs", hex: "#8B8E8A", ral: "RAL 7030" },
  { name: "Crème", hex: "#E8DCC8", ral: "RAL 9001" },
] satisfies ProductColor[];

export const products: Product[] = [
  {
    slug: "wooddesign-potdeksel-180",
    brand: "Wooddesign",
    brandSlug: "wooddesign",
    name: "Wooddesign Potdeksel 180 mm",
    category: "gevelbekleding",
    meta: "6 m per lengte · 12 kleuren",
    price: 89.45,
    inStock: true,
    badge: "Bestseller",
    colors: wood,
    length: "6 m",
    description:
      "Potdeksel met diepe overlapping. Geeft ritme in de gevel en extra waterkering. Populair bij renovatie van boerderijen en jaren-70-woningen.",
    specs: [
      { label: "Werkende breedte", value: "180 mm" },
      { label: "Lengte", value: "6 m" },
      { label: "Materiaal", value: "PVC houtlook" },
      { label: "Garantie", value: "10 jaar kleurvast" },
    ],
    palette: ["#7A4E2E", "#8C5A36", "#6E4326", "#9A6840"],
  },
  {
    slug: "vinyplus-dakrandpaneel-295",
    brand: "VinyPlus",
    brandSlug: "vinyplus",
    name: "Vinyplus Dakrandpaneel 295 × 35 × 16 mm",
    category: "dakranden",
    meta: "6 m per lengte · 8 kleuren",
    price: 264.99,
    inStock: false,
    stockText: "Levertijd 5 werkdagen",
    colors: slate,
    length: "6 m",
    description:
      "Stevig dakrandpaneel voor boeiboord en overhang. Past bij VinyPlus geveldelen; zelfde folie, zelfde garantie.",
    specs: [
      { label: "Maat", value: "295 × 35 × 16 mm" },
      { label: "Lengte", value: "6 m" },
      { label: "Materiaal", value: "PVC" },
      { label: "Garantie", value: "10 jaar" },
    ],
    palette: ["#3A3D41", "#45484C", "#323538", "#4C5055"],
  },
  {
    slug: "keralit-sponningdeel-143",
    brand: "Keralit",
    brandSlug: "keralit",
    name: "Keralit Sponningdeel 143 mm",
    category: "gevelbekleding",
    meta: "6 m per lengte · 24 kleuren",
    price: 74.95,
    inStock: true,
    badge: "Nieuw",
    colors: slate,
    length: "6 m",
    description:
      "Strak sponningdeel met subtiele groef. Rustige gevel zonder grove overlapping. Vaak gekozen bij nieuwbouw.",
    specs: [
      { label: "Werkende breedte", value: "143 mm" },
      { label: "Lengte", value: "6 m" },
      { label: "Materiaal", value: "Keralit houtlook" },
      { label: "Garantie", value: "10 jaar kleurvast" },
    ],
    palette: ["#3A3D41", "#45484C", "#323538", "#4C5055"],
  },
  {
    slug: "eurotexx-rabatdeel-167",
    brand: "Eurotexx",
    brandSlug: "eurotexx",
    name: "Eurotexx Rabatdeel 167 mm",
    category: "gevelbekleding",
    meta: "6 m per lengte · 10 kleuren",
    price: 68.5,
    inStock: true,
    colors: wood,
    length: "6 m",
    description:
      "Klassiek rabatdeel. Overlapping voert regenwater af. Geschikt voor gevels, topgevels en bergingen.",
    specs: [
      { label: "Werkende breedte", value: "167 mm" },
      { label: "Lengte", value: "6 m" },
      { label: "Materiaal", value: "PVC houtlook" },
      { label: "Garantie", value: "10 jaar" },
    ],
    palette: ["#7A4E2E", "#8C5A36", "#6E4326", "#9A6840"],
  },
  {
    slug: "keralit-zweeds-rabat-175",
    brand: "Keralit",
    brandSlug: "keralit",
    name: "Keralit Zweeds rabat 175 mm",
    category: "gevelbekleding",
    meta: "6 m per lengte · 18 kleuren",
    price: 82.0,
    inStock: true,
    colors: wood,
    length: "6 m",
    description:
      "Schuine delen met een Scandinavische, houtachtige gevelstructuur. Goed in combinatie met antraciet kozijnen.",
    specs: [
      { label: "Werkende breedte", value: "175 mm" },
      { label: "Lengte", value: "6 m" },
      { label: "Materiaal", value: "Keralit houtlook" },
      { label: "Garantie", value: "10 jaar kleurvast" },
    ],
    palette: ["#A39480", "#B3A490", "#8E8170", "#C4B6A2"],
  },
  {
    slug: "eurotexx-hoekprofiel-buiten",
    brand: "Eurotexx",
    brandSlug: "eurotexx",
    name: "Eurotexx Buitenhoekprofiel 70 mm",
    category: "kozijnafwerking",
    meta: "6 m per lengte · 10 kleuren",
    price: 41.25,
    inStock: true,
    colors: slate,
    length: "6 m",
    description:
      "Buitenhoek voor een strakke sluiting van rabat- en sponningdelen. Zelfde folie als de geveldelen.",
    specs: [
      { label: "Breedte", value: "70 mm" },
      { label: "Lengte", value: "6 m" },
      { label: "Toepassing", value: "Buitenhoek" },
      { label: "Garantie", value: "10 jaar" },
    ],
    palette: ["#3A3D41", "#1A1B1C", "#8B8E8A", "#E8DCC8"],
  },
  {
    slug: "wooddesign-startprofiel",
    brand: "Wooddesign",
    brandSlug: "wooddesign",
    name: "Wooddesign Start- en eindprofiel",
    category: "kozijnafwerking",
    meta: "6 m per lengte · 12 kleuren",
    price: 36.8,
    inStock: true,
    colors: wood,
    length: "6 m",
    description:
      "Startlat onderaan en eindprofiel bovenaan. Nodig voor ventilatie en een nette sluiting.",
    specs: [
      { label: "Lengte", value: "6 m" },
      { label: "Toepassing", value: "Start / einde" },
      { label: "Materiaal", value: "PVC" },
      { label: "Garantie", value: "10 jaar" },
    ],
    palette: ["#7A4E2E", "#8C5A36", "#6E4326", "#9A6840"],
  },
  {
    slug: "vinyplus-waterslag-180",
    brand: "VinyPlus",
    brandSlug: "vinyplus",
    name: "Vinyplus Waterslag 180 mm",
    category: "kozijnafwerking",
    meta: "6 m per lengte · 8 kleuren",
    price: 54.9,
    inStock: true,
    badge: "Actie",
    colors: slate,
    length: "6 m",
    description:
      "Waterslag onder het kozijn. Voert water af van de gevel en sluit aan op VinyPlus panelen.",
    specs: [
      { label: "Breedte", value: "180 mm" },
      { label: "Lengte", value: "6 m" },
      { label: "Toepassing", value: "Onder kozijn" },
      { label: "Garantie", value: "10 jaar" },
    ],
    palette: ["#3A3D41", "#45484C", "#323538", "#4C5055"],
  },
  {
    slug: "keralit-dakrand-200",
    brand: "Keralit",
    brandSlug: "keralit",
    name: "Keralit Dakrand 200 mm",
    category: "dakranden",
    meta: "6 m per lengte · 16 kleuren",
    price: 118.0,
    inStock: true,
    colors: slate,
    length: "6 m",
    description:
      "Dakrand voor een doorlopende lijn met Keralit geveldelen. Folie en garantie gelijk aan het gevelsysteem.",
    specs: [
      { label: "Breedte", value: "200 mm" },
      { label: "Lengte", value: "6 m" },
      { label: "Materiaal", value: "Keralit" },
      { label: "Garantie", value: "10 jaar kleurvast" },
    ],
    palette: ["#3A3D41", "#45484C", "#323538", "#4C5055"],
  },
  {
    slug: "eurotexx-boeidelen-250",
    brand: "Eurotexx",
    brandSlug: "eurotexx",
    name: "Eurotexx Boeideel 250 mm",
    category: "dakranden",
    meta: "6 m per lengte · 10 kleuren",
    price: 96.4,
    inStock: false,
    stockText: "Levertijd 5 werkdagen",
    colors: wood,
    length: "6 m",
    description:
      "Boeideel voor de dakoverstek. Zelfde nerf als Eurotexx rabat, zodat dakrand en gevel één vlak vormen.",
    specs: [
      { label: "Breedte", value: "250 mm" },
      { label: "Lengte", value: "6 m" },
      { label: "Materiaal", value: "PVC houtlook" },
      { label: "Garantie", value: "10 jaar" },
    ],
    palette: ["#7A4E2E", "#8C5A36", "#6E4326", "#9A6840"],
  },
];

export const featuredProductSlugs = [
  "wooddesign-potdeksel-180",
  "vinyplus-dakrandpaneel-295",
  "keralit-sponningdeel-143",
  "eurotexx-rabatdeel-167",
] as const;

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: Product["category"]) {
  return products.filter((product) => product.category === category);
}

export function getProductsByBrand(brandSlug: string) {
  return products.filter((product) => product.brandSlug === brandSlug);
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((product) =>
    [product.name, product.brand, product.meta, product.category, product.slug]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getBrand(slug: string) {
  return brands.find((brand) => brand.slug === slug);
}
