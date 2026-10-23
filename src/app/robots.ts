import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/afrekenen", "/account", "/inloggen", "/registreren", "/winkelwagen", "/weergave", "/api/"],
    },
    sitemap: "https://www.kunststof-gevel.nl/sitemap.xml",
  };
}
