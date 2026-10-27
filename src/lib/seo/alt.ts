export function productAlt(product: { brand?: string; name: string }, detail?: string) {
  const name = [product.brand, product.name].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (!detail) return name;
  return `${name}, ${detail}`;
}
