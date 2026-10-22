import { colorById } from "./config";
import type { Layout, PaneKind } from "./layouts";
import { panesFor, type KozijnConfig } from "./model";
import { hingeOnRight, opensInward } from "./opening";

/**
 * Vaste verhouding per indeling. De ingevoerde millimeters staan niet in dit plaatje.
 * 64 mm is de aanzichtbreedte van het kader, 120 mm de inbouwdiepte. Beide zijn hier een vaste dikte.
 */

export type PicturePane = {
  kind: PaneKind;
  hingeRight: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PictureScene = {
  width: number;
  height: number;
  frame: string;
  sash: string;
  grain: boolean;
  sashGrain: boolean;
  corner: KozijnConfig["corner"];
  vent: boolean;
  panes: PicturePane[];
};

const DEPTH_X = 26;
const DEPTH_Y = -14;
const FACE = 22;

function canvas(layout: Layout) {
  if (layout.group === "deuren") return { w: 220, h: 320 };
  if (layout.group === "schuifpuien") return { w: layout.panes.length > 2 ? 420 : 340, h: 230 };
  if (layout.panes.length >= 3) return { w: 380, h: 230 };
  if (layout.panes.length === 2) return { w: 340, h: 240 };
  return { w: 220, h: 260 };
}

function mix(hex: string, toward: string, amount: number) {
  const from = rgb(hex);
  const to = rgb(toward);
  const next = from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount));
  return `#${next.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function rgb(hex: string) {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((start) => Number.parseInt(value.slice(start, start + 2), 16));
}

export function pictureScene(layout: Layout, config: KozijnConfig): PictureScene {
  const front = canvas(layout);
  const panes = panesFor(layout, config);
  const gaps = Math.max(0, panes.length - 1);
  const mullion = layout.meeting ? 3 : 12;
  const vent = config.vent === "rooster" ? 16 : 0;
  const innerW = front.w - FACE * 2 - mullion * gaps;
  const innerH = front.h - FACE * 2 - vent;
  const flex = panes.reduce((sum, pane) => sum + pane.flex, 0) || 1;
  const originX = 8;
  const originY = 32;
  let cursor = originX + FACE;
  const boxes: PicturePane[] = panes.map((pane, index) => {
    const width = (innerW * pane.flex) / flex;
    const box = {
      kind: pane.kind,
      hingeRight: hingeOnRight(layout, config, index, panes.length),
      x: cursor,
      y: originY + FACE + vent,
      width,
      height: innerH,
    };
    cursor += width + mullion;
    return box;
  });
  const frame = colorById(config.frameOut);
  const sash = colorById(config.sashOut);
  return {
    width: originX + front.w + DEPTH_X + 10,
    height: originY + front.h + 12,
    frame: frame.hex,
    sash: sash.hex,
    grain: frame.id.includes("nerf"),
    sashGrain: sash.id.includes("nerf"),
    corner: config.corner,
    vent: config.vent === "rooster",
    panes: boxes,
  };
}

export function productPictureSvg(layout: Layout, config: KozijnConfig, prefix = "k") {
  const scene = pictureScene(layout, config);
  const front = canvas(layout);
  const x = 8;
  const y = 32;
  const { w, h } = front;
  const side = mix(scene.frame, "#1B2838", 0.38);
  const top = mix(scene.frame, "#FFFFFF", 0.22);
  const frameFill = scene.grain ? `url(#${prefix}-frame)` : scene.frame;
  const sashFill = scene.sashGrain ? `url(#${prefix}-sash)` : scene.sash;
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${scene.width}" height="${scene.height}" viewBox="0 0 ${scene.width} ${scene.height}" role="img">`,
  );
  if (scene.grain || scene.sashGrain) {
    parts.push("<defs>");
    if (scene.grain) parts.push(grain(prefix, "frame", scene.frame));
    if (scene.sashGrain) parts.push(grain(prefix, "sash", scene.sash));
    parts.push("</defs>");
  }
  parts.push(face(x, y, w, 0, DEPTH_X, DEPTH_Y, top));
  parts.push(face(x + w, y, 0, h, DEPTH_X, DEPTH_Y, side));
  parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${frameFill}"/>`);
  parts.push(seams(x, y, w, h, scene.corner));
  if (scene.vent) parts.push(vent(x + FACE, y + FACE - 2, w - FACE * 2));
  for (const pane of scene.panes) {
    parts.push(paneArt(pane, config, sashFill, layout));
  }
  parts.push("</svg>");
  return parts.join("");
}

function grain(prefix: string, name: string, hex: string) {
  const line = mix(hex, "#1B2838", 0.28);
  return `<pattern id="${prefix}-${name}" width="7" height="32" patternUnits="userSpaceOnUse"><rect width="7" height="32" fill="${hex}"/><path d="M1 0 V32 M3.5 0 V32 M6 0 V32" stroke="${line}" stroke-width="0.7" opacity="0.55"/></pattern>`;
}

function face(x: number, y: number, w: number, h: number, dx: number, dy: number, fill: string) {
  const d = `M ${x} ${y} L ${x + dx} ${y + dy} L ${x + w + dx} ${y + h + dy} L ${x + w} ${y + h} Z`;
  return `<path d="${d}" fill="${fill}"/>`;
}

