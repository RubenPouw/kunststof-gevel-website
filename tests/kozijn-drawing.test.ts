import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { DETAIL_PHOTOS } from "../src/lib/kozijnen/detail-photos.ts";
import { drawnPanes, frameFaceMm, workingDrawingSvg } from "../src/lib/kozijnen/drawing.ts";
import { allLayouts, getLayoutBySlug } from "../src/lib/kozijnen/layouts.ts";
import { defaultConfig } from "../src/lib/kozijnen/model.ts";
import { hingeOnRight, openingPhrase, opensInward, slideTowardRight } from "../src/lib/kozijnen/opening.ts";
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
  assert.match(text, /Glad wit \(RAL 9016\)/);
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

function labels(svg: string) {
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((match) => match[1]);
}

test("the working drawing follows size, hinge side and opening", () => {
  const pair = getLayoutBySlug("draaikiepraam-met-vast-raam");
  const turn = getLayoutBySlug("draaikiepraam");
  const smart = getLayoutBySlug("schuifpui-2-delig");
  assert.ok(pair && turn && smart);

  const config = defaultConfig(pair);
  const panes = drawnPanes(pair, config);
  assert.deepEqual(
    panes.map((pane) => pane.kind),
    ["vast", "draaikiep"],
  );
  assert.equal(panes[0]?.width, 750);
  assert.equal(panes[1]?.width, 750);
  assert.equal(panes[1]?.hingeRight, true);
  assert.equal(panes.reduce((sum, pane) => sum + pane.width, 0), config.width);

  const right = workingDrawingSvg(pair, config);
  const left = workingDrawingSvg(pair, { ...config, side: "links" });
  assert.notEqual(right, left);
  assert.match(right, /width="\d+" height="\d+"/);
  assert.match(right, /stroke-dasharray/);
  assert.match(right, /data-apex="rechts"/);
  assert.match(left, /data-apex="links"/);
  assert.equal(labels(right).filter((label) => label === "750").length >= 1, true);
  assert.equal(labels(right).includes("1500"), true);
  assert.equal(labels(right).includes("1400"), true);
  assert.equal(labels(right).includes("64"), true);
  assert.equal(/EKO|three|webgl/i.test(right), false);

  const wider = workingDrawingSvg(pair, { ...config, width: 1800, height: 1600 });
  assert.notEqual(wider, right);
  assert.equal(labels(wider).includes("900"), true);
  assert.equal(labels(wider).includes("1800"), true);

  const mitre = workingDrawingSvg(turn, defaultConfig(turn));
  const butt = workingDrawingSvg(turn, { ...defaultConfig(turn), corner: "hvl" });
  assert.match(mitre, /data-hoek="verstek"/);
  assert.match(butt, /data-hoek="hvl"/);
  assert.match(mitre, /stroke-dasharray/);
  const tiltCount = mitre.match(/<path /g)?.length ?? 0;
  assert.equal(tiltCount >= 2, true);

  const withVent = workingDrawingSvg(turn, { ...defaultConfig(turn), vent: "rooster" });
  assert.match(withVent, /data-vent="rooster"/);
  const withDuco = workingDrawingSvg(turn, { ...defaultConfig(turn), vent: "duco", bars: "met" });
  assert.equal(withDuco.includes('data-vent="rooster"'), false);
  assert.notEqual(withVent, mitre);

  const slide = workingDrawingSvg(smart, defaultConfig(smart));
  assert.match(slide, /data-slide="links"/);
  assert.equal(labels(slide).includes("64"), false);
  assert.equal(frameFaceMm(smart.slug), null);
  assert.equal(frameFaceMm(turn.slug), 64);
  const slideLeft = workingDrawingSvg(smart, { ...defaultConfig(smart), active: "links" });
  assert.match(slideLeft, /data-slide="rechts"/);

  for (const layout of allLayouts()) {
    const svg = workingDrawingSvg(layout, defaultConfig(layout));
    assert.match(svg, /<svg[^>]*width="\d+"[^>]*height="\d+"/);
    assert.equal(/EKO/i.test(svg), false, layout.slug);
  }

  const pkg = readFileSync(new URL("../package.json", import.meta.url), "utf8");
  assert.equal(/three|@react-three|drei/i.test(pkg), false);
});

test("detail cards use only matching Fillout photos", () => {
  const filled = [
    "hvl",
    "folie",
    "duco",
    "spacer-zwart",
    "kruk-wit",
    "kruk-alu",
    "kruk-zwart",
    "roeden",
    "ral",
    "stomp",
    "aanslag",
  ] as const;
  for (const photo of Object.values(DETAIL_PHOTOS)) {
    assert.equal(photo.width, 960, photo.id);
    assert.equal(photo.height, 720, photo.id);
    assert.equal(/EKO/i.test(`${photo.src ?? ""} ${photo.alt} ${photo.sourceUrl ?? ""}`), false, photo.id);
    if (filled.includes(photo.id as (typeof filled)[number])) {
      assert.ok(photo.src?.startsWith("/kozijnen/") && photo.src.endsWith(".webp"), photo.id);
      assert.match(photo.sourceUrl ?? "", /images\.fillout\.com\/orgid-276098\/flowpublicid-skf34nbCp4us\//);
      assert.equal(existsSync(new URL(`../public${photo.src}`, import.meta.url)), true, photo.src);
    } else {
      assert.equal(photo.src, null, photo.id);
      assert.equal(photo.sourceUrl, null, photo.id);
    }
  }
  assert.match(DETAIL_PHOTOS.hvl.sourceUrl ?? "", /Schermafbeelding-2025-10-06-om-22\.21\.39\.png/);
  assert.match(DETAIL_PHOTOS.folie.sourceUrl ?? "", /Wit\.jpg/);
  assert.match(DETAIL_PHOTOS.folie.sourceUrl ?? "", /Antraciet\.jpg/);
});
