import { cn } from "@/lib/utils";

type ProductVisualProps = {
  palette: readonly string[];
  className?: string;
  variant?: "overlap" | "flush" | "angle";
};

export function ProductVisual({
  palette,
  className,
  variant = "overlap",
}: ProductVisualProps) {
  const colors = palette.length ? palette : ["#3A3D41", "#45484C", "#323538"];

  return (
    <div
      className={cn("relative aspect-[4/3] overflow-hidden bg-[#e9e7e1]", className)}
      aria-hidden
    >
      <div className="absolute inset-0 flex flex-col gap-[3px] bg-[#d8d5ce] p-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="relative min-h-0 flex-1 overflow-hidden"
            style={{
              background: `linear-gradient(90deg, ${colors[index % colors.length]} 0%, ${colors[(index + 1) % colors.length]} 55%, ${colors[(index + 2) % colors.length]} 100%)`,
              clipPath:
                variant === "angle"
                  ? "polygon(0 18%, 100% 0, 100% 100%, 0 100%)"
                  : variant === "flush"
                    ? undefined
                    : "polygon(0 0, 100% 0, 100% 100%, 0 82%)",
              marginTop: variant === "flush" || index === 0 ? 0 : -6,
            }}
          >
            <div className="absolute inset-y-0 left-[12%] w-px bg-black/15" />
            <div className="absolute inset-y-0 left-[38%] w-px bg-white/10" />
            <div className="absolute inset-y-0 left-[71%] w-px bg-black/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function visualVariantFor(name: string): ProductVisualProps["variant"] {
  const lower = name.toLowerCase();
  if (lower.includes("zweeds")) return "angle";
  if (lower.includes("sponning") || lower.includes("hoek") || lower.includes("water")) {
    return "flush";
  }
  return "overlap";
}
