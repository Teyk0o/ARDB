import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.metaforge.app',
        pathname: '/arc-raiders/**',
      },
    ],
  },
};

export default nextConfig;
