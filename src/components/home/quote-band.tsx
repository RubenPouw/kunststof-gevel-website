import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuoteBand() {
  return (
    <section className="container-kg section-kg">
      <div
        className="relative overflow-hidden px-8 py-14 sm:px-14"
        style={{ background: "var(--gradient-brand)" }}
      >
        <div
          className="pointer-events-none absolute -top-[80px] right-0 size-[380px]"
          style={{ background: "var(--glow-orange)" }}
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="kicker text-[var(--kg-blue-100)]">Gratis offerte</p>
            <h2 className="mt-3 font-heading text-[52px] leading-[0.95] font-bold text-white uppercase">
              Wilt u ook nooit meer schilderen?
            </h2>
            <p className="mt-4 max-w-lg text-[17px] text-white/88">
              Stuur het geveloppervlak. U krijgt een bandbreedte, daarna een vaste prijs na opname.
            </p>
          </div>
          <div className="lg:text-right">
            <Link href="/offerte" className={cn(buttonVariants({ variant: "primary" }))}>
              Vraag gratis offerte aan
            </Link>
            <p className="mt-3 text-[13px] text-[var(--kg-blue-100)]">U zit nergens aan vast.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
