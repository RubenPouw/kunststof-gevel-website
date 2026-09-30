import Link from "next/link";

import { blogPosts } from "@/data/blog/posts";

export function HomeGuides() {
  const posts = blogPosts.slice(0, 3);
  return (
    <section className="container-kg py-14">
      <p className="font-mono text-[13px] text-kg-text-2">Kennis</p>
      <h2 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">Voor u bestelt</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="border border-kg-lijn bg-white p-5 text-inherit no-underline hover:bg-kg-kalk hover:no-underline"
          >
            <p className="font-mono text-[13px] text-kg-text-2">{post.kicker}</p>
            <h3 className="mt-2 text-[17px] font-medium">{post.title}</h3>
            <p className="mt-2 text-[14px] leading-[1.5] text-kg-text-2">{post.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
