import { cn } from "@/lib/utils";

type TagProps = {
  variant?: "tint" | "outline";
  children: React.ReactNode;
  className?: string;
};

export function Tag({ variant = "tint", children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-block font-[600] text-[11px] leading-none tracking-[0.04em]",
        variant === "outline"
          ? "border border-[var(--color-border-strong)] px-2.5 py-[5px] text-kg-ink"
          : "bg-tint px-2.5 py-1.5 text-kg-blue-deep",
        className,
      )}
    >
      {children}
    </span>
  );
}
