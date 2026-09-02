import type { Metadata } from "next";

import { QuoteForm } from "@/components/quote-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Offerte",
  description:
    "Vraag een prijsindicatie aan voor kunststof gevelbekleding. Vaste offerte na opname.",
};

export default function OffertePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_minmax(0,28rem)]">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Offerte
        </p>
        <h1 className="mt-2 text-4xl sm:text-6xl">Eén formulier. Een vaste prijs daarna.</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Vul het geveloppervlak in. Je ziet meteen een bandbreedte inclusief
          montage. De echte offerte volgt na foto’s of een opname — geen
          verrassing achteraf.
        </p>
        <ul className="mt-8 space-y-3 text-sm">
          <li>Reactie op werkdagen binnen 24 uur</li>
          <li>Indicatie €95–€140 per m² inclusief montage</li>
          <li>
            Liever direct?{" "}
            <a href={site.phoneHref} className="underline underline-offset-4">
              {site.phone}
            </a>
          </li>
        </ul>
      </div>
      <QuoteForm />
    </div>
  );
}
