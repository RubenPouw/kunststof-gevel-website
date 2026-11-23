import { GoogleReviewInline } from "@/components/reviews/google-line";

const DEFAULT_ITEMS = [
  "Onderhoudsvrij en duurzaam",
  "Standaard 10 jaar garantie",
  "Direct uit voorraad leverbaar",
] as const;

export function UspBar({ items = DEFAULT_ITEMS }: { items?: readonly string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-10 gap-y-2 bg-tint px-6 py-[9px] text-[13px] leading-[1.4] font-medium">
      {items.map((item) => (
        <span key={item}>
          <span className="mr-1.5 font-bold text-brand">✓</span>
          {item}
        </span>
      ))}
      <span className="inline-flex items-center">
        <span className="mr-1.5 font-bold text-brand">✓</span>
        <GoogleReviewInline className="text-[13px]" starSize={13} />
      </span>
    </div>
  );
}
