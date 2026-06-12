import type { NextConfig } from "next";

const isDev = process.env.NEXT_PUBLIC_ENV === 'development';

const nextConfig: NextConfig = {
  images: {
    unoptimized: isDev, // true locally, false in production
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'petitefille.com.au',
        pathname: '/petite-backend/**',
      },
    ],
  },
};

export default nextConfig;