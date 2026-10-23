import { LandingListing } from "@/components/catalog/landing-listing";
import { landingMetadata } from "@/data/seo/landings";

export const revalidate = 3600;

export function generateMetadata() {
  return landingMetadata("kunststof-vensterbank");
}

export default function KunststofVensterbankPage() {
  return <LandingListing slug="kunststof-vensterbank" filters={{}} page={1} />;
}
