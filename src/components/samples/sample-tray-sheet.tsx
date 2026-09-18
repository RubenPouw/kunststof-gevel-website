"use client";

import Link from "next/link";

import { SampleTrayCard } from "@/components/samples/sample-tray-card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function SampleTraySheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-md border-l border-[var(--color-border)] bg-kg-offwhite p-0 shadow-none"
      >
        <SheetHeader className="border-b border-[var(--color-border)] p-6">
          <SheetTitle className="font-heading text-[22px] font-semibold">Kleurstalen</SheetTitle>
          <SheetDescription className="text-[13px] text-[var(--color-text-muted)]">
            Maximaal vier kleuren, gratis thuis.{" "}
            <Link href="/#stalen" onClick={() => onOpenChange(false)}>
              Alle kleuren
            </Link>
          </SheetDescription>
        </SheetHeader>
        <div className="p-6">
          <SampleTrayCard />
        </div>
      </SheetContent>
    </Sheet>
  );
}
