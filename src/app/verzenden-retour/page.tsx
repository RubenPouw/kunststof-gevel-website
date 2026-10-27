import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/prose";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Verzenden en retour",
  description: "Verzending binnen Nederland en retour van ongeopende standaardlengtes.",
  alternates: { canonical: "/verzenden-retour" },
};

export default function ShippingPage() {
  return (
    <LegalPage
      kicker="Bezorging"
      title="Verzenden en retour"
      intro="De checkout van Shopify bepaalt de definitieve verzendkosten. Hier staat hoe we leveren en wanneer u kunt terugsturen."
    >
      <section>
        <h2>Verzenden</h2>
        <p className="mt-3">
          We leveren in Nederland. Onder {formatPrice(site.freeShippingFrom)} rekenen we in de winkelwagen {formatPrice(49)} verzending als indicatie. Daarboven is de indicatie gratis. Het bedrag in de Shopify-checkout is leidend, omdat de vervoerder en het gewicht daar worden bepaald.
        </p>
        <p className="mt-3">
          Lange panelen gaan mee met een lengtetransport. Een levertijd op de site is geen belofte van een vaste week. We bevestigen de levertijd na de bestelling.
        </p>
      </section>
      <section>
        <h2>Showroom</h2>
        <p className="mt-3">
          Afhalen kan alleen op afspraak aan de {site.address}. Kom niet onaangekondigd langs. De showroom is geen magazijnbalie.
        </p>
      </section>
      <section>
        <h2>Retour</h2>
        <p className="mt-3">
          Consumenten kunnen ongebruikte standaardartikelen binnen 14 dagen herroepen. Zie het{" "}
          <Link href="/herroepingsrecht">herroepingsrecht</Link>. Panelen op maat, gezaagde lengtes en duidelijk op bestelling gemaakte artikelen nemen we niet retour.
        </p>
        <p className="mt-3">
          Meld de retour eerst via {site.email} of {site.phone}. We geven dan het retouradres. Lever geen pallets af op het showroomadres zonder afspraak. De kosten van de terugzending zijn voor u als u de koop herroept zonder gebrek.
        </p>
        <p className="mt-3">
          Is het artikel beschadigd of wijkt het af, dan lost u het op via de <Link href="/klachtenprocedure">klachtenprocedure</Link>. Die retour is voor ons.
        </p>
      </section>
      <section>
        <h2>Ophalen met een vrachtwagen</h2>
        <p className="mt-3">
          Lange panelen gaan mee met lengtetransport. Vraagt u ons om een herroepen zending op te halen, dan rekenen we de rit door: € 85 excl. btw voor de retourvracht. Zelf terugsturen mag ook, op uw kosten, droog en in de originele verpakking.
        </p>
        <p className="mt-3">
          Een waardevermindering verrekenen we als het artikel is gebruikt, gezaagd of de verpakking open is. Dat is geen vast percentage. Maatwerk, gezaagde lengtes en artikelen die u onlosmakelijk heeft verwerkt, vallen buiten het herroepingsrecht.
        </p>
      </section>
    </LegalPage>
  );
}
