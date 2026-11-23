import assert from "node:assert/strict";
import test from "node:test";

import { enrichProduct } from "../src/lib/catalog/derive.ts";
import { applyListingFilters, listingHref, parseListingSearchParams } from "../src/lib/catalog/helpers.ts";
import {
  eindkapSystemOf,
  kozijnTypeLabels,
  kozijnTypeOf,
  withKozijnPhotos,
  type KozijnType,
} from "../src/lib/catalog/kozijn-types.ts";
import type { Product } from "../src/lib/catalog/types.ts";
import { inferCategory, resolvePublicCategory } from "../src/lib/shopify/map.ts";

/** Live titles on /kozijnafwerking, November 2026. */
const LIVE: { slug: string; name: string; type: KozijnType | "hpl-platen"; system?: string }[] = [
  { slug: "volschuim-afwerkprofiel-20x6-mm", name: "Volschuim afwerkprofiel 20x6 mm", type: "afwerkprofiel-volschuim" },
  { slug: "volschuim-afwerkprofiel-22x20-mm", name: "Volschuim afwerkprofiel 22x20 mm", type: "afwerkprofiel-volschuim" },
  { slug: "volschuim-afwerkprofiel-90x5-5-mm", name: "Volschuim afwerkprofiel 90x5,5 mm", type: "afwerkprofiel-volschuim" },
  { slug: "volschuim-afwerkprofiel-98x8-mm", name: "Volschuim afwerkprofiel 98x8 mm", type: "afwerkprofiel-volschuim" },
  { slug: "volschuim-afwerkprofiel-40x5-5-mm", name: "Volschuim afwerkprofiel 40x5,5 mm", type: "afwerkprofiel-volschuim" },
  { slug: "volschuim-afwerkprofiel-60x5-5-mm", name: "Volschuim afwerkprofiel 60x5,5 mm", type: "afwerkprofiel-volschuim" },
  { slug: "volschuim-afwerkprofiel-25x6-mm", name: "Volschuim afwerkprofiel 25x6 mm", type: "afwerkprofiel-volschuim" },
  { slug: "volschuim-kwartrond-18x18-mm", name: "Volschuim kwartrond 18x18 mm", type: "kwartrond" },
  { slug: "volschuim-kwartrond-12x12-mm", name: "Volschuim kwartrond 12x12 mm", type: "kwartrond" },
  { slug: "staalversterking-behandeld-tbv-paneelprofiel", name: "Staalversterking behandeld tbv paneelprofiel", type: "paneelprofiel" },
  { slug: "paneelprofiel-100x24-mm", name: "Paneelprofiel 100x24 mm", type: "paneelprofiel" },
  { slug: "paneelprofiel-100x24-mm-wit", name: "Paneelprofiel 100x24 mm / wit", type: "paneelprofiel" },
  { slug: "dagkant-bekleding-180-mm", name: "Dagkant bekleding 180 mm", type: "dagkantafwerking" },
  { slug: "dagkant-bekleding-250-mm", name: "Dagkant bekleding 250 mm", type: "dagkantafwerking" },
  { slug: "koplat-100-mm", name: "Koplat 100 mm", type: "koplat" },
  { slug: "koplat-75-mm", name: "Koplat 75 mm", type: "koplat" },
  { slug: "milinboard-steenlook-eindkap-500-mm", name: "Milinboard steenlook eindkap 500 mm", type: "eindkap", system: "milinboard" },
  { slug: "milinboard-type-b-eindkap-2-zijdig-420-mm", name: "Milinboard type B eindkap 2-zijdig 420 mm", type: "eindkap", system: "milinboard" },
  { slug: "eindkap-connector-links-voor-2814-5st", name: "Eindkap+connector links voor 2814 (5st)", type: "eindkap", system: "keralit" },
  { slug: "keralit-eindkap-voor-2827-2828", name: "Keralit eindkap voor 2827/2828", type: "eindkap", system: "keralit" },
  { slug: "eindkap-connector-rechts-voor-2814-5st", name: "Eindkap+connector rechts voor 2814 (5st)", type: "eindkap", system: "keralit" },
  { slug: "eindkap-connector-links-voor-2817-5st", name: "Eindkap+connector links voor 2817 (5st)", type: "eindkap", system: "keralit" },
  { slug: "eindkap-connector-rechts-voor-2817-5st", name: "Eindkap+connector rechts voor 2817 (5st)", type: "eindkap", system: "keralit" },
  { slug: "eindkap-connector-links-voor-2819-5st", name: "Eindkap+connector links voor 2819 (5st)", type: "eindkap", system: "keralit" },
  { slug: "eindkap-connector-rechts-voor-2819-5st", name: "Eindkap+connector rechts voor 2819 (5st)", type: "eindkap", system: "keralit" },
  { slug: "eindkap-connector-links-voor-2815-5st", name: "Eindkap+connector links voor 2815 (5st)", type: "eindkap", system: "keralit" },
  { slug: "eindkap-connector-rechts-voor-2815-5st", name: "Eindkap+connector rechts voor 2815 (5st)", type: "eindkap", system: "keralit" },
  { slug: "novaboard-eindkap-links", name: "Novaboard eindkap links", type: "eindkap", system: "novaboard" },
  { slug: "novaboard-eindkap-400mm-vlak", name: "Novaboard eindkap 400mm (vlak)", type: "eindkap", system: "novaboard" },
  { slug: "novaboard-stone-eindkap-400mm-vlak", name: "Novaboard Stone Eindkap 400mm (vlak)", type: "eindkap", system: "novaboard" },
  { slug: "novaboard-stone-eindkap-rechts-links", name: "Novaboard Stone Eindkap rechts & links", type: "eindkap", system: "novaboard" },
  { slug: "novaboard-eindkap-rechts", name: "Novaboard eindkap rechts", type: "eindkap", system: "novaboard" },
  { slug: "eindkap-lignodur-stone-30cm", name: "Eindkap Lignodur Stone 30cm", type: "eindkap", system: "lignodur" },
  { slug: "eindkap-universeel-lignodur", name: "Eindkap universeel, Lignodur", type: "eindkap", system: "lignodur" },
  { slug: "eindkap-univers-lignodur-overz-vensterb", name: "Eindkap univers.Lignodur overz.vensterb.", type: "eindkap", system: "lignodur" },
  { slug: "zelfklevend-schuim-3000-x-1000-x-17-mm", name: "Zelfklevend schuim 3000 x 1000 x 17 mm", type: "zelfklevend-schuim" },
  { slug: "zelfklevend-schuim-3000-x-1000-x-20-mm", name: "Zelfklevend schuim 3000 x 1000 x 20 mm", type: "zelfklevend-schuim" },
  { slug: "zelfklevend-schuim-3000-x-1000-x-22-mm", name: "Zelfklevend schuim 3000 x 1000 x 22 mm", type: "zelfklevend-schuim" },
  { slug: "zelfklevend-schuim-3000-x-1000-x-21-mm", name: "Zelfklevend schuim 3000 x 1000 x 21 mm", type: "zelfklevend-schuim" },
  { slug: "hard-pvc-reiniger-1000-ml", name: "Hard PVC reiniger 1000 ml", type: "reiniging" },
  { slug: "reiniging-onderhouds-set-premium-voor-kozijnen", name: "Reiniging / onderhouds set premium voor kozijnen", type: "reiniging" },
  { slug: "pvc-plaat-3000-x-1500-x-1-5-mm", name: "PVC plaat 3000 x 1500 x 1,5 mm", type: "hpl-platen" },
  { slug: "sandwichpaneel-pvc-hpl-folie-3050-x-1150-x-24-mm", name: "Sandwichpaneel PVC/HPL Folie 3050 x 1150 x 24 mm", type: "hpl-platen" },
  { slug: "sandwichpaneel-hpl-hpl-3050-x-1150-x-24-mm", name: "Sandwichpaneel HPL/HPL 3050 x 1150 x 24 mm", type: "hpl-platen" },
  { slug: "sandwichpaneel-hpl-folie-hpl-3050-x-1300-x-24-mm", name: "Sandwichpaneel HPL Folie/HPL 3050 x 1300 x 24 mm", type: "hpl-platen" },
  { slug: "sandwichpaneel-pvc-pvc-3000-x-1500-x-24-mm", name: "Sandwichpaneel PVC/PVC 3000 x 1500 x 24 mm", type: "hpl-platen" },
  { slug: "sandwichpaneel-hpl-folie-hpl-folie-3050-x-1150-x-24-mm", name: "Sandwichpaneel HPL Folie/HPL Folie 3050 x 1150 x 24 mm", type: "hpl-platen" },
];

