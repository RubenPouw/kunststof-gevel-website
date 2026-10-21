import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/afrekenen", "/account", "/inloggen", "/registreren", "/winkelwagen"],
    },
    sitemap: "https://www.kunststof-gevel.nl/sitemap.xml",
  };
}
