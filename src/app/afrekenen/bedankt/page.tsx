import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bestelling ontvangen",
};

export default function CheckoutThanksPage() {
  return (
    <div className="container-kg max-w-xl py-16">
      <p className="font-mono text-[13px] text-kg-text-2">Afrekenen</p>
      <h1 className="mt-2">Bestelling ontvangen</h1>
      <p className="mt-6 text-kg-text-2">
        Altijd binnen 24 uur bericht op {site.email}. Betaling volgt per e-mail
        (iDEAL). Dit is nog geen automatische incasso.
      </p>
      <Link href="/gevelbekleding" className={buttonVariants({ variant: "secondary" }) + " mt-8 inline-flex"}>
        Verder winkelen
      </Link>
    </div>
  );
}
