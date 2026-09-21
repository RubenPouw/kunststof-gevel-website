"use client";

import { useEffect, useRef, useState } from "react";

import { site } from "@/lib/site";

export function ChatButton() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="fixed right-6 bottom-6 z-[80] flex flex-col items-end gap-3">
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Chat"
          className="w-[min(calc(100vw-2rem),20rem)] border border-kg-lijn bg-white p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[22px] font-bold tracking-[-0.03em]">Hebt u een vraag?</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-11 place-items-center text-kg-navy"
              aria-label="Chat sluiten"
            >
              ×
            </button>
          </div>
          <p className="mt-2 font-mono text-[13px] text-kg-text-2">
            Altijd binnen 24 uur bericht. Op werkdagen {site.hours}.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-[15px] font-medium">
            <a href={site.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href={site.emailHref}>{site.email}</a>
            <a href={site.phoneHref}>{site.phone}</a>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="grid size-[52px] place-items-center bg-kg-navy font-mono text-[12px] font-medium text-kg-kalk"
        aria-expanded={open}
        aria-label={open ? "Chat sluiten" : "Chat openen"}
      >
        {open ? "×" : "Chat"}
      </button>
    </div>
  );
}
