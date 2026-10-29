/** Cavesupplies C-mark, brandbook grid. One unit is e. Drawing area is 8e × 8e. */

export const MARK_UNITS = 8;
export const KAP = 2.2;
export const CHAMFER = 1;
export const VOEG = 0.3;
/** Width of the left leg. One poot. */
export const POOT = 2.2;
export const FLOOR = 2.2;
/** From the underside of the kap to the top of the floor, including the voeg. */
export const OPENING = 3.6;

export const LOCKUP_KALK = "#F4F2ED";
export const LOCKUP_NAVY = "#1B2838";

function unit(value: number) {
  return String(Math.round(value * 1000) / 1000);
}

export function cavesuppliesMarkPath() {
  const right = MARK_UNITS;
  const chamferX = right - CHAMFER;
  const legTop = KAP + VOEG;
  const floorTop = KAP + OPENING;
  return [
    `M0 0H${unit(chamferX)}L${unit(right)} ${unit(CHAMFER)}V${unit(KAP)}H0Z`,
    `M0 ${unit(legTop)}H${unit(POOT)}V${unit(floorTop)}H0Z`,
    `M0 ${unit(floorTop)}H${unit(right)}V${unit(floorTop + FLOOR)}H0Z`,
  ].join("");
}

export function lockupMetrics(nameSize: number) {
  const line2 = nameSize * 0.58;
  const mark = Math.max(12, line2);
  const e = mark / MARK_UNITS;
  const poot = POOT * e;
  return {
    line2,
    mark,
    /** Half a poot between the mark and the parent line. */
    markGap: 0.5 * poot,
    /** One poot of clear space around the lockup. */
    clear: poot,
    lineGap: nameSize * 0.22,
  };
}

export function lockupColor(tone: "light" | "dark") {
  return tone === "dark" ? LOCKUP_KALK : LOCKUP_NAVY;
}
