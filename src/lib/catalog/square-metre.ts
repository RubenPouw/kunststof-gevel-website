import { parseLengthMeters } from "./text-rules";

/** Metres from a stored length. 150 mm and "stuk" are not a length. */
export function lengthToMeters(length: string | undefined): number | undefined {
  if (!length) return undefined;
  const meters = parseLengthMeters(length);
  if (meters) return meters;
  const mm = length.trim().match(/^(\d+(?:[.,]\d+)?)\s*mm$/i);
  if (!mm) return undefined;
  const value = Number(mm[1].replace(",", "."));
  if (!Number.isFinite(value) || value < 500) return undefined;
  return value / 1000;
}

/**
 * Incl. btw price per m² from the piece price and a real width plus length,
 * or from a sheet's m². Missing data returns undefined. Nothing is invented.
 */
export function pricePerSquareMetre(input: {
  priceIncl: number;
  workingWidthMm?: number;
  length?: string;
  sheetM2?: number;
}): number | undefined {
  if (!(input.priceIncl > 0)) return undefined;
  if (input.sheetM2 && input.sheetM2 > 0) {
    const perM2 = input.priceIncl / input.sheetM2;
    return Number.isFinite(perM2) && perM2 > 0 ? Math.round(perM2 * 100) / 100 : undefined;
  }
  const meters = lengthToMeters(input.length);
  if (!input.workingWidthMm || input.workingWidthMm < 80 || !meters) return undefined;
  const area = (input.workingWidthMm / 1000) * meters;
  const perM2 = area > 0 ? input.priceIncl / area : Number.NaN;
  if (!Number.isFinite(perM2) || perM2 <= 0) return undefined;
  return Math.round(perM2 * 100) / 100;
}
