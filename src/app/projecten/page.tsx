import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ProjectQuoteDock } from "@/components/projects/project-quote-dock";
import { ProjectQuoteForm } from "@/components/projects/project-quote-form";
import { buttonVariants } from "@/components/ui/button";
import { projectBrands, projects, type Project, type ProjectBrand } from "@/data/projects";
import { cleanProjectQuoteReference } from "@/lib/project-quote";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const BRANDS = new Set<ProjectBrand>(projectBrands.map((brand) => brand.slug));

type Props = {
  searchParams: Promise<{ merk?: string; verzonden?: string; ref?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { merk, verzonden } = await searchParams;
  const filtered = Boolean(merk && BRANDS.has(merk as ProjectBrand));
  const sent = verzonden === "1";
  return {
    title: "Projecten van Cavemen",
    description:
      "Projecten van Cavemen in Keralit, VinyPlus en Kerrafront. Het resultaat van een kunststof gevel voor en na, in houtlook en antraciet.",
    alternates: { canonical: "/projecten" },
    ...(filtered || sent ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProjectenPage({ searchParams }: Props) {
  const { merk, verzonden, ref } = await searchParams;
  const active = merk && BRANDS.has(merk as ProjectBrand) ? (merk as ProjectBrand) : null;
  const list = active ? projects.filter((project) => project.brandSlug === active) : projects;
  const sent = verzonden === "1";
  const reference = sent ? cleanProjectQuoteReference(ref) : "";
  const [first, ...rest] = list;

  return (
    <div className="container-kg pt-8 pb-24 sm:pt-16 sm:pb-32 lg:pt-20 lg:pb-40">
      <header className="max-w-2xl">
        <p className="font-mono text-[13px] text-kg-text-2">Projecten</p>
        <h1 className="mt-4 text-[34px] leading-[1.05] font-medium tracking-[-0.04em] sm:text-[44px]">
          Projecten van Cavemen
        </h1>
        <p className="mt-4 max-w-lg text-[16px] leading-normal text-kg-text-2 sm:text-[17px] sm:leading-[1.6]">
          Gevels, plafonds en overstekken in Keralit, VinyPlus en Kerrafront. Paneel en kleur op het huis. Zoekt u een
          kunststof gevel voor en na, dan is dit het na.
        </p>
        <p className="mt-6">
          <a href="#offerte" className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
            {sent ? "Aanvraag ontvangen" : "Vraag een offerte aan"}
          </a>
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

      <div className="mt-10 flex flex-col gap-12 sm:mt-14 sm:gap-16">
        {first ? (
          <ul>
            <ProjectRow project={first} index={0} priority />
          </ul>
        ) : null}
        <ProjectQuoteForm sent={sent} reference={reference} merk={active ?? ""} />
        {rest.length ? (
          <ul className="flex flex-col gap-12 sm:gap-16">
            {rest.map((project, index) => (
              <ProjectRow key={project.slug} project={project} index={index + 1} />
            ))}
          </ul>
        ) : null}
      </div>

      <p className="mt-24 font-mono text-[13px] text-kg-text-2 sm:mt-32">
        <a href={`${site.instagram}/`} className="text-kg-text-2 no-underline hover:text-kg-navy hover:underline">
          Volg ons op Instagram
        </a>
      </p>
      <ProjectQuoteDock sent={sent} />
    </div>
  );
}

function ProjectRow({ project, index, priority = false }: { project: Project; index: number; priority?: boolean }) {
  const photo = project.photos[0];
  const flipped = index % 2 === 1;
  return (
    <li
      className={cn(
        "grid items-center gap-5 lg:gap-12",
        flipped ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]" : "lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]",
      )}
    >
      <Link
        href={`/projecten/${project.slug}`}
        className={cn("block max-w-[420px] no-underline hover:no-underline", flipped && "lg:order-2 lg:justify-self-end")}
      >
        <span className="relative block aspect-[4/3] overflow-hidden rounded-[10px] bg-kg-kalk">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 420px, 100vw"
            className="object-cover"
            style={{ objectPosition: photo.position ?? "center" }}
          />
        </span>
      </Link>
      <div className="max-w-xl">
        <h2 className="text-[22px] leading-snug font-medium tracking-[-0.03em] sm:text-[26px]">
          <Link href={`/projecten/${project.slug}`} className="text-inherit no-underline hover:underline">
            {project.rowTitle}
          </Link>
        </h2>
        <p className="mt-3 text-[16px] leading-[1.6] text-kg-text-2">{project.rowText}</p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[13px] text-kg-text-2">
          {project.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        <p className="mt-4">
          <Link href={project.article.href} className="text-[15px] text-kg-navy">
            {project.article.label}
          </Link>
        </p>
      </div>
    </li>
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
