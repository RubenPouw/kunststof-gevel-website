import { LandingListing } from "@/components/catalog/landing-listing";
import { landingViewMetadata } from "@/lib/seo/listing-meta";

export const revalidate = 3600;

export async function generateMetadata() {
  return landingViewMetadata("keralit-gevelbekleding", {}, 1);
}

export default function KeralitCanonicalPage() {
  return <LandingListing slug="keralit-gevelbekleding" filters={{}} page={1} />;
}
