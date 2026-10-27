import type { Layout } from "./layouts";
import { panesFor, type KozijnConfig } from "./model";
import { hingeOnRight, opensInward, slideTowardRight } from "./opening";

/** Aanzichtbreedte van het kader, Aluplast Ideal 7000 NL. Geen maat voor de schuifpui. */
export const FRAME_FACE_MM = 64;

export function frameFaceMm(slug: string): number | null {
  if (slug === "schuifpui-2-delig" || slug === "schuifpui-4-delig") return null;
  return FRAME_FACE_MM;
}

export type DrawnPane = {
  kind: Layout["panes"][number]["kind"];
  index: number;
  x: number;
  width: number;
  height: number;
  hingeRight: boolean;
  inward: boolean;
  slideRight: boolean | null;
};

/** Buitenwerkse vakmaten. De breedtes tellen op tot de kozijnbreedte. */
export function drawnPanes(layout: Layout, config: KozijnConfig): DrawnPane[] {
  const panes = panesFor(layout, config);
  const widths = share(config.width, panes.map((pane) => pane.flex));
  let x = 0;
  return panes.map((pane, index) => {
    const width = widths[index] ?? 0;
    const box: DrawnPane = {
      kind: pane.kind,
      index,
      x,
      width,
      height: config.height,
      hingeRight: hingeOnRight(layout, config, index, panes.length),
      inward: opensInward(layout, config),
      slideRight: pane.kind === "schuif" ? slideTowardRight(layout, config, index, panes.length) : null,
    };
    x += width;
    return box;
  });
}

export function drawingBox(config: KozijnConfig) {
  const font = Math.max(22, config.width * 0.05);
  const padL = font * 4.4;
  const padR = font * 3.8;
  const padT = font * 3.6;
  const padB = font * 3.8;
  return {
    font,
    padL,
    padR,
    padT,
    padB,
    width: config.width + padL + padR,
    height: config.height + padT + padB,
  };
}

export function workingDrawingSvg(layout: Layout, config: KozijnConfig, prefix = "w") {
  const box = drawingBox(config);
  const panes = drawnPanes(layout, config);
  const faceKnown = frameFaceMm(layout.slug);
  const face = faceKnown ?? Math.max(36, Math.round(Math.min(config.width, config.height) * 0.04));
  const mullion = layout.meeting ? Math.max(8, Math.round(face * 0.28)) : face;
  const sash = Math.max(10, Math.round(face * 0.42));
  const ventH = config.vent === "rooster" ? Math.max(16, Math.round(face * 0.62)) : 0;
  const W = config.width;
  const H = config.height;
  const ox = box.padL;
  const oy = box.padT;
  const stroke = box.font * 0.085;
  const thin = box.font * 0.045;
  const dash = `${r(box.font * 0.42)} ${r(box.font * 0.26)}`;
  const ink = "#1B2838";
  const parts: string[] = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" id="${prefix}-sheet" width="${r(box.width)}" height="${r(box.height)}" viewBox="0 0 ${r(box.width)} ${r(box.height)}" style="display:block;width:100%;height:auto" role="img" aria-label="${escapeXml(`${layout.title}, ${W} bij ${H} millimeter, van buiten gezien`)}">`,
  );
  parts.push(`<rect width="100%" height="100%" fill="#FFFFFF"/>`);
  parts.push(rect(ox, oy, W, H, "none", ink, stroke));

  if (ventH > 0) {
    parts.push(`<g data-vent="rooster">`);
    parts.push(rect(ox + face, oy + face, W - face * 2, ventH, "#F4F2ED", ink, thin));
    for (const row of [0.3, 0.55, 0.8]) {
      const y = oy + face + ventH * row;
      parts.push(line(ox + face + 6, y, ox + W - face - 6, y, ink, thin));
    }
    parts.push(`</g>`);
  }

  panes.forEach((pane, index) => {
    const left = index === 0 ? face : pane.x + mullion / 2;
    const right = index === panes.length - 1 ? W - face : pane.x + pane.width - mullion / 2;
    const top = face + ventH;
    const bottom = H - face;
    const open = pane.kind !== "vast";
    const inset = open ? sash : 0;
    const gx = ox + left + inset;
    const gy = oy + top + inset;
    const gw = Math.max(8, right - left - inset * 2);
    const gh = Math.max(8, bottom - top - inset * 2);
    parts.push(`<g data-vak="${index + 1}" data-kind="${pane.kind}" data-hinge="${pane.hingeRight ? "rechts" : "links"}">`);
    if (open) parts.push(rect(ox + left, oy + top, right - left, bottom - top, "#FFFFFF", ink, thin));
    parts.push(paneGlass(pane.kind, config.filling, gx, gy, gw, gh, ink, thin));
    if (pane.kind === "draai" || pane.kind === "draaikiep" || pane.kind === "deur") {
      parts.push(openingMarks(gx, gy, gw, gh, pane.hingeRight, pane.kind === "draaikiep", ink, thin, dash));
    }
    if (pane.kind === "schuif" && pane.slideRight != null) {
      parts.push(slideArrow(gx, gy, gw, gh, pane.slideRight, ink, thin, dash, box.font));
    }
    if (pane.kind === "deur" || pane.kind === "draai" || pane.kind === "draaikiep") {
      parts.push(handle(gx, gy, gw, gh, pane.hingeRight, pane.kind === "deur", ink, box.font));
    }
    parts.push(`</g>`);
  });

  for (let index = 0; index < panes.length - 1; index += 1) {
    const pane = panes[index];
    if (!pane) continue;
    const cx = ox + pane.x + pane.width;
    const my = oy + face + ventH;
    parts.push(rect(cx - mullion / 2, my, mullion, oy + H - face - my, "#FFFFFF", ink, thin));
  }

  parts.push(corners(ox, oy, W, H, face, config.corner === "hvl", ink, thin));

  const label = (value: number) => String(Math.round(value));
  parts.push(
    hDim(ox, ox + W, oy + H + box.font * 1.7, label(W), box.font, thin, ink, oy + H, oy + H + box.font * 2),
  );
  parts.push(vDim(box.font * 1.15, oy, oy + H, label(H), box.font, thin, ink, ox, box.font * 0.4));
  panes.forEach((pane) => {
    parts.push(
      hDim(
        ox + pane.x,
        ox + pane.x + pane.width,
        oy - box.font * 1.55,
        label(pane.width),
        box.font,
        thin,
        ink,
        oy,
        oy - box.font * 1.9,
      ),
    );
  });
  parts.push(vDim(ox + W + box.font * 1.7, oy, oy + H, label(H), box.font, thin, ink, ox + W, ox + W + box.font * 2.1));
  if (faceKnown != null) {
    parts.push(
      hDim(ox, ox + faceKnown, oy + H + box.font * 3.05, label(faceKnown), box.font * 0.82, thin, ink, oy + H, oy + H + box.font * 3.2),
    );
  }

  parts.push(`</svg>`);
  return parts.join("");
}

