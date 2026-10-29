import Link from "next/link";

export function HomePrice() {
  return (
    <section className="container-kg pt-8 pb-2">
      <h2 className="max-w-3xl text-[28px] leading-[1.1] font-bold tracking-[-0.03em]">
        Op zoek naar de goedkoopste kunststof gevelbekleding?
      </h2>
      <p className="mt-4 max-w-2xl text-kg-text-2">
        De prijs staat per plank op het artikel. Materiaal voor een gangbaar gevelpaneel ligt tussen € 65 en € 120 per
        m² excl. btw. Inclusief montage ligt de eerste indicatie tussen € 95 en € 140 per m². Beide banden zijn een
        start, geen opdracht. De vaste prijs volgt na foto’s of een opname.
      </p>
      <p className="mt-4">
        <Link href="/blog/wat-kost-kunststof-gevelbekleding">Wat kost het per m²</Link>
      </p>
    </section>
  );
}
