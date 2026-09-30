"use client";

import { useEffect, useRef } from "react";

import { useAccount, type AccountRequest } from "@/lib/account";

export function RememberLead({
  type,
  reference,
  email,
  summary,
}: {
  type: AccountRequest["type"];
  reference: string;
  email: string;
  summary: string;
}) {
  const { addRequest } = useAccount();
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    addRequest({ type, reference, email, summary });
  }, [addRequest, email, reference, summary, type]);

  return null;
}
