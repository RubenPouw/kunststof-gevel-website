import assert from "node:assert/strict";
import test from "node:test";

import { pricePerSquareMetre } from "../src/lib/catalog/square-metre.ts";
import { CARD_SWATCH_LIMIT, isWoodColour, visibleCardSwatches } from "../src/lib/catalog/swatches.ts";

test("square metre price uses width and length and skips missing data", () => {
  assert.equal(pricePerSquareMetre({ priceIncl: 90, workingWidthMm: 150, length: "6 m" }), 100);
  assert.equal(pricePerSquareMetre({ priceIncl: 40, workingWidthMm: 80, length: "5 m" }), 100);
  assert.equal(pricePerSquareMetre({ priceIncl: 90, length: "6 m" }), undefined);
  assert.equal(pricePerSquareMetre({ priceIncl: 90, workingWidthMm: 70, length: "6 m" }), undefined);
  assert.equal(pricePerSquareMetre({ priceIncl: 90, workingWidthMm: 150, length: "stuk" }), undefined);
  assert.equal(pricePerSquareMetre({ priceIncl: 90, workingWidthMm: 150, length: "150 mm" }), undefined);
  assert.equal(pricePerSquareMetre({ priceIncl: 0, workingWidthMm: 150, length: "6 m" }), undefined);
  assert.equal(pricePerSquareMetre({ priceIncl: 39.65, sheetM2: 3.965 }), 10);
});

test("a card shows at most six swatches and keeps the active one visible", () => {
  const swatches = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
  assert.equal(CARD_SWATCH_LIMIT, 6);
  assert.deepEqual(
    visibleCardSwatches(swatches, 1).map((item) => item.index),
    [0, 1, 2, 3, 4, 5],
  );
  assert.deepEqual(
    visibleCardSwatches(swatches, 8).map((item) => item.index),
    [0, 1, 2, 3, 4, 8],
  );
  assert.equal(swatches.length - visibleCardSwatches(swatches, 8).length, 4);
  assert.equal(visibleCardSwatches(swatches.slice(0, 3), 0).length, 3);
  assert.equal(isWoodColour("Eiken", "donker"), true);
  assert.equal(isWoodColour("Antraciet", "houtlook"), true);
  assert.equal(isWoodColour("Antraciet", "donker"), false);
});
