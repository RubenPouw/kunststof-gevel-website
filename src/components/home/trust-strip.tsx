import { StarRow } from "@/components/brand/star-row";
import { WebwinkelKeurBadge } from "@/components/brand/webwinkelkeur-badge";

export function TrustStrip({
  label,
  mapsUrl,
  rating,
}: {
  label: string;
  mapsUrl: string;
  rating: number;
}) {
  return (
    <section className="border-y border-kg-lijn bg-kg-kalk" aria-label="Beoordelingen">
      <div className="container-kg flex flex-col gap-3 py-3 font-mono text-[13px] text-kg-navy sm:flex-row sm:items-center sm:justify-between">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-kg-navy"
          aria-label={`Google: ${label}`}
        >
          <StarRow value={rating} />
          <span>{label}</span>
        </a>
        <WebwinkelKeurBadge variant="wordmark" />
      </div>
    </section>
  );
}