function share(total: number, flexes: number[]) {
  const flex = flexes.reduce((sum, item) => sum + item, 0) || 1;
  const widths = flexes.map((item) => Math.round((total * item) / flex));
  const drift = total - widths.reduce((sum, item) => sum + item, 0);
  const last = widths.length - 1;
  if (last >= 0) widths[last] = (widths[last] ?? 0) + drift;
  return widths;
}

function paneGlass(kind: string, filling: KozijnConfig["filling"], x: number, y: number, w: number, h: number, ink: string, stroke: number) {
  if (kind === "deur" && filling === "paneel") return rect(x, y, w, h, "#E4DDD2", ink, stroke);
  if (kind === "deur" && filling === "half") {
    const split = Math.round(h * 0.45);
    return rect(x, y, w, split, "#F4F2ED", ink, stroke) + rect(x, y + split, w, h - split, "#E4DDD2", ink, stroke);
  }
  return rect(x, y, w, h, "#F4F2ED", ink, stroke);
}

function openingMarks(x: number, y: number, w: number, h: number, hingeRight: boolean, tilt: boolean, ink: string, stroke: number, dash: string) {
  const gap = Math.min(w, h) * 0.08;
  const hingeX = hingeRight ? x + w - gap : x + gap;
  const openX = hingeRight ? x + gap : x + w - gap;
  const turn = `M ${r(openX)} ${r(y + gap)} L ${r(hingeX)} ${r(y + h / 2)} L ${r(openX)} ${r(y + h - gap)}`;
  const kiep = `M ${r(x + gap)} ${r(y + h - gap)} L ${r(x + w / 2)} ${r(y + gap)} L ${r(x + w - gap)} ${r(y + h - gap)}`;
  return `<g fill="none" stroke="${ink}" stroke-width="${r(stroke)}" stroke-dasharray="${dash}" data-apex="${hingeRight ? "rechts" : "links"}">${path(turn)}${tilt ? path(kiep) : ""}</g>`;
}

function slideArrow(x: number, y: number, w: number, h: number, toRight: boolean, ink: string, stroke: number, dash: string, font: number) {
  const yMid = y + h / 2;
  const x1 = toRight ? x + w * 0.22 : x + w * 0.78;
  const x2 = toRight ? x + w * 0.78 : x + w * 0.22;
  const head = arrowTip(x2, yMid, toRight, Math.max(font * 0.34, stroke * 6));
  return `<g data-slide="${toRight ? "rechts" : "links"}">${line(x1, yMid, x2, yMid, ink, Math.max(stroke, font * 0.06), dash)}${head}</g>`;
}

