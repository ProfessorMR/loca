import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      // Wikimedia serves resized thumbnails from thumb.wikimedia.org
      { protocol: "https", hostname: "**.wikimedia.org" },
    ],
  },
  // Collections were demo data that did not match the real places. Send anyone
  // with an old link to their saved places.
  async redirects() {
    return [
      { source: "/collections", destination: "/saved", permanent: false },
      { source: "/collections/:id", destination: "/saved", permanent: false },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
