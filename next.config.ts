import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
	unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.metaforge.app',
        pathname: '/arc-raiders/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.arctracker.io',
        pathname: '/items/**',
      },
    ],
  },
};

export default nextConfig;
