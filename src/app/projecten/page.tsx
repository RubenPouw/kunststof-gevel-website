import type { Metadata } from "next";
import Link from "next/link";

import { ProjectFigure } from "@/components/projects/project-figure";
import { projectBrands, projects, type ProjectBrand } from "@/data/projects";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const BRANDS = new Set<ProjectBrand>(projectBrands.map((brand) => brand.slug));

type Props = {
  searchParams: Promise<{ merk?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { merk } = await searchParams;
  const filtered = Boolean(merk && BRANDS.has(merk as ProjectBrand));
  return {
    title: "Gevelbekleding projecten",
    description:
      "Gevelbekleding projecten in Keralit, VinyPlus en Kerrafront. Het resultaat van een kunststof gevel voor en na, in houtlook en antraciet.",
    alternates: { canonical: "/projecten" },
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProjectenPage({ searchParams }: Props) {
  const { merk } = await searchParams;
  const active = merk && BRANDS.has(merk as ProjectBrand) ? (merk as ProjectBrand) : null;
  const list = active ? projects.filter((project) => project.brandSlug === active) : projects;

  return (
    <div className="container-kg pt-8 pb-24 sm:pt-16 sm:pb-32 lg:pt-20 lg:pb-40">
      <header className="max-w-2xl">
        <p className="font-mono text-[13px] text-kg-text-2">Projecten</p>
        <h1 className="mt-4 text-[34px] leading-[1.05] font-medium tracking-[-0.04em] sm:text-[44px]">
          Gevelbekleding projecten
        </h1>
        <p className="mt-4 max-w-lg text-[16px] leading-normal text-kg-text-2 sm:text-[17px] sm:leading-[1.6]">
          Eigen werk in Keralit, VinyPlus en Kerrafront: paneel en kleur op de gevel, het plafond of het overstek. Zoekt u
          een kunststof gevel voor en na, dan is dit het na.
        </p>
        <nav aria-label="Filter op merk" className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <FilterLink href="/projecten" current={!active}>
            Alle
          </FilterLink>
          {projectBrands.map((brand) => (
            <FilterLink key={brand.slug} href={`/projecten?merk=${brand.slug}`} current={active === brand.slug}>
              {brand.label}
            </FilterLink>
          ))}
        </nav>
      </header>

      <ul className="mt-6 flex flex-col gap-20 sm:mt-14 sm:gap-28 lg:gap-36">
        {list.map((project, index) => (
          <li key={project.slug}>
            <Link
              href={`/projecten/${project.slug}`}
              className="group block text-inherit no-underline hover:no-underline"
            >
              <ProjectFigure
                photo={project.photos[0]}
                priority={index === 0}
                sizes="(min-width: 1024px) 1248px, 100vw"
                imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              />
              <div className="mt-6 max-w-xl sm:mt-8">
                <h2 className="text-[22px] leading-snug font-medium tracking-[-0.03em] sm:text-[26px]">
                  {project.title}
                </h2>
                <p className="mt-2 font-mono text-[13px] text-kg-text-2">
                  {project.brand} · {project.color}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-24 font-mono text-[13px] text-kg-text-2 sm:mt-32">
        <a href={`${site.instagram}/`} className="text-kg-text-2 no-underline hover:text-kg-navy hover:underline">
          Volg ons op Instagram
        </a>
      </p>
    </div>
  );
}

function FilterLink({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "true" : undefined}
      className={cn(
        "text-[15px] no-underline hover:text-kg-navy hover:no-underline",
        current ? "text-kg-navy underline decoration-kg-navy underline-offset-8" : "text-kg-text-2",
      )}
    >
      {children}
    </Link>
  );
}
