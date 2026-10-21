/** Gevelvlak → aantal panelen. Snijverlies zit vast op 10%. */

export const FACADE_WASTE = 0.1;

/** 3050 × 1300 mm, sold as a whole sheet. */
export const HPL_SHEET_M2 = 3.965;

export type FacadeInput = {
  widthM: number;
  heightM: number;
  openingsM2?: number;
  panelsPerM2: number;
  waste?: number;
};

export type FacadeOrder =
  | {
      ok: true;
      grossM2: number;
      openingsM2: number;
      netM2: number;
      orderM2: number;
      panels: number;
      waste: number;
    }
  | { ok: false; error: string };

export function parseMeters(raw: string) {
  const trimmed = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!trimmed) return Number.NaN;
  return Number(trimmed);
}

export function facadeOrder(input: FacadeInput): FacadeOrder {
  const waste = input.waste ?? FACADE_WASTE;
  if (!Number.isFinite(input.widthM) || !Number.isFinite(input.heightM) || input.widthM <= 0 || input.heightM <= 0) {
    return { ok: false, error: "Vul breedte en hoogte in meters in." };
  }
  if (input.widthM > 200 || input.heightM > 40) {
    return { ok: false, error: "Controleer de maten. Breedte tot 200 m, hoogte tot 40 m." };
  }
  const openings = input.openingsM2 ?? 0;
  if (!Number.isFinite(openings) || openings < 0) {
    return { ok: false, error: "Vul openingen in als m², of laat 0 staan." };
  }
  const grossM2 = input.widthM * input.heightM;
  if (openings > grossM2) {
    return { ok: false, error: "Openingen zijn groter dan het gevelvlak." };
  }
  if (!Number.isFinite(input.panelsPerM2) || input.panelsPerM2 <= 0) {
    return { ok: false, error: "Voor dit artikel is geen m²-dekking bekend." };
  }
  const netM2 = grossM2 - openings;
  if (netM2 <= 0) {
    return { ok: false, error: "Na aftrek van openingen blijft er geen gevel over." };
  }
  const orderM2 = netM2 * (1 + waste);
  return {
    ok: true,
    grossM2,
    openingsM2: openings,
    netM2,
    orderM2,
    panels: Math.ceil(orderM2 * input.panelsPerM2 - 1e-9),
    waste,
  };
}

export type SheetInput = {
  widthM: number;
  heightM: number;
  openingsM2?: number;
  sheetM2?: number;
};

export type SheetOrder =
  | {
      ok: true;
      grossM2: number;
      openingsM2: number;
      netM2: number;
      sheets: number;
      sheetM2: number;
    }
  | { ok: false; error: string };

/** Area divided by one whole sheet. No cutting, no panel waste percentage. */
export function sheetOrder(input: SheetInput): SheetOrder {
  const sheetM2 = input.sheetM2 ?? HPL_SHEET_M2;
  if (!Number.isFinite(input.widthM) || !Number.isFinite(input.heightM) || input.widthM <= 0 || input.heightM <= 0) {
    return { ok: false, error: "Vul breedte en hoogte in meters in." };
  }
  if (input.widthM > 200 || input.heightM > 40) {
    return { ok: false, error: "Controleer de maten. Breedte tot 200 m, hoogte tot 40 m." };
  }
  const openings = input.openingsM2 ?? 0;
  if (!Number.isFinite(openings) || openings < 0) {
    return { ok: false, error: "Vul openingen in als m², of laat 0 staan." };
  }
  const grossM2 = input.widthM * input.heightM;
  if (openings > grossM2) {
    return { ok: false, error: "Openingen zijn groter dan het vlak." };
  }
  const netM2 = grossM2 - openings;
  if (netM2 <= 0) {
    return { ok: false, error: "Na aftrek van openingen blijft er geen vlak over." };
  }
  if (!Number.isFinite(sheetM2) || sheetM2 <= 0) {
    return { ok: false, error: "De plaatmaat is niet bekend." };
  }
  return {
    ok: true,
    grossM2,
    openingsM2: openings,
    netM2,
    sheetM2,
    sheets: Math.ceil(netM2 / sheetM2 - 1e-9),
  };
}
