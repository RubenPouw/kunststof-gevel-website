import { absoluteUrl } from "@/lib/seo/schema";

import { PROFILE } from "./config";
import type { Layout } from "./layouts";

export function kozijnProductJsonLd(layout: Layout, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${layout.title} in ${PROFILE.name}`,
    description,
    brand: { "@type": "Brand", name: PROFILE.name },
    category: "Kunststof kozijnen",
    url: absoluteUrl(`/kunststof-kozijnen/${layout.group}/${layout.slug}`),
  };
}

export function howToJsonLd(input: { name: string; description: string; path: string; steps: { name: string; text: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    inLanguage: "nl-NL",
    url: absoluteUrl(input.path),
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
