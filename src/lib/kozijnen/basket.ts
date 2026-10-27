export type BasketItem = {
  layout: string;
  query: string;
  title: string;
};

export const BASKET_KEY = "kg-offertemand";

export function basketKey(item: Pick<BasketItem, "layout" | "query">) {
  return `${item.layout}?${item.query}`;
}

export function addBasketItem(items: BasketItem[], item: BasketItem) {
  const key = basketKey(item);
  return [...items.filter((current) => basketKey(current) !== key), item].slice(-12);
}

export function removeBasketItem(items: BasketItem[], key: string) {
  return items.filter((item) => basketKey(item) !== key);
}

export function readBasket(): BasketItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BASKET_KEY);
    const parsed = raw ? (JSON.parse(raw) as BasketItem[]) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item.layout && item.query && item.title) : [];
  } catch {
    return [];
  }
}

export function writeBasket(items: BasketItem[]) {
  window.localStorage.setItem(BASKET_KEY, JSON.stringify(items));
}
