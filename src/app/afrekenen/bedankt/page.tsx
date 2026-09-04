import type { Metadata } from "next";
import Link from "next/link";

import { SegmentBar } from "@/components/brand/segment-bar";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bestelling ontvangen",
};

export default function CheckoutThanksPage() {
  return (
    <div className="container-kg max-w-xl py-16">
      <p className="kicker">Afrekenen</p>
      <h1 className="mt-2">Bestelling ontvangen</h1>
      <SegmentBar size={32} progress={3} className="mt-6" />
      <p className="mt-6 text-[var(--color-text-soft)]">
        Altijd binnen 24 uur bericht op {site.email}. Betaling volgt per e-mail
        (iDEAL). Dit is nog geen automatische incasso.
      </p>
      <Link href="/gevelbekleding" className={buttonVariants({ variant: "secondary" }) + " mt-8 inline-flex"}>
        Verder winkelen
      </Link>
    </div>
  );
}
