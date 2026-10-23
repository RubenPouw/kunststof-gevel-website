"use client";

import { useLayoutEffect, useRef } from "react";

import { readVatMode, setVatMode, type VatMode } from "@/lib/vat-mode";
import { cn } from "@/lib/utils";

export function VatSwitch({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function mark(mode: VatMode) {
    ref.current?.querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.mode === mode ? "true" : "false");
    });
  }

  useLayoutEffect(() => {
    const mode = readVatMode(document.cookie);
    document.documentElement.dataset.btw = mode;
    mark(mode);
  }, []);

  function choose(mode: VatMode) {
    setVatMode(mode);
    mark(mode);
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Prijzen tonen"
      className={cn("kg-btw-switch", tone === "light" && "kg-btw-switch-light", className)}
    >
      <button type="button" data-mode="incl" onClick={() => choose("incl")}>
        Incl. btw
      </button>
      <button type="button" data-mode="excl" onClick={() => choose("excl")}>
        Excl. btw
      </button>
    </div>
  );
}
