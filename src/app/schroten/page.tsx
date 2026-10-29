import { gapMetadata, GapListing } from "@/components/seo/gap-listing";

export const revalidate = 3600;

export function generateMetadata() {
  return gapMetadata("schroten");
}

export default function Page() {
  return <GapListing id="schroten" />;
}
