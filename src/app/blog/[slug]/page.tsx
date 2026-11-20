import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Bevel } from "@/components/brand/section-head";
import { SeoArticle } from "@/components/seo/article";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { blogPosts, getBlogPost, type BlogPost } from "@/data/blog/posts";
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/schema";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Kennis" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `/blog/${post.slug}`,
      ...(post.image ? { images: [{ url: post.image.src, alt: post.image.alt }] } : {}),
    },
  };
}

function PostCta({ cta }: { cta: NonNullable<BlogPost["cta"]> }) {
  return (
    <section className="container-kg max-w-3xl pb-16">
      <div className="border border-kg-lijn bg-kg-kalk px-6 py-8 sm:px-8">
        <h2 className="text-[22px] font-bold tracking-[-0.03em]">{cta.heading}</h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-[1.5] text-kg-text-2">{cta.text}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {cta.actions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                buttonVariants({ variant: index === cta.actions.length - 1 ? "primary" : "secondary" }),
                "no-underline hover:no-underline",
              )}
            >
              {action.label}
            </Link>
          ))}
        </div>
        {cta.more ? (
          <p className="mt-4 text-[15px]">
            <Link href={cta.more.href}>{cta.more.label}</Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const heading = post.h1 ?? post.title;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: heading,
    datePublished: post.date,
    dateModified: post.date,
    description: post.description,
    inLanguage: "nl-NL",
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    author: { "@type": "Organization", name: site.name, url: `${site.origin}/` },
    publisher: { "@id": `${site.origin}/#organization` },
    ...(post.image ? { image: absoluteUrl(post.image.src) } : {}),
  };

  return (
    <article>
      <JsonLd data={jsonLd} />
      <JsonLd data={faqJsonLd(post.faqs)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Kennis", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <header className="container-kg max-w-3xl pt-12 sm:pt-16">
        <p className="font-mono text-[13px] text-kg-text-2">
          <Link href="/blog" className="no-underline hover:underline">
            Kennis
          </Link>
          {" / "}
          {post.kicker} · {new Date(post.date).toLocaleDateString("nl-NL")}
        </p>
        <h1 className="mt-3 max-w-3xl">{heading}</h1>
        <p className="mt-4 text-[16px] text-kg-text-2">{post.description}</p>
        {post.image ? (
          <Bevel size={24} className="relative mt-8 aspect-[3/2] bg-kg-kalk">
            <Image
              src={post.image.src}
              alt={post.image.alt}
              fill
              priority
              unoptimized
              sizes="(min-width: 768px) 48rem, 100vw"
              className="object-cover"
            />
          </Bevel>
        ) : null}
      </header>
      <SeoArticle
        intro={post.intro}
        sections={post.sections}
        faqs={post.faqs}
        links={post.cta ? [] : post.links}
        faqSchema={false}
      />
      {post.cta ? <PostCta cta={post.cta} /> : null}
    </article>
  );
}
