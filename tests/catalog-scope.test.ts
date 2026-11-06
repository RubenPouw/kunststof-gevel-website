import assert from "node:assert/strict";
import test from "node:test";

import { brandLogoSrc } from "../src/lib/catalog/brand-logos.ts";
import { isHiddenOnKunststofGevel } from "../src/lib/catalog/visibility.ts";
import { matchProductLine } from "../src/lib/catalog/text-rules.ts";
import { assembleCatalog } from "../src/lib/shopify/catalog.ts";
import {
  KNOWN_BRANDS,
  categoryFromProductType,
  inferCategory,
  mapShopifyProduct,
  resolvePublicCategory,
} from "../src/lib/shopify/map.ts";
import type { ShopifyProduct } from "../src/lib/shopify/types.ts";

function shop(partial: Pick<ShopifyProduct, "handle" | "title"> & Partial<ShopifyProduct>): ShopifyProduct {
  return {
    id: `gid://shopify/Product/${partial.handle}`,
    description: "Omschrijving die lang genoeg is om te bewaren.",
    productType: "",
    vendor: "AJ Fust",
    tags: [],
    availableForSale: true,
    options: [{ name: "Title" }],
    featuredImage: null,
    images: { nodes: [] },
    variants: {
      nodes: [
        {
          id: `gid://shopify/ProductVariant/${partial.handle}`,
          title: "Default Title",
          sku: "SKU-1",
          availableForSale: true,
          price: { amount: "12.00", currencyCode: "EUR" },
          selectedOptions: [{ name: "Title", value: "Default Title" }],
          image: null,
        },
      ],
    },
    ...partial,
  };
}

test("product types land on dakranden and plafondpanelen, not on hygienische wandbekleding", () => {
  assert.equal(categoryFromProductType("Dakranden"), "dakranden");
  assert.equal(categoryFromProductType("Plafondpanelen"), "plafondpanelen");
  assert.equal(categoryFromProductType("Hygienische wandbekleding"), undefined);
  assert.equal(categoryFromProductType("Hygiënische wandbekleding"), undefined);
  assert.equal(
    isHiddenOnKunststofGevel({ handle: "wand-wit", title: "Wand wit", productType: "Hygiënische wandbekleding" }),
    true,
  );
});

test("unipanel panels and florence leave gevel, even when the stored type still says gevel", () => {
  assert.equal(
    inferCategory(
      shop({
        handle: "unipanel-bouwpaneel-185x16mm",
        title: "Unipanel bouwpaneel 185x16mm",
        productType: "Gevelbekleding",
      }),
      ["gevelbekleding"],
    ),
    "dakranden",
  );
  assert.equal(
    inferCategory(
      shop({
        handle: "unipanel-sierlijst-36x52mm",
        title: "Unipanel sierlijst 36x52mm",
        productType: "Dakranden",
      }),
      ["gevelbekleding"],
    ),
    "dakranden",
  );
  assert.equal(
    inferCategory(
      shop({
        handle: "florence-buitenplafond-paneel-250x16-5-mm",
        title: "Florence buitenplafond paneel 250x16,5 mm",
        productType: "Plafondpanelen",
      }),
      ["wandpanelen"],
    ),
    "plafondpanelen",
  );
  assert.equal(
    inferCategory(
      shop({
        handle: "startprofiel-2-dl-florence-buitenplafond",
        title: "Startprofiel 2-dl Florence buitenplafond",
        productType: "Kunststof profielen",
      }),
      ["montage"],
    ),
    "plafondpanelen",
  );
  assert.equal(
    resolvePublicCategory({
      category: "gevelbekleding",
      productType: "Wandpanelen",
      name: "Unipanel bouwpaneel 610x16mm",
      slug: "unipanel-bouwpaneel-610x16mm",
      brandSlug: "unipanel",
    }),
    "dakranden",
  );
  assert.equal(
    resolvePublicCategory({
      category: "gevelbekleding",
      productType: "Gevelbekleding",
      name: "Florence binnenplafond paneel 250x10mm",
      slug: "florence-binnenplafond-paneel-250x10mm",
      brandSlug: "florence",
    }),
    "plafondpanelen",
  );
  assert.equal(
    resolvePublicCategory({
      category: "gevelbekleding",
      productType: "Gevelbekleding",
      name: "Keralit sponningdeel 143 mm",
      slug: "keralit-sponningdeel-143",
      brandSlug: "keralit",
    }),
    "gevelbekleding",
  );
  assert.equal(
    resolvePublicCategory({
      category: "montage",
      productType: "Montage",
      name: "Unipanel schroef 4x50 100st",
      slug: "unipanel-schroef-4x50-100st-incl-dopjes",
      brandSlug: "unipanel",
    }),
    "montage",
  );
});

test("linerio and wonderboard stay out of the kunststof-gevel catalog", () => {
  assert.equal(KNOWN_BRANDS.some((brand) => brand.slug === "linerio"), false);
  assert.equal(brandLogoSrc("linerio"), undefined);
  assert.equal(matchProductLine("Linerio wandpaneel S 115mm"), undefined);

  const catalog = assembleCatalog(
    [
      shop({
        handle: "linerio-wandpaneel-s-115mm",
        title: "Linerio wandpaneel S 115mm",
        productType: "Wandpanelen",
        vendor: "Linerio",
      }),
      shop({
        handle: "wonderboard-2500x1200x2-3-mm-structuur",
        title: "Wonderboard 2500x1200x2,3 mm structuur",
        productType: "Gevelbekleding",
        vendor: "Milin",
        collections: { nodes: [{ handle: "gevelbekleding" }] },
      }),
      shop({
        handle: "wand-hygienisch",
        title: "Hygienische wandplaat wit",
        productType: "Hygienische wandbekleding",
        vendor: "Milin",
        collections: { nodes: [{ handle: "milin" }] },
      }),
      shop({
        handle: "unipanel-bouwpaneel-185x16mm",
        title: "Unipanel bouwpaneel 185x16mm",
        productType: "Dakranden",
        collections: { nodes: [{ handle: "gevelbekleding" }] },
      }),
      shop({
        handle: "florence-buitenplafond-paneel-250x16-5-mm",
        title: "Florence buitenplafond paneel 250x16,5 mm",
        productType: "Plafondpanelen",
      }),
      shop({
        handle: "keralit-sponningdeel-143",
        title: "Keralit sponningdeel 143 mm",
        productType: "Gevelbekleding",
        vendor: "Keralit",
      }),
    ],
    [],
  );

  const slugs = catalog.products.map((product) => product.slug).sort();
  assert.deepEqual(slugs, [
    "florence-buitenplafond-paneel-250x16-5-mm",
    "keralit-sponningdeel-143",
    "unipanel-bouwpaneel-185x16mm",
  ]);
  assert.equal(catalog.products.find((product) => product.brandSlug === "unipanel")?.category, "dakranden");
  assert.equal(catalog.products.find((product) => product.brandSlug === "florence")?.category, "plafondpanelen");
  assert.equal(catalog.products.find((product) => product.brandSlug === "keralit")?.category, "gevelbekleding");
  assert.equal(catalog.brands.some((brand) => brand.slug === "linerio" || brand.slug === "wonderboard"), false);
  assert.equal(mapShopifyProduct(shop({ handle: "linerio-startprofiel-s-2650x28x12", title: "Linerio startprofiel S" })), null);
});
