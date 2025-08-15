import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase timeout for API routes to handle long-running AI operations
  serverExternalPackages: ["sharp"],
  // Configure timeouts
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        port: "",
        pathname: "/private/**",
      },
    ],
  },
};

export default nextConfig;
