import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { ChatButton } from "@/components/brand/chat-button";
import { FactsStrip } from "@/components/brand/facts-strip";
import { ConsentAndGtm } from "@/components/seo/consent";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AccountProvider } from "@/lib/account";
import { CartProvider } from "@/lib/cart";
import { SampleTrayProvider } from "@/lib/samples";
import { organizationJsonLd } from "@/lib/seo/schema";
import { site } from "@/lib/site";
import { CLICK_CAPTURE_SCRIPT } from "@/lib/tracking/capture-script";
import { VAT_BOOT_SCRIPT } from "@/lib/vat-mode";

import "./globals.css";

export const revalidate = 3600;

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name}, ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  metadataBase: new URL(site.origin),
  icons: { icon: "/favicon.svg", apple: "/brand/avatar.svg" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: site.name,
    title: `${site.name}, ${site.tagline}`,
    description: site.description,
    url: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="nl"
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: VAT_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: CLICK_CAPTURE_SCRIPT }} />
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <linearGradient id="gb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFE45C" />
              <stop offset="1" stopColor="#F5B800" />
            </linearGradient>
          </defs>
        </svg>
        <JsonLd data={organizationJsonLd()} />
        <AccountProvider>
          <CartProvider>
            <SampleTrayProvider>
              <SiteHeader />
              <FactsStrip />
              <main className="flex-1">{children}</main>
              <SiteFooter />
              <ChatButton />
              <ConsentAndGtm />
            </SampleTrayProvider>
          </CartProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
