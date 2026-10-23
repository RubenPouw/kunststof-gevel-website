import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectFigure } from "@/components/projects/project-figure";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { getProject, projects } from "@/data/projects";
import { getCatalog } from "@/lib/catalog";
import { findProjectProduct, projectStaalHref } from "@/lib/projects";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo/schema";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Projecten" };
  const description = project.paragraphs[0];
  return {
    title: project.title,
    description,
    alternates: { canonical: `/projecten/${project.slug}` },
    openGraph: {
      title: project.title,
      description,
      type: "article",
      url: `/projecten/${project.slug}`,
      images: [{ url: project.photos[0].src, alt: project.photos[0].alt }],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const catalog = await getCatalog();
  const product = findProjectProduct(catalog.products, project.product);
  const staalHref = projectStaalHref(product);
  const [cover, ...rest] = project.photos;
  const dateLabel = new Date(project.date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    datePublished: project.date,
    dateModified: project.date,
    description: project.paragraphs[0],
    inLanguage: "nl-NL",
    image: project.photos.map((photo) => ({
      "@type": "ImageObject",
      contentUrl: absoluteUrl(photo.src),
      caption: photo.alt,
    })),
    mainEntityOfPage: absoluteUrl(`/projecten/${project.slug}`),
    author: { "@type": "Organization", name: site.name, url: `${site.origin}/` },
    publisher: { "@id": `${site.origin}/#organization` },
    about: { "@type": "Brand", name: project.brand },
  };

  return (
    <article className="pb-24 sm:pb-32">
      <JsonLd data={jsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Projecten", path: "/projecten" },
          { name: project.title, path: `/projecten/${project.slug}` },
        ])}
      />

      <div className="container-kg pt-10 sm:pt-14 lg:pt-16">
        <nav aria-label="Kruimelpad" className="font-mono text-[13px] text-kg-text-2">
          <Link href="/" className="no-underline hover:underline">
            Home
          </Link>
          {" / "}
          <Link href="/projecten" className="no-underline hover:underline">
            Projecten
          </Link>
          {" / "}
          <span>{project.brand}</span>
        </nav>

        <div className="mt-8 lg:mt-10">
          <ProjectFigure photo={cover} priority sizes="(min-width: 1024px) 1248px, 100vw" />
        </div>

        <header className="mt-10 max-w-2xl lg:mt-14">
          <p className="font-mono text-[13px] text-kg-text-2">
            {project.brand} · {project.color}
          </p>
          <h1 className="mt-3 max-w-[16ch] text-[34px] leading-[1.05] font-medium tracking-[-0.04em] sm:text-[48px]">
            {project.title}
          </h1>
          <p className="mt-5 text-[17px] leading-[1.7] text-kg-text-2">{project.card}</p>
          <p className="mt-6 font-mono text-[13px] text-kg-text-2">{dateLabel}</p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link href={staalHref} className={cn(buttonVariants({ variant: "primary" }), "no-underline hover:no-underline")}>
              Gratis staalaanvraag
            </Link>
            <Link href="/offerte" className={cn(buttonVariants({ variant: "secondary" }), "no-underline hover:no-underline")}>
              Vraag een offerte aan
            </Link>
          </div>
        </header>

        <div className="mt-14 max-w-2xl space-y-6 text-[17px] leading-[1.75] lg:mt-16">
          {project.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <p className="pt-2 text-[15px]">
            <Link href="/gevelbekleding">Gevelbekleding</Link>
            {" · "}
            <Link href={`/merken/${project.brandSlug}`}>{project.brand}</Link>
            {product ? (
              <>
                {" · "}
                <Link href={`/producten/${product.slug}`}>{product.name}</Link>
              </>
            ) : null}
          </p>
        </div>

        {rest.length ? (
          <div className="mt-16 flex flex-col gap-16 lg:mt-24 lg:gap-20">
            {rest.map((photo) => (
              <ProjectFigure key={photo.src} photo={photo} sizes="(min-width: 1024px) 1248px, 100vw" />
            ))}
          </div>
        ) : null}

        <p className="mt-20 font-mono text-[13px] text-kg-text-2 lg:mt-28">
          <a href={`${site.instagram}/`} className="text-kg-text-2 no-underline hover:text-kg-navy hover:underline">
            Volg ons op Instagram
          </a>
        </p>
      </div>
    </article>
  );
}
