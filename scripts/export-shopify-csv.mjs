import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const palettes = JSON.parse(readFileSync(join(root, "data/catalog/palettes.json"), "utf8"));
const productsFile = JSON.parse(readFileSync(join(root, "data/catalog/products.json"), "utf8"));

function csvEscape(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function variantsOf(item) {
  if (item.variants?.length) return item.variants;
  const palette = palettes[item.paletteId] ?? [];
  return palette.map((color) => ({
    sku: `${item.skuPrefix}-${color.skuSuffix}`,
    ean: "",
    colorName: color.colorName,
    price: item.price,
    inStock: item.inStock !== false,
  }));
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
