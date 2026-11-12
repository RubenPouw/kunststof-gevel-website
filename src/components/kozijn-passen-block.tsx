import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function KozijnPassenBlock({ plain = false }: { plain?: boolean }) {
  const card = (
    <div className="kg-soft-card border-kg-navy p-6 sm:p-8">
      <h2 id="passen-kozijnen" className="text-[22px] font-medium tracking-[-0.03em] text-kg-navy">
        Passen je kozijnen nog?
      </h2>
      <p className="mt-3 max-w-2xl text-[16px] leading-normal text-kg-text-2">
        Een nieuwe gevel op oude kozijnen vraagt om een kloppende aansluiting en een kleur die u eerst naast elkaar legt. Cavemen kan gevel en kozijnen in één ronde monteren. Bekijk de kozijnen, of vraag gevel en kozijnen in één offerte aan.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/kunststof-kozijnen" className={buttonVariants({ size: "sm" })}>
          Kunststof kozijnen
        </Link>
        <Link href="/offerte-montage?delen=Gevel,Kozijnen" className={buttonVariants({ variant: "secondary", size: "sm" })}>
          Offerte gevel en kozijnen
        </Link>
      </div>
      <p className="mt-4 text-[15px]">
        <Link href="/gevel-en-kozijnen-renoveren">Gevel en kozijnen tegelijk renoveren</Link>
      </p>
    </div>
  );
  if (plain) return <div className="mt-16">{card}</div>;
  return (
    <section aria-labelledby="passen-kozijnen" className="container-kg py-8">
      {card}
    </section>
  );
}
