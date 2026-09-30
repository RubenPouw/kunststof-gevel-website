import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SeoArticle } from "@/components/seo/article";
import { blogPosts, getBlogPost } from "@/data/blog/posts";

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
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    description: post.description,
    inLanguage: "nl-NL",
    mainEntityOfPage: `https://kunststof-gevel.nl/blog/${post.slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="container-kg max-w-3xl pt-12 sm:pt-16">
        <p className="font-mono text-[13px] text-kg-text-2">
          <Link href="/blog" className="no-underline hover:underline">
            Kennis
          </Link>
          {" / "}
          {post.kicker} · {new Date(post.date).toLocaleDateString("nl-NL")}
        </p>
        <h1 className="mt-3 max-w-3xl">{post.title}</h1>
        <p className="mt-4 text-[16px] text-kg-text-2">{post.description}</p>
      </header>
      <SeoArticle sections={post.sections} faqs={post.faqs} links={post.links} />
    </article>
  );
}
