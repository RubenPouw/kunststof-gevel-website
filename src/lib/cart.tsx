"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getProduct, getVariant } from "@/lib/catalog";

export const FREE_SHIPPING_FROM = 499;
const STORAGE_KEY = "kg-cart-v2";
const EVENT_NAME = "kg-cart";

export type CartLine = {
  productSlug: string;
  variantSku: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  remainingForFreeShipping: number;
  add: (line: CartLine) => void;
  setQty: (variantSku: string, qty: number) => void;
  remove: (variantSku: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readRaw() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function parseLines(raw: string): CartLine[] {
  try {
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed)
      ? parsed.filter((line) => line && typeof line.variantSku === "string" && typeof line.productSlug === "string")
      : [];
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

function lineTotal(line: CartLine) {
  const product = getProduct(line.productSlug);
  const variant = product ? getVariant(product, line.variantSku) : undefined;
  return variant ? variant.price * line.qty : 0;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const lines = useMemo(() => parseLines(raw), [raw]);

  const add = useCallback((line: CartLine) => {
    const current = parseLines(readRaw());
    const existing = current.find((item) => item.variantSku === line.variantSku);
    persist(
      existing
        ? current.map((item) =>
            item.variantSku === line.variantSku ? { ...item, qty: item.qty + line.qty } : item,
          )
        : [...current, line],
    );
  }, []);

  const setQty = useCallback((variantSku: string, qty: number) => {
    const current = parseLines(readRaw());
    persist(
      qty < 1
        ? current.filter((item) => item.variantSku !== variantSku)
        : current.map((item) => (item.variantSku === variantSku ? { ...item, qty } : item)),
    );
  }, []);

  const remove = useCallback((variantSku: string) => {
    persist(parseLines(readRaw()).filter((item) => item.variantSku !== variantSku));
  }, []);

  const clear = useCallback(() => persist([]), []);

  const value = useMemo(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0);
    const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);
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
