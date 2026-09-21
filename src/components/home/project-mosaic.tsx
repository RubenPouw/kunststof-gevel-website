import Link from "next/link";

import { Bevel, SectionHead } from "@/components/brand/section-head";
import { projects, site } from "@/lib/site";

export function ProjectMosaic() {
  const tiles = projects.slice(0, 4);

  return (
    <section className="container-kg section-kg">
      <SectionHead title="Handen, profiel, resultaat" aside={site.instagramHandle} />
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-12 lg:grid-rows-[260px_260px]">
        {tiles[0] ? (
          <Link
            href="/projecten"
            className="relative col-span-2 min-h-[220px] overflow-hidden text-inherit no-underline hover:no-underline lg:col-span-6 lg:row-span-2 lg:min-h-0"
          >
            <Bevel size={16} className="absolute inset-0" style={{ background: tiles[0].palette[0] }} />
            <span className="absolute bottom-0 left-0 bg-kg-kalk px-3 py-2 font-mono text-[13px] text-kg-navy">
              {tiles[0].profile} · {tiles[0].color} · {tiles[0].location.split(",")[0]}
            </span>
          </Link>
        ) : null}
        {tiles.slice(1, 4).map((project) => (
          <Link
            key={project.slug}
            href="/projecten"
            className="relative min-h-[140px] overflow-hidden no-underline hover:no-underline lg:col-span-3 lg:min-h-0"
          >
            <Bevel size={16} className="absolute inset-0" style={{ background: project.palette[0] }} />
          </Link>
        ))}
        <div className="col-span-2 flex flex-col justify-end bg-kg-navy p-6 text-kg-kalk lg:col-span-3">
          <p className="text-[56px] leading-none font-bold tracking-[-0.05em]">
            {site.gevelsDelivered.replace("+", "")}
            <span className="text-kg-signal">+</span>
          </p>
          <p className="mt-3 font-mono text-[13px] text-kg-grind">gevels geleverd sinds {site.since}</p>
          <p className="mt-2 font-mono text-[13px] text-kg-grind">Bouwen verandert niet. Inkopen wel.</p>
        </div>
      </div>
    </section>
  );
}
