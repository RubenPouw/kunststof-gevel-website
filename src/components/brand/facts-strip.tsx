import { facts } from "@/lib/site";

export function FactsStrip({
  articleCount,
}: {
  articleCount?: number;
}) {
  const items = facts.map((item, index) =>
    index === 0 && articleCount
      ? { k: String(articleCount), v: item.v }
      : item,
  );

  return (
    <div
      className="bevel-24"
      style={{ background: "var(--gradient-signal)" }}
    >
      <div className="container-kg grid grid-cols-2 gap-y-2 py-3.5 font-mono text-[13px] text-kg-navy sm:text-[14px] lg:grid-cols-4">
        {items.map((item) => (
          <span key={item.k}>
            <b className="font-bold">{item.k}</b> {item.v}
          </span>
        ))}
      </div>
    </div>
  );
}
