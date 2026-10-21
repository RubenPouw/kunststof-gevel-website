import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DirectionFigures, MeasureFigures } from "@/components/kozijnen/figures";
import { JsonLd } from "@/components/seo/json-ld";
import { articles, getArticle } from "@/lib/kozijnen/kennis";
import { howToJsonLd } from "@/lib/kozijnen/schema";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/schema";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Kennisbank" };
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/kunststof-kozijnen/kennisbank/${article.slug}` },
  };
}

export default async function KennisArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const path = `/kunststof-kozijnen/kennisbank/${article.slug}`;

  return (
    <article>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Kunststof kozijnen", path: "/kunststof-kozijnen" },
          { name: "Kennisbank", path: "/kunststof-kozijnen/kennisbank" },
          { name: article.title, path },
        ])}
      />
      <JsonLd data={faqJsonLd(article.faqs)} />
      {article.howTo ? (
        <JsonLd
          data={howToJsonLd({
            name: article.title,
            description: article.description,
            path,
            steps: article.howTo,
          })}
        />
      ) : null}
      <header className="container-kg max-w-3xl pt-12">
        <p className="font-mono text-[13px] text-kg-text-2">
          <Link href="/kunststof-kozijnen/kennisbank" className="underline underline-offset-[3px]">
            Kennisbank
          </Link>
          {` / ${article.kicker}`}
        </p>
        <h1 className="mt-3 max-w-3xl">{article.title}</h1>
        <p className="mt-4 text-[16px] leading-normal text-kg-text-2">{article.description}</p>
      </header>
      <div className="container-kg max-w-3xl space-y-8 py-10">
        {article.slug === "hoe-moet-je-meten" ? <MeasureFigures /> : null}
        {article.slug === "draairichting-en-aanslag" ? <DirectionFigures /> : null}
        {article.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-[22px] font-bold tracking-[-0.03em]">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-[16px] leading-normal text-kg-text-2">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        {article.slug === "hoe-moet-je-meten" ? (
          <p>
            <Link href="/kunststof-kozijnen/kennisbank/hoe-moet-je-meten/formulier">Meetformulier, printen of PDF</Link>
          </p>
        ) : null}
        {article.faqs.length ? (
          <section>
            <h2 className="text-[22px] font-bold tracking-[-0.03em]">Vragen</h2>
            <dl className="mt-4 space-y-4">
              {article.faqs.map((faq) => (
                <div key={faq.q}>
                  <dt className="font-medium">{faq.q}</dt>
                  <dd className="mt-1 text-[15px] leading-normal text-kg-text-2">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[15px]">
          {article.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
