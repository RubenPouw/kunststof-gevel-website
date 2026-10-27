import { colourOptionText, colourParts, compareColourLabels } from "@/lib/catalog/colours";

export { colourOptionText, compareColourLabels };

/** Supplier name, with the reorder code smaller after it. */
export function ColourName({
  value,
  className,
  codeClassName = "font-mono text-[0.85em] text-kg-text-2",
}: {
  value: string;
  className?: string;
  codeClassName?: string;
}) {
  const parts = colourParts(value);
  if (!parts.code) return <span className={className}>{parts.name}</span>;
  return (
    <span className={className}>
      {parts.name} <span className={codeClassName}>({parts.code})</span>
    </span>
  );
}
