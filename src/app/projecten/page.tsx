import type { Metadata } from "next";
import Image from "next/image";

import { projects } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projecten",
  description:
    "Recent opgeleverde gevels: villa’s, aanbouwen, renovatie en recreatiewoningen in heel Nederland.",
};

export default function ProjectenPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
        Projecten
      </p>
      <h1 className="mt-2 max-w-3xl text-4xl sm:text-6xl">
        Gevels die we zelf hebben gezet.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Elke gevel is anders: ondergrond, windbelasting, dakoverstek. Hier vier
        recente opleveringen, van een villa tot een chalet.
      </p>

      {projects.length === 0 ? (
        <p className="mt-12 rounded-2xl bg-card px-6 py-12 text-center text-muted-foreground ring-1 ring-foreground/10">
          Nog geen projecten om te tonen.
        </p>
      ) : (
        <div className="mt-12 grid gap-8">
          {projects.map((project) => (
            <article
              key={project.slug}
              className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 lg:grid lg:grid-cols-2"
            >
              <div className="relative aspect-[16/11] lg:aspect-auto lg:min-h-[22rem]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {project.year} · {project.location}
                </p>
                <h2 className="mt-2 text-3xl">{project.title}</h2>
                <p className="mt-3 text-muted-foreground">{project.summary}</p>
                <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Profiel</dt>
                    <dd className="font-medium">{project.profile}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Kleur</dt>
                    <dd className="font-medium">{project.color}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Oppervlak</dt>
                    <dd className="font-medium">{project.area}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
