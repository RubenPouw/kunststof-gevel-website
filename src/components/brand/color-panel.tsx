import { cn } from "@/lib/utils";

export function ColorPanel({
  hex,
  className,
  label,
}: {
  hex: string;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: hex }}
      aria-hidden={!label}
      aria-label={label}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 2px, rgba(0,0,0,.05) 2px 22px)",
        }}
      />
    </div>
  );
}
