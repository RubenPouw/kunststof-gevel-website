import type { KozijnConfig } from "@/lib/kozijnen/model";
import { summaryLines } from "@/lib/kozijnen/text";

export function KozijnOrderSummary({ config }: { config: KozijnConfig }) {
  const lines = summaryLines(config);
  return (
    <div className="mt-6 border-t border-kg-lijn pt-5">
      <p className="text-[16px] font-medium">Dit bestelt u</p>
      <dl className="mt-3 space-y-2 text-[14px] leading-snug">
        {lines.map((line) => (
          <div key={line.label} className="grid grid-cols-[7.25rem_1fr] gap-3">
            <dt className="text-kg-text-2">{line.label}</dt>
            <dd>{line.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