test("live kozijnafwerking titles land on the finer types", () => {
  const counts = new Map<string, number>();
  const systems = new Map<string, number>();
  for (const row of LIVE) {
    const type = kozijnTypeOf(row);
    if (row.type === "hpl-platen") {
      assert.equal(type, undefined, row.slug);
      continue;
    }
    assert.equal(type, row.type, row.name);
    counts.set(type!, (counts.get(type!) ?? 0) + 1);
    if (row.system) {
      assert.equal(eindkapSystemOf(row), row.system, row.name);
      systems.set(row.system, (systems.get(row.system) ?? 0) + 1);
    } else {
      assert.equal(eindkapSystemOf(row), undefined, row.name);
    }
  }
  assert.equal(counts.get("afwerkprofiel-volschuim"), 7);
  assert.equal(counts.get("kwartrond"), 2);
  assert.equal(counts.get("paneelprofiel"), 3);
  assert.equal(counts.get("dagkantafwerking"), 2);
  assert.equal(counts.get("koplat"), 2);
  assert.equal(counts.get("eindkap"), 19);
  assert.equal(counts.get("zelfklevend-schuim"), 4);
  assert.equal(counts.get("reiniging"), 2);
  assert.equal(systems.get("keralit"), 9);
  assert.equal(systems.get("novaboard"), 5);
  assert.equal(systems.get("lignodur"), 3);
  assert.equal(systems.get("milinboard"), 2);
  assert.equal(
    LIVE.filter((row) => row.type !== "hpl-platen").length,
    [...counts.values()].reduce((sum, count) => sum + count, 0),
  );
  assert.equal(
    kozijnTypeOf({
      name: "Koplat 75 mm",
      slug: "koplat-75-mm",
      tags: ["cat-full:kozijnafwerking-dagkantafwerking-2-delige-dagkantafwerkingen"],
    }),
    "koplat",
  );
  assert.equal(kozijnTypeLabels.eindkap, "Eindkappen");
  assert.equal(kozijnTypeLabels.reiniging, "Reiniging en onderhoud");
});

