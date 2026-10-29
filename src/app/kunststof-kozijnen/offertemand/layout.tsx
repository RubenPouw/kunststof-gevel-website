import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offertemand",
  robots: { index: false, follow: false },
  alternates: { canonical: "/kunststof-kozijnen/offertemand" },
};

export default function OffertemandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
