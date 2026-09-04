export function formatPrice(value: number) {
  return value.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatMoneyLabel(value: number) {
  return formatPrice(value);
}
