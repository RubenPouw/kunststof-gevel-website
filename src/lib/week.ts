export function weekNow(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - start.getTime()) / 864e5 + start.getDay() + 1) / 7) + 1;
}

export function stockLabel(inStock: boolean, stockText?: string) {
  if (inStock) {
    return { text: "Op voorraad", color: "var(--kg-stock)" };
  }
  return {
    text: stockText ?? "Niet op voorraad",
    color: "var(--kg-navy)",
  };
}
