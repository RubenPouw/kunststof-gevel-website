import type { SizeBox } from "./types";

const OPENING = new Set(["draai", "draaikiep", "schuif", "deur"]);

export type LimitPane = { kind: string; flex: number };

const BIGGER = "Neem contact op voor grotere maten. Bel 030 227 1397.";
const SMALLER = "Neem contact op voor kleinere maten. Bel 030 227 1397.";

export function formatMm(value: number) {
  return new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 }).format(value);
}

export function openingLeafTooWide(box: SizeBox, panes: LimitPane[], width: number) {
  if (box.maxSashWidth == null) return false;
  const flex = panes.reduce((sum, pane) => sum + pane.flex, 0);
  if (flex <= 0) return true;
  return panes.some((pane) => OPENING.has(pane.kind) && pane.flex > 0 && width * pane.flex > box.maxSashWidth! * flex);
}

/** Grootste buitenwerkse breedte die kader én vakken nog halen. */
export function inputMaxWidth(box: SizeBox, panes: LimitPane[]): number | undefined {
  let cap = box.maxWidth;
  if (box.maxSashWidth == null) return cap;
  const flex = panes.reduce((sum, pane) => sum + pane.flex, 0);
  if (flex <= 0) return cap;
  for (const pane of panes) {
    if (!OPENING.has(pane.kind) || pane.flex <= 0) continue;
    const leafCap = Math.floor((box.maxSashWidth * flex) / pane.flex);
    cap = cap == null ? leafCap : Math.min(cap, leafCap);
  }
  return cap;
}

export function dimensionMessages(box: SizeBox, panes: LimitPane[], width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return ["Vul een breedte en een hoogte in millimeters in."];
  }
  const messages: string[] = [];
  if (box.minWidth != null && width < box.minWidth) {
    messages.push(`Minimale breedte voor dit type is ${formatMm(box.minWidth)} mm. ${SMALLER}`);
  }
  if (box.maxWidth != null && width > box.maxWidth) {
    messages.push(`Maximale breedte voor dit type is ${formatMm(box.maxWidth)} mm. ${BIGGER}`);
  }
  if (box.minHeight != null && height < box.minHeight) {
    messages.push(`Minimale hoogte voor dit type is ${formatMm(box.minHeight)} mm. ${SMALLER}`);
  }
  if (box.maxHeight != null && height > box.maxHeight) {
    messages.push(`Maximale hoogte voor dit type is ${formatMm(box.maxHeight)} mm. ${BIGGER}`);
  }
  if (openingLeafTooWide(box, panes, width) && box.maxSashWidth != null) {
    messages.push(`Maximale breedte van een vak is ${formatMm(box.maxSashWidth)} mm. ${BIGGER}`);
  }
  return messages;
}

export function dimensionsAllowed(box: SizeBox, panes: LimitPane[], width: number, height: number) {
  return dimensionMessages(box, panes, width, height).length === 0;
}

export function limitIntro(box: SizeBox, panes: LimitPane[]) {
  const maxWidth = inputMaxWidth(box, panes);
  if (box.maxWidth == null && box.maxSashWidth != null && maxWidth != null && box.maxHeight != null) {
    return `Een vak is maximaal ${formatMm(box.maxSashWidth)} mm breed. Bij gelijke vakken gaat dit type tot ${formatMm(maxWidth)} mm breed en ${formatMm(box.maxHeight)} mm hoog.`;
  }
  if (maxWidth != null && box.maxHeight != null) {
    return `Dit type gaat tot ${formatMm(maxWidth)} mm breed en ${formatMm(box.maxHeight)} mm hoog.`;
  }
  if (maxWidth != null) return `Dit type gaat tot ${formatMm(maxWidth)} mm breed.`;
  if (box.maxHeight != null) return `Dit type gaat tot ${formatMm(box.maxHeight)} mm hoog.`;
  return "Voor dit type staat nog geen maximale maat online. Twijfelt u, bel 030 227 1397.";
}
