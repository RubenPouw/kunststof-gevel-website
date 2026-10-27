"use client";

import { useEffect, useState } from "react";

import { publishConsent } from "@/lib/tracking/browser";

const STORAGE_KEY = "kg-consent";

type Choice = "granted" | "denied";

export function ConsentAndGtm() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "granted" || stored === "denied") {
        setChoice(stored);
        void publishConsent(stored);
      }
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function choose(next: Choice) {
    await publishConsent(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    setChoice(next);
    window.dispatchEvent(new Event("kg-consent"));
  }

  return (
    <>
      {ready && choice === null ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-kg-navy bg-white px-4 py-3">
          <div className="container-kg flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-[14px] leading-snug">
              Statistiek en advertentiemeting lopen via onze eigen server, alleen nadat u toestemt. We laden geen script van Google. De site werkt ook zonder.
            </p>
            <div className="flex shrink-0 gap-2">
              <button type="button" className="h-10 border border-kg-navy px-3 text-[14px] font-medium" onClick={() => void choose("denied")}>
                Weigeren
              </button>
              <button type="button" className="h-10 bg-kg-navy px-3 text-[14px] font-medium text-white" onClick={() => void choose("granted")}>
                Accepteren
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
