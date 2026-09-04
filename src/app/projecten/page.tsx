import type { Metadata } from "next";

import { ProductVisual, visualVariantFor } from "@/components/brand/product-visual";
import { projects } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projecten",
  description:
    "Recent opgeleverde gevels: villa’s, aanbouwen, renovatie en recreatiewoningen in heel Nederland.",
};

export default function ProjectenPage() {
  return (
    <div className="container-kg py-12 sm:py-16">
      <p className="kicker">Projecten</p>
      <h1 className="mt-2 max-w-3xl">Gevels die we zelf hebben gezet.</h1>
      <p className="mt-4 max-w-2xl text-[var(--color-text-soft)]">
        Elke gevel is anders: ondergrond, windbelasting, dakoverstek. Hier vier
        recente opleveringen, van een villa tot een chalet.
      </p>

      <div className="mt-12 grid gap-8">
        {projects.map((project) => (
          <article
            key={project.slug}
            className="border border-[var(--color-border)] bg-surface lg:grid lg:grid-cols-2"
          >
            <ProductVisual
              palette={project.palette}
              variant={visualVariantFor(project.profile)}
              className="min-h-[16rem] lg:min-h-[22rem]"
            />
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="text-[13px] tracking-wide text-[var(--color-text-muted)] uppercase">
                {project.year} · {project.location}
              </p>
              <h2 className="mt-2">{project.title}</h2>
              <p className="mt-3 text-[var(--color-text-muted)]">{project.summary}</p>
              <dl className="mt-6 grid grid-cols-3 gap-3 text-[14px]">
                <div>
                  <dt className="text-[var(--color-text-muted)]">Profiel</dt>
                  <dd className="font-semibold">{project.profile}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Kleur</dt>
                  <dd className="font-semibold">{project.color}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Oppervlak</dt>
                  <dd className="font-semibold">{project.area}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
