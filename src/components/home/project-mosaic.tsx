import Link from "next/link";

import { ColorPanel } from "@/components/brand/color-panel";
import { projects, site } from "@/lib/site";

export function ProjectMosaic() {
  const tiles = projects.slice(0, 4);

  return (
    <section className="container-kg section-kg">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="kicker">Projecten · {site.instagramHandle}</p>
          <h2 className="mt-2 font-heading text-[44px] leading-none font-bold uppercase">
            Zo kan uw gevel er straks uitzien
          </h2>
        </div>
        <Link href="/projecten" className="hidden text-[14px] font-medium sm:inline">
          Alle projecten
        </Link>
      </div>
      <div className="mt-8 grid auto-rows-[140px] grid-cols-2 gap-4 sm:auto-rows-[180px] lg:grid-cols-4 lg:auto-rows-[140px]">
        {tiles[0] ? (
          <Link
            href="/projecten"
            className="relative col-span-2 row-span-2 overflow-hidden text-inherit no-underline hover:text-inherit"
          >
            <ColorPanel hex={tiles[0].palette[0]} className="absolute inset-0" />
            <span className="absolute right-4 bottom-4 left-4 bg-white p-3">
              <span className="kicker">Project · {tiles[0].location.split(",")[0]}</span>
              <span className="mt-1 block font-heading text-[16px] font-semibold">
                {tiles[0].profile} · {tiles[0].color}
              </span>
            </span>
          </Link>
        ) : null}
        {tiles.slice(1, 4).map((project) => (
          <Link
            key={project.slug}
            href="/projecten"
            className="relative overflow-hidden text-inherit no-underline hover:text-inherit"
          >
            <ColorPanel hex={project.palette[0]} className="absolute inset-0" />
          </Link>
        ))}
        <a
          href={site.instagram}
          target="_blank"
          rel="noreferrer"
          className="relative flex flex-col justify-end p-5 text-inherit no-underline hover:text-inherit"
          style={{ background: "var(--gradient-ink)" }}
        >
          <p className="font-heading text-[56px] leading-none font-bold text-white">{site.gevelsDelivered}</p>
          <p className="mt-2 text-[14px] text-[var(--kg-blue-300)]">
            gevels geleverd sinds {site.since}
          </p>
          <p className="mt-4 text-[14px] font-medium text-white">Volg ons op Instagram</p>
        </a>
      </div>
    </section>
  );
}
