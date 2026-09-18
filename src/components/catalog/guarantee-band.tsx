import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GuaranteeBand() {
  return (
    <section className="container-kg mt-16 mb-16 grid gap-8 bg-tint px-9 py-11 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <h2 className="font-heading text-[32px] leading-none font-bold uppercase">Leveringsgaranties</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Standaard 10 jaar kleurvastheid",
            "Vandaag besteld, binnen 2 werkdagen geleverd",
            "Gratis kleurstalen, nergens aan vast",
            "Hulpstukken in dezelfde folie",
          ].map((item) => (
            <li key={item} className="text-[15px]">
              <span className="mr-2 font-bold text-brand">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <Link href="/#stalen" className={cn(buttonVariants({ variant: "secondary" }))}>
        Vraag gratis stalen aan
      </Link>
    </section>
  );
}
