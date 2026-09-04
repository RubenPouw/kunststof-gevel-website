import type { Metadata } from "next";

import { Logo } from "@/components/brand/logo";
import { QuoteForm } from "@/components/quote-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Offerte",
  description:
    "Vraag een prijsindicatie aan voor kunststof gevelbekleding. Vaste offerte na opname.",
};

export default function OffertePage() {
  return (
    <div className="container-kg grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_minmax(0,28rem)]">
      <div>
        <p className="kicker">Offerte</p>
        <h1 className="mt-2">Eén formulier. Een vaste prijs daarna.</h1>
        <p className="mt-4 max-w-xl text-[var(--color-text-soft)]">
          Vul het geveloppervlak in. U ziet meteen een bandbreedte inclusief
          montage. De echte offerte volgt na foto’s of een opname.
        </p>
        <div className="mt-6">
          <Logo size={28} tagline href="" />
        </div>
        <ul className="mt-8 space-y-3 text-[15px]">
          <li>
            <span className="mr-2 font-bold text-brand">✓</span>
            Reactie op werkdagen binnen 24 uur
          </li>
          <li>
            <span className="mr-2 font-bold text-brand">✓</span>
            Indicatie 95–140 per m² inclusief montage
          </li>
          <li>
            <span className="mr-2 font-bold text-brand">✓</span>
            Liever direct?{" "}
            <a href={site.phoneHref}>{site.phone}</a>
          </li>
        </ul>
      </div>
      <QuoteForm />
    </div>
  );
}
