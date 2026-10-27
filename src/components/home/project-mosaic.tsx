import Image from "next/image";
import Link from "next/link";

import { SectionHead } from "@/components/brand/section-head";
import { projects } from "@/data/projects";

const featured = ["kerrafront-chalet", "vinyplus-quattro-uitbouw", "keralit-190mm-gevel-renovatie"];

export function ProjectMosaic() {
  const tiles = featured
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project) => project !== undefined);

  return (
    <section className="container-kg section-kg">
      <SectionHead
        title="Projecten"
        aside={
          <Link href="/projecten" className="no-underline hover:underline">
            Alles bekijken
          </Link>
        }
      />
      <div className="grid gap-12 sm:grid-cols-3 sm:gap-8 lg:gap-10">
        {tiles.map((project, index) => (
          <Link
            key={project.slug}
            href={`/projecten/${project.slug}`}
            className="group text-inherit no-underline hover:no-underline"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-kg-kalk bevel-16">
              <Image
                src={project.photos[0].src}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, 100vw"
                priority={index === 0}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                style={{ objectPosition: project.photos[0].position ?? "center" }}
              />
            </div>
            <p className="mt-4 text-[16px] leading-snug font-medium tracking-[-0.02em]">{project.title}</p>
            <p className="mt-1 font-mono text-[13px] text-kg-text-2">
              {project.brand} · {project.color}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
