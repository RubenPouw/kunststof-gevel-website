export function weekNow(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - start.getTime()) / 864e5 + start.getDay() + 1) / 7) + 1;
}

export function stockLabel(inStock: boolean, week = weekNow(), stockText?: string) {
  if (inStock) {
    return { text: `Op voorraad · wk ${week}`, color: "var(--kg-stock)" };
  }
  return {
    text: stockText ?? `Levering wk ${week + 2}`,
    color: "var(--kg-navy)",
  };
}
