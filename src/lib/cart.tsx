"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getVariant } from "@/lib/catalog/helpers";
import { getStaticProduct } from "@/lib/catalog/static";
import { isFacadePanel } from "@/lib/catalog/derive";
import { exclVat, FREE_SHIPPING_FROM, GEVEL_MOUNT_PER_M2, SHIPPING_FLAT } from "@/lib/format";

export { FREE_SHIPPING_FROM };

const STORAGE_KEY = "kg-cart-v2";
const MOUNT_KEY = "kg-cart-mount-v1";
const EVENT_NAME = "kg-cart";

export type CartLine = {
  productSlug: string;
  variantSku: string;
  qty: number;
  name?: string;
  brand?: string;
  colorName?: string;
  price?: number;
  kind?: "product" | "kozijn";
  hex?: string;
  length?: string;
  areaM2?: number;
  mount?: boolean;
  skuLabel?: string;
};

type ResolvedLine = {
  name: string;
  brand: string;
  colorName: string;
  /** Unit price excl. btw */
  unitExcl: number;
  hex: string;
  length: string;
  areaM2: number;
  kind: "product" | "kozijn";
  skuLabel: string;
  inStock: boolean;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  remainingForFreeShipping: number;
  mountGevel: boolean;
  setMountGevel: (value: boolean) => void;
  gevelM2: number;
  mountPrice: number;
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

function readMount() {
  if (typeof window === "undefined") return "0";
  return window.localStorage.getItem(MOUNT_KEY) ?? "0";
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

function persistMount(value: boolean) {
  window.localStorage.setItem(MOUNT_KEY, value ? "1" : "0");
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

function resolveLine(line: CartLine): ResolvedLine | undefined {
  if (line.kind === "kozijn" && line.name && typeof line.price === "number") {
    return {
      name: line.name,
      brand: line.brand ?? "Kömmerling 76",
      colorName: line.colorName ?? "",
      unitExcl: line.price,
      hex: line.hex ?? "#3b3f42",
      length: line.length ?? "",
      areaM2: 0,
      kind: "kozijn",
      skuLabel: line.skuLabel ?? "Kömmerling 76",
      inStock: true,
    };
  }

  const product = getStaticProduct(line.productSlug);
  const variant = product ? getVariant(product, line.variantSku) : undefined;
  const name = line.name ?? product?.name;
  const priceIncl = typeof line.price === "number" ? line.price : variant?.price;
  if (!name || typeof priceIncl !== "number") return undefined;

  const coverage = variant?.panelsPerM2 ?? product?.panelsPerM2;
  const derivedArea =
    line.areaM2 ??
    (coverage && product && isFacadePanel(product) ? line.qty / coverage : 0);

  return {
    name,
    brand: line.brand ?? product?.brand ?? "",
    colorName: line.colorName ?? variant?.colorName ?? "",
    unitExcl: exclVat(priceIncl),
    hex: line.hex ?? variant?.hex ?? "#c9c4b8",
    length: line.length ?? variant?.length ?? "",
    areaM2: derivedArea,
    kind: "product",
    skuLabel: line.skuLabel ?? variant?.sku ?? line.variantSku,
    inStock: variant?.inStock ?? true,
  };
}

function lineTotalExcl(line: CartLine) {
  const resolved = resolveLine(line);
  return resolved ? resolved.unitExcl * line.qty : 0;
}

export function resolveCartLine(line: CartLine) {
  return resolveLine(line);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const mountRaw = useSyncExternalStore(subscribe, readMount, () => "0");
  const lines = useMemo(() => parseLines(raw), [raw]);
  const mountGevel = mountRaw === "1";

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

  const setMountGevel = useCallback((value: boolean) => persistMount(value), []);

  const value = useMemo(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0);
    const subtotal = lines.reduce((sum, line) => sum + lineTotalExcl(line), 0);
    const gevelM2 = lines.reduce((sum, line) => {
      const resolved = resolveLine(line);
      return sum + (resolved?.kind === "product" ? resolved.areaM2 : 0);
    }, 0);
    const mountPrice = Math.round(gevelM2 * GEVEL_MOUNT_PER_M2);
    return {
      lines,
      count,
      subtotal,
      remainingForFreeShipping: Math.max(0, FREE_SHIPPING_FROM - subtotal),
      mountGevel,
      setMountGevel,
      gevelM2,
      mountPrice,
      add,
      setQty,
      remove,
      clear,
    };
  }, [add, clear, lines, mountGevel, remove, setMountGevel, setQty]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart moet binnen CartProvider");
  return ctx;
}

export { SHIPPING_FLAT };
