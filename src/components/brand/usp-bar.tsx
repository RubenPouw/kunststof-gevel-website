const DEFAULT_ITEMS = [
  "Onderhoudsvrij en duurzaam",
  "Standaard 10 jaar garantie",
  "Direct uit voorraad leverbaar",
  "Google 4,9 / 5",
] as const;

export function UspBar({ items = DEFAULT_ITEMS }: { items?: readonly string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 bg-tint px-6 py-[9px] text-[13px] leading-[1.4] font-medium">
      {items.slice(0, 4).map((item) => (
        <span key={item}>
          <span className="mr-1.5 font-bold text-brand">✓</span>
          {item}
        </span>
      ))}
    </div>
  );
}
