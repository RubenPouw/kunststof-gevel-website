export const VAT_RATE = 1.21;
export const FREE_SHIPPING_FROM = 499;
export const SHIPPING_FLAT = 49;
export const GEVEL_MOUNT_PER_M2 = 38;

export function formatPrice(value: number) {
  return `€ ${value.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatMoneyLabel(value: number) {
  return formatPrice(value);
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function exclVat(incl: number) {
  return roundMoney(incl / VAT_RATE);
}

export function inclVat(excl: number) {
  return roundMoney(excl * VAT_RATE);
}

export function formatLengthMm(length: string) {
  const meters = length.trim().toLowerCase().match(/^(\d+(?:[.,]\d+)?)\s*(m|meter|mtr)\b/);
  if (meters) {
    const mm = Math.round(Number(meters[1].replace(",", ".")) * 1000);
    return `${mm.toLocaleString("nl-NL")} mm`;
  }
  if (/^\d+$/.test(length.trim())) {
    return `${Number(length).toLocaleString("nl-NL")} mm`;
  }
  return length;
}

export function formatNlNumber(value: number, digits = 1) {
  return value.toLocaleString("nl-NL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
