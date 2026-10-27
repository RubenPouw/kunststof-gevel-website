import { isWoodColour } from "@/lib/catalog/swatches";
import { cn } from "@/lib/utils";

const WOOD_GRAIN = [
  "repeating-linear-gradient(90deg, transparent 0 2px, rgba(27,40,56,0.28) 2px 3px)",
  "repeating-linear-gradient(8deg, transparent 0 6px, rgba(255,255,255,0.35) 6px 7px)",
].join(", ");

/** Round colour dot. Wood colours get a grain on top of the hex. */
export function ColourSwatch({
  name,
  hex,
  family,
  size = 28,
  active = false,
  className,
}: {
  name: string;
  hex: string;
  family?: string;
  size?: number;
  active?: boolean;
  className?: string;
}) {
  const wood = isWoodColour(name, family);
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 border border-kg-lijn", active && "outline outline-2 outline-offset-2 outline-kg-navy", className)}
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        backgroundColor: hex || "#F4F2ED",
        backgroundImage: wood ? WOOD_GRAIN : undefined,
      }}
    />
  );
}
