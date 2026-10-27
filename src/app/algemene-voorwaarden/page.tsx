import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description: `Algemene voorwaarden van ${site.company} voor consumenten en zakelijke klanten.`,
  alternates: { canonical: "/algemene-voorwaarden" },
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Voorwaarden"
      title="Algemene voorwaarden"
      intro="Deze tekst geldt voor bestellingen via kunststof-gevel.nl, naast het herroepingsrecht voor consumenten."
    >
      <section>
        <h2>1. Wie</h2>
        <p className="mt-3">
          {site.company}, {site.address}, KvK {site.kvk}, BTW {site.btw}. Contact: {site.email}, {site.phone}.
        </p>
      </section>
      <section>
        <h2>2. Aanbod en prijzen</h2>
        <p className="mt-3">
          Prijzen op de site staan exclusief btw, tenzij anders vermeld. Het bedrag in de Shopify-checkout is het bedrag dat u betaalt, inclusief btw en de verzendkosten die daar staan. Een artikel met prijs op aanvraag is geen aanbod en kan niet in de winkelwagen.
        </p>
        <p className="mt-3">
          Een kennelijke vergissing, zoals een prijs van € 0,00, bindt ons niet. We laten het u weten en u kunt de bestelling dan kosteloos laten vervallen.
        </p>
      </section>
      <section id="betaling">
        <h2>3. Bestellen en betalen</h2>
        <p className="mt-3">
          Een bestelling komt tot stand als Shopify de betaling bevestigt. Tot dat moment is er geen koop. Betalen doet u in de checkout van Shopify, met de methoden die daar op dat moment aan staan. We zetten geen logo van een betaalmethode op de site zolang die methode niet in de checkout staat.
        </p>
      </section>
      <section>
        <h2>4. Levering</h2>
        <p className="mt-3">
          Levertijden zijn een indicatie, geen fatale termijn, tenzij we een datum schriftelijk vastleggen. Zie ook{" "}
          <Link href="/verzenden-retour">verzenden en retour</Link>.
        </p>
      </section>
      <section>
        <h2>5. Montage</h2>
        <p className="mt-3">
          Montage zit niet in de materiaalprijs. Een montage-opdracht is een aparte offerte. Zelf monteren doet u volgens het voorschrift van het merk. Garantie vervalt bij een montage die dat voorschrift negeert.
        </p>
      </section>
      <section>
        <h2>6. Eigendom</h2>
        <p className="mt-3">De goederen blijven van ons tot de betaling volledig binnen is.</p>
      </section>
      <section>
        <h2>7. Garantie en gebreken</h2>
        <p className="mt-3">
          Fabrieksgarantie, vaak 10 jaar op kleur en vorm, geldt naast uw wettelijke rechten. Een consument houdt de rechten uit de wet als een product niet deugt. Meld een gebrek binnen een redelijke termijn via {site.email}.
        </p>
      </section>
      <section>
        <h2>8. Aansprakelijkheid</h2>
        <p className="mt-3">
          Voor consumenten beperken we niets wat de wet niet toestaat. Voor zakelijke klanten is de aansprakelijkheid beperkt tot het factuurbedrag van de betreffende order, behalve bij opzet of bewuste roekeloosheid.
        </p>
      </section>
      <section>
        <h2>9. Klachten en recht</h2>
        <p className="mt-3">
          De <Link href="/klachtenprocedure">klachtenprocedure</Link> beschrijft de stappen. Op de overeenkomst is Nederlands recht van toepassing. Een consument mag ook naar de rechter van zijn woonplaats.
        </p>
      </section>
    </LegalPage>
  );
}
