"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

import { site } from "@/lib/site";

export function ChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {open ? (
        <div className="mb-3 w-[min(100vw-2rem,20rem)] border border-[var(--color-border)] bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="font-heading text-[22px] font-semibold">Hebt u een vraag?</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-11 place-items-center text-kg-ink"
              aria-label="Chat sluiten"
            >
              <X strokeWidth={1.5} />
            </button>
          </div>
          <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
            Altijd binnen 24 uur bericht. Op werkdagen {site.hours}.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-[15px] font-semibold">
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
        className="grid size-[52px] place-items-center bg-brand text-[12px] font-semibold text-white"
        aria-expanded={open}
        aria-label={open ? "Chat sluiten" : "Chat openen"}
      >
        {open ? <X strokeWidth={1.5} /> : <MessageCircle strokeWidth={1.5} />}
      </button>
    </div>
  );
}
