import Link from "next/link";

import { CavemenMark } from "@/components/brand/marks";
import { buttonVariants } from "@/components/ui/button";
import { businessPoints } from "@/lib/site";
import { cn } from "@/lib/utils";

export function BusinessBand() {
  return (
    <section className="container-kg section-kg grid gap-5 lg:grid-cols-2">
      <div className="bg-kg-navy p-8 text-kg-kalk sm:p-10">
        <div className="flex items-center gap-2 text-[16px] font-bold">
          <CavemenMark size={18} />
          Cavemen
        </div>
        <h2 className="mt-5 text-[28px] leading-[1.1] font-bold tracking-[-0.03em] sm:text-[34px]">
          Materiaal geregeld,
          <br />
          <span className="text-kg-signal">handen tekort?</span>
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-[1.5] text-kg-grind">
          Een Caveman zet de gevel of het kozijn. Eén factuur via uw account. Niet als vierde shop, als extra handen.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/montage" className={cn(buttonVariants({ variant: "signal" }), "no-underline hover:no-underline")}>
            Plaats een klus
          </Link>
          <Link href="/zakelijk" className={cn(buttonVariants({ variant: "on-dark" }), "no-underline hover:no-underline")}>
            Word Caveman
          </Link>
        </div>
      </div>
      <div className="border border-kg-lijn bg-white p-8 sm:p-10">
        <p className="font-mono text-[13px] text-kg-text-2">Zakelijk · één account</p>
        <h2 className="mt-3 text-[28px] leading-[1.1] font-bold tracking-[-0.03em] sm:text-[34px]">
          Bestelt u voor uw zaak?
        </h2>
        <ul className="mt-6 divide-y divide-kg-lijn border-y border-kg-lijn">
          {businessPoints.map((point) => (
            <li key={point} className="py-3 font-mono text-[14px]">
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/zakelijk" className={cn(buttonVariants({ variant: "primary" }), "no-underline hover:no-underline")}>
            Zakelijk account aanvragen
          </Link>
          <Link href="/offerte" className={cn(buttonVariants({ variant: "outline" }), "no-underline hover:no-underline")}>
            Vraag offerte aan
          </Link>
        </div>
      </div>
    </section>
  );
}
