import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `Privacyverklaring van ${site.company} voor de webshop kunststof-gevel.nl.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Privacy"
      title="Privacyverklaring"
      intro="Pouw Online Group B.V. is verantwoordelijke voor de persoonsgegevens van deze webshop."
    >
      <section>
        <h2>Wie we zijn</h2>
        <p className="mt-3">
          {site.company}, {site.address}. KvK {site.kvk}, BTW {site.btw}. Mail {site.email} of bel {site.phone}.
          De showroom is alleen op afspraak.
        </p>
      </section>
      <section>
        <h2>Welke gegevens</h2>
        <ul className="mt-3">
          <li>Contactgegevens die u zelf invult: naam, e-mail, telefoon, adres en plaats.</li>
          <li>Inhoud van een offerte, staalaanvraag, herroeping of bestelling.</li>
          <li>Technische gegevens die de hosting meelogt, zoals IP-adres en tijdstip, om misbruik te beperken.</li>
        </ul>
        <p className="mt-3">
          We vragen geen bijzondere persoonsgegevens. Een bestelling betaalt u bij Shopify. Die betaalgegevens zien wij niet.
        </p>
      </section>
      <section>
        <h2>Waarvoor</h2>
        <ul className="mt-3">
          <li>Uw bestelling, offerte of staalaanvraag afhandelen.</li>
          <li>Leveren, retourneren en klachten.</li>
          <li>De wettelijke administratie, waaronder de fiscale bewaarplicht.</li>
        </ul>
        <p className="mt-3">
          De grondslag is de overeenkomst, een stap die u zelf zet voor een aanvraag, of een wettelijke plicht.
        </p>
      </section>
      <section>
        <h2>Met wie we delen</h2>
        <p className="mt-3">
          Shopify verwerkt de catalogus en de betaling. Als e-mail of ActiveCampaign is ingesteld, gaat een aanvraag naar {site.email} of naar dat systeem. Na toestemming in de cookiebanner kan onze server een gebeurtenis doorsturen naar Google, voor statistiek en advertentiemeting. Zonder die toestemming gebeurt dat niet. We verkopen geen adressen. Verwerkers zitten in de EU of werken met een passende doorgifte.
        </p>
      </section>
      <section>
        <h2>Bewaartermijn</h2>
        <p className="mt-3">
          Offertes en stalen bewaren we zolang de aanvraag loopt en daarna kort voor de administratie, tenzij een langere fiscale termijn geldt. Bestelgegevens volgen de bewaarplicht van zeven jaar.
        </p>
      </section>
      <section>
        <h2>Cookies</h2>
        <p className="mt-3">
          De winkelwagen en een eventueel account staan in uw browser. We laden geen script van Google of een andere meetpartij.
          De keuze incl. of excl. btw bewaren we een jaar in een functionele cookie en in deze browser, zodat de volgende pagina dezelfde prijzen toont. Daar zit geen account of meting in.
        </p>
        <p className="mt-3">
          Kiest u in de cookiebanner voor accepteren, dan zetten we een eigen cookie voor ongeveer negentig dagen. Daarin staat een willekeurig kenmerk van deze browser en, als u via een advertentie binnenkwam, de klikcode uit het adres. Onze server kan daarna een gebeurtenis doorsturen, zoals een geopende configurator, een verstuurde offerte, een staalaanvraag of een bestelling. Bij een aanvraag of bestelling gaat een gehasht e-mailadres of telefoonnummer mee, zodat Google de klik aan de inzending kan koppelen. Weigeren betekent: geen meetcookie en geen doorstuur. Tot u kiest, blijft een klikcode alleen in dit tabblad en gaat die niet naar Google. De site werkt zonder toestemming.
        </p>
      </section>
      <section>
        <h2>Uw rechten</h2>
        <p className="mt-3">
          U kunt inzage, correctie of verwijdering vragen via {site.email}. U kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens. We reageren binnen een maand.
        </p>
      </section>
    </LegalPage>
  );
}
