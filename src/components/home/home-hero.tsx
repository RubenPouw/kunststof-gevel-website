import Link from "next/link";

import { Bevel } from "@/components/brand/section-head";
import { buttonVariants } from "@/components/ui/button";
import { hero } from "@/lib/site";
import { weekNow } from "@/lib/week";
import { cn } from "@/lib/utils";

export function HomeHero() {
  const week = weekNow();

  return (
    <section className="container-kg pt-10 pb-4 lg:pt-14">
      <div className="grid items-end gap-5 lg:grid-cols-[7fr_5fr]">
        <div>
          <h1 className="display-home text-balance">
            {hero.title}
            <br />
            {hero.subtitle}
          </h1>
          <p className="mt-5 max-w-[560px] text-[17px] text-kg-text-2">{hero.body}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/gevelbekleding" className={cn(buttonVariants({ variant: "primary" }))}>
              {hero.cta}
            </Link>
            <a href="#stalen" className={cn(buttonVariants({ variant: "outline" }), "no-underline hover:no-underline")}>
              {hero.samples}
            </a>
            <span className="ml-2 font-mono text-[13px] text-kg-text-2">{hero.micro}</span>
          </div>
        </div>
        <Bevel size={24} className="relative h-[240px] lg:h-[380px]" style={{ background: "#4a4f52" }}>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(27,40,56,.15), rgba(27,40,56,.35)), repeating-linear-gradient(90deg, #3b3f42 0 8px, #4a4f52 8px 18px)",
            }}
          />
          <div className="absolute top-0 left-0 bg-kg-navy px-[18px] py-3.5 font-mono text-[13px] leading-[1.5] text-kg-kalk">
            VinyPlus rondkant 150 mm · antraciet
            <br />
            <span className="text-[22px] font-medium tracking-[-0.02em] sm:text-[26px]">
              levering week {week}
            </span>
          </div>
        </Bevel>
      </div>
    </section>
  );
}
