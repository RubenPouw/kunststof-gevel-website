"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { SampleColor } from "@/lib/catalog/types";

export const SAMPLE_LIMIT = 4;
const STORAGE_KEY = "kg-samples-v1";
const EVENT_NAME = "kg-samples";

type SamplesContextValue = {
  items: SampleColor[];
  count: number;
  has: (id: string) => boolean;
  toggle: (item: SampleColor) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const SamplesContext = createContext<SamplesContextValue | null>(null);

function readRaw() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function parseItems(raw: string): SampleColor[] {
  try {
    const parsed = JSON.parse(raw) as SampleColor[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.hex === "string" &&
        typeof item.colorName === "string",
    );
  } catch {
    return [];
  }
}

function persist(items: SampleColor[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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

export function trayProgress(count: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0;
  if (count >= 4) return 3;
  return count as 1 | 2 | 3;
}

export function SampleTrayProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const items = useMemo(() => parseItems(raw), [raw]);

  const toggle = useCallback((item: SampleColor) => {
    const current = parseItems(readRaw());
    const exists = current.some((entry) => entry.id === item.id);
    if (exists) {
      persist(current.filter((entry) => entry.id !== item.id));
      return;
    }
    if (current.length >= SAMPLE_LIMIT) return;
    persist([...current, item]);
  }, []);

  const remove = useCallback((id: string) => {
    persist(parseItems(readRaw()).filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => persist([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      has: (id: string) => items.some((item) => item.id === id),
      toggle,
      remove,
      clear,
    }),
    [clear, items, remove, toggle],
  );

  return <SamplesContext.Provider value={value}>{children}</SamplesContext.Provider>;
}

export function useSamples() {
  const ctx = useContext(SamplesContext);
  if (!ctx) throw new Error("useSamples moet binnen SampleTrayProvider");
  return ctx;
}

export function asSampleColor(input: {
  id: string;
  brandSlug: string;
  brandName: string;
  colorName: string;
  hex: string;
  ral?: string;
}): SampleColor {
  return input;
}
