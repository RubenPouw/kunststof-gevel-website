import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { allLayouts, getLayoutBySlug } from "../src/lib/kozijnen/layouts.ts";
import { defaultConfig } from "../src/lib/kozijnen/model.ts";
import { hingeOnRight, openingPhrase, opensInward, slideTowardRight } from "../src/lib/kozijnen/opening.ts";
import { pictureScene, productPictureSvg } from "../src/lib/kozijnen/picture.ts";
import { summaryText } from "../src/lib/kozijnen/text.ts";

test("opening direction is seen from outside and windows stay inward", () => {
  const turn = getLayoutBySlug("draaikiepraam");
  const pair = getLayoutBySlug("draaikiepraam-met-vast-raam");
  const door = getLayoutBySlug("tuindeur");
  const slide = getLayoutBySlug("schuifpui-2-delig");
  const stolp = getLayoutBySlug("stolpraam");
  assert.ok(turn && pair && door && slide && stolp);

  const right = defaultConfig(turn);
  assert.equal(hingeOnRight(turn, right, 0, 1), true);
  assert.equal(opensInward(turn, { ...right, direction: "buiten" }), true);
  assert.match(openingPhrase(turn, right, "draaikiep", 0, 1), /draaikiep, scharnier rechts, naar binnen/);

  const left = { ...right, side: "links" as const };
  assert.equal(hingeOnRight(turn, left, 0, 1), false);
  assert.match(openingPhrase(turn, left, "draaikiep", 0, 1), /scharnier links, naar binnen/);

  const pairRight = defaultConfig(pair);
  const pairLeft = { ...pairRight, side: "links" as const };
  assert.equal(hingeOnRight(pair, pairRight, 1, 2), true);
  assert.equal(hingeOnRight(pair, pairLeft, 0, 2), false);

  const garden = defaultConfig(door);
  assert.equal(opensInward(door, garden), false);
  assert.match(openingPhrase(door, garden, "deur", 0, 1), /deur, scharnier rechts, naar buiten/);
  const inwardDoor = { ...garden, direction: "binnen" as const };
  assert.match(openingPhrase(door, inwardDoor, "deur", 0, 1), /naar binnen/);

  const sliding = defaultConfig(slide);
  assert.equal(slideTowardRight(slide, sliding, 1, 2), false);
  const slidingLeft = { ...sliding, active: "links" as const };
  assert.equal(slideTowardRight(slide, slidingLeft, 0, 2), true);

  const meeting = defaultConfig(stolp);
  assert.equal(hingeOnRight(stolp, meeting, 0, 2), false);
  assert.equal(hingeOnRight(stolp, meeting, 1, 2), true);
  const meetingLeft = { ...meeting, active: "links" as const };
  assert.equal(hingeOnRight(stolp, meetingLeft, 0, 2), false);
  assert.equal(hingeOnRight(stolp, meetingLeft, 1, 2), true);
});

test("the order text names the vakken, the size and the colours", () => {
  const layout = getLayoutBySlug("draaikiepraam-met-vast-raam");
  assert.ok(layout);
  const config = defaultConfig(layout);
  config.frameOut = "7016";
  config.frameIn = "9016";
  config.vent = "rooster";
  config.corner = "hvl";
  config.width = 1600;
  config.height = 1400;
  const text = summaryText(config);
  assert.match(text, /Aluplast Ideal 7000 NL/);
  assert.match(text, /Draaikiepraam met vast raam/);
  assert.match(text, /Vak 1 links: vast/);
  assert.match(text, /Vak 2 rechts: draaikiep, scharnier rechts, naar binnen/);
  assert.match(text, /1600 × 1400 mm/);
  assert.match(text, /Antraciet \(RAL 7016\)/);
  assert.match(text, /Wit \(RAL 9016\)/);
  assert.match(text, /HR\+\+/);
  assert.match(text, /HVL/);
  assert.match(text, /ventilatierooster/);
  assert.equal(text.includes("€"), false);
  assert.equal(/EKO/i.test(text), false);

  const left = summaryText({ ...config, side: "links" });
  assert.match(left, /Vak 1 links: draaikiep, scharnier links, naar binnen/);
  assert.match(left, /Vak 2 rechts: vast/);

  const smart = getLayoutBySlug("schuifpui-2-delig");
  assert.ok(smart);
  const door = summaryText(defaultConfig(smart));
  assert.match(door, /Aluplast Smart-Slide schuifpui/);
  assert.match(door, /schuivend, schuift naar links/);
});

test("product pictures keep a fixed shape and stay small", () => {
  let total = 0;
  for (const layout of allLayouts()) {
    const config = defaultConfig(layout);
    const wide = productPictureSvg(layout, config);
    const narrow = productPictureSvg(layout, { ...config, width: 600, height: 600 });
    assert.equal(wide, narrow, layout.slug);
    assert.match(wide, /<svg[^>]*width="\d+"[^>]*height="\d+"/);
    assert.equal(/EKO|three|webgl/i.test(wide), false, layout.slug);
    assert.ok(wide.length < 6000, `${layout.slug} ${wide.length}`);
    total += wide.length;
    const scene = pictureScene(layout, config);
    assert.equal(scene.width > 0 && scene.height > 0, true);
  }
  assert.ok(total < 40_000, String(total));

  const pair = getLayoutBySlug("draaikiepraam-met-vast-raam");
  const turn = getLayoutBySlug("draairaam");
  const smart = getLayoutBySlug("schuifpui-2-delig");
  assert.ok(pair && turn && smart);
  const right = productPictureSvg(pair, defaultConfig(pair));
  const left = productPictureSvg(pair, { ...defaultConfig(pair), side: "links" });
  assert.notEqual(right, left);
  assert.match(productPictureSvg(turn, defaultConfig(turn)), /stroke-dasharray/);
  assert.match(productPictureSvg(getLayoutBySlug("draaikiepraam")!, defaultConfig(getLayoutBySlug("draaikiepraam")!)), /L .* L /);
  const mitre = productPictureSvg(turn, defaultConfig(turn));
  const butt = productPictureSvg(turn, { ...defaultConfig(turn), corner: "hvl" });
  assert.notEqual(mitre, butt);
  const white = productPictureSvg(turn, defaultConfig(turn));
  const dark = productPictureSvg(turn, { ...defaultConfig(turn), frameOut: "7016", sashOut: "7016" });
  assert.match(dark, /#383E42/i);
  assert.notEqual(white, dark);
  const grain = productPictureSvg(turn, { ...defaultConfig(turn), frameOut: "7016-nerf" });
  assert.match(grain, /<pattern/);
  const slide = productPictureSvg(smart, defaultConfig(smart));
  assert.match(slide, /stroke-dasharray/);
  const withVent = productPictureSvg(turn, { ...defaultConfig(turn), vent: "rooster" });
  assert.notEqual(withVent, mitre);

  const pkg = readFileSync(new URL("../package.json", import.meta.url), "utf8");
  assert.equal(/three|@react-three|drei/i.test(pkg), false);
});
