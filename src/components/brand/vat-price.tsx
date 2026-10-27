import { exclVat, formatPrice, shippingEstimateCopy, shippingEstimateInclCopy } from "@/lib/format";
import { cn } from "@/lib/utils";

export { shippingEstimateBothCopy, shippingEstimateInclCopy } from "@/lib/format";

/** One amount. The head script shows incl. or excl. before paint. */
export function VatPrice({
  incl,
  excl,
  suffix = "",
  labeled = true,
  className,
}: {
  incl: number;
  excl?: number;
  suffix?: string;
  labeled?: boolean;
  className?: string;
}) {
  const net = excl ?? exclVat(incl);
  return (
    <span className={cn("kg-vat", className)}>
      <span className="kg-vat-incl">
        {formatPrice(incl)}
        {suffix}
        {labeled ? " incl. btw" : null}
      </span>
      <span className="kg-vat-excl">
        {formatPrice(net)}
        {suffix}
        {labeled ? " excl. btw" : null}
      </span>
    </span>
  );
}

/** Checkout keeps both amounts on screen, whatever the header choice is. */
export function VatBoth({
  incl,
  excl,
  className,
}: {
  incl: number;
  excl?: number;
  className?: string;
}) {
  const net = excl ?? exclVat(incl);
  return (
    <span className={cn("inline-flex flex-col items-end text-right font-mono", className)}>
      <span>{formatPrice(net)} excl. btw</span>
      <span>{formatPrice(incl)} incl. 21% btw</span>
    </span>
  );
}

export function ShippingEstimate({ className }: { className?: string }) {
  return (
    <span className={cn("kg-vat", className)}>
      <span className="kg-vat-incl">{shippingEstimateInclCopy()}</span>
      <span className="kg-vat-excl">{shippingEstimateCopy()}</span>
    </span>
  );
}
