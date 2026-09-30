import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/inloggen", "/registreren", "/afrekenen", "/winkelwagen"],
    },
    sitemap: "https://kunststof-gevel.nl/sitemap.xml",
  };
}
