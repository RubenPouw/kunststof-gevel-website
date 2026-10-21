import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Klachtenprocedure",
  description: "Zo meldt u een klacht over een bestelling of de levering.",
  alternates: { canonical: "/klachtenprocedure" },
};

export default function ComplaintsPage() {
  return (
    <LegalPage
      kicker="Klacht"
      title="Klachtenprocedure"
      intro="We behandelen een klacht schriftelijk, met een reactie binnen 14 dagen."
    >
      <section>
        <h2>Melden</h2>
        <p className="mt-3">
          Mail {site.email} of bel {site.phone}. Zet het bestelnummer, uw naam en een korte omschrijving erbij. Beeld van transportschade het liefst binnen twee dagen na ontvangst.
        </p>
      </section>
      <section>
        <h2>Afhandeling</h2>
        <p className="mt-3">
          We bevestigen de ontvangst en reageren inhoudelijk binnen 14 dagen. Lukt dat niet, dan laten we weten wanneer het wel lukt. Een oplossing is herstel, vervanging of terugbetaling, afhankelijk van het gebrek en uw wettelijke rechten.
        </p>
      </section>
      <section>
        <h2>Komt u er niet uit</h2>
        <p className="mt-3">
          We zijn niet aangesloten bij een geschillencommissie. Een consument kan het geschil voorleggen aan de bevoegde rechter. Zakelijke klanten ook, naar Nederlands recht. Zie de{" "}
          <Link href="/algemene-voorwaarden">algemene voorwaarden</Link>.
        </p>
      </section>
    </LegalPage>
  );
}