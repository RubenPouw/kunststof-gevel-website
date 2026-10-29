import { permanentRedirect } from "next/navigation";

import { KERALIT_CANONICAL } from "@/lib/seo/migratie";

/** Live canonical is the product-category URL. This slug only redirects. */
export default function KeralitShortPage() {
  permanentRedirect(KERALIT_CANONICAL);
}
