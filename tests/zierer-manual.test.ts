import assert from "node:assert/strict";
import test from "node:test";

import { ZIERER_MANUAL, withManuals } from "../src/lib/catalog/manuals.ts";

test("the Zierer manual is attached once, and other brands stay without it", () => {
  const zierer = withManuals({ brandSlug: "zierer", downloads: undefined });
  assert.deepEqual(zierer.downloads, [{ label: ZIERER_MANUAL.label, href: ZIERER_MANUAL.href }]);
  const again = withManuals(zierer);
  assert.equal(again.downloads?.length, 1);
  const keralit = withManuals({ brandSlug: "keralit" });
  assert.equal(keralit.downloads, undefined);
});
