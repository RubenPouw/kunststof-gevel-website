import type { Metadata } from "next";

import { WithdrawalForm } from "@/app/herroepingsrecht/form";
import { LegalPage } from "@/components/legal/prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Herroepingsrecht",
  description: "Bedenktijd van 14 dagen voor consumenten, met het modelformulier voor herroeping.",
  alternates: { canonical: "/herroepingsrecht" },
};

export default function WithdrawalPage() {
  return (
    <LegalPage
      kicker="Bedenktijd"
      title="Herroepingsrecht"
      intro="Consumenten kunnen een koop op afstand binnen 14 dagen herroepen, met de uitzonderingen die de wet noemt voor bouwmaterialen op maat."
    >
      <section>
        <h2>Termijn</h2>
        <p className="mt-3">
          U hebt 14 dagen bedenktijd na de dag waarop u de goederen ontvangt. In die termijn laat u ons weten dat u de overeenkomst herroept. U hoeft geen reden te geven.
        </p>
      </section>
      <section>
        <h2>Uitzonderingen</h2>
        <p className="mt-3">
          Het herroepingsrecht geldt niet voor goederen die duidelijk voor u zijn gemaakt, of die op maat zijn gezaagd. Panelen die wij of u op een afwijkende lengte hebben afgekort, kunt u niet terugsturen. Dat volgt uit artikel 6:230p van het Burgerlijk Wetboek. Standaard lengtes die ongeopend en onbeschadigd zijn, vallen wel onder de bedenktijd.
        </p>
      </section>
      <section>
        <h2>Terugsturen en terugbetalen</h2>
        <p className="mt-3">
          Stuur de goederen binnen 14 dagen na uw herroeping terug. De kosten van de retourzending zijn voor u, omdat we dat hier voor het sluiten van de koop vermelden. We betalen het aankoopbedrag inclusief de standaard heenzending terug binnen 14 dagen nadat we de herroeping hebben ontvangen. We mogen wachten tot we de goederen terug hebben, of tot u heeft aangetoond dat u ze heeft teruggestuurd.
        </p>
      </section>
      <section>
        <h2>Modelformulier voor herroeping</h2>
        <p className="mt-3">
          Dit formulier alleen invullen en terugzenden als u de overeenkomst wilt herroepen. U kunt het ook mailen of op papier sturen.
        </p>
        <div className="mt-4 border border-kg-lijn bg-white p-5 text-kg-navy">
          <p>Aan {site.company}, {site.address}, {site.email}.</p>
          <p className="mt-3">
            Ik deel u hierbij mede dat ik onze overeenkomst betreffende de verkoop van de volgende goederen herroep.
          </p>
          <ul className="mt-3">
            <li>Besteld op, en ontvangen op.</li>
            <li>Naam van de consument.</li>
            <li>Adres van de consument.</li>
            <li>Datum.</li>
          </ul>
          <p className="mt-3">Handtekening van de consument, alleen wanneer dit formulier op papier wordt ingediend.</p>
        </div>
        <WithdrawalForm />
      </section>
    </LegalPage>
  );
}
