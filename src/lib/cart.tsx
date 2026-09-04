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

const STORAGE_KEY = "kg-cart";
const CartContext = createContext<CartContextValue | null>(null);
const empty: CartLine[] = [];
const listeners = new Set<() => void>();
let memory: CartLine[] = empty;
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

function readStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : empty;
  } catch {
    return empty;
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  memory = readStorage();
  hydrated = true;
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  hydrate();
  return memory;
}

function getServerSnapshot() {
  return empty;
}

function write(next: CartLine[]) {
  memory = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
}

function lineKey(line: Pick<CartLine, "productSlug" | "colorName">) {
  return `${line.productSlug}::${line.colorName}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((line: CartLine) => {
    const current = getSnapshot();
    const existing = current.find((item) => lineKey(item) === lineKey(line));
    write(
      existing
        ? current.map((item) =>
            lineKey(item) === lineKey(line) ? { ...item, qty: item.qty + line.qty } : item,
          )
        : [...current, line],
    );
  }, []);

  const setQty = useCallback((productSlug: string, colorName: string, qty: number) => {
    const current = getSnapshot();
    const key = lineKey({ productSlug, colorName });
    write(
      qty < 1
        ? current.filter((item) => lineKey(item) !== key)
        : current.map((item) => (lineKey(item) === key ? { ...item, qty } : item)),
    );
  }, []);

  const remove = useCallback((productSlug: string, colorName: string) => {
    const key = lineKey({ productSlug, colorName });
    write(getSnapshot().filter((item) => lineKey(item) !== key));
  }, []);

  const clear = useCallback(() => write(empty), []);

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
