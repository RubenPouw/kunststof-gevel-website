import type { Metadata } from "next";

import { SampleRequestForm } from "@/app/stalen/sample-form";

export const metadata: Metadata = {
  title: "Kleurstalen",
  description: "Vraag tot vier gratis kleurstalen aan. Binnen twee werkdagen thuis, zonder verplichting.",
};

export default function StalenPage() {
  return (
    <div className="container-kg py-12 sm:py-16">
      <p className="kicker">Gratis kleurstalen</p>
      <h1 className="display-pdp mt-2 normal-case">Stalen aanvragen</h1>
      <p className="mt-4 max-w-xl text-[var(--color-text-soft)]">
        Maximaal vier kleuren. U ziet de folie in uw licht. Geen offerte, geen verplichting.
      </p>
      <div className="mt-10">
        <SampleRequestForm />
      </div>
    </div>
  );
}
