import assert from "node:assert/strict";
import test from "node:test";

import { facadeOrder, parseMeters } from "../src/lib/area.ts";

test("parseMeters accepts a Dutch decimal comma", () => {
  assert.equal(parseMeters("8,5"), 8.5);
});

test("facadeOrder adds 10 percent waste and rounds panels up", () => {
  const result = facadeOrder({ widthM: 10, heightM: 3, openingsM2: 2, panelsPerM2: 1.2 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.netM2, 28);
  assert.ok(Math.abs(result.orderM2 - 30.8) < 1e-9);
  assert.equal(result.panels, 37);
});

test("facadeOrder rejects openings larger than the wall", () => {
  const result = facadeOrder({ widthM: 2, heightM: 2, openingsM2: 5, panelsPerM2: 1 });
  assert.equal(result.ok, false);
});

test("facadeOrder refuses a panel without coverage", () => {
  const result = facadeOrder({ widthM: 4, heightM: 3, panelsPerM2: 0 });
  assert.equal(result.ok, false);
});
