import type { ReactNode } from "react";

/**
 * De chatknop zit vast rechtsonder (52 px, 24 px van de rand).
 * Op een smal scherm houdt deze ruimte de tekst uit die hoek.
 */
export default function KozijnenLayout({ children }: { children: ReactNode }) {
  return <div className="max-sm:pr-16 max-sm:pb-28">{children}</div>;
}
