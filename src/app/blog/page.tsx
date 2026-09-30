import type { Metadata } from "next";
import Link from "next/link";

import { blogPosts } from "@/data/blog/posts";

export const metadata: Metadata = {
  title: "Kennis",
  description:
    "Prijzen, merken, montage en kleurstalen voor kunststof gevelbekleding. Uitleg van kunststof-gevel.nl.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <div className="container-kg max-w-3xl py-12 sm:py-16">
      <p className="font-mono text-[13px] text-kg-text-2">Kennis</p>
      <h1 className="mt-2">Voor u de gevel bestelt</h1>
      <p className="mt-4 text-[16px] text-kg-text-2">
        Prijzen, het verschil tussen de merken, montage en stalen. Kort, zodat u daarna kunt rekenen of aanvragen.
      </p>
      <ul className="mt-10 divide-y divide-kg-lijn border-y border-kg-lijn">
        {blogPosts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="block py-5 text-inherit no-underline hover:no-underline">
              <p className="font-mono text-[13px] text-kg-text-2">
                {post.kicker} · {new Date(post.date).toLocaleDateString("nl-NL")}
              </p>
              <h2 className="mt-1 text-[22px] font-bold tracking-[-0.03em]">{post.title}</h2>
              <p className="mt-2 text-[15px] text-kg-text-2">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