function seams(x: number, y: number, w: number, h: number, corner: KozijnConfig["corner"]) {
  const stroke = `stroke="#1B2838" stroke-width="1.25" fill="none" opacity="0.55"`;
  if (corner === "hvl") {
    return `<path ${stroke} d="M ${x + FACE} ${y} V ${y + FACE} M ${x + w - FACE} ${y} V ${y + FACE} M ${x + FACE} ${y + h} V ${y + h - FACE} M ${x + w - FACE} ${y + h} V ${y + h - FACE}"/>`;
  }
  return `<path ${stroke} d="M ${x} ${y + FACE} L ${x + FACE} ${y} M ${x + w - FACE} ${y} L ${x + w} ${y + FACE} M ${x} ${y + h - FACE} L ${x + FACE} ${y + h} M ${x + w - FACE} ${y + h} L ${x + w} ${y + h - FACE}"/>`;
}

function vent(x: number, y: number, w: number) {
  const slots = [0, 5, 10]
    .map((offset) => `<rect x="${x + 4}" y="${y + offset}" width="${w - 8}" height="3" fill="#D7DEE4"/>`)
    .join("");
  return `<rect x="${x}" y="${y - 2}" width="${w}" height="16" fill="#C5C1B8"/>${slots}`;
}

function paneArt(pane: PicturePane, config: KozijnConfig, sashFill: string, layout: Layout) {
  const open = pane.kind !== "vast";
  const inset = open ? 10 : 0;
  const gx = pane.x + inset;
  const gy = pane.y + inset;
  const gw = Math.max(8, pane.width - inset * 2);
  const gh = Math.max(8, pane.height - inset * 2);
  const parts: string[] = [];
  if (open) parts.push(`<rect x="${pane.x}" y="${pane.y}" width="${pane.width}" height="${pane.height}" fill="${sashFill}"/>`);
  for (const rect of fills(config.filling, pane.kind, gx, gy, gw, gh)) {
    parts.push(`<rect x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}" fill="${rect.fill}"/>`);
    if (rect.fill === "#D7DEE4") parts.push(reflection(rect.x, rect.y, rect.w, rect.h));
  }
  if (pane.kind === "draai" || pane.kind === "draaikiep" || pane.kind === "deur") {
    parts.push(openingLines(gx, gy, gw, gh, pane.hingeRight, pane.kind === "draaikiep", !opensInward(layout, config)));
  }
  if (pane.kind === "schuif") parts.push(slideLine(gx, gy, gw, gh, !pane.hingeRight));
  if (pane.kind === "deur" || pane.kind === "draai" || pane.kind === "draaikiep" || pane.kind === "schuif") {
    parts.push(handle(gx, gy, gw, gh, pane));
  }
  return parts.join("");
}

function fills(filling: KozijnConfig["filling"], kind: PaneKind, x: number, y: number, w: number, h: number) {
  if (kind !== "deur" || filling === "glas") return [{ x, y, w, h, fill: "#D7DEE4" }];
  if (filling === "paneel") return [{ x, y, w, h, fill: "#C9C4B8" }];
  const split = h * 0.42;
  return [
    { x, y, w, h: split, fill: "#D7DEE4" },
    { x, y: y + split, w, h: h - split, fill: "#C9C4B8" },
  ];
}

function reflection(x: number, y: number, w: number, h: number) {
  const d = `M ${n(x + 6)} ${n(y + 6)} L ${n(x + w * 0.46)} ${n(y + 6)} L ${n(x + 16)} ${n(y + h * 0.62)} Z`;
  return `<path d="${d}" fill="#FFFFFF" opacity="0.38"/>`;
}

function openingLines(x: number, y: number, w: number, h: number, hingeRight: boolean, tilt: boolean, outward: boolean) {
  const hingeX = hingeRight ? x + w : x;
  const openX = hingeRight ? x : x + w;
  const dash = outward ? "7 4" : "4 3";
  const turn = `M ${n(openX)} ${n(y)} L ${n(hingeX)} ${n(y + h / 2)} L ${n(openX)} ${n(y + h)}`;
  const kiep = tilt ? ` M ${n(x)} ${n(y + h)} L ${n(x + w / 2)} ${n(y)} L ${n(x + w)} ${n(y + h)}` : "";
  return `<path d="${turn}${kiep}" fill="none" stroke="#1B2838" stroke-width="1.4" stroke-dasharray="${dash}"/>`;
}

function slideLine(x: number, y: number, w: number, h: number, toRight: boolean) {
  const yMid = y + h / 2;
  const x1 = toRight ? x + w * 0.28 : x + w * 0.72;
  const x2 = toRight ? x + w * 0.72 : x + w * 0.28;
  const head = toRight
    ? `M ${n(x2 - 8)} ${n(yMid - 5)} L ${n(x2)} ${n(yMid)} L ${n(x2 - 8)} ${n(yMid + 5)}`
    : `M ${n(x2 + 8)} ${n(yMid - 5)} L ${n(x2)} ${n(yMid)} L ${n(x2 + 8)} ${n(yMid + 5)}`;
  return `<path d="M ${n(x1)} ${n(yMid)} L ${n(x2)} ${n(yMid)} ${head}" fill="none" stroke="#1B2838" stroke-width="1.4" stroke-dasharray="4 3"/>`;
}

function handle(x: number, y: number, w: number, h: number, pane: PicturePane) {
  const door = pane.kind === "deur";
  const height = door ? 26 : 16;
  const hy = door ? y + h * 0.58 : y + h * 0.46;
  const hx = pane.hingeRight ? x + 6 : x + w - 12;
  return `<rect x="${n(hx)}" y="${n(hy)}" width="4" height="${height}" fill="#1B2838"/>`;
}

function n(value: number) {
  return Math.round(value * 10) / 10;
}
