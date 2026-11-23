import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "52mb",
    },
  },
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async redirects() {
    return [
      {
        source: "/dakkapel-renovatie",
        destination: "/blog/dakkapel-renovatie",
        permanent: true,
      },
      {
        source: "/dakkapel-renovatie/",
        destination: "/blog/dakkapel-renovatie",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
};

export default nextConfig;
