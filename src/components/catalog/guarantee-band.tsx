import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GuaranteeBand() {
  return (
    <section className="container-kg mt-16 mb-16 grid gap-8 border border-kg-lijn bg-white px-8 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <h2 className="text-[22px] font-bold tracking-[-0.03em]">Levering</h2>
        <ul className="mt-6 grid gap-3 font-mono text-[14px] sm:grid-cols-2">
          {[
            "10 jaar kleurvastheid",
            "Levering in vaste weken",
            "Gratis kleurstalen, geen verplichting",
            "Hulpstukken in dezelfde folie",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <Link href="/#stalen" className={cn(buttonVariants({ variant: "primary" }), "no-underline hover:no-underline")}>
        Kleurstalen aanvragen
      </Link>
    </section>
  );
}