function arrowTip(x: number, y: number, toRight: boolean, size: number) {
  const dir = toRight ? -1 : 1;
  const tip = `${r(x)},${r(y)}`;
  const a = `${r(x + dir * size)},${r(y - size * 0.45)}`;
  const b = `${r(x + dir * size)},${r(y + size * 0.45)}`;
  return `<polygon points="${tip} ${a} ${b}" fill="#1B2838"/>`;
}

function handle(x: number, y: number, w: number, h: number, hingeRight: boolean, door: boolean, ink: string, font: number) {
  const hw = Math.max(4, font * 0.22);
  const hh = Math.max(16, font * 1.05);
  const hx = hingeRight ? x + font * 0.2 : x + w - font * 0.2 - hw;
  const hy = y + h * (door ? 0.55 : 0.46);
  return rect(hx, hy, hw, hh, ink, ink, 0);
}

function corners(ox: number, oy: number, w: number, h: number, face: number, butt: boolean, ink: string, stroke: number) {
  const seams = [
    butt ? line(ox + face, oy, ox + face, oy + face, ink, stroke) : line(ox, oy, ox + face, oy + face, ink, stroke),
    butt ? line(ox + w - face, oy, ox + w - face, oy + face, ink, stroke) : line(ox + w, oy, ox + w - face, oy + face, ink, stroke),
    butt ? line(ox + face, oy + h, ox + face, oy + h - face, ink, stroke) : line(ox, oy + h, ox + face, oy + h - face, ink, stroke),
    butt
      ? line(ox + w - face, oy + h, ox + w - face, oy + h - face, ink, stroke)
      : line(ox + w, oy + h, ox + w - face, oy + h - face, ink, stroke),
  ];
  return `<g data-hoek="${butt ? "hvl" : "verstek"}">${seams.join("")}</g>`;
}

function hDim(x1: number, x2: number, y: number, label: string, font: number, stroke: number, ink: string, fromY: number, toY: number) {
  const span = Math.abs(x2 - x1);
  const mid = (x1 + x2) / 2;
  const ah = Math.min(font * 0.42, Math.max(6, span * 0.22));
  const extend = `${line(x1, fromY, x1, toY, ink, stroke)}${line(x2, fromY, x2, toY, ink, stroke)}`;
  const labelText = span < font * 1.8
    ? text(Math.max(x1, x2) + ah + font * 0.28, y + font * 0.32, label, font, ink, "start")
    : text(mid, y - font * 0.28, label, font, ink, "middle");
  return `<g>${extend}${line(x1, y, x2, y, ink, stroke)}${arrowHead(x1, y, ah, 1)}${arrowHead(x2, y, ah, -1)}${labelText}</g>`;
}

function vDim(x: number, y1: number, y2: number, label: string, font: number, stroke: number, ink: string, fromX: number, toX: number) {
  const mid = (y1 + y2) / 2;
  const ah = font * 0.42;
  const extend = `${line(fromX, y1, toX, y1, ink, stroke)}${line(fromX, y2, toX, y2, ink, stroke)}`;
  return `<g>${extend}${line(x, y1, x, y2, ink, stroke)}${arrowHead(x, y1, ah, 1, true)}${arrowHead(x, y2, ah, -1, true)}${text(x - font * 0.35, mid, label, font, ink, "middle", -90)}</g>`;
}

function arrowHead(x: number, y: number, size: number, dir: number, vertical = false) {
  if (vertical) {
    const tip = `${r(x)},${r(y)}`;
    const a = `${r(x - size * 0.38)},${r(y + dir * size)}`;
    const b = `${r(x + size * 0.38)},${r(y + dir * size)}`;
    return `<polygon points="${tip} ${a} ${b}" fill="#1B2838"/>`;
  }
  const tip = `${r(x)},${r(y)}`;
  const a = `${r(x + dir * size)},${r(y - size * 0.38)}`;
  const b = `${r(x + dir * size)},${r(y + size * 0.38)}`;
  return `<polygon points="${tip} ${a} ${b}" fill="#1B2838"/>`;
}

function text(x: number, y: number, value: string, font: number, ink: string, anchor: string, rotate = 0) {
  const spin = rotate ? ` transform="rotate(${rotate} ${r(x)} ${r(y)})"` : "";
  return `<text x="${r(x)}" y="${r(y)}"${spin} fill="${ink}" stroke="#FFFFFF" stroke-width="${r(font * 0.28)}" paint-order="stroke fill" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="${r(font)}" text-anchor="${anchor}">${value}</text>`;
}

function rect(x: number, y: number, w: number, h: number, fill: string, stroke: string, strokeWidth: number) {
  return `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="${fill}" stroke="${stroke}" stroke-width="${r(strokeWidth)}"/>`;
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, strokeWidth: number, dash?: string) {
  const dashed = dash ? ` stroke-dasharray="${dash}"` : "";
  return `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" fill="none" stroke="${stroke}" stroke-width="${r(strokeWidth)}"${dashed}/>`;
}

function path(d: string) {
  return `<path d="${d}"/>`;
}

function r(value: number) {
  return Math.round(value);
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
