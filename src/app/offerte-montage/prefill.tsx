"use client";

import { useEffect, useState } from "react";

import { MontageQuoteCard } from "@/components/montage-quote-card";
import { MONTAGE_QUOTE_KEY, readMontageQuoteRequest, type MontageQuoteDraft } from "@/lib/montage-quote";

export function MontageQuotePrefill() {
  const [draft, setDraft] = useState<MontageQuoteDraft | null | undefined>(undefined);

  useEffect(() => {
    setDraft(readMontageQuoteRequest(window.location.search, sessionStorage.getItem(MONTAGE_QUOTE_KEY)));
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
