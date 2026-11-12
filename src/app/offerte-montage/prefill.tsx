"use client";

import { useEffect, useState } from "react";

import { MontageQuoteCard } from "@/components/montage-quote-card";
import { MONTAGE_QUOTE_KEY, readMontageQuoteRequest, type MontageQuoteDraft } from "@/lib/montage-quote";

export function MontageQuotePrefill() {
  const [draft, setDraft] = useState<MontageQuoteDraft | null | undefined>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem(MONTAGE_QUOTE_KEY) ?? sessionStorage.getItem(MONTAGE_QUOTE_KEY);
    setDraft(readMontageQuoteRequest(window.location.search, stored));
  }, []);

  return (
    <MontageQuoteCard
      idPrefix="montage"
      heading="Offerte montage aanvragen"
      headingLevel="h1"
      draft={draft ?? null}
      ready={draft !== undefined}
    />
  );
}
