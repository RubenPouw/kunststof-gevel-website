"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getProduct } from "@/lib/catalog";

export const FREE_SHIPPING_FROM = 499;
const STORAGE_KEY = "kg-cart";
const EVENT_NAME = "kg-cart";

export type CartLine = {
  productSlug: string;
  colorName: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  remainingForFreeShipping: number;
  add: (line: CartLine) => void;
  setQty: (productSlug: string, colorName: string, qty: number) => void;
  remove: (productSlug: string, colorName: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(line: Pick<CartLine, "productSlug" | "colorName">) {
  return `${line.productSlug}::${line.colorName}`;
}

function readRaw() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function parseLines(raw: string): CartLine[] {
  try {
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(lines: CartLine[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(EVENT_NAME));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT_NAME, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT_NAME, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const lines = useMemo(() => parseLines(raw), [raw]);

  const add = useCallback((line: CartLine) => {
    const current = parseLines(readRaw());
    const existing = current.find((item) => lineKey(item) === lineKey(line));
    persist(
      existing
        ? current.map((item) =>
            lineKey(item) === lineKey(line) ? { ...item, qty: item.qty + line.qty } : item,
          )
        : [...current, line],
    );
  }, []);

  const setQty = useCallback((productSlug: string, colorName: string, qty: number) => {
    const current = parseLines(readRaw());
    const key = lineKey({ productSlug, colorName });
    persist(
      qty < 1
        ? current.filter((item) => lineKey(item) !== key)
        : current.map((item) => (lineKey(item) === key ? { ...item, qty } : item)),
    );
  }, []);

  const remove = useCallback((productSlug: string, colorName: string) => {
    const key = lineKey({ productSlug, colorName });
    persist(parseLines(readRaw()).filter((item) => lineKey(item) !== key));
  }, []);

  const clear = useCallback(() => persist([]), []);

  const value = useMemo(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0);
    const subtotal = lines.reduce((sum, line) => {
      const product = getProduct(line.productSlug);
      return sum + (product ? product.price * line.qty : 0);
    }, 0);
    return {
      lines,
      count,
      subtotal,
      remainingForFreeShipping: Math.max(0, FREE_SHIPPING_FROM - subtotal),
      add,
      setQty,
      remove,
      clear,
    };
  }, [add, clear, lines, remove, setQty]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart moet binnen CartProvider");
  return ctx;
}
