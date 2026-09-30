import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { ChatButton } from "@/components/brand/chat-button";
import { FactsStrip } from "@/components/brand/facts-strip";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AccountProvider } from "@/lib/account";
import { CartProvider } from "@/lib/cart";
import { SampleTrayProvider } from "@/lib/samples";
import { site } from "@/lib/site";

import "./globals.css";

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
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  metadataBase: new URL("https://kunststof-gevel.nl"),
  icons: { icon: "/favicon.svg", apple: "/brand/avatar.svg" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
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
    >
      <body className="flex min-h-full flex-col">
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <linearGradient id="gb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFE45C" />
              <stop offset="1" stopColor="#F5B800" />
            </linearGradient>
          </defs>
        </svg>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HomeAndConstructionBusiness",
              name: site.name,
              url: "https://kunststof-gevel.nl",
              telephone: site.phone,
              email: site.email,
              address: {
                "@type": "PostalAddress",
                streetAddress: "Binnenkamp 7a",
                postalCode: "5321 KA",
                addressLocality: "Hedel",
                addressCountry: "NL",
              },
            }),
          }}
        />
        <AccountProvider>
          <CartProvider>
            <SampleTrayProvider>
              <SiteHeader />
              <FactsStrip />
              <main className="flex-1">{children}</main>
              <SiteFooter />
              <ChatButton />
            </SampleTrayProvider>
          </CartProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
