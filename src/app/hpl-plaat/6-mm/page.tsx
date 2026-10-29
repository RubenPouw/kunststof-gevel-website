import { gapMetadata, GapListing } from "@/components/seo/gap-listing";

export const revalidate = 3600;

export function generateMetadata() {
  return gapMetadata("hpl6");
}

export default function Page() {
  return <GapListing id="hpl6" />;
}
