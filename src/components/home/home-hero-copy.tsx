import { hero } from "@/lib/site";

export function HomeHeroCopy() {
  return (
    <>
      <h1 className="home-h1 text-balance">{hero.heading}</h1>
      <p className="mt-3 text-[18px] leading-[1.2] font-medium tracking-[-0.02em] text-kg-navy sm:text-[22px]">
        {hero.title}
        <span className="block">{hero.subtitle}</span>
      </p>
      <p className="mt-5 max-w-[560px] text-[17px] text-kg-text-2">{hero.body}</p>
    </>
  );
}
