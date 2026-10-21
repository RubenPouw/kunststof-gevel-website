import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Afrekenen",
  description: "Gegevens voor de Shopify-checkout. Er is pas een bestelling na betaling.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/afrekenen" },
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
