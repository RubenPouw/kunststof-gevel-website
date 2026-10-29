import assert from "node:assert/strict";
import test from "node:test";

import {
  CHAMFER,
  FLOOR,
  KAP,
  LOCKUP_KALK,
  LOCKUP_NAVY,
  MARK_UNITS,
  OPENING,
  POOT,
  VOEG,
  cavesuppliesMarkPath,
  lockupColor,
  lockupMetrics,
} from "../src/lib/brand/lockup.ts";

test("the C-mark fits the 8e grid: kap, voeg, opening and floor", () => {
  assert.equal(KAP + OPENING + FLOOR, MARK_UNITS);
  assert.equal(KAP + VOEG + (OPENING - VOEG) + FLOOR, MARK_UNITS);
  assert.equal(POOT, 2.2);
  assert.equal(CHAMFER, 1);
  const path = cavesuppliesMarkPath();
  assert.equal(path, "M0 0H7L8 1V2.2H0ZM0 2.5H2.2V5.8H0ZM0 5.8H8V8H0Z");
  assert.equal(path.includes("url("), false);
});

test("the parent line is 55 to 60 percent of the name and the mark stays at least 12px", () => {
  const header = lockupMetrics(20);
  assert.ok(header.line2 / 20 >= 0.55 && header.line2 / 20 <= 0.6);
  assert.ok(header.mark >= 12);
  assert.equal(header.markGap, 0.5 * POOT * (header.mark / MARK_UNITS));
  assert.equal(header.clear, POOT * (header.mark / MARK_UNITS));

  const small = lockupMetrics(16);
  assert.equal(small.mark, 12);
  assert.equal(lockupColor("dark"), LOCKUP_KALK);
  assert.equal(lockupColor("light"), LOCKUP_NAVY);
});
