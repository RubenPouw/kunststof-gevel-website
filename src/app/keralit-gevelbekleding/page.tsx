import { LandingListing } from "@/components/catalog/landing-listing";
import { landingMetadata } from "@/data/seo/landings";

export const revalidate = 3600;

export function generateMetadata() {
  return landingMetadata("keralit-gevelbekleding");
}

export default function KeralitGevelbekledingPage() {
  return <LandingListing slug="keralit-gevelbekleding" filters={{}} page={1} />;
}
