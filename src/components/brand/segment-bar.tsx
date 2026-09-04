import { cn } from "@/lib/utils";

type SegmentBarProps = {
  size?: number;
  tone?: "light" | "dark";
  progress?: 1 | 2 | 3;
  className?: string;
};

export function SegmentBar({
  size = 56,
  tone = "light",
  progress,
  className,
}: SegmentBarProps) {
  const height = Math.max(2, Math.round(size * 0.16));
  const pad = height * 0.445;
  const brandCols =
    tone === "dark"
      ? ["var(--kg-blue-300)", "var(--kg-blue)", "var(--kg-orange)"]
      : ["var(--kg-blue)", "var(--kg-blue-300)", "var(--kg-orange)"];
  const fills =
    progress == null
      ? brandCols
      : ([1, 2, 3] as const).map((step) =>
          step <= progress ? "var(--kg-blue)" : "var(--kg-blue-100)",
        );

  return (
    <div
      aria-hidden
      className={cn("flex box-border", className)}
      style={{ gap: height, paddingInline: pad }}
    >
      {[3, 2, 1].map((flex, index) => (
        <div
          key={flex}
          style={{
            flex,
            height,
            background: fills[index],
            transform: "skewX(var(--segbar-skew, -24deg))",
          }}
        />
      ))}
    </div>
  );
}
