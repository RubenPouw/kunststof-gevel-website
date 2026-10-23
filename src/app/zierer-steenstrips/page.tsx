import { LandingListing } from "@/components/catalog/landing-listing";
import { landingMetadata } from "@/data/seo/landings";

export const revalidate = 3600;

export function generateMetadata() {
  return landingMetadata("zierer-steenstrips");
}

export default function ZiererSteenstripsPage() {
  return <LandingListing slug="zierer-steenstrips" filters={{}} page={1} />;
}
