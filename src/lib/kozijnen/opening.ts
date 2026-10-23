import type { Layout, PaneKind } from "./layouts";
import type { KozijnConfig } from "./model";

/**
 * Scharnierzijde van buiten gezien.
 * Links is links als u voor de gevel staat.
 * Ramen draaien naar binnen. Een deur volgt de gekozen richting.
 * Bij een stolp of dubbele deur zitten de scharnieren aan de buitenkant.
 */
export function hingeOnRight(layout: Layout, config: KozijnConfig, index: number, count: number) {
  if (layout.slug === "draaikiepraam-met-vast-raam") return config.side === "rechts";
  if (layout.slug === "vast-draaikiep-vast") return true;
  if (layout.slug === "draaikiep-vast-draaikiep") return index === count - 1;
  if (layout.meeting) return index === count - 1;
  if (layout.chooseSide) return config.side === "rechts";
  return index >= count / 2;
}

export function opensInward(layout: Layout, config: KozijnConfig) {
  if (layout.group === "ramen") return true;
  return config.direction !== "buiten";
}

/** Het schuivende deel beweegt naar het vaste deel toe. */
export function slideTowardRight(layout: Layout, config: KozijnConfig, index: number, count: number) {
  return !hingeOnRight(layout, config, index, count);
}

export function openingPhrase(layout: Layout, config: KozijnConfig, kind: PaneKind, index: number, count: number) {
  if (kind === "vast") return "vast";
  if (kind === "schuif") {
    const toward = slideTowardRight(layout, config, index, count) ? "rechts" : "links";
    return `schuivend, schuift naar ${toward}`;
  }
  const hinge = hingeOnRight(layout, config, index, count) ? "rechts" : "links";
  const direction = opensInward(layout, config) ? "naar binnen" : "naar buiten";
  if (kind === "draai") return `draai, scharnier ${hinge}, ${direction}`;
  if (kind === "draaikiep") return `draaikiep, scharnier ${hinge}, ${direction}`;
  return `deur, scharnier ${hinge}, ${direction}`;
}