test("sandwichpanelen and the PVC plaat leave kozijnafwerking for HPL platen", () => {
  for (const row of LIVE.filter((item) => item.type === "hpl-platen")) {
    assert.equal(
      inferCategory({
        handle: row.slug,
        title: row.name,
        productType: "Kozijnafwerking",
        tags: [],
      }),
      "hpl-platen",
      row.slug,
    );
    assert.equal(
      resolvePublicCategory({
        category: "kozijnafwerking",
        productType: "Kozijnafwerking",
        name: row.name,
        slug: row.slug,
        brandSlug: "milin",
      }),
      "hpl-platen",
      row.slug,
    );
  }
  assert.equal(
    resolvePublicCategory({
      category: "kozijnafwerking",
      productType: "Kozijnafwerking",
      name: "Volschuim afwerkprofiel 20x6 mm",
      slug: "volschuim-afwerkprofiel-20x6-mm",
      brandSlug: "milin",
    }),
    "kozijnafwerking",
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
});

test("a moved sandwich is not sold as a 6 mm HPL sheet", () => {
  const product = enrichProduct({
    slug: "sandwichpaneel-hpl-hpl-3050-x-1150-x-24-mm",
    name: "Sandwichpaneel HPL/HPL 3050 x 1150 x 24 mm",
    vendor: "Milin",
    brand: "Milin",
    brandSlug: "milin",
    category: "hpl-platen",
    description: "Sandwich.",
    specs: [],
    relatedSlugs: [],
    variants: [
      {
        sku: "SAND",
        ean: "",
        colorName: "Wit",
        hex: "#F4F1EA",
        length: "stuk",
        price: 364,
        inStock: true,
        colorFamily: "licht",
        sampleId: "pending",
      },
    ],
    price: 364,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: "stuk",
    images: [],
    profileType: "overig",
    sampleable: false,
  } satisfies Product);
  assert.equal(product.saleUnit, undefined);
  assert.equal(product.sheetM2, undefined);
  assert.equal(product.sampleable, false);
  assert.equal(product.length, "3050 mm");
});

test("type and systeem query the kozijn filters and leave gevel type links alone", () => {
  const filters = parseListingSearchParams({ type: "eindkap", systeem: "keralit" });
  assert.equal(filters.kozijnType, "eindkap");
  assert.equal(filters.profileType, undefined);
  assert.equal(filters.eindkapSystem, "keralit");
  assert.equal(
    listingHref("/kozijnafwerking", {}, { kozijnTypes: ["eindkap"], eindkapSystems: ["keralit"] }),
    "/kozijnafwerking?type=eindkap&systeem=keralit",
  );
  const gevel = parseListingSearchParams({ type: "sponning" });
  assert.equal(gevel.profileType, "sponning");
  assert.equal(gevel.kozijnType, undefined);
  const kept = applyListingFilters(
    [
      { ...sheetish("volschuim-afwerkprofiel-20x6-mm", "Volschuim afwerkprofiel 20x6 mm"), category: "kozijnafwerking" },
      { ...sheetish("novaboard-eindkap-links", "Novaboard eindkap links"), category: "kozijnafwerking" },
    ],
    { kozijnType: "eindkap" },
  );
  assert.deepEqual(kept.map((item) => item.slug), ["novaboard-eindkap-links"]);
});

test("a product without a gallery file keeps a real Shopify photo", () => {
  const filled = withKozijnPhotos([
    {
      slug: "paneelprofiel-100x24-mm",
      name: "Paneelprofiel 100x24 mm",
      images: [],
      variants: [{ image: undefined }],
    },
    {
      slug: "eindkap-connector-links-voor-2814-5st",
      name: "Eindkap+connector links voor 2814 (5st)",
      images: [{ url: "https://cdn.shopify.com/s/files/1/1091/6698/5554/files/FM2233.jpg", alt: "2814" }],
      variants: [],
    },
    {
      slug: "eindkap-connector-links-voor-2815-5st",
      name: "Eindkap+connector links voor 2815 (5st)",
      images: [],
      variants: [{ image: undefined }],
    },
  ]);
  assert.match(filled[0]?.images[0]?.url ?? "", /paneelprofieltotaal\.jpg/);
  assert.equal(filled[1]?.images[0]?.url, "https://cdn.shopify.com/s/files/1/1091/6698/5554/files/FM2233.jpg");
  assert.equal(filled[2]?.images[0]?.url, "https://cdn.shopify.com/s/files/1/1091/6698/5554/files/FM2233.jpg");
  assert.equal(filled[2]?.images[0]?.alt, "Eindkap+connector links voor 2815 (5st)");
});

function sheetish(slug: string, name: string): Product {
  return {
    slug,
    name,
    vendor: "Milin",
    brand: "Milin",
    brandSlug: "milin",
    category: "kozijnafwerking",
    description: "",
    specs: [],
    relatedSlugs: [],
    variants: [],
    price: 1,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: "stuk",
    images: [],
    profileType: "profiel",
    sampleable: false,
  };
}
