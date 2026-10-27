import { exclVat, formatPrice } from "@/lib/format";

/** Approximate price per m². Renders nothing when the figure cannot be calculated. */
export function SquareMetrePrice({ incl }: { incl: number | undefined }) {
  if (!incl || incl <= 0) return null;
  const net = exclVat(incl);
  return (
    <span className="kg-vat mt-1 block font-mono text-[12px] text-kg-text-2">
      <span className="kg-vat-incl">± {formatPrice(incl)}/m²</span>
      <span className="kg-vat-excl">± {formatPrice(net)}/m²</span>
    </span>
  );
}
