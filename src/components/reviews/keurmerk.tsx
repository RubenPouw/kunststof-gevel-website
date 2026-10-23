import { WEBWINKELKEUR_PROFILE_URL } from "@/lib/reviews/config";

export function KeurmerkLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={WEBWINKELKEUR_PROFILE_URL}
      className={`inline-flex items-center gap-2 font-mono text-[13px] text-kg-navy no-underline hover:underline ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <rect x="1" y="1" width="16" height="16" fill="none" stroke="#1B2838" strokeWidth="1.5" />
        <path d="M4.5 9.2 7.4 12 13.5 5.8" fill="none" stroke="#1B2838" strokeWidth="1.5" />
      </svg>
      WebwinkelKeur
    </a>
  );
}