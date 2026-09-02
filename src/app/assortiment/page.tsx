import type { Metadata } from "next";

import { ProfileSample } from "@/components/profile-sample";
import { colors, profiles } from "@/lib/site";

export const metadata: Metadata = {
  title: "Assortiment",
  description:
    "Rabat, sponningdeel, potdeksel en Zweeds rabat. Houtlook en unikleuren, inclusief hoek- en startprofielen.",
};

export default function AssortimentPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
        Assortiment
      </p>
      <h1 className="mt-2 max-w-3xl text-4xl sm:text-6xl">
        Profielen die water keren en eruitzien als hout.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Elk systeem bestaat uit geveldelen, start- en eindprofielen, binnen- en
        buitenhoeken en ventilatielatten. Wij leveren complete pakketten, geen
        losse planken zonder bevestiging.
      </p>

      <div className="mt-12 grid gap-8">
        {profiles.map((profile) => (
          <article
            key={profile.slug}
            id={profile.slug}
            className="grid items-center gap-6 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 md:grid-cols-[minmax(0,18rem)_1fr] md:p-8"
          >
            <ProfileSample variant={profile.slug} className="h-52 md:h-64" />
            <div>
              <h2 className="text-3xl">{profile.name}</h2>
              <p className="mt-3 text-muted-foreground">{profile.detail}</p>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Toepassing</dt>
                  <dd className="font-medium">{profile.use}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Materiaal vanaf</dt>
                  <dd className="font-medium">€{profile.priceFrom} per m²</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="text-3xl sm:text-4xl">Kleuren uit voorraad</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Houtlook heeft nerf. Unikleuren zijn strak. We sturen graag een
          kleurstaal mee; schermkleuren wijken altijd af van de gevel in
          daglicht.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {colors.map((color) => (
            <div key={color.name} className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
              <div className="h-20" style={{ background: color.hex }} />
              <p className="bg-card px-3 py-2 text-sm">{color.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
