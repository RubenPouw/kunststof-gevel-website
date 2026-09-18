import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const palettes = JSON.parse(readFileSync(join(root, "src/data/catalog/palettes.json"), "utf8"));
const productsFile = JSON.parse(readFileSync(join(root, "src/data/catalog/products.json"), "utf8"));

const THREE_M_RATIO = 46.9 / 87.3;

function csvEscape(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function inferProfileType(name) {
  const t = name.toLowerCase();
  if (/steenstrip|wildverband/.test(t)) return "steenstrip";
  if (/sponning/.test(t)) return "sponning";
  if (/potdeksel/.test(t)) return "potdeksel";
  if (/rondkant/.test(t)) return "rondkant";
  if (/quattro/.test(t)) return "quattro";
  if (/\brabat\b|duafort/.test(t)) return "rabat";
  return "overig";
}

function colorVariantsOf(item) {
  if (item.variants?.length) {
    return item.variants.map((variant) => ({
      sku: variant.sku,
      ean: variant.ean ?? "",
      colorName: variant.colorName,
      length: variant.length,
      price: variant.price,
      inStock: variant.inStock !== false,
    }));
  }
  const palette = palettes[item.paletteId] ?? [];
  return palette.map((color) => ({
    sku: `${item.skuPrefix}-${color.skuSuffix}`,
    ean: "",
    colorName: color.colorName,
    length: item.length ?? "6 m",
    price: item.price,
    inStock: item.inStock !== false,
  }));
}

function variantsOf(item) {
  const colors = colorVariantsOf(item);
  const facade =
    item.category === "gevelbekleding" &&
    ["sponning", "potdeksel", "rabat", "rondkant", "quattro"].includes(inferProfileType(item.name));
  const lengths = new Set(colors.map((variant) => variant.length));
  if (!facade || !lengths.has("6 m") || lengths.has("3 m")) return colors;

  return [
    ...colors,
    ...colors
      .filter((variant) => variant.length === "6 m")
      .map((variant) => ({
        ...variant,
        sku: `${variant.sku}-3M`,
        length: "3 m",
        price: item.slug === "keralit-sponning-143" ? 46.9 : roundMoney(variant.price * THREE_M_RATIO),
      })),
  ];
}

const header = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Type",
  "Tags",
  "Published",
  "Option1 Name",
  "Option1 Value",
  "Option2 Name",
  "Option2 Value",
  "Variant SKU",
  "Variant Barcode",
  "Variant Price",
  "Variant Grams",
  "Variant Inventory Qty",
  "Status",
];

const rows = [header.map(csvEscape).join(",")];

for (const product of productsFile.items) {
  variantsOf(product).forEach((variant, index) => {
    rows.push(
      [
        product.slug,
        index === 0 ? product.name : "",
        index === 0 ? product.description : "",
        index === 0 ? product.vendor : "",
        index === 0 ? product.category : "",
        index === 0 ? product.brandSlug : "",
        index === 0 ? "TRUE" : "",
        "Kleur",
        variant.colorName,
        "Lengte",
        variant.length,
        variant.sku,
        variant.ean ?? "",
        Number(variant.price).toFixed(2),
        "",
        variant.inStock ? "10" : "0",
        index === 0 ? "active" : "",
      ]
        .map(csvEscape)
        .join(","),
    );
  });
}

writeFileSync(join(root, "data/shopify-import.csv"), `${rows.join("\n")}\n`);
