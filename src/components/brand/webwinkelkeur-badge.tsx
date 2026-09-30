import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function WebwinkelKeurBadge({
  variant = "mark",
  className,
}: {
  variant?: "mark" | "wordmark";
  className?: string;
}) {
  const wordmark = variant === "wordmark";
  return (
    <a
      href={site.webwinkelkeurUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center no-underline hover:no-underline"
    >
      {/* Officieel SVG-keurmerk. next/image weigert SVG tenzij dangerouslyAllowSVG aan staat. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={wordmark ? site.webwinkelkeurWordmark : site.webwinkelkeurMark}
        alt="WebwinkelKeur"
        width={wordmark ? 158 : 28}
        height={wordmark ? 24 : 28}
        className={cn(wordmark ? "h-6 w-auto" : "h-7 w-7", className)}
      />
    </a>
  );
}
